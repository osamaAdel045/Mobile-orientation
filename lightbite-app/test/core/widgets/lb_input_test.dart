import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lightbite_app/core/widgets/lb_input.dart';
import '../../helpers/test_app.dart';

void main() {
  group('LBInput', () {
    testWidgets('renders with label text', (tester) async {
      await tester.pumpWidget(testApp(LBInput(controller: TextEditingController(), label: 'Email')));
      expect(find.text('Email'), findsOneWidget);
    });
    testWidgets('shows hint text', (tester) async {
      await tester.pumpWidget(testApp(LBInput(controller: TextEditingController(), hint: 'Enter your email')));
      expect(find.text('Enter your email'), findsOneWidget);
    });
  });
}
