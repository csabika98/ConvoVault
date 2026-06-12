import 'package:convovault/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('app boots with the chat screen and default session',
      (tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(ConvoVaultApp(prefs: prefs));
    await tester.pump();

    // Default phone-sized surface → narrow layout with app bar.
    expect(find.text('ConvoVault'), findsOneWidget);
    expect(find.text('AI vs Human'), findsOneWidget);
    expect(find.text('AI vs AI'), findsOneWidget);
    expect(find.text('No messages yet.'), findsOneWidget);

    // History drawer lists the default session.
    await tester.tap(find.byTooltip('Open navigation menu'));
    await tester.pumpAndSettle();
    expect(find.text('Session 1'), findsOneWidget);
    expect(find.text('History'), findsOneWidget);
  });

  testWidgets('wide layout shows all three panes', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    tester.view.physicalSize = const Size(1400, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(ConvoVaultApp(prefs: prefs));
    await tester.pump();

    expect(find.text('History'), findsOneWidget);
    expect(find.text('AI Profile'), findsOneWidget);
    expect(find.text('Session 1'), findsOneWidget);
    expect(find.text('No messages yet.'), findsOneWidget);
  });
}
