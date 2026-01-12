import 'package:app/api_setup_screen.dart';
import 'package:app/notification_helper.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:media_store_plus/media_store_plus.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationHelper.init();
  await MediaStore.ensureInitialized();
  MediaStore.appFolder = 'OCR';
  runApp(
    AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
      ),
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'OCR App',
      theme: ThemeData(useMaterial3: true),
      themeMode: ThemeMode.dark,
      home: const ApiSetupScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}
