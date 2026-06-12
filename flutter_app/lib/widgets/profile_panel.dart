import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/models.dart';
import '../state/profile_state.dart';
import 'ai_profile_view.dart';
import 'character_list_view.dart';

class ProfilePanel extends StatelessWidget {
  const ProfilePanel({super.key, this.sessionKey});

  final String? sessionKey;

  @override
  Widget build(BuildContext context) {
    final profileState = context.watch<ProfileState>();
    final mode = profileState.getModeForSession(sessionKey);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('AI Profile', style: Theme.of(context).textTheme.titleSmall),
        const Divider(height: 24),
        if (mode == AiMode.aiVsAi)
          CharacterListView(sessionKey: sessionKey)
        else
          const AIProfileView(),
      ],
    );
  }
}
