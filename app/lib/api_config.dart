import 'package:shared_preferences/shared_preferences.dart';

class ApiConfig {
  static const String _keyIp = 'api_ip';
  static const String _keyPort = 'api_port';

  // defaults for first launch
  static const String defaultIp = '192.168.1.21';
  static const String defaultPort = '4000';

  static Future<String> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();

    final ip = prefs.getString(_keyIp) ?? defaultIp;
    final port = prefs.getString(_keyPort) ?? defaultPort;

    return 'http://$ip:$port/api';
  }

  static Future<void> saveConfig({
    required String ip,
    required String port,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyIp, ip);
    await prefs.setString(_keyPort, port);
  }

  static Future<bool> hasConfig() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey(_keyIp) && prefs.containsKey(_keyPort);
  }
}
