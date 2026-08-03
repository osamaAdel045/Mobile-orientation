import type { FrameworkConfig } from '@/types/framework'

export const FRAMEWORKS: FrameworkConfig[] = [
  {
    id: 'flutter',
    name: 'Flutter',
    icon: 'F',
    color: '#4DA6FF',
    company: 'Google',
    language: 'Dart',
    year: '2017',
    tagline: 'Owns the screen. Compiles to native ARM code. No bridge.',
    description:
      "Flutter is Google's open-source UI toolkit for building natively compiled applications from a single codebase. Unlike React Native or Ionic, Flutter does not use platform UI components — it paints every pixel itself through its own rendering engine (Impeller, formerly Skia). This gives Flutter complete control over the rendering surface, enabling pixel-perfect UI across platforms and consistent 60/120fps animations.",
  },
  {
    id: 'react-native',
    name: 'React Native',
    icon: 'RN',
    color: '#61DAFB',
    company: 'Meta (Facebook)',
    language: 'JavaScript / TypeScript',
    year: '2015',
    tagline: 'Learn once, write anywhere. JavaScript drives native UI.',
    description:
      'React Native enables building mobile apps using React and JavaScript. Unlike Flutter, RN uses the platform\'s native UI components — a <code>&lt;Text&gt;</code> becomes a <code>UITextView</code> on iOS and a <code>TextView</code> on Android. The JavaScript runtime (Hermes in production) communicates with native code through the JSI (JavaScript Interface), which replaced the legacy async Bridge in the New Architecture.',
  },
  {
    id: 'android',
    name: 'Native Android',
    icon: 'A',
    color: '#3DDC84',
    company: 'Google',
    language: 'Kotlin / Java',
    year: '2008',
    tagline: 'Direct platform access. No abstractions. Full OS integration.',
    description:
      'Native Android development gives you direct access to the Android SDK, hardware APIs, and platform capabilities without any cross-platform abstraction layer. With Jetpack Compose (declarative UI) and Kotlin as the modern language, Android development has transformed from verbose XML/Java to a concise, reactive paradigm. The ART runtime executes DEX bytecode compiled from Kotlin/Java with profile-guided AOT compilation for optimal performance.',
  },
  {
    id: 'ios',
    name: 'Native iOS',
    icon: 'i',
    color: '#FA7343',
    company: 'Apple',
    language: 'Swift / Objective-C',
    year: '2008',
    tagline: 'Swift concurrency. Metal GPU. Direct hardware access.',
    description:
      "Native iOS development provides direct access to Apple's entire ecosystem: SwiftUI for declarative UI, Swift Concurrency (async/await, actors, Sendable) for structured concurrency, Metal for GPU compute, and deep integration with iOS, iPadOS, watchOS, tvOS, and visionOS. Native iOS apps have the smallest binary footprint and fastest startup of any mobile development approach.",
  },
  {
    id: 'kmm',
    name: 'Kotlin Multiplatform',
    icon: 'K',
    color: '#B86CE8',
    company: 'JetBrains',
    language: 'Kotlin',
    year: '2020 (Alpha) / 2023 (Stable)',
    tagline: 'Share business logic. Keep native UI. Best of both worlds.',
    description:
      "Kotlin Multiplatform (KMP) takes a fundamentally different approach from Flutter or React Native: share business logic, keep native UI. The shared Kotlin module compiles to JVM bytecode for Android and native ARM64 binaries for iOS (via Kotlin/Native). Each platform renders its own native UI (Jetpack Compose on Android, SwiftUI on iOS). This means KMP apps look and feel completely native on each platform — because they are native on each platform.",
  },
  {
    id: 'maui',
    name: '.NET MAUI',
    icon: 'M',
    color: '#8A6AD8',
    company: 'Microsoft',
    language: 'C#',
    year: '2022',
    tagline: '.NET everywhere. XAML or C# UI. Native via handlers.',
    description:
      ".NET MAUI (Multi-platform App UI) is Microsoft's cross-platform framework, the successor to Xamarin.Forms. It runs on the .NET runtime (Mono on Android/iOS, CoreCLR on Windows) and renders UI through Handler-based mapping to native controls. Developers write UI in XAML or C# code, and MAUI maps the abstract controls to platform-native implementations at runtime.",
  },
  {
    id: 'ionic',
    name: 'Ionic + Capacitor',
    icon: 'Io',
    color: '#4A8CFF',
    company: 'Ionic (Independent)',
    language: 'JavaScript / TypeScript',
    year: '2013 (Ionic) / 2019 (Capacitor)',
    tagline: 'Web native. Runs in WebView. Capacitor bridges to native.',
    description:
      "Ionic is a web-native cross-platform framework. Your app is an HTML/CSS/JS application that runs inside a platform WebView (WebKit on iOS, Chromium WebView on Android). Capacitor (Ionic's native bridge, successor to Cordova) provides JavaScript-to-native API access. The UI is rendered by the platform's browser engine — no custom renderer, no native UI compilation. Ionic is the lightest cross-platform approach: if you can build it for the web, you can build it for mobile.",
  },
]

export function getFramework(id: string): FrameworkConfig | undefined {
  return FRAMEWORKS.find(f => f.id === id)
}

/**
 * Map of section number → section title for each framework.
 * All frameworks share the same section titles.
 */
export const SECTION_TITLES: Record<number, string> = {
  1: '1. Overview & Introduction',
  2: '2. Internal Architecture',
  3: '3. Rendering Pipeline',
  4: '4. Compilation Process',
  5: '5. Project Structure',
  6: '6. State Management',
  7: '7. Architecture Patterns',
  8: '8. Navigation',
  9: '9. Networking',
  10: '10. Local Database',
  11: '11. Dependency Injection',
  12: '12. Native Integration',
  13: '13. Package System',
  14: '14. Performance',
  15: '15. Debugging',
  16: '16. Testing',
  17: '17. CI/CD',
  18: '18. Security',
  19: '19. AI Development',
  20: '20. Best Practices',
  21: '21. Common Mistakes',
  22: '22. Decision Matrix',
  23: '23. Comparisons',
  24: '24. Real Project Example',
}

export function getSectionTitle(sectionNum: number): string {
  return SECTION_TITLES[sectionNum] || `Section ${sectionNum}`
}
