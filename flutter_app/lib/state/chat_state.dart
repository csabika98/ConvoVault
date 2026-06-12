import 'package:flutter/foundation.dart';

import '../models/models.dart';
import '../services/ai_service.dart';
import '../state/sessions_state.dart';
import '../utils/text_utils.dart';

class ChatState extends ChangeNotifier {
  ChatState(this._sessions);

  final SessionsState _sessions;

  final Map<String, List<ChatMessage>> _messagesBySession = {};
  bool _isLoading = false;
  bool _isSimulationRunning = false;
  bool _inFlight = false;

  bool get isLoading => _isLoading;
  bool get isSimulationRunning => _isSimulationRunning;

  List<ChatMessage> messagesFor(String? sessionKey) {
    if (sessionKey == null) return const [];
    return List.unmodifiable(_messagesBySession[sessionKey] ?? const []);
  }

  Future<void> sendMessage({
    required String sessionKey,
    required String text,
    required AssistantProfile assistantProfile,
  }) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || _inFlight || !_sessions.containsSession(sessionKey)) {
      return;
    }

    final previous = _messagesBySession[sessionKey] ?? const <ChatMessage>[];
    final baseConversation = [
      ...previous.map((item) => ChatTurn(
            role: item.isUser ? 'user' : 'assistant',
            content: item.content,
          )),
      ChatTurn(role: 'user', content: trimmed),
    ];

    _appendMessage(sessionKey, ChatMessage(content: trimmed, isUser: true));

    _inFlight = true;
    _setLoading(true);
    final assistantAvatar = AvatarSnapshot(
      name: assistantProfile.name,
      avatarUrl: assistantProfile.avatarUrl ?? '',
      avatarEmoji: assistantProfile.avatarEmoji,
    );
    try {
      final ai = await getAiReply(
        baseConversation,
        mode: AiMode.aiVsHuman,
        assistantProfile: assistantProfile,
      );
      if (!_sessions.containsSession(sessionKey)) return;

      final assistantChunks = splitIntoChatBubbles(ai.content, 2);
      for (final (index, chunk) in assistantChunks.indexed) {
        _appendMessage(
          sessionKey,
          ChatMessage(
            content: chunk,
            isUser: false,
            assistantAvatar: assistantAvatar,
          ),
        );
        if (index < assistantChunks.length - 1) {
          await Future<void>.delayed(const Duration(milliseconds: 650));
          if (!_sessions.containsSession(sessionKey)) return;
        }
      }
    } catch (error) {
      _appendMessage(
        sessionKey,
        ChatMessage(
          content: 'AI request failed: ${_describe(error)}',
          isUser: false,
          assistantAvatar: assistantAvatar,
        ),
      );
      debugPrint('$error');
    } finally {
      _inFlight = false;
      _setLoading(false);
    }
  }

  Future<void> runSimulation(
    SimulationRequest request,
    String sessionKey,
  ) async {
    final participants = request.participants
        .where((participant) => participant.name.trim().isNotEmpty)
        .toList();
    if (participants.length < 2 || _inFlight) return;

    final startedAt = DateTime.now();
    final maxDurationMs = request.durationMs > 0 ? request.durationMs : 60000;
    final maxTurns =
        (maxDurationMs / 5000).ceil().clamp(6, double.maxFinite.toInt());
    final topic = request.topic.trim();
    final conversation = <ChatTurn>[];

    _inFlight = true;
    _isSimulationRunning = true;
    _setLoading(true);

    try {
      for (var turn = 0; turn < maxTurns; turn++) {
        if (_elapsedMs(startedAt) >= maxDurationMs) break;
        if (!_sessions.containsSession(sessionKey)) return;

        final instruction = turn == 0
            ? _buildSimulationInstruction(topic)
            : 'Continue the AI-vs-AI simulation with the next natural chat message.';

        final ai = await getAiReply(
          [...conversation, ChatTurn(role: 'user', content: instruction)],
          mode: AiMode.aiVsAi,
          simulationCharacters: participants,
          simulationTopic: topic,
        );
        if (!_sessions.containsSession(sessionKey)) return;

        final nextMessage =
            parseSimulationMessage(ai.content, participants, turn);
        final assistantAvatar =
            createSimulationAvatarSnapshot(nextMessage.speaker, participants);

        _appendMessage(
          sessionKey,
          ChatMessage(
            content: nextMessage.message,
            isUser: false,
            assistantAvatar: assistantAvatar,
          ),
        );

        conversation.add(ChatTurn(
          role: 'assistant',
          content: '${nextMessage.speaker}: ${nextMessage.message}',
        ));

        if (turn < maxTurns - 1 && _elapsedMs(startedAt) < maxDurationMs) {
          await Future<void>.delayed(const Duration(milliseconds: 2500));
        }
      }
    } catch (error) {
      _appendMessage(
        sessionKey,
        ChatMessage(
          content: 'AI simulation failed: ${_describe(error)}',
          isUser: false,
        ),
      );
      debugPrint('$error');
    } finally {
      _inFlight = false;
      _isSimulationRunning = false;
      _setLoading(false);
    }
  }

  void _appendMessage(String sessionKey, ChatMessage message) {
    _messagesBySession.putIfAbsent(sessionKey, () => []).add(message);
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  static int _elapsedMs(DateTime startedAt) =>
      DateTime.now().difference(startedAt).inMilliseconds;

  static String _buildSimulationInstruction(String topic) {
    if (topic.isEmpty) {
      return 'Start the AI-vs-AI simulation. Pick the first speaker and open with a concrete, conversational message about any natural topic.';
    }
    return 'Start the AI-vs-AI simulation. Pick the first speaker and open with a concrete, conversational message about this topic only: $topic';
  }

  static String _describe(Object error) {
    final text = '$error';
    return text.startsWith('Exception: ') ? text.substring(11) : text;
  }
}

AvatarSnapshot createSimulationAvatarSnapshot(
  String speaker,
  List<Character> participants,
) {
  Character? participant;
  for (final item in participants) {
    if (item.name.trim().toLowerCase() == speaker.trim().toLowerCase()) {
      participant = item;
      break;
    }
  }

  return AvatarSnapshot(
    name: participant?.name ?? speaker,
    avatarUrl: participant?.avatarUrl ?? '',
    avatarEmoji: participant != null && participant.initials.isNotEmpty
        ? participant.initials
        : deriveInitials(speaker),
  );
}
