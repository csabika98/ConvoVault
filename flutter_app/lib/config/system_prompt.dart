import 'dart:math';

import '../models/models.dart';

const systemPromptAiVsHuman = '''You are ConvoVault.

Mode: AI vs Human (default).

Behave like a normal helpful chatbot assistant. Answer the user's questions directly and naturally.

Formatting constraints:
- No markdown formatting. Use plain text only.
- Keep responses concise. If there is a lot to say, split it into multiple short paragraphs.''';

const systemPromptAiVsAi = '''You are ConvoVault, a group-chat simulator.

The app's purpose: pick 3–4 historical or fictional figures, pose a question, and simulate a realistic group chat between them. The UI renders it like a real chat with avatars and typing indicators.

Core behavior:
- Always write as a multi-person group chat transcript: each message clearly indicates the speaker (e.g. "Ada Lovelace:", "Sherlock Holmes:", etc.).
- Keep each message short, chat-like, and distinct in voice, worldview, and knowledge.
- No markdown formatting. Use plain text only.
- Keep messages compact: max 1–2 sentences per chat bubble. If there is more to say, split it into multiple separate messages (multiple bubbles).
- Ask clarifying questions only if absolutely necessary; otherwise make reasonable assumptions and proceed.
- Avoid narration, scene-setting, or stage directions unless the user explicitly asks.

Modes:
- Default is AI vs Human: the user is one participant and the other 3–4 participants are the chosen figures.
- AI vs AI: simulate all participants without requiring user replies. Write in English and simulate personas based on the provided context.''';

const systemPromptAiVsHumanPersonaSection = '''Persona to follow for this conversation:
- Name: {{name}}
- Introduction: {{introduction}}
- Personality: {{personality}}
- Stay consistent with this persona's tone and style in all replies.
- This persona definition overrides any conflicting identity in prior chat messages.
- If asked for your name or identity, answer as "{{name}}".''';

String buildAiVsAiSystemPrompt(
  List<Character> characters, {
  String topic = '',
}) {
  final participants = characters
      .map((character) => character.name.trim())
      .where((name) => name.isNotEmpty)
      .take(5)
      .toList();

  if (participants.isEmpty) return systemPromptAiVsAi;

  final trimmedTopic = topic.trim();

  return [
    systemPromptAiVsAi,
    '',
    'Active simulation participants:',
    ...participants.map((name) => '- $name'),
    '',
    trimmedTopic.isNotEmpty
        ? 'Discussion topic: $trimmedTopic'
        : 'Discussion topic: choose any natural topic that fits these participants.',
    '',
    'For each request, return STRICT JSON only with these string fields:',
    '- speaker: exactly one active participant name',
    "- message: one short chat message in that participant's voice",
    'Rules:',
    '- choose a speaker who naturally continues the conversation',
    '- do not invent speakers outside the active participants',
    trimmedTopic.isNotEmpty
        ? '- keep every message focused on the declared discussion topic'
        : '- pick a topic and keep the conversation coherent',
    '- no markdown, no backticks, no extra keys',
  ].join('\n');
}

String buildNamedCharacterProfilePrompt(String requestedName) {
  final name = requestedName.trim();
  if (name.isEmpty) return '';

  return [
    'Generate a single AI assistant character profile for a chat app.',
    'The character must be this real famous person (historical or public figure): $name.',
    'If the name is ambiguous, choose the single best-known real person who matches.',
    'Return STRICT JSON only with these string fields:',
    'Rules:',
    "- name: use the exact famous person's common full name",
    '- introduction: one short sentence under 120 characters',
    "- personality: 1-2 sentences matching that person's known communication style",
    '- wikipediaTitle: exact English Wikipedia page title for that person',
    '- avatarEmoji: exactly one emoji that matches the persona vibe, it should be colorful',
    '- do not use fictional characters',
    '- no markdown, no backticks, no extra keys',
  ].join('\n');
}

List<ChatTurn> buildRandomCharactersPrompt(int count) {
  return [
    ChatTurn(
      role: 'system',
      content: [
        'You generate diverse participant lists for an AI-vs-AI chat simulator.',
        'Return STRICT JSON only.',
        'No markdown, no backticks, no explanation.',
      ].join('\n'),
    ),
    ChatTurn(
      role: 'user',
      content: [
        'Choose exactly $count well-known characters or public figures for a group chat simulation.',
        'They can be real historical/public figures or famous fictional characters.',
        'Prioritize variety in era, domain, worldview, and speaking style.',
        'Return this JSON shape only:',
        '{"characters":["Name One","Name Two"]}',
      ].join('\n'),
    ),
  ];
}

const _personaCategories = [
  'Science',
  'Technology',
  'Philosophy',
  'Politics',
  'History',
  'Literature',
  'Arts',
  'Music',
  'Film & Television',
  'Mythology',
  'Religion',
  'Business',
  'Economics',
  'Psychology',
  'Exploration',
  'Military',
  'Sports',
  'Gaming',
  'Internet Culture',
  'Anime & Manga',
  'Comics & Superheroes',
  'Fantasy',
  'Science Fiction',
  'World Leaders',
  'Revolutionaries',
  'Inventors',
  'Detectives',
  'Villains',
  'Heroes',
  'Royalty',
  'Scientists',
  'Writers',
  'Musicians',
  'Philosophers',
  'Celebrities',
  'Entrepreneurs',
  'Hackers',
  'Journalists',
  'Historical Figures',
  'Fictional Characters',
  'Ancient Civilizations',
  'Medieval Era',
  'Cyberpunk',
  'Post-Apocalyptic',
  'Space Exploration',
  'Artificial Intelligence',
  'Conspiracy & Mystery',
  'Folklore & Legends',
  'Arctic Cultures',
  'Debate Masters',
  'Chaotic Thinkers',
  'Visionaries',
  'Strategists',
  'Geniuses',
  'Rebels',
  'Diplomats',
  'Antiheroes',
  'Master Manipulators',
  'Comedians',
  'Wise Mentors',
  'Dark Academia',
  'Solarpunk',
  'Retro Futurism',
  'Noir',
  'Steampunk',
  'Gothic',
  'Utopian',
  'Dystopian',
];

final _random = Random();

String buildCharacterProfilePrompt(List<String> excludedNames) {
  final blocked = excludedNames
      .map((name) => name.trim())
      .where((name) => name.isNotEmpty)
      .take(8)
      .toList();

  final category = _personaCategories[_random.nextInt(_personaCategories.length)];

  return [
    'Generate a single AI assistant character profile for a chat app.',
    'The character must be a real famous person (historical or public figure), not fictional.',
    'Use this category as the main inspiration: $category.',
    'Prioritize variety across science, arts, politics, exploration, philosophy, and world regions.',
    'Return STRICT JSON only with these string fields:',
    'Rules:',
    "- name: use the exact famous person's common full name",
    '- introduction: one short sentence under 120 characters',
    "- personality: 1-2 sentences matching that person's known communication style",
    '- wikipediaTitle: exact English Wikipedia page title for that person',
    '- avatarEmoji: exactly one emoji that matches the persona vibe, it should be colorful',
    '- do not use fictional characters',
    if (blocked.isNotEmpty)
      '- do not use any of these already-used people: ${blocked.join(', ')}',
    '- if an excluded person appears in your draft, pick another famous person instead',
    '- no markdown, no backticks, no extra keys',
  ].join('\n');
}
