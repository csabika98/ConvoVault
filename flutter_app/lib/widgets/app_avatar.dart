import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';

class AppAvatar extends StatelessWidget {
  const AppAvatar({
    super.key,
    this.imageUrl = '',
    this.imageBytes,
    required this.fallback,
    this.radius = 20,
    this.primary = false,
  });

  final String imageUrl;
  final Uint8List? imageBytes;
  final String fallback;
  final double radius;
  final bool primary;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    ImageProvider? image;
    if (imageBytes != null) {
      image = MemoryImage(imageBytes!);
    } else if (imageUrl.isNotEmpty) {
      image = NetworkImage(imageUrl);
    }

    return CircleAvatar(
      radius: radius,
      backgroundColor:
          primary ? colors.primary : colors.surfaceContainerHighest,
      foregroundImage: image,
      onForegroundImageError: image != null ? (_, _) {} : null,
      child: Text(
        fallback,
        style: TextStyle(
          fontSize: radius * 0.65,
          fontWeight: FontWeight.w600,
          color: primary ? colors.onPrimary : colors.onSurface,
        ),
        overflow: TextOverflow.clip,
        maxLines: 1,
      ),
    );
  }
}

Uint8List? decodeAvatar(String stored) {
  if (stored.isEmpty) return null;
  try {
    return base64Decode(stored);
  } catch (_) {
    return null;
  }
}
