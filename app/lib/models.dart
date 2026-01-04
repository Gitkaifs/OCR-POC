class Document {
  final String imageUrl;
  final String csvUrl;

  Document({
    required this.imageUrl,
    required this.csvUrl,
  });

  static Document fromMap(Map<String, dynamic> map) => Document(
        imageUrl: map['imagePath'].toString(),
        csvUrl: map['csvPath'].toString(),
      );
}
