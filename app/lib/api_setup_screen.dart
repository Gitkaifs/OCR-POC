import 'package:app/api_config.dart';
import 'package:app/home_screen.dart';
import 'package:flutter/material.dart';

class ApiSetupScreen extends StatefulWidget {
  const ApiSetupScreen({super.key});

  @override
  State<ApiSetupScreen> createState() => _ApiSetupScreenState();
}

class _ApiSetupScreenState extends State<ApiSetupScreen> {
  final _ipController = TextEditingController(text: '192.168.1.21');
  final _portController = TextEditingController(text: '4000');

  Future<void> _saveAndContinue() async {
    await ApiConfig.saveConfig(
      ip: _ipController.text.trim(),
      port: _portController.text.trim(),
    );
    if (!context.mounted) return;
    // ignore: use_build_context_synchronously
    Navigator.of(
      context,
    ).push(MaterialPageRoute(builder: (context) => HomeScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Server Configuration')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: .center,
          mainAxisAlignment: .center,
          children: [
            TextField(
              controller: _ipController,
              decoration: const InputDecoration(labelText: 'Server IP'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _portController,
              decoration: const InputDecoration(labelText: 'Port'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _saveAndContinue,
              child: const Text('Continue'),
            ),
          ],
        ),
      ),
    );
  }
}
