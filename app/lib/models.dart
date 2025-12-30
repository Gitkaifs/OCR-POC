class Document {
  final int? id;
  final String imagePath;
  final String text;
  final String createdAt;

  Document({
    this.id,
    required this.imagePath,
    required this.text,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'image_path': imagePath,
    'text': text,
    'created_at': createdAt,
  };

  static Document fromMap(Map<String, dynamic> map) => Document(
    id: map['id'],
    imagePath: map['image_path'],
    text: map['text'],
    createdAt: map['created_at'],
  );
}
