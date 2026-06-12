import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _themeStorageKey = 'convovault-theme';

class ThemeState extends ChangeNotifier {
  ThemeState(this._prefs)
      : _mode = _parse(_prefs.getString(_themeStorageKey));

  final SharedPreferences _prefs;
  ThemeMode _mode;

  ThemeMode get mode => _mode;

  Future<void> setMode(ThemeMode mode) async {
    _mode = mode;
    await _prefs.setString(_themeStorageKey, mode.name);
    notifyListeners();
  }

  static ThemeMode _parse(String? value) {
    return ThemeMode.values.firstWhere(
      (mode) => mode.name == value,
      orElse: () => ThemeMode.system,
    );
  }
}
