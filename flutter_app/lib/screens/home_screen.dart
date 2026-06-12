import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/sessions_state.dart';
import '../widgets/chatbox.dart';
import '../widgets/history_panel.dart';
import '../widgets/profile_panel.dart';
import '../widgets/settings_sheet.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int? _selectedSessionId;
  final _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    final sessions = context.watch<SessionsState>().sessions;
    final effectiveSelectedId = sessions.isEmpty
        ? null
        : sessions.any((session) => session.id == _selectedSessionId)
            ? _selectedSessionId
            : sessions.first.id;
    final sessionKey =
        effectiveSelectedId != null ? '$effectiveSelectedId' : null;

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 1000;
        if (isWide) {
          return _buildWideLayout(sessionKey, effectiveSelectedId);
        }
        return _buildNarrowLayout(sessionKey, effectiveSelectedId);
      },
    );
  }

  Widget _buildWideLayout(String? sessionKey, int? effectiveSelectedId) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            Row(
              children: [
                SizedBox(
                  width: 280,
                  child: HistoryPanel(
                    selectedSessionId: effectiveSelectedId,
                    onSessionSelect: (id) =>
                        setState(() => _selectedSessionId = id),
                  ),
                ),
                const VerticalDivider(width: 1),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Chatbox(sessionKey: sessionKey),
                  ),
                ),
                const VerticalDivider(width: 1),
                SizedBox(
                  width: 340,
                  child: ProfilePanel(sessionKey: sessionKey),
                ),
              ],
            ),
            Positioned(
              top: 8,
              right: 8,
              child: IconButton.outlined(
                onPressed: () => showSettingsSheet(context),
                icon: const Icon(Icons.settings, size: 18),
                tooltip: 'Settings',
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNarrowLayout(String? sessionKey, int? effectiveSelectedId) {
    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        title: const Text('ConvoVault'),
        actions: [
          IconButton(
            onPressed: () => _scaffoldKey.currentState?.openEndDrawer(),
            icon: const Icon(Icons.person_outline),
            tooltip: 'AI Profile',
          ),
          IconButton(
            onPressed: () => showSettingsSheet(context),
            icon: const Icon(Icons.settings_outlined),
            tooltip: 'Settings',
          ),
        ],
      ),
      drawer: Drawer(
        child: SafeArea(
          child: HistoryPanel(
            selectedSessionId: effectiveSelectedId,
            onSessionSelect: (id) {
              setState(() => _selectedSessionId = id);
              Navigator.of(context).pop();
            },
          ),
        ),
      ),
      endDrawer: Drawer(
        child: SafeArea(child: ProfilePanel(sessionKey: sessionKey)),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Chatbox(sessionKey: sessionKey),
        ),
      ),
    );
  }
}
