import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/models.dart';
import '../state/characters_state.dart';
import '../state/chat_state.dart';
import '../state/profile_state.dart';
import 'message_bubble.dart';

class Chatbox extends StatefulWidget {
  const Chatbox({super.key, this.sessionKey});

  final String? sessionKey;

  @override
  State<Chatbox> createState() => _ChatboxState();
}

class _ChatboxState extends State<Chatbox> {
  final _inputController = TextEditingController();
  final _scrollController = ScrollController();
  int _lastMessageCount = 0;

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottomAfterBuild(int messageCount) {
    if (messageCount == _lastMessageCount) return;
    _lastMessageCount = messageCount;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
      );
    });
  }

  Future<void> _handleSend() async {
    final sessionKey = widget.sessionKey;
    if (sessionKey == null) return;

    final chat = context.read<ChatState>();
    final profileState = context.read<ProfileState>();
    final mode = profileState.getModeForSession(sessionKey);
    final assistantProfile = profileState.assistantProfile;

    final text = _inputController.text.trim();
    if (text.isEmpty ||
        mode == AiMode.aiVsAi ||
        assistantProfile == null ||
        profileState.isGeneratingProfile ||
        chat.isLoading) {
      return;
    }

    _inputController.clear();
    await chat.sendMessage(
      sessionKey: sessionKey,
      text: text,
      assistantProfile: assistantProfile,
    );
  }

  @override
  Widget build(BuildContext context) {
    final chat = context.watch<ChatState>();
    final profileState = context.watch<ProfileState>();
    final charactersState = context.watch<CharactersState>();

    final sessionKey = widget.sessionKey;
    final hasSelectedSession = sessionKey != null;
    final mode = profileState.getModeForSession(sessionKey);
    final hasAssistantProfile = profileState.assistantProfile != null;
    final messages = chat.messagesFor(sessionKey);
    _scrollToBottomAfterBuild(messages.length);

    final simulationParticipants =
        charactersState.simulationRequest?.participants;
    final loadingAvatar = mode == AiMode.aiVsAi &&
            simulationParticipants != null &&
            simulationParticipants.isNotEmpty
        ? createSimulationAvatarSnapshot(
            simulationParticipants.first.name,
            simulationParticipants,
          )
        : _profileSnapshot(profileState.assistantProfile);

    final inputEnabled = hasSelectedSession &&
        mode != AiMode.aiVsAi &&
        hasAssistantProfile &&
        !profileState.isGeneratingProfile &&
        !chat.isLoading;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (hasSelectedSession)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                _ModeButton(
                  label: 'AI vs Human',
                  active: mode == AiMode.aiVsHuman,
                  enabled: !chat.isLoading && !profileState.isGeneratingProfile,
                  onPressed: () => profileState.setModeForSession(
                      sessionKey, AiMode.aiVsHuman),
                ),
                const SizedBox(width: 8),
                _ModeButton(
                  label: 'AI vs AI',
                  active: mode == AiMode.aiVsAi,
                  enabled: !chat.isLoading && !profileState.isGeneratingProfile,
                  onPressed: () =>
                      profileState.setModeForSession(sessionKey, AiMode.aiVsAi),
                ),
              ],
            ),
          ),
        Expanded(
          child: _buildMessages(
            context,
            chat: chat,
            messages: messages,
            hasSelectedSession: hasSelectedSession,
            loadingAvatar: loadingAvatar,
            userAvatar: profileState.userAvatar,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: TextField(
                controller: _inputController,
                enabled: inputEnabled,
                minLines: 1,
                maxLines: 6,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _handleSend(),
                decoration: InputDecoration(
                  border: const OutlineInputBorder(),
                  isDense: true,
                  hintText: !hasSelectedSession
                      ? 'Select a valid session first...'
                      : mode == AiMode.aiVsAi
                          ? 'Start the simulation from AI Profile...'
                          : 'Type a message...',
                ),
              ),
            ),
            const SizedBox(width: 8),
            IconButton.filled(
              onPressed: inputEnabled ? _handleSend : null,
              icon: chat.isLoading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.send),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMessages(
    BuildContext context, {
    required ChatState chat,
    required List<ChatMessage> messages,
    required bool hasSelectedSession,
    required AvatarSnapshot? loadingAvatar,
    required String userAvatar,
  }) {
    final mutedStyle = Theme.of(context).textTheme.bodyMedium?.copyWith(
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        );

    if (!hasSelectedSession) {
      return Text(
        'Select a session from History to view messages.',
        style: mutedStyle,
      );
    }

    final loadingRow = Row(
      children: [
        AssistantAvatar(profile: loadingAvatar),
        const SizedBox(width: 8),
        OutlinedButton.icon(
          onPressed: null,
          icon: const SizedBox(
            width: 14,
            height: 14,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
          label: Text(chat.isSimulationRunning ? 'Simulating' : 'Thinking'),
        ),
      ],
    );

    if (messages.isEmpty) {
      if (chat.isLoading) return Align(alignment: Alignment.bottomLeft, child: loadingRow);
      return Text('No messages yet.', style: mutedStyle);
    }

    return ListView(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(vertical: 8),
      children: [
        for (final message in messages)
          MessageBubble(message: message, userAvatar: userAvatar),
        if (chat.isLoading)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: loadingRow,
          ),
      ],
    );
  }

  static AvatarSnapshot? _profileSnapshot(AssistantProfile? profile) {
    if (profile == null) return null;
    return AvatarSnapshot(
      name: profile.name,
      avatarUrl: profile.avatarUrl ?? '',
      avatarEmoji: profile.avatarEmoji,
    );
  }
}

class _ModeButton extends StatelessWidget {
  const _ModeButton({
    required this.label,
    required this.active,
    required this.enabled,
    required this.onPressed,
  });

  final String label;
  final bool active;
  final bool enabled;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return active
        ? FilledButton(
            onPressed: enabled ? onPressed : null,
            child: Text(label),
          )
        : OutlinedButton(
            onPressed: enabled ? onPressed : null,
            child: Text(label),
          );
  }
}
