import 'dart:async';
import 'dart:io';
import 'package:app/documents.screen.dart';
import 'package:app/home_screen.dart';
import 'package:flutter/material.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';
import 'api.dart';

class CropScreen extends StatefulWidget {
  final String imagePath;
  const CropScreen({super.key, required this.imagePath});

  @override
  State<CropScreen> createState() => _CropScreenState();
}

class _CropScreenState extends State<CropScreen> {
  File? _finalImage;
  String _status = 'Preparing document…';
  bool _started = false;

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      try {
        _openCropper();
      } catch (e) {
        setState(() => _status = "Failed, ${e.toString()}");
        Timer(
          Duration(milliseconds: 100),
          () => Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => HomeScreen()),
            (route) => false,
          ),
        );
      }
    });
  }

  Future<void> _openCropper() async {
    if (_started) return;
    _started = true;

    final cropped = await ImageCropper().cropImage(
      sourcePath: widget.imagePath,
      uiSettings: [
        AndroidUiSettings(
          toolbarTitle: 'Crop Document',
          hideBottomControls: false,
          lockAspectRatio: false,
        ),
        IOSUiSettings(title: 'Crop Document'),
      ],
    );

    if (cropped == null || !mounted) {
      // ignore: use_build_context_synchronously
      Navigator.pop(context);
      return;
    }

    await _processAfterCrop(File(cropped.path));
  }

  Future<void> _processAfterCrop(File croppedFile) async {
    setState(() => _status = 'Saving image…');

    final dir = await getApplicationDocumentsDirectory();
    final savedImage = await croppedFile.copy(
      '${dir.path}/${const Uuid().v4()}.jpg',
    );

    setState(() => _finalImage = savedImage);

    setState(() => _status = 'Uploading for OCR…');
    await OcrApi.upload(savedImage);

    if (!mounted) return;
    setState(() => _status = "Almost, done");
    Timer(
      Duration(milliseconds: 100),
      () => Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => DocumentsScreen()),
        (route) => false,
      ),
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
                      child: _finalImage == null
                          // to-do (shimmer effect for image).
                          ? const Center(child: CircularProgressIndicator())
                          : Image.file(
                              _finalImage!,
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
