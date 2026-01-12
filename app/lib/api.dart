import 'dart:convert';
import 'dart:io';

import 'package:app/models.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:mime/mime.dart';

import 'api_config.dart';

class OcrApi {
  static final http.Client _client = http.Client();

  static Future<void> upload(File image) async {
    final baseUrl = await ApiConfig.getBaseUrl();

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
      final baseUrl = await ApiConfig.getBaseUrl();

      final response = await _client
          .get(Uri.parse('$baseUrl/getall'))
          .timeout(const Duration(seconds: 30));

      final values = List.from(
        jsonDecode(response.body)['allData'] as Iterable<dynamic>,
      );

      return values.map((e) => Document.fromMap(e)).toList();
    } catch (_) {
      return <Document>[];
    }
  }

  static Future<List<int>> fetchExcelFromDownloadUrl(String excelPath) async {
    final baseUrl = await ApiConfig.getBaseUrl();

    final response = await _client.get(Uri.parse('$baseUrl$excelPath'));

    if (response.statusCode != 200) {
      throw Exception('Failed to download CSV');
    }

    return response.bodyBytes;
  }

  static Future<String> getImageUrl(String imagePath) async {
    final baseUrl = await ApiConfig.getBaseUrl();
    return '$baseUrl/$imagePath';
  }
}
