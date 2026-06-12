import 'package:flutter/material.dart';

import '../models/models.dart';
import 'app_avatar.dart';

class MessageBubble extends StatelessWidget {
  const MessageBubble({
    super.key,
    required this.message,
    required this.userAvatar,
  });

  final ChatMessage message;

  final String userAvatar;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final isUser = message.isUser;

    final avatar = isUser
        ? AppAvatar(
            imageBytes: decodeAvatar(userAvatar),
            fallback: 'HU',
            primary: true,
          )
        : AssistantAvatar(profile: message.assistantAvatar);

    final bubble = Flexible(
      child: Container(
        padding: const EdgeInsets.all(12),
        constraints: const BoxConstraints(maxWidth: 560),
        decoration: BoxDecoration(
          color: colors.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          message.content,
          style: Theme.of(context).textTheme.bodyMedium,
        ),
      ),
    );

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment:
            isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isUser) ...[avatar, const SizedBox(width: 8)],
          bubble,
          if (isUser) ...[const SizedBox(width: 8), avatar],
        ],
      ),
    );
  }
}

class AssistantAvatar extends StatelessWidget {
  const AssistantAvatar({super.key, this.profile});

  final AvatarSnapshot? profile;

  @override
  Widget build(BuildContext context) {
    return AppAvatar(
      imageUrl: profile?.avatarUrl ?? '',
      fallback: (profile?.avatarEmoji.isNotEmpty ?? false)
          ? profile!.avatarEmoji
          : 'AI',
    );
  }
}
