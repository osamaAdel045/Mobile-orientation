// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appName => 'لايت بايت';

  @override
  String get tagline => 'أكل سريع، تجربة خفيفة';

  @override
  String get login => 'تسجيل الدخول';

  @override
  String get register => 'إنشاء حساب';

  @override
  String get email => 'البريد الإلكتروني';

  @override
  String get password => 'كلمة المرور';

  @override
  String get emailRequired => 'البريد الإلكتروني مطلوب';

  @override
  String get passwordRequired => 'كلمة المرور مطلوبة';

  @override
  String get loginFailedDefault => 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.';

  @override
  String get customer => 'عميل';

  @override
  String get driver => 'سائق';

  @override
  String get driverAppTitle => 'لايت بايت - سائق';

  @override
  String get home => 'الرئيسية';

  @override
  String get cart => 'السلة';

  @override
  String get orders => 'الطلبات';

  @override
  String get profile => 'الملف الشخصي';

  @override
  String get earnings => 'الأرباح';

  @override
  String get history => 'السجل';

  @override
  String get deliverTo => 'توصيل إلى';

  @override
  String get searchPlaceholder => 'ابحث عن مطاعم أو أطباق...';

  @override
  String restaurantsNearYou(int count) {
    return '$count مطاعم بالقرب منك';
  }

  @override
  String get minAbbrev => 'دقيقة';

  @override
  String get deliveryFee => 'رسوم التوصيل';

  @override
  String get deliveryFeeDefault => 'رسوم التوصيل 5.00 درهم';

  @override
  String get subtotal => 'المجموع الفرعي';

  @override
  String get tax => 'الضريبة';

  @override
  String get total => 'المجموع';

  @override
  String get cartEmpty => 'سلتك فارغة';

  @override
  String get cartEmptySubtitle => 'أضف أطباقاً من مطعم للبدء';

  @override
  String fromRestaurant(String name) {
    return 'من: $name';
  }

  @override
  String get proceedToCheckout => 'متابعة للدفع';

  @override
  String minimumOrder(int minOrder, String shortfall) {
    return 'الحد الأدنى للطلب: $minOrder درهم. أضف $shortfall درهم إضافية.';
  }

  @override
  String get noOrders => 'لا توجد طلبات بعد';

  @override
  String get noOrdersSubtitle => 'اطلب أول طلب لتجده هنا';

  @override
  String get active => 'نشط';

  @override
  String orderNumber(String number) {
    return 'طلب #$number';
  }

  @override
  String get deliveredStatus => 'تم التوصيل!';

  @override
  String get onItsWay => 'في الطريق';

  @override
  String get orderProgress => 'حالة الطلب';

  @override
  String get driverAssigned => 'تم تعيين سائق';

  @override
  String estimatedDelivery(int minutes) {
    return 'الوقت المتوقع: $minutes دقيقة';
  }

  @override
  String get items => 'الأصناف';

  @override
  String get youAreOffline => 'أنت غير متصل';

  @override
  String get tapToStartReceiving => 'اضغط لبدء استلام طلبات التوصيل';

  @override
  String get lookingForJobs => 'جاري البحث عن طلبات...';

  @override
  String get notifyWhenAvailable => 'سنخطرك عند توفر طلب توصيل';

  @override
  String get newDeliveryJob => 'طلب توصيل جديد!';

  @override
  String get restaurantLabel => 'المطعم';

  @override
  String get dropoff => 'وجهة التوصيل';

  @override
  String get distance => 'المسافة';

  @override
  String pickupFrom(String name) {
    return 'استلام من $name';
  }

  @override
  String get deliverToCustomer => 'توصيل إلى العميل';

  @override
  String get confirmPickup => 'تأكيد الاستلام';

  @override
  String get confirmDelivery => 'تأكيد التوصيل';

  @override
  String get accept => 'قبول!';

  @override
  String get decline => 'رفض';

  @override
  String get todayEarnings => 'اليوم';

  @override
  String get trips => 'رحلات';

  @override
  String get weekEarnings => 'الأسبوع';

  @override
  String get offlineBanner => 'أنت غير متصل. بعض الميزات قد لا تكون متاحة.';

  @override
  String get dismiss => 'إغلاق';

  @override
  String get tryAgain => 'حاول مرة أخرى';

  @override
  String get loading => 'جارٍ التحميل...';

  @override
  String get errorOccurred => 'حدث خطأ ما';

  @override
  String get noRestaurants => 'لا توجد مطاعم قريبة';

  @override
  String get noAccountMessage => 'ليس لديك حساب؟';

  @override
  String get logout => 'تسجيل الخروج';

  @override
  String get save => 'حفظ';

  @override
  String get cancel => 'إلغاء';

  @override
  String get orderNow => 'اطلب الآن';

  @override
  String get placeOrder => 'تأكيد الطلب';

  @override
  String get trackOrder => 'تتبع الطلب';

  @override
  String get orderHistory => 'سجل الطلبات';

  @override
  String get statusPending => 'قيد الانتظار';

  @override
  String get statusConfirmed => 'مؤكد';

  @override
  String get statusPreparing => 'قيد التحضير';

  @override
  String get statusReady => 'جاهز';

  @override
  String get statusPickedUp => 'تم الاستلام';

  @override
  String get statusDelivering => 'قيد التوصيل';

  @override
  String get statusDelivered => 'تم التوصيل';

  @override
  String get statusCancelled => 'ملغي';

  @override
  String get statusRejected => 'مرفوض';

  @override
  String get today => 'اليوم';

  @override
  String get yesterday => 'أمس';

  @override
  String get addToCart => 'إضافة';

  @override
  String addedToCart(String item) {
    return 'تمت إضافة $item إلى السلة';
  }

  @override
  String get viewCart => 'عرض السلة';

  @override
  String get unavailable => 'غير متوفر';

  @override
  String get noMenuItems => 'لا توجد عناصر في القائمة';

  @override
  String get startDelivery => 'بدء التوصيل';
}
