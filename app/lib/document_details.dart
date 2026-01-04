import 'dart:io';
import 'package:app/api.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:excel/excel.dart';
import 'models.dart';
import 'notification_helper.dart';

Excel csvToExcel(String csv) {
  final excel = Excel.createExcel();
  final sheet = excel.sheets.values.first;

  final rows = csv
      .split('\n')
      .where((l) => l.trim().isNotEmpty)
      .map((l) => l.split(','))
      .toList();

  for (var r = 0; r < rows.length; r++) {
    for (var c = 0; c < rows[r].length; c++) {
      sheet
          .cell(CellIndex.indexByColumnRow(columnIndex: c, rowIndex: r))
          .value = TextCellValue(
        rows[r][c],
      );
    }
  }

  return excel;
}

class DocumentDetails extends StatelessWidget {
  final Document doc;
  const DocumentDetails({super.key, required this.doc});

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
          child: Stack(
            children: [
              /// 🔽 Single scroll (image + table together)
              SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 72, 16, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    /// 🖼 Zoomable image preview
                    Container(
                      height: 260,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(38),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: InteractiveViewer(
                          minScale: 1,
                          maxScale: 4,
                          child: Image.network(
                            "${OcrApi.baseUrl}/${doc.imageUrl}",
                            fit: BoxFit.cover,
                            errorBuilder: (_, _, _) => const Center(
                              child: CircularProgressIndicator(),
                            ),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    /// 📊 CSV / Excel preview
                    FutureBuilder<String>(
                      future: OcrApi.fetchCsvFromDownloadUrl(doc.csvUrl),
                      builder: (context, snapshot) {
                        if (!snapshot.hasData) {
                          return const Center(
                            child: Padding(
                              padding: EdgeInsets.all(32),
                              child: CircularProgressIndicator(
                                color: Colors.white,
                              ),
                            ),
                          );
                        }

                        final table = _parseAndNormalizeCsv(snapshot.data!);

                        return _CsvTable(table: table);
                      },
                    ),
                  ],
                ),
              ),

              /// 🔝 Floating top bar (unchanged behavior)
              Positioned(
                top: 16,
                left: 16,
                right: 16,
                child: _TopBar(doc: doc),
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<List<String>> _parseAndNormalizeCsv(String csv) {
    final rawRows = csv
        .split('\n')
        .where((l) => l.trim().isNotEmpty)
        .map((l) => l.split(','))
        .toList();

    final maxCols = rawRows
        .map((r) => r.length)
        .reduce((a, b) => a > b ? a : b);

    return rawRows.map((row) {
      if (row.length < maxCols) {
        return [...row, ...List.filled(maxCols - row.length, '')];
      }
      if (row.length > maxCols) {
        return row.sublist(0, maxCols);
      }
      return row;
    }).toList();
  }
}

class _CsvTable extends StatelessWidget {
  final List<List<String>> table;
  const _CsvTable({required this.table});

  @override
  Widget build(BuildContext context) {
    final headers = table.first;
    final rows = table.skip(1);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          columns: headers.map((h) => DataColumn(label: Text(h))).toList(),
          rows: rows
              .map(
                (r) => DataRow(cells: r.map((c) => DataCell(Text(c))).toList()),
              )
              .toList(),
        ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  final Document doc;
  const _TopBar({required this.doc});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _CircleButton(
          icon: Icons.arrow_back,
          onTap: () => Navigator.pop(context),
        ),
        _CircleButton(
          icon: Icons.download,
          onTap: () async {
            final status = await Permission.storage.request();
            if (!status.isGranted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Storage permission denied')),
              );
              return;
            }

            try {
              final csv = await OcrApi.fetchCsvFromDownloadUrl(doc.csvUrl);
              final excel = csvToExcel(csv);
              final bytes = excel.encode();

              if (bytes == null) throw Exception();

              final file = File(
                '/storage/emulated/0/Download/document_${DateTime.now().millisecondsSinceEpoch}.xlsx',
              );

              await file.writeAsBytes(bytes, flush: true);

              // 🔔 show notification instead of snackbar
              await NotificationHelper.showDownloadComplete(file.path);
            } catch (_) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Excel conversion failed')),
              );
            }
          },
        ),
      ],
    );
  }
}

class _CircleButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _CircleButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(color: Colors.black.withAlpha(38), blurRadius: 10),
          ],
        ),
        child: Icon(icon, color: const Color(0xFF2C5364)),
      ),
    );
  }
}
