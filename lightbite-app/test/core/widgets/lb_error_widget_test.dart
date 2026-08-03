import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lightbite_app/core/widgets/lb_error_widget.dart';
import '../../helpers/test_app.dart';

void main() {
  group('LBErrorWidget', () {
    testWidgets('renders error message', (tester) async {
      await tester.pumpWidget(testApp(const LBErrorWidget(message: 'Something went wrong')));
      expect(find.text('Something went wrong'), findsOneWidget);
    });
  });
}
