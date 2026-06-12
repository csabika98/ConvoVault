import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/sessions_state.dart';

class HistoryPanel extends StatelessWidget {
  const HistoryPanel({
    super.key,
    required this.selectedSessionId,
    required this.onSessionSelect,
  });

  final int? selectedSessionId;
  final ValueChanged<int> onSessionSelect;

  @override
  Widget build(BuildContext context) {
    final sessionsState = context.watch<SessionsState>();
    final sessions = sessionsState.sessions;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Image.asset('assets/ConvoVault_transparent_logo.png',
                width: 36, height: 36),
            const SizedBox(width: 8),
            Text(
              'ConvoVault',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Text('History', style: Theme.of(context).textTheme.titleSmall),
        const Divider(height: 24),
        for (final (index, session) in sessions.indexed)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _SessionCard(
              title: session.title,
              counter: index + 1,
              isActive: selectedSessionId == session.id,
              onSelect: () => onSessionSelect(session.id),
              onDelete: () => sessionsState.deleteSession(session.id),
            ),
          ),
        Align(
          alignment: Alignment.centerRight,
          child: sessionsState.sessionsAreFull
              ? const Chip(label: Text('Max 5 sessions'))
              : IconButton.filledTonal(
                  onPressed: () {
                    final newId = sessionsState.addSession(
                      title: 'Session ${sessions.length + 1}',
                    );
                    if (newId != null) onSessionSelect(newId);
                  },
                  icon: const Icon(Icons.add),
                ),
        ),
      ],
    );
  }
}

class _SessionCard extends StatelessWidget {
  const _SessionCard({
    required this.title,
    required this.counter,
    required this.isActive,
    required this.onSelect,
    required this.onDelete,
  });

  final String title;
  final int counter;
  final bool isActive;
  final VoidCallback onSelect;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Material(
      color: isActive
          ? colors.primary.withValues(alpha: 0.05)
          : colors.surfaceContainerLow,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(
          color: isActive
              ? colors.primary.withValues(alpha: 0.3)
              : colors.outlineVariant,
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onSelect,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  border: Border.all(color: colors.outlineVariant),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  '#$counter',
                  style: Theme.of(context).textTheme.labelSmall,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                        color: isActive
                            ? colors.onSurface
                            : colors.onSurfaceVariant,
                      ),
                ),
              ),
              IconButton(
                onPressed: onDelete,
                icon: const Icon(Icons.delete_outline, size: 18),
                tooltip: 'Delete',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
