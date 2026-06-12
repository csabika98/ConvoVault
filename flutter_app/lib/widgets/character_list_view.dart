import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/characters_state.dart';
import '../state/chat_state.dart';
import 'character_card.dart';

enum DiscussionLength { short, normal, long }

int _discussionDurationMs(DiscussionLength length) {
  switch (length) {
    case DiscussionLength.short:
      return 30000;
    case DiscussionLength.long:
      return 120000;
    case DiscussionLength.normal:
      return 60000;
  }
}

class CharacterListView extends StatefulWidget {
  const CharacterListView({super.key, this.sessionKey});

  final String? sessionKey;

  @override
  State<CharacterListView> createState() => _CharacterListViewState();
}

class _CharacterListViewState extends State<CharacterListView> {
  int? _selectedId;
  DiscussionLength _discussionLength = DiscussionLength.normal;
  bool _declareTopic = false;
  final _topicController = TextEditingController();
  bool _isRandomizing = false;
  bool _isStartingSimulation = false;

  @override
  void dispose() {
    _topicController.dispose();
    super.dispose();
  }

  Future<void> _handleRandomize() async {
    final charactersState = context.read<CharactersState>();
    setState(() => _isRandomizing = true);
    try {
      final next = await charactersState.randomizeCharacters();
      if (!mounted) return;
      setState(() => _selectedId = next.isNotEmpty ? next.first.id : null);
    } catch (error) {
      debugPrint('$error');
    } finally {
      if (mounted) setState(() => _isRandomizing = false);
    }
  }

  Future<void> _handleStartSimulation() async {
    final sessionKey = widget.sessionKey;
    if (sessionKey == null) return;

    final charactersState = context.read<CharactersState>();
    final chatState = context.read<ChatState>();
    setState(() => _isStartingSimulation = true);
    try {
      final request = await charactersState.startSimulation(
        durationMs: _discussionDurationMs(_discussionLength),
        topic: _declareTopic ? _topicController.text : '',
      );
      if (request != null) {
        // Fire and forget — the simulation streams into ChatState.
        // ignore: unawaited_futures
        chatState.runSimulation(request, sessionKey);
      }
    } finally {
      if (mounted) setState(() => _isStartingSimulation = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final charactersState = context.watch<CharactersState>();
    final characters = charactersState.characters;
    final busy = _isRandomizing || _isStartingSimulation;

    final canStartSimulation = characters
            .where((character) => character.name.trim().isNotEmpty)
            .length >=
        2;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final character in characters)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: CharacterCard(
              character: character,
              selected: _selectedId == character.id,
              onSelect: () => setState(() => _selectedId = character.id),
              onDelete: () {
                charactersState.deleteCharacter(character.id);
                if (_selectedId == character.id) {
                  setState(() => _selectedId = null);
                }
              },
              onNameChange: (newName) =>
                  charactersState.updateCharacterName(character.id, newName),
            ),
          ),
        const SizedBox(height: 4),
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            OutlinedButton.icon(
              onPressed: busy ? null : _handleRandomize,
              icon: const Icon(Icons.shuffle, size: 16),
              label: Text(_isRandomizing ? 'Randomizing...' : 'Randomize'),
            ),
            const SizedBox(width: 8),
            if (charactersState.charactersAreFull)
              const Chip(label: Text('Max 5 characters'))
            else
              IconButton.filledTonal(
                onPressed: busy
                    ? null
                    : () {
                        final newId = charactersState.addCharacter(
                          name: 'Character ${characters.length + 1}',
                        );
                        if (newId != null) {
                          setState(() => _selectedId = newId);
                        }
                      },
                icon: const Icon(Icons.add),
              ),
          ],
        ),
        const SizedBox(height: 24),
        Text('Discussion Length',
            style: Theme.of(context).textTheme.labelLarge),
        const SizedBox(height: 8),
        SegmentedButton<DiscussionLength>(
          segments: const [
            ButtonSegment(
                value: DiscussionLength.short, label: Text('Short')),
            ButtonSegment(
                value: DiscussionLength.normal, label: Text('Normal')),
            ButtonSegment(value: DiscussionLength.long, label: Text('Long')),
          ],
          selected: {_discussionLength},
          onSelectionChanged: (selection) =>
              setState(() => _discussionLength = selection.first),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Declare Topic',
                style: Theme.of(context).textTheme.labelLarge),
            Switch(
              value: _declareTopic,
              onChanged: (checked) {
                setState(() {
                  _declareTopic = checked;
                  if (!checked) _topicController.clear();
                });
              },
            ),
          ],
        ),
        if (_declareTopic) ...[
          const SizedBox(height: 8),
          TextField(
            controller: _topicController,
            minLines: 3,
            maxLines: 5,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              hintText:
                  'Explain the topic you wish the characters to chat about',
            ),
          ),
        ],
        const SizedBox(height: 24),
        Center(
          child: FilledButton(
            onPressed: !canStartSimulation || busy || widget.sessionKey == null
                ? null
                : _handleStartSimulation,
            child: Text(
                _isStartingSimulation ? 'Starting...' : 'Start simulation'),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}
