import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/system_prompt.dart';
import '../models/models.dart';

const _deepseekUrl = 'https://api.deepseek.com/chat/completions';
const _apiKey = String.fromEnvironment('DEEPSEEK_API_KEY');
const _model =
    String.fromEnvironment('DEEPSEEK_MODEL', defaultValue: 'deepseek-v4-pro');

Future<AiReply> getAiReply(
  List<ChatTurn> conversation, {
  AiMode mode = AiMode.aiVsHuman,
  AssistantProfile? assistantProfile,
  List<Character> simulationCharacters = const [],
  String simulationTopic = '',
}) async {
  if (_apiKey.isEmpty) {
    throw Exception(
      'Missing DEEPSEEK_API_KEY. Pass it with --dart-define=DEEPSEEK_API_KEY=...',
    );
  }

  final response = await http.post(
    Uri.parse(_deepseekUrl),
    headers: {
      'Authorization': 'Bearer $_apiKey',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'model': _model,
      'messages': _withSystemPrompt(
        conversation,
        mode: mode,
        assistantProfile: assistantProfile,
        simulationCharacters: simulationCharacters,
        simulationTopic: simulationTopic,
      ).map((turn) => turn.toJson()).toList(),
      'thinking': {'type': 'enabled'},
    }),
  );

  if (response.statusCode < 200 || response.statusCode >= 300) {
    var errorMessage = 'Deepseek request failed (${response.statusCode})';
    try {
      final errorBody = jsonDecode(response.body) as Map<String, dynamic>;
      final apiMessage = (errorBody['error'] as Map<String, dynamic>?)?['message'] as String? ??
          errorBody['message'] as String?;
      if (apiMessage != null && apiMessage.isNotEmpty) {
        errorMessage = '$apiMessage (status ${response.statusCode})';
      }
    } catch (_) {
      if (response.body.isNotEmpty) errorMessage = response.body;
    }
    throw Exception(errorMessage);
  }

  final data = jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
  final choices = data['choices'] as List<dynamic>?;
  final message = choices != null && choices.isNotEmpty
      ? (choices.first as Map<String, dynamic>)['message'] as Map<String, dynamic>?
      : null;
  final text = _normalizeContent(message?['content']);

  return AiReply(
    content: text.isNotEmpty ? text : 'I could not generate a response.',
    reasoningDetails: message?['reasoning_details'],
  );
}

List<ChatTurn> _withSystemPrompt(
  List<ChatTurn> conversation, {
  required AiMode mode,
  AssistantProfile? assistantProfile,
  required List<Character> simulationCharacters,
  required String simulationTopic,
}) {
  final hasSystem = conversation.any((turn) => turn.role == 'system');
  if (hasSystem) return conversation;

  final systemPrompt = mode == AiMode.aiVsAi
      ? buildAiVsAiSystemPrompt(simulationCharacters, topic: simulationTopic)
      : _buildAiVsHumanSystemPrompt(assistantProfile);

  return [ChatTurn(role: 'system', content: systemPrompt), ...conversation];
}

String _buildAiVsHumanSystemPrompt(AssistantProfile? profile) {
  if (profile == null) return systemPromptAiVsHuman;

  final name = profile.name.trim();
  final introduction = profile.introduction.trim();
  final personality = profile.personality.trim();
  if (name.isEmpty || introduction.isEmpty || personality.isEmpty) {
    return systemPromptAiVsHuman;
  }

  return [
    systemPromptAiVsHuman,
    '',
    _applyPersonaTemplate(systemPromptAiVsHumanPersonaSection, {
      'name': name,
      'introduction': introduction,
      'personality': personality,
    }),
  ].join('\n');
}

String _applyPersonaTemplate(String template, Map<String, String> values) {
  return values.entries.fold(
    template,
    (result, entry) => result.replaceAll('{{${entry.key}}}', entry.value),
  );
}

String _normalizeContent(Object? content) {
  if (content is String) return content.trim();
  if (content is! List) return '';
  return content
      .map((part) {
        if (part is String) return part;
        if (part is Map && part['text'] is String) return part['text'] as String;
        return '';
      })
      .join()
      .trim();
}
