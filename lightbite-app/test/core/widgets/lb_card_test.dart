import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lightbite_app/core/widgets/lb_card.dart';
import '../../helpers/test_app.dart';

void main() {
  group('LBCard', () {
    testWidgets('renders child widget', (tester) async {
      await tester.pumpWidget(testApp(const LBCard(child: Text('Card content'))));
      expect(find.text('Card content'), findsOneWidget);
    });
    testWidgets('calls onTap when tapped', (tester) async {
      var tapped = false;
      await tester.pumpWidget(testApp(LBCard(child: const Text('Tappable'), onTap: () => tapped = true)));
      await tester.tap(find.text('Tappable'));
      expect(tapped, true);
    });
  });
}
