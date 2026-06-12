import 'package:flutter/material.dart';

import '../models/models.dart';
import 'app_avatar.dart';

class CharacterCard extends StatefulWidget {
  const CharacterCard({
    super.key,
    required this.character,
    required this.selected,
    required this.onSelect,
    required this.onDelete,
    required this.onNameChange,
  });

  final Character character;
  final bool selected;
  final VoidCallback onSelect;
  final VoidCallback onDelete;
  final ValueChanged<String> onNameChange;

  @override
  State<CharacterCard> createState() => _CharacterCardState();
}

class _CharacterCardState extends State<CharacterCard> {
  bool _isEditing = false;
  final _nameController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _handleEditToggle() {
    if (_isEditing) {
      final newName = _nameController.text.trim();
      if (newName.isNotEmpty && newName != widget.character.name) {
        widget.onNameChange(newName);
      }
      setState(() => _isEditing = false);
    } else {
      _nameController.text = widget.character.name;
      setState(() => _isEditing = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final character = widget.character;

    return Material(
      color: widget.selected
          ? colors.primary.withValues(alpha: 0.05)
          : Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(
          color: widget.selected
              ? colors.primary.withValues(alpha: 0.3)
              : colors.outlineVariant,
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: widget.onSelect,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          child: Row(
            children: [
              AppAvatar(
                imageUrl: character.avatarUrl,
                fallback:
                    character.initials.isNotEmpty ? character.initials : 'AI',
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _isEditing
                    ? TextField(
                        controller: _nameController,
                        autofocus: true,
                        decoration: const InputDecoration(
                          isDense: true,
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(
                              horizontal: 8, vertical: 8),
                        ),
                        style: Theme.of(context).textTheme.bodyMedium,
                        onSubmitted: (_) => _handleEditToggle(),
                      )
                    : Text(
                        character.name,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
              ),
              IconButton(
                onPressed: _handleEditToggle,
                icon: Icon(
                  _isEditing ? Icons.check : Icons.edit_outlined,
                  size: 18,
                ),
              ),
              IconButton(
                onPressed: widget.onDelete,
                icon: const Icon(Icons.delete_outline, size: 18),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
