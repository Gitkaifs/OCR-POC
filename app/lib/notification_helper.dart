import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:android_intent_plus/android_intent.dart';
import 'package:android_intent_plus/flag.dart';
import 'dart:io';
import 'package:permission_handler/permission_handler.dart';

class NotificationHelper {
  static final _plugin = FlutterLocalNotificationsPlugin();

  static Future<void> init() async {
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const settings = InitializationSettings(android: android);

    await _plugin.initialize(
      settings,
      onDidReceiveNotificationResponse: (response) {
        final uri = response.payload;
        if (uri != null) {
          _openUri(uri);
        }
      },
    );
  }

  static void _openUri(String uri) {
    final intent = AndroidIntent(
      action: 'android.intent.action.VIEW',
      data: uri,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      flags: <int>[
        Flag.FLAG_GRANT_READ_URI_PERMISSION,
        Flag.FLAG_ACTIVITY_NEW_TASK,
      ],
    );

    intent.launch();
  }

  static Future<void> showDownloadComplete(String uri) async {
    if (Platform.isAndroid) {
      final status = await Permission.notification.status;
      if (!status.isGranted) {
        await Permission.notification.request();
      }
    }
    const androidDetails = AndroidNotificationDetails(
      'downloads',
      'Downloads',
      channelDescription: 'File download notifications',
      importance: Importance.high,
      priority: Priority.high,
    );

    const notificationDetails = NotificationDetails(android: androidDetails);

    await _plugin.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      'Excel downloaded',
      'Tap to open file',
      notificationDetails,
      payload: uri, // 👈 content URI, not path
    );
  }
}
