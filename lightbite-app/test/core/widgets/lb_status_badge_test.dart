import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lightbite_app/core/widgets/lb_status_badge.dart';
import '../../helpers/test_app.dart';

void main() {
  group('LBStatusBadge', () {
    testWidgets('renders without crashing', (tester) async {
      await tester.pumpWidget(testApp(const LBStatusBadge('pending')));
      expect(find.byType(LBStatusBadge), findsOneWidget);
    });
    testWidgets('renders delivered status without crashing', (tester) async {
      await tester.pumpWidget(testApp(const LBStatusBadge('delivered')));
      expect(find.byType(LBStatusBadge), findsOneWidget);
    });
  });
}
