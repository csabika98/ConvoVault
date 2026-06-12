import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/profile_state.dart';
import 'app_avatar.dart';

class AIProfileView extends StatefulWidget {
  const AIProfileView({super.key});

  @override
  State<AIProfileView> createState() => _AIProfileViewState();
}

class _AIProfileViewState extends State<AIProfileView> {
  bool _isEditingName = false;
  final _nameController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final profileState = context.read<ProfileState>();
      if (profileState.assistantProfile == null &&
          !profileState.isGeneratingProfile) {
        profileState.regenerateProfile();
      }
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _handleNameEditToggle(ProfileState profileState) {
    final busy =
        profileState.isGeneratingProfile || profileState.isFetchingPortrait;
    if (busy) return;

    if (_isEditingName) {
      final trimmed = _nameController.text.trim();
      setState(() => _isEditingName = false);
      if (trimmed.isEmpty) return;
      profileState.regenerateProfileForRequestedName(trimmed);
      return;
    }

    _nameController.text = profileState.assistantProfile?.name ?? '';
    setState(() => _isEditingName = true);
  }

  @override
  Widget build(BuildContext context) {
    final profileState = context.watch<ProfileState>();
    final profile = profileState.assistantProfile;
    final busy =
        profileState.isGeneratingProfile || profileState.isFetchingPortrait;
    final textTheme = Theme.of(context).textTheme;
    final mutedColor = Theme.of(context).colorScheme.onSurfaceVariant;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        AppAvatar(
          imageUrl: profile?.avatarUrl ?? '',
          fallback: profile?.avatarEmoji ?? '✨',
          radius: 40,
        ),
        const SizedBox(height: 16),
        if (profile == null)
          Text('Generating profile...', style: textTheme.titleMedium)
        else if (_isEditingName)
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _nameController,
                  autofocus: true,
                  enabled: !busy,
                  textAlign: TextAlign.center,
                  decoration: const InputDecoration(
                    isDense: true,
                    border: OutlineInputBorder(),
                  ),
                  onSubmitted: (_) => _handleNameEditToggle(profileState),
                ),
              ),
              IconButton(
                onPressed: busy ? null : () => _handleNameEditToggle(profileState),
                icon: const Icon(Icons.check, size: 18),
                tooltip: 'Confirm name',
              ),
            ],
          )
        else
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Flexible(
                child: Text(
                  profile.name,
                  style: textTheme.titleMedium,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              IconButton(
                onPressed: busy ? null : () => _handleNameEditToggle(profileState),
                icon: const Icon(Icons.edit_outlined, size: 18),
                tooltip: 'Edit name',
              ),
            ],
          ),
        const SizedBox(height: 8),
        Text(
          profile?.introduction ??
              'Please wait while we create your AI character.',
          textAlign: TextAlign.center,
          style: textTheme.bodySmall?.copyWith(color: mutedColor),
        ),
        const SizedBox(height: 16),
        if (profile == null)
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              border: Border.all(
                  color: Theme.of(context).colorScheme.outlineVariant),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                const SizedBox(width: 8),
                Text(
                  profileState.isGeneratingProfile
                      ? 'Generating profile...'
                      : 'Loading profile...',
                  style: textTheme.bodySmall,
                ),
              ],
            ),
          )
        else ...[
          Text.rich(
            TextSpan(
              children: [
                const TextSpan(
                  text: 'Personality: ',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
                TextSpan(text: profile.personality),
              ],
            ),
            style: textTheme.bodySmall?.copyWith(color: mutedColor),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: busy ? null : () => profileState.regenerateProfile(),
            icon: const Icon(Icons.refresh, size: 16),
            label: Text(
              profileState.isGeneratingProfile
                  ? 'Refreshing...'
                  : profileState.isFetchingPortrait
                      ? 'Fetching portrait...'
                      : 'Randomize',
            ),
          ),
        ],
      ],
    );
  }
}
