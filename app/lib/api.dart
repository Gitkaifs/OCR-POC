import 'dart:convert';
import 'dart:io';

import 'package:app/models.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:mime/mime.dart';

class OcrApi {
  static const String baseUrl = 'http://192.168.4.97:3000/api';
  static final http.Client _client = http.Client();

  // unchanged
  static Future<void> upload(File image) async {
    final mimeType = lookupMimeType(image.path) ?? 'application/octet-stream';
    final parts = mimeType.split('/');

    final mediaType = parts.length == 2
        ? MediaType(parts[0], parts[1])
        : MediaType('application', 'octet-stream');

    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl/upload'));

    request.files.add(
      await http.MultipartFile.fromPath(
        'image',
        image.path,
        contentType: mediaType,
      ),
    );

    final streamedResponse = await _client.send(request);
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode != 200) {
      throw Exception(response.body);
    }
  }

  static Future<List<Document>> getAll() async {
    try {
      final response = await _client
          .get(Uri.parse("$baseUrl/getall"))
          .timeout(const Duration(seconds: 10));

      final values = List.from(
        jsonDecode(response.body)['allData'] as Iterable<dynamic>,
      );

      return values.map((e) => Document.fromMap(e)).toList();
    } catch (_) {
      return <Document>[];
    }
  }


  // ✅ FIX: download CSV as bytes, then decode
  static Future<String> fetchCsvFromDownloadUrl(String csvPath) async {
    final response = await _client.get(Uri.parse("$baseUrl$csvPath"));

    if (response.statusCode != 200) {
      throw Exception('Failed to download CSV');
    }
    // critical line
    return utf8.decode(response.bodyBytes);
  }

  static Future<List<int>> downloadExcelBytes(String excelPath) async {
    final response = await _client.get(Uri.parse("$baseUrl$excelPath"));

    if (response.statusCode != 200) {
      throw Exception('Failed to download Excel');
    }

    return response.bodyBytes;
  }
}
