import 'package:flutter/foundation.dart';

import '../models/models.dart';

const maxSessions = 5;

class SessionsState extends ChangeNotifier {
  final List<Session> _sessions = [const Session(id: 1, title: 'Session 1')];
  int _nextSessionId = 2;

  List<Session> get sessions => List.unmodifiable(_sessions);
  bool get sessionsAreFull => _sessions.length >= maxSessions;

  bool containsSession(String sessionKey) =>
      _sessions.any((session) => '${session.id}' == sessionKey);

  int? addSession({required String title}) {
    if (sessionsAreFull) return null;

    final nextId = _nextSessionId++;
    _sessions.add(Session(id: nextId, title: title));
    notifyListeners();
    return nextId;
  }

  void deleteSession(int idToDelete) {
    _sessions.removeWhere((session) => session.id == idToDelete);
    notifyListeners();
  }
}
