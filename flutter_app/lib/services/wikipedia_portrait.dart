import 'dart:convert';

import 'package:http/http.dart' as http;

Future<String?> fetchWikipediaPortraitUrl(String? title) async {
  final safeTitle = Uri.encodeComponent((title ?? '').trim());
  if (safeTitle.isEmpty) return null;

  try {
    final summaryUrl =
        'https://en.wikipedia.org/api/rest_v1/page/summary/$safeTitle';
    final summaryResponse = await http.get(Uri.parse(summaryUrl));
    if (summaryResponse.statusCode == 200) {
      final summaryData =
          jsonDecode(utf8.decode(summaryResponse.bodyBytes)) as Map<String, dynamic>;
      final fromSummary =
          (summaryData['thumbnail'] as Map<String, dynamic>?)?['source'] ??
              (summaryData['originalimage'] as Map<String, dynamic>?)?['source'];
      if (fromSummary is String && fromSummary.isNotEmpty) return fromSummary;
    }

    final pageImageUrl =
        'https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=512&redirects=1&format=json&titles=$safeTitle&origin=*';
    final response = await http.get(Uri.parse(pageImageUrl));
    if (response.statusCode != 200) return null;
    final data = jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
    final pages = (data['query'] as Map<String, dynamic>?)?['pages'];
    if (pages is! Map<String, dynamic>) return null;
    for (final page in pages.values) {
      if (page is! Map<String, dynamic>) continue;
      final source = (page['thumbnail'] as Map<String, dynamic>?)?['source'];
      if (source is String && source.isNotEmpty) return source;
    }
    return null;
  } catch (_) {
    return null;
  }
}
