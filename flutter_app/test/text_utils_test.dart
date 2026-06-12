import 'package:convovault/models/models.dart';
import 'package:convovault/utils/text_utils.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('deriveInitials', () {
    test('takes first letters of the first two words', () {
      expect(deriveInitials('Ada Lovelace'), 'AL');
      expect(deriveInitials('Sherlock'), 'S');
      expect(deriveInitials('Johann Sebastian Bach'), 'JS');
    });

    test('falls back when empty', () {
      expect(deriveInitials(''), 'AI');
      expect(deriveInitials(null, fallback: '?'), '?');
    });
  });

  group('splitIntoChatBubbles', () {
    test('keeps short paragraphs whole', () {
      expect(splitIntoChatBubbles('Hello there. How are you?', 2),
          ['Hello there. How are you?']);
    });

    test('splits long paragraphs into sentence chunks', () {
      const text = 'One. Two. Three. Four. Five.';
      expect(splitIntoChatBubbles(text, 2),
          ['One. Two.', 'Three. Four.', 'Five.']);
    });

    test('splits on blank lines first', () {
      expect(splitIntoChatBubbles('First paragraph.\n\nSecond paragraph.', 2),
          ['First paragraph.', 'Second paragraph.']);
    });

    test('returns empty list for blank input', () {
      expect(splitIntoChatBubbles('   ', 2), isEmpty);
    });
  });

  group('parseSimulationMessage', () {
    const participants = [
      Character(id: 1, name: 'Ada Lovelace', initials: 'AL'),
      Character(id: 2, name: 'Sherlock Holmes', initials: 'SH'),
    ];

    test('parses strict JSON replies', () {
      final result = parseSimulationMessage(
        '{"speaker":"Ada Lovelace","message":"Numbers are poetry."}',
        participants,
        0,
      );
      expect(result.speaker, 'Ada Lovelace');
      expect(result.message, 'Numbers are poetry.');
    });

    test('parses "Speaker: message" plain text', () {
      final result = parseSimulationMessage(
        'Sherlock Holmes: Elementary, of course.',
        participants,
        0,
      );
      expect(result.speaker, 'Sherlock Holmes');
      expect(result.message, 'Elementary, of course.');
    });

    test('rejects unknown speakers and rotates fallback by turn', () {
      final result = parseSimulationMessage(
        'Moriarty: I object.',
        participants,
        1,
      );
      expect(result.speaker, 'Sherlock Holmes');
      expect(result.message, 'Moriarty: I object.');
    });
  });

  group('parseCharacterProfile', () {
    test('parses a complete profile', () {
      final profile = parseCharacterProfile(
        '{"name":"Marie Curie","introduction":"Pioneer of radioactivity.",'
        '"personality":"Precise and humble.","wikipediaTitle":"Marie Curie",'
        '"avatarEmoji":"⚗️"}',
      );
      expect(profile, isNotNull);
      expect(profile!.name, 'Marie Curie');
      expect(profile.avatarEmoji, '⚗️');
    });

    test('rejects incomplete profiles', () {
      expect(parseCharacterProfile('{"name":"Marie Curie"}'), isNull);
      expect(parseCharacterProfile('not json'), isNull);
    });
  });
}
