class Document {
  final String imageUrl;
  final String text;

  Document({required this.imageUrl, required this.text});

  static Document fromMap(Map<String, dynamic> map) => Document(
    imageUrl: map['imagePath'].toString(),
    text: map['extractedText'].toString(),
  );
}
