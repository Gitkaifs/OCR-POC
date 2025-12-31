import 'dart:convert';
import 'dart:io';

import 'package:app/models.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:mime/mime.dart';

class OcrApi {
  static const String baseUrl = 'http://192.168.1.53:3000/api';
  static final http.Client _client = http.Client();

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
      var values = List.from(
        jsonDecode(response.body)['allData'] as Iterable<dynamic>,
      );
      return values.map((e) {
        return Document.fromMap(e);
      }).toList();
    } catch (e) {
      return <Document>[];
    }
  }

  static String getImgUrl(String str) {
    return "$baseUrl/$str";
  }
  // static Future<String> status(String jobId) async {
  //   try {
  //     final response = await _client
  //         .get(Uri.parse('$baseUrl/api/status/$jobId'))
  //         .timeout(const Duration(seconds: 10));

  //     return jsonDecode(response.body)['status'];
  //   } catch (e) {
  //     print(e);
  //     return "COMPLETED";
  //   }
  // }

  // static Future<String> result(String jobId) async {
  //   try {
  //     final response = await _client
  //         .get(Uri.parse('$baseUrl/api/result/$jobId'))
  //         .timeout(const Duration(seconds: 10));

  //     return jsonDecode(response.body)['text'];
  //   } catch (e) {
  //     print(e);
  //     return "";
  //   }
  // }
}
