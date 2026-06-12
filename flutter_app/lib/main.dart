import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'screens/home_screen.dart';
import 'state/characters_state.dart';
import 'state/chat_state.dart';
import 'state/profile_state.dart';
import 'state/sessions_state.dart';
import 'state/theme_state.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  runApp(ConvoVaultApp(prefs: prefs));
}

class ConvoVaultApp extends StatelessWidget {
  const ConvoVaultApp({super.key, required this.prefs});

  final SharedPreferences prefs;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeState(prefs)),
        ChangeNotifierProvider(create: (_) => SessionsState()),
        ChangeNotifierProvider(create: (_) => ProfileState(prefs)),
        ChangeNotifierProvider(create: (_) => CharactersState()),
        ChangeNotifierProvider(
          create: (context) => ChatState(context.read<SessionsState>()),
        ),
      ],
      child: Consumer<ThemeState>(
        builder: (context, themeState, _) {
          return MaterialApp(
            title: 'ConvoVault',
            debugShowCheckedModeBanner: false,
            themeMode: themeState.mode,
            theme: _buildTheme(Brightness.light),
            darkTheme: _buildTheme(Brightness.dark),
            home: const HomeScreen(),
          );
        },
      ),
    );
  }

  static ThemeData _buildTheme(Brightness brightness) {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF3F3F46),
        brightness: brightness,
      ),
    );
  }
}
