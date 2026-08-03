import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lightbite_app/core/widgets/lb_button.dart';
import '../../helpers/test_app.dart';

void main() {
  group('LBButton', () {
    testWidgets('renders label text', (tester) async {
      await tester.pumpWidget(testApp(const LBButton(label: 'Click me', onPressed: null)));
      expect(find.text('Click me'), findsOneWidget);
    });

    testWidgets('calls onPressed when tapped', (tester) async {
      var tapped = false;
      await tester.pumpWidget(testApp(LBButton(label: 'Tap', onPressed: () => tapped = true)));
      await tester.tap(find.text('Tap'));
      expect(tapped, true);
    });

    testWidgets('does not call onPressed when disabled', (tester) async {
      var tapped = false;
      await tester.pumpWidget(testApp(const LBButton(label: 'Disabled', onPressed: null)));
      await tester.tap(find.text('Disabled'));
      expect(tapped, false);
    });

    testWidgets('shows CircularProgressIndicator when loading', (tester) async {
      await tester.pumpWidget(testApp(const LBButton(label: 'Loading', onPressed: null, loading: true)));
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('renders icon when provided', (tester) async {
      await tester.pumpWidget(testApp(const LBButton(label: 'With icon', onPressed: null, icon: Icons.add)));
      expect(find.byIcon(Icons.add), findsOneWidget);
    });

    testWidgets('secondary variant renders with border', (tester) async {
      await tester.pumpWidget(testApp(const LBButton(label: 'Secondary', onPressed: null, variant: LBButtonVariant.secondary)));
      expect(find.text('Secondary'), findsOneWidget);
    });
  });
}
