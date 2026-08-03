import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lightbite_app/core/widgets/lb_empty_state.dart';
import '../../helpers/test_app.dart';

void main() {
  group('LBEmptyState', () {
    testWidgets('renders without crashing', (tester) async {
      await tester.pumpWidget(testApp(const LBEmptyState(title: 'No items', subtitle: 'Add your first item')));
      expect(find.byType(LBEmptyState), findsOneWidget);
    });
    testWidgets('renders action button when provided', (tester) async {
      await tester.pumpWidget(testApp(const LBEmptyState(title: 'Empty', actionLabel: 'Add')));
      expect(find.byType(LBEmptyState), findsOneWidget);
    });
  });
}
