import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:lightbite_app/core/theme/app_colors.dart';
import 'package:lightbite_app/core/theme/app_spacing.dart';
import 'package:lightbite_app/core/widgets/lb_empty_state.dart';
import 'package:lightbite_app/features/customer/address/domain/entities/address.dart';
import 'package:lightbite_app/features/customer/address/presentation/pages/location_picker_page.dart';
import '../cubit/address_cubit.dart';
import '../cubit/address_state.dart';

class AddressPage extends StatelessWidget {
  const AddressPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Saved Addresses')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _openEditor(context),
        child: const Icon(Icons.add),
      ),
      body: BlocBuilder<AddressCubit, AddressState>(
        builder: (context, state) {
          return state.maybeWhen(
            loading: () => const Center(child: CircularProgressIndicator()),
            loaded: (addresses) => addresses.isEmpty
                ? const LBEmptyState(
                    icon: Icons.location_on_outlined,
                    title: 'No saved addresses',
                    subtitle: 'Add your first delivery address',
                  )
                : _buildList(context, addresses),
            saving: () => _buildFromState(context),
            error: (msg) => Center(child: Text(msg)),
            orElse: () => const Center(child: CircularProgressIndicator()),
          );
        },
      ),
    );
  }

  Widget _buildFromState(BuildContext context) {
    // If we're in 'saving' state, check if we have loaded data to display
    final state = context.read<AddressCubit>().state;
    return state.maybeWhen(
      loaded: (addresses) => _buildList(context, addresses),
      orElse: () => const Center(child: CircularProgressIndicator()),
    );
  }

  Widget _buildList(BuildContext context, List<Address> addresses) {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: addresses.length,
      itemBuilder: (_, i) {
        final a = addresses[i];
        final isDefault = a.isDefault;
        return Card(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            side: BorderSide(
              color: isDefault ? AppColors.primary500 : AppColors.neutral200,
              width: isDefault ? 1.5 : 1,
            ),
          ),
          child: ListTile(
            leading: Icon(Icons.location_on,
                color: isDefault ? AppColors.primary500 : AppColors.neutral400),
            title: Row(
              children: [
                Flexible(child: Text(a.label, overflow: TextOverflow.ellipsis)),
                if (isDefault) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                    decoration: BoxDecoration(
                      color: AppColors.primary100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text('Default',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.primary700)),
                  ),
                ],
              ],
            ),
            subtitle: Text(a.address, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12)),
            trailing: PopupMenuButton<String>(
              onSelected: (action) => _handleAction(context, action, a),
              itemBuilder: (_) => [
                const PopupMenuItem(value: 'edit', child: Text('Edit')),
                if (!isDefault)
                  const PopupMenuItem(value: 'default', child: Text('Set as Default')),
                const PopupMenuItem(value: 'delete', child: Text('Delete', style: TextStyle(color: AppColors.error))),
              ],
            ),
          ),
        );
      },
    );
  }

  void _handleAction(BuildContext context, String action, Address addr) {
    switch (action) {
      case 'edit':
        _openEditor(context, addr: addr);
      case 'default':
        context.read<AddressCubit>().createAddress(label: addr.label, address: addr.address, isDefault: true);
      case 'delete':
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Delete Address'),
            content: const Text('Are you sure you want to delete this address?'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
              TextButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  context.read<AddressCubit>().deleteAddress(addr.uuid);
                },
                child: const Text('Delete', style: TextStyle(color: AppColors.error)),
              ),
            ],
          ),
        );
    }
  }

  void _openEditor(BuildContext context, {Address? addr}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => _AddressForm(initial: addr, cubit: context.read<AddressCubit>()),
    );
  }
}

class _AddressForm extends StatefulWidget {
  const _AddressForm({this.initial, required this.cubit});
  final Address? initial;
  final AddressCubit cubit;

  @override
  State<_AddressForm> createState() => _AddressFormState();
}

class _AddressFormState extends State<_AddressForm> {
  final _form = GlobalKey<FormState>();
  late final _labelCtrl = TextEditingController(text: widget.initial?.label ?? '');
  late final _addressCtrl = TextEditingController(text: widget.initial?.address ?? '');
  double? _lat;
  double? _lng;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _lat = widget.initial?.lat;
    _lng = widget.initial?.lng;
  }

  @override
  void dispose() {
    _labelCtrl.dispose();
    _addressCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.initial != null;
    return Padding(
      padding: EdgeInsets.only(
        left: AppSpacing.md, right: AppSpacing.md, top: AppSpacing.md,
        bottom: MediaQuery.of(context).viewInsets.bottom + AppSpacing.md,
      ),
      child: Form(
        key: _form,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(isEdit ? 'Edit Address' : 'New Address', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: AppSpacing.md),
            TextFormField(
              controller: _labelCtrl,
              decoration: const InputDecoration(labelText: 'Label', hintText: 'Home, Work, etc.'),
              validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
            ),
            const SizedBox(height: AppSpacing.sm),
            TextFormField(
              controller: _addressCtrl,
              decoration: const InputDecoration(labelText: 'Address', hintText: 'Street, area'),
              validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
            ),
            const SizedBox(height: AppSpacing.sm),

            // Location picker
            OutlinedButton.icon(
              onPressed: () => _pickLocation(context),
              icon: const Icon(Icons.map_outlined),
              label: Text(_lat != null ? 'Change Location on Map' : 'Pick Location on Map'),
            ),
            if (_lat != null && _lng != null) ...[
              const SizedBox(height: 8),
              Text(
                '📍 ${_lat!.toStringAsFixed(6)}, ${_lng!.toStringAsFixed(6)}',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, color: AppColors.neutral400),
              ),
            ],

            const SizedBox(height: AppSpacing.lg),
            ElevatedButton(
              onPressed: _saving ? null : _save,
              child: _saving
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : Text(isEdit ? 'Update' : 'Save'),
            ),
            const SizedBox(height: AppSpacing.sm),
          ],
        ),
      ),
    );
  }

  Future<void> _pickLocation(BuildContext context) async {
    final result = await context.push<Map<String, dynamic>>(
      '/pick-location',
      extra: <String, double>{
        if (_lat != null) 'lat': _lat!,
        if (_lng != null) 'lng': _lng!,
      },
    );
    if (result != null && mounted) {
      setState(() {
        _lat = (result['lat'] as num).toDouble();
        _lng = (result['lng'] as num).toDouble();
      });
    }
  }

  Future<void> _save() async {
    if (!(_form.currentState?.validate() ?? false)) return;
    setState(() => _saving = true);
    try {
      await widget.cubit.createAddress(
        label: _labelCtrl.text.trim(),
        address: _addressCtrl.text.trim(),
        isDefault: widget.initial?.isDefault ?? false,
        lat: _lat,
        lng: _lng,
      );
      if (mounted) Navigator.pop(context);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to save address'), backgroundColor: AppColors.error),
        );
      }
    }
    if (mounted) setState(() => _saving = false);
  }
}
