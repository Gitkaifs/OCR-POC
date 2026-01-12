class Document {
  final String imageUrl;
  final String excelLink;

  Document({required this.imageUrl, required this.excelLink});

  static Document fromMap(Map<String, dynamic> map) => Document(
    imageUrl: map['imagePath'].toString(),
    excelLink: map['excelPath'].toString(),
  );
}
