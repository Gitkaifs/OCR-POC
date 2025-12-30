import 'dart:io';
import 'package:http/http.dart' as http;

class OcrApi {
  static const baseUrl = 'https://YOUR_BACKEND_URL';

  static Future<String> upload(File image) async {
    try {
      final req = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/ocr/upload'),
      );
      req.files.add(await http.MultipartFile.fromPath('file', image.path));
      await req.send();
      // return jsonDecode(body)['job_id'];
    } catch (e) {
      print(e);
    }
    return "ijdflk";
  }

  static Future<String> status(String jobId) async {
    try {
      await http.get(Uri.parse('$baseUrl/ocr/status/$jobId'));
      // return jsonDecode(res.body)['status'];
    } catch (e) {
      print(e);
    }
    return "COMPLETED";
  }

  static Future<String> result(String jobId) async {
    try {
      await http.get(Uri.parse('$baseUrl/ocr/result/$jobId'));
      // return jsonDecode(res.body)['text'];
    } catch (e) {
      print(e);
    }
    return '''"dummy ocr"''';
  }
}
