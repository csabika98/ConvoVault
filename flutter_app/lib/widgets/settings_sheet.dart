import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../state/profile_state.dart';
import '../state/theme_state.dart';
import 'app_avatar.dart';

Future<void> showSettingsSheet(BuildContext context) {
  return showModalBottomSheet(
    context: context,
    showDragHandle: true,
    isScrollControlled: true,
    builder: (_) => const _SettingsSheetContent(),
  );
}

class _SettingsSheetContent extends StatelessWidget {
  const _SettingsSheetContent();

  Future<void> _handleAvatarUpload(BuildContext context) async {
    final profileState = context.read<ProfileState>();
    final picked = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 512,
      maxHeight: 512,
    );
    if (picked == null) return;
    final bytes = await picked.readAsBytes();
    await profileState.setUserAvatar(base64Encode(bytes));
  }

  @override
  Widget build(BuildContext context) {
    final profileState = context.watch<ProfileState>();
    final themeState = context.watch<ThemeState>();
    final textTheme = Theme.of(context).textTheme;
    final mutedColor = Theme.of(context).colorScheme.onSurfaceVariant;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Settings', style: textTheme.titleMedium),
            Text(
              'Customize your chat experience.',
              style: textTheme.bodySmall?.copyWith(color: mutedColor),
            ),
            const SizedBox(height: 20),
            Text('Profile', style: textTheme.labelLarge),
            Text(
              'Manage how you appear in chat.',
              style: textTheme.bodySmall?.copyWith(color: mutedColor),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                border: Border.all(
                    color: Theme.of(context).colorScheme.outlineVariant),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  AppAvatar(
                    imageBytes: decodeAvatar(profileState.userAvatar),
                    fallback: 'HU',
                    radius: 24,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Your avatar', style: textTheme.bodyMedium),
                        Text(
                          'Used for your messages in chat.',
                          style: textTheme.bodySmall
                              ?.copyWith(color: mutedColor),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _handleAvatarUpload(context),
                    icon: const Icon(Icons.upload, size: 16),
                    label: const Text('Upload image'),
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton.tonal(
                  onPressed: profileState.userAvatar.isEmpty
                      ? null
                      : () => profileState.setUserAvatar(''),
                  child: const Text('Remove'),
                ),
              ],
            ),
            const Divider(height: 32),
            Text('Appearance', style: textTheme.labelLarge),
            Text(
              'Choose how ConvoVault looks on this device.',
              style: textTheme.bodySmall?.copyWith(color: mutedColor),
            ),
            const SizedBox(height: 12),
            SegmentedButton<ThemeMode>(
              segments: const [
                ButtonSegment(
                  value: ThemeMode.light,
                  label: Text('Light'),
                  icon: Icon(Icons.light_mode, size: 16),
                ),
                ButtonSegment(
                  value: ThemeMode.dark,
                  label: Text('Dark'),
                  icon: Icon(Icons.dark_mode, size: 16),
                ),
                ButtonSegment(
                  value: ThemeMode.system,
                  label: Text('System'),
                  icon: Icon(Icons.brightness_auto, size: 16),
                ),
              ],
              selected: {themeState.mode},
              onSelectionChanged: (selection) =>
                  themeState.setMode(selection.first),
            ),
          ],
        ),
      ),
    );
  }
}
