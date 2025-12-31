import 'dart:async';
import 'dart:io';
import 'package:cunning_document_scanner/cunning_document_scanner.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';

import 'api.dart';
import 'documents.screen.dart';
import 'home_screen.dart';

class ScanDocumentScreen extends StatefulWidget {
  const ScanDocumentScreen({super.key});

  @override
  State<ScanDocumentScreen> createState() => _ScanDocumentScreenState();
}

class _ScanDocumentScreenState extends State<ScanDocumentScreen> {
  String _status = 'Opening scanner…';
  File? imageFile;

  @override
  void initState() {
    super.initState();
    try {
      _scan();
    } catch (e) {
      setState(() => _status = "Failed, ${e.toString()}");
      Timer(Duration(milliseconds: 100), () => _goHome());
    }
  }

  Future<void> _scan() async {
    try {
      final List<String>? scannedImages =
          await CunningDocumentScanner.getPictures();

      if (scannedImages == null || scannedImages.isEmpty) {
        _goHome();
        return;
      }
      imageFile = File(scannedImages.first);

      setState(() => _status = 'Saving image…');

      final dir = await getApplicationDocumentsDirectory();
      final savedImage = await imageFile!.copy(
        '${dir.path}/${const Uuid().v4()}.jpg',
      );

      setState(() => _status = 'Uploading for OCR…');
      await OcrApi.upload(savedImage);

      if (!mounted) return;
      setState(() => _status = 'Almost done');
      Timer(
        Duration(milliseconds: 100),
        () => Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => DocumentsScreen()),
          (_) => false,
        ),
      );
    } catch (e) {
      _goHome();
    }
  }

  void _goHome() {
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => HomeScreen()),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF0F2027), Color(0xFF203A43), Color(0xFF2C5364)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: const [
                    Icon(Icons.crop, color: Colors.white),
                    SizedBox(width: 8),
                    Text(
                      'Processing Document',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(38),
                          blurRadius: 20,
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: imageFile == null
                          // to-do (shimmer effect for image).
                          ? const Center(child: CircularProgressIndicator())
                          : Image.file(
                              imageFile!,
                              width: double.infinity,
                              fit: BoxFit.cover,
                            ),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 24),

              Text(
                _status,
                style: const TextStyle(color: Colors.white70, fontSize: 15),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),

              const SizedBox(height: 16),

              const Padding(
                padding: EdgeInsets.only(bottom: 32),
                child: CircularProgressIndicator(color: Colors.white),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
