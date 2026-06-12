import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/system_prompt.dart';
import '../models/models.dart';
import '../services/ai_service.dart';
import '../services/wikipedia_portrait.dart';
import '../utils/text_utils.dart';

const _userAvatarStorageKey = 'convovault-user-avatar';

class ProfileState extends ChangeNotifier {
  ProfileState(this._prefs)
      : _userAvatar = _prefs.getString(_userAvatarStorageKey) ?? '';

  final SharedPreferences _prefs;

  final Map<String, AiMode> _modeBySession = {};
  AssistantProfile? _assistantProfile;
  bool _isGeneratingProfile = false;
  bool _isFetchingPortrait = false;
  bool _profileGenerationInFlight = false;
  String _userAvatar;
  final List<String> _recentPersonNames = [];

  AssistantProfile? get assistantProfile => _assistantProfile;
  bool get isGeneratingProfile => _isGeneratingProfile;
  bool get isFetchingPortrait => _isFetchingPortrait;
  List<String> get recentPersonNames => List.unmodifiable(_recentPersonNames);

  String get userAvatar => _userAvatar;

  Future<void> setUserAvatar(String avatar) async {
    _userAvatar = avatar;
    if (avatar.isNotEmpty) {
      await _prefs.setString(_userAvatarStorageKey, avatar);
    } else {
      await _prefs.remove(_userAvatarStorageKey);
    }
    notifyListeners();
  }

  AiMode getModeForSession(String? sessionKey) {
    if (sessionKey == null || sessionKey.isEmpty) return AiMode.aiVsHuman;
    return _modeBySession[sessionKey] ?? AiMode.aiVsHuman;
  }

  void setModeForSession(String sessionKey, AiMode mode) {
    if (sessionKey.isEmpty) return;
    _modeBySession[sessionKey] = mode;
    notifyListeners();
  }

  void rememberPersonName(String name) {
    final normalized = name.trim();
    if (normalized.isEmpty) return;
    _recentPersonNames
        .removeWhere((item) => item.toLowerCase() == normalized.toLowerCase());
    _recentPersonNames.insert(0, normalized);
    if (_recentPersonNames.length > 8) {
      _recentPersonNames.removeRange(8, _recentPersonNames.length);
    }
    notifyListeners();
  }

  Future<void> regenerateProfile() async {
    if (_profileGenerationInFlight) return;
    _profileGenerationInFlight = true;
    _setGenerating(true);
    try {
      final attemptedNames = {
        ..._recentPersonNames,
        if (_assistantProfile != null) _assistantProfile!.name,
      }.map((name) => name.trim()).where((name) => name.isNotEmpty).toList();

      AssistantProfile? nextProfile;
      const maxAttempts = 4;

      for (var i = 0; i < maxAttempts; i++) {
        final prompt = buildCharacterProfilePrompt(attemptedNames);
        final reply =
            await getAiReply([ChatTurn(role: 'user', content: prompt)]);
        final candidate = parseCharacterProfile(reply.content);
        if (candidate == null) continue;
        if (_containsName(attemptedNames, candidate.name)) {
          attemptedNames.add(candidate.name);
          continue;
        }
        nextProfile = candidate;
        break;
      }
      if (nextProfile == null) return;
      _assistantProfile = nextProfile;
      rememberPersonName(nextProfile.name);
      _hydratePortrait(nextProfile);
    } catch (error) {
      debugPrint('$error');
    } finally {
      _profileGenerationInFlight = false;
      _setGenerating(false);
    }
  }

  Future<void> regenerateProfileForRequestedName(String requestedName) async {
    final trimmed = requestedName.trim();
    if (trimmed.isEmpty) return;

    final prompt = buildNamedCharacterProfilePrompt(trimmed);
    if (prompt.isEmpty) return;

    if (_profileGenerationInFlight) return;
    _profileGenerationInFlight = true;
    _setGenerating(true);
    try {
      AssistantProfile? nextProfile;
      const maxAttempts = 4;
      for (var i = 0; i < maxAttempts; i++) {
        final reply =
            await getAiReply([ChatTurn(role: 'user', content: prompt)]);
        final candidate = parseCharacterProfile(reply.content);
        if (candidate != null) {
          nextProfile = candidate;
          break;
        }
      }
      if (nextProfile == null) return;
      _assistantProfile = nextProfile;
      rememberPersonName(nextProfile.name);
      _hydratePortrait(nextProfile);
    } catch (error) {
      debugPrint('$error');
    } finally {
      _profileGenerationInFlight = false;
      _setGenerating(false);
    }
  }

  Future<void> _hydratePortrait(AssistantProfile nextProfile) async {
    _isFetchingPortrait = true;
    notifyListeners();
    try {
      final avatarUrl =
          await fetchWikipediaPortraitUrl(nextProfile.wikipediaTitle);
      if (avatarUrl == null || avatarUrl.isEmpty) return;
      final current = _assistantProfile;
      if (current == null ||
          current.name != nextProfile.name ||
          current.wikipediaTitle != nextProfile.wikipediaTitle) {
        return;
      }
      _assistantProfile = current.copyWith(avatarUrl: avatarUrl);
    } finally {
      _isFetchingPortrait = false;
      notifyListeners();
    }
  }

  void _setGenerating(bool value) {
    _isGeneratingProfile = value;
    notifyListeners();
  }

  static bool _containsName(List<String> list, String value) {
    final normalized = value.trim().toLowerCase();
    if (normalized.isEmpty) return false;
    return list.any((item) => item.trim().toLowerCase() == normalized);
  }
}
