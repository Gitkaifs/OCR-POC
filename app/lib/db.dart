// import 'package:sqflite/sqflite.dart';
// import 'package:path/path.dart';
// import 'models.dart';

// class AppDatabase {
//   static Database? _db;

//   static Future<Database> get db async {
//     _db ??= await _initDb();
//     return _db!;
//   }

//   static Future<Database> _initDb() async {
//     final path = join(await getDatabasesPath(), 'documents.db');
//     return openDatabase(
//       path,
//       version: 1,
//       onCreate: (db, _) async {
//         await db.execute('''
//           CREATE TABLE documents (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             image_path TEXT,
//             text TEXT,
//             created_at TEXT
//           )
//         ''');
//       },
//     );
//   }

//   static Future<void> insert(Document doc) async {
//     final database = await db;
//     await database.insert('documents', doc.toMap());
//   }

//   static Future<List<Document>> getAll() async {
//     final database = await db;
//     final result = await database.query('documents', orderBy: 'id DESC');
//     return result.map(Document.fromMap).toList();
//   }
// }
