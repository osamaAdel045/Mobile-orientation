import 'dart:async';
import 'package:flutter/material.dart';
import 'package:lightbite_app/core/theme/extensions/lightbite_theme.dart';
import '../../l10n/app_localizations.dart';
import '../connectivity/connectivity_service.dart';

/// Shows a banner at the top of the screen when offline.
///
/// Wraps [child] and overlays a thin connectivity warning when
/// the device loses network access.
class LBOfflineBanner extends StatefulWidget {
  const LBOfflineBanner({super.key, required this.connectivity, required this.child});
  final ConnectivityService connectivity; final Widget child;

  @override
  State<LBOfflineBanner> createState() => _LBOfflineBannerState();
}

class _LBOfflineBannerState extends State<LBOfflineBanner> {
  StreamSubscription<bool>? _sub; bool _isOffline = false; bool _dismissed = false;

  @override
  void initState() {
    super.initState();
    _isOffline = !widget.connectivity.isConnected;
    _sub = widget.connectivity.onConnectivityChanged.listen((connected) {
      if (mounted) setState(() { _isOffline = !connected; if (connected) _dismissed = false; });
    });
  }

  @override
  void dispose() { _sub?.cancel(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final theme = LightBiteTheme.of(context);
    final showBanner = _isOffline && !_dismissed;

    return Column(
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          height: showBanner ? 44 : 0,
          color: theme.colors.neutral900,
          child: showBanner
              ? Row(
                  children: [
                    const SizedBox(width: 16),
                    const Icon(Icons.wifi_off, color: Colors.white, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        AppLocalizations.of(context)?.offlineBanner ?? 'You are offline.',
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                      ),
                    ),
                    GestureDetector(
                      onTap: () => setState(() => _dismissed = true),
                      child: const Padding(
                        padding: EdgeInsets.all(12),
                        child: Icon(Icons.close, color: Colors.white54, size: 16),
                      ),
                    ),
                  ],
                )
              : null,
        ),
        Expanded(child: widget.child),
      ],
    );
  }
}
