import 'dart:convert';

import '../models/models.dart';

String deriveInitials(String? name, {String fallback = 'AI'}) {
  final parts = (name ?? '')
      .trim()
      .split(RegExp(r'\s+'))
      .where((part) => part.isNotEmpty)
      .toList();
  if (parts.isEmpty) return fallback;
  return parts
      .take(2)
      .map((part) => part.substring(0, 1).toUpperCase())
      .join();
}

List<String> splitIntoChatBubbles(String text, int maxSentencesPerBubble) {
  final raw = text.trim();
  if (raw.isEmpty) return [];

  final paragraphs = raw
      .split(RegExp(r'\n{2,}'))
      .map((p) => p.trim())
      .where((p) => p.isNotEmpty)
      .toList();

  final bubbles = <String>[];
  for (final p in paragraphs) {
    final normalized = p.replaceAll(RegExp(r'\s+'), ' ').trim();
    final sentences = normalized
        .split(RegExp(r'(?<=[.!?])\s+'))
        .where((s) => s.isNotEmpty)
        .toList();

    if (sentences.length <= maxSentencesPerBubble) {
      bubbles.add(normalized);
      continue;
    }

    for (var i = 0; i < sentences.length; i += maxSentencesPerBubble) {
      final end = (i + maxSentencesPerBubble).clamp(0, sentences.length);
      final chunk = sentences.sublist(i, end).join(' ').trim();
      if (chunk.isNotEmpty) bubbles.add(chunk);
    }
  }

  return bubbles.isNotEmpty ? bubbles : [raw];
}

class ParsedSimulationMessage {
  const ParsedSimulationMessage({required this.speaker, required this.message});

  final String speaker;
  final String message;
}

ParsedSimulationMessage parseSimulationMessage(
  String raw,
  List<Character> participants,
  int turnIndex,
) {
  final fallbackSpeaker = participants.isNotEmpty
      ? participants[turnIndex % participants.length].name
      : '';
  final fallback = ParsedSimulationMessage(
    speaker: fallbackSpeaker.isNotEmpty ? fallbackSpeaker : 'AI',
    message: raw.trim().isNotEmpty ? raw.trim() : 'I am ready to continue.',
  );

  try {
    final parsed = jsonDecode(raw);
    if (parsed is Map<String, dynamic>) {
      final speaker = (parsed['speaker'] as String? ?? '').trim();
      final message = (parsed['message'] as String? ?? '').trim();
      if (_isSimulationParticipant(speaker, participants) &&
          message.isNotEmpty) {
        return ParsedSimulationMessage(speaker: speaker, message: message);
      }
    }
  } catch (_) {
    // Fall through to plain-text parsing.
  }

  final text = raw.trim();
  final separatorIndex = text.indexOf(':');
  if (separatorIndex > 0) {
    final speaker = text.substring(0, separatorIndex).trim();
    final message = text.substring(separatorIndex + 1).trim();
    if (_isSimulationParticipant(speaker, participants) && message.isNotEmpty) {
      return ParsedSimulationMessage(speaker: speaker, message: message);
    }
  }

  return fallback;
}

bool _isSimulationParticipant(String speaker, List<Character> participants) {
  final normalized = speaker.trim().toLowerCase();
  if (normalized.isEmpty) return false;
  return participants
      .any((participant) => participant.name.trim().toLowerCase() == normalized);
}

AssistantProfile? parseCharacterProfile(String raw) {
  try {
    final parsed = jsonDecode(raw);
    if (parsed is! Map<String, dynamic>) return null;
    final name = (parsed['name'] as String? ?? '').trim();
    final introduction = (parsed['introduction'] as String? ?? '').trim();
    final personality = (parsed['personality'] as String? ?? '').trim();
    final wikipediaTitle = (parsed['wikipediaTitle'] as String? ?? '').trim();
    var avatarEmoji = (parsed['avatarEmoji'] as String? ?? '').trim();
    if (avatarEmoji.isEmpty) avatarEmoji = '✨';
    if (name.isEmpty ||
        introduction.isEmpty ||
        personality.isEmpty ||
        wikipediaTitle.isEmpty) {
      return null;
    }
    return AssistantProfile(
      name: name,
      introduction: introduction,
      personality: personality,
      wikipediaTitle: wikipediaTitle,
      avatarEmoji: avatarEmoji,
    );
  } catch (_) {
    return null;
  }
}
