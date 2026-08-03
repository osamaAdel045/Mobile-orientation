import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:lightbite_app/core/config/app_environment.dart';

/// Full-screen location picker.
///
/// Uses Google Maps when an API key is configured, otherwise falls
/// back to a manual coordinate input form that uses the device's
/// current location as a starting point.
class LocationPickerPage extends StatefulWidget {
  const LocationPickerPage({super.key, this.initialLat, this.initialLng});

  final double? initialLat;
  final double? initialLng;

  @override
  State<LocationPickerPage> createState() => _LocationPickerPageState();
}

class _LocationPickerPageState extends State<LocationPickerPage> {
  LatLng? _selectedLocation;

  LatLng get _initialPosition => LatLng(
        widget.initialLat ?? AppEnvironmentConfig.defaultLat,
        widget.initialLng ?? AppEnvironmentConfig.defaultLng,
      );

  bool get _hasApiKey {
    final key = dotenv.env['GOOGLE_MAPS_API_KEY'];
    return key != null && key.isNotEmpty && key != 'YOUR_API_KEY_HERE';
  }

  @override
  void initState() {
    super.initState();
    _selectedLocation = _initialPosition;
  }

  void _confirm() {
    if (_selectedLocation != null) {
      Navigator.of(context).pop({
        'lat': _selectedLocation!.latitude,
        'lng': _selectedLocation!.longitude,
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pick Location'),
        actions: [
          TextButton(
            onPressed: _selectedLocation != null ? _confirm : null,
            child: const Text('Confirm'),
          ),
        ],
      ),
      body: _hasApiKey ? _buildMap() : _buildManualInput(),
    );
  }

  Widget _buildMap() {
    return Stack(
      children: [
        GoogleMap(
          initialCameraPosition: CameraPosition(target: _initialPosition, zoom: 15),
          onCameraMove: (position) => _selectedLocation = position.target,
          myLocationEnabled: true,
          myLocationButtonEnabled: true,
          zoomControlsEnabled: false,
        ),
        const IgnorePointer(
          child: Center(
            child: Icon(Icons.location_on, size: 48, color: Colors.red),
          ),
        ),
        if (_selectedLocation != null)
          Positioned(
            bottom: 24, left: 24, right: 24,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  '${_selectedLocation!.latitude.toStringAsFixed(6)}, ${_selectedLocation!.longitude.toStringAsFixed(6)}',
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildManualInput() {
    final latCtrl = TextEditingController(
      text: _selectedLocation?.latitude.toStringAsFixed(6) ?? AppEnvironmentConfig.defaultLat.toStringAsFixed(6),
    );
    final lngCtrl = TextEditingController(
      text: _selectedLocation?.longitude.toStringAsFixed(6) ?? AppEnvironmentConfig.defaultLng.toStringAsFixed(6),
    );

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.map_outlined, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          const Text('Enter Coordinates',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          const Text(
            'Google Maps API key not configured.\nEnter latitude and longitude manually.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey),
          ),
          const SizedBox(height: 32),
          TextField(
            controller: latCtrl,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(labelText: 'Latitude'),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: lngCtrl,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(labelText: 'Longitude'),
          ),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: () {
              final lat = double.tryParse(latCtrl.text);
              final lng = double.tryParse(lngCtrl.text);
              if (lat != null && lng != null) {
                Navigator.of(context).pop({'lat': lat, 'lng': lng});
              }
            },
            child: const Text('Confirm Location'),
          ),
        ],
      ),
    );
  }
}
