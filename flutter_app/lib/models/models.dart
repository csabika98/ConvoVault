enum AiMode { aiVsHuman, aiVsAi }

class ChatTurn {
  const ChatTurn({required this.role, required this.content});

  final String role;
  final String content;

  Map<String, String> toJson() => {'role': role, 'content': content};
}

class AiReply {
  const AiReply({required this.content, this.reasoningDetails});

  final String content;
  final Object? reasoningDetails;
}

class Session {
  const Session({required this.id, required this.title});

  final int id;
  final String title;
}

class Character {
  const Character({
    required this.id,
    required this.name,
    this.avatarUrl = '',
    required this.initials,
  });

  final int id;
  final String name;
  final String avatarUrl;
  final String initials;

  Character copyWith({String? name, String? avatarUrl, String? initials}) {
    return Character(
      id: id,
      name: name ?? this.name,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      initials: initials ?? this.initials,
    );
  }
}

class AssistantProfile {
  const AssistantProfile({
    required this.name,
    required this.introduction,
    required this.personality,
    required this.wikipediaTitle,
    required this.avatarEmoji,
    this.avatarUrl,
  });

  final String name;
  final String introduction;
  final String personality;
  final String wikipediaTitle;
  final String avatarEmoji;
  final String? avatarUrl;

  AssistantProfile copyWith({String? avatarUrl}) {
    return AssistantProfile(
      name: name,
      introduction: introduction,
      personality: personality,
      wikipediaTitle: wikipediaTitle,
      avatarEmoji: avatarEmoji,
      avatarUrl: avatarUrl ?? this.avatarUrl,
    );
  }
}

class AvatarSnapshot {
  const AvatarSnapshot({
    required this.name,
    this.avatarUrl = '',
    this.avatarEmoji = '',
  });

  final String name;
  final String avatarUrl;
  final String avatarEmoji;
}

class ChatMessage {
  ChatMessage({
    required this.content,
    required this.isUser,
    this.assistantAvatar,
  }) : id = _nextId++;

  static int _nextId = 1;

  final int id;
  final String content;
  final bool isUser;
  final AvatarSnapshot? assistantAvatar;
}

class SimulationRequest {
  const SimulationRequest({
    required this.id,
    required this.participants,
    required this.durationMs,
    required this.topic,
  });

  final int id;
  final List<Character> participants;
  final int durationMs;
  final String topic;
}
