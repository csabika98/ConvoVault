import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';

import '../config/system_prompt.dart';
import '../models/models.dart';
import '../services/ai_service.dart';
import '../services/wikipedia_portrait.dart';
import '../utils/text_utils.dart';

const maxCharacters = 5;

class CharactersState extends ChangeNotifier {
  final List<Character> _characters = [];
  SimulationRequest? _simulationRequest;
  int _nextCharacterId = 1;
  int _nextSimulationRequestId = 1;
  final _random = Random();

  List<Character> get characters => List.unmodifiable(_characters);
  SimulationRequest? get simulationRequest => _simulationRequest;
  bool get charactersAreFull => _characters.length >= maxCharacters;

  int? addCharacter({String? name}) {
    if (charactersAreFull) return null;

    final nextId = _nextCharacterId++;
    final resolvedName = (name ?? '').trim().isNotEmpty
        ? name!.trim()
        : 'Character ${_characters.length + 1}';

    _characters.add(Character(
      id: nextId,
      name: resolvedName,
      initials: deriveInitials(resolvedName, fallback: '?'),
    ));
    notifyListeners();
    return nextId;
  }

  void deleteCharacter(int idToDelete) {
    _characters.removeWhere((character) => character.id == idToDelete);
    notifyListeners();
  }

  void updateCharacterName(int id, String newName) {
    final trimmed = newName.trim();
    if (trimmed.isEmpty) return;

    final index = _characters.indexWhere((character) => character.id == id);
    if (index < 0) return;
    _characters[index] = _characters[index].copyWith(
      name: trimmed,
      initials: deriveInitials(trimmed, fallback: '?'),
    );
    notifyListeners();
  }

  Future<List<Character>> randomizeCharacters() async {
    final count = 2 + _random.nextInt(maxCharacters - 1);
    final names = await _generateRandomCharacterNames(count);
    if (names.length < 2) return characters;

    final nextCharacters = await Future.wait(names.indexed.map((entry) async {
      final (index, name) = entry;
      return Character(
        id: _nextCharacterId + index,
        name: name,
        avatarUrl: await fetchWikipediaPortraitUrl(name) ?? '',
        initials: deriveInitials(name, fallback: '?'),
      );
    }));

    _nextCharacterId += count;
    _characters
      ..clear()
      ..addAll(nextCharacters);
    notifyListeners();
    return characters;
  }

  Future<SimulationRequest?> startSimulation({
    int durationMs = 60000,
    String topic = '',
  }) async {
    final participants = _characters
        .where((character) => character.name.trim().isNotEmpty)
        .toList();
    if (participants.length < 2) return null;

    final participantsWithAvatars =
        await Future.wait(participants.map((participant) async {
      if (participant.avatarUrl.isNotEmpty) return participant;
      return participant.copyWith(
        avatarUrl: await fetchWikipediaPortraitUrl(participant.name) ?? '',
      );
    }));

    for (final participant in participantsWithAvatars) {
      final index =
          _characters.indexWhere((character) => character.id == participant.id);
      if (index >= 0) {
        _characters[index] = _characters[index].copyWith(
          avatarUrl: participant.avatarUrl,
          initials: participant.initials,
        );
      }
    }

    final request = SimulationRequest(
      id: _nextSimulationRequestId++,
      participants: participantsWithAvatars,
      durationMs: durationMs,
      topic: topic.trim(),
    );
    _simulationRequest = request;
    notifyListeners();
    return request;
  }

  Future<List<String>> _generateRandomCharacterNames(int count) async {
    final response = await getAiReply(buildRandomCharactersPrompt(count));

    try {
      final parsed = jsonDecode(response.content);
      if (parsed is! Map<String, dynamic>) return [];
      final rawNames = parsed['characters'];
      if (rawNames is! List) return [];
      final names = rawNames
          .map((name) => name is String ? name.trim() : '')
          .where((name) => name.isNotEmpty)
          .toList();
      return names.toSet().take(count).toList();
    } catch (_) {
      return [];
    }
  }
}
