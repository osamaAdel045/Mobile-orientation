---
layout: home

hero:
  name: LightBite React Native
  text: Best-Practices Reference Implementation
  tagline: Expo SDK 52+ • Zustand • Expo Router • Zod • TypeScript strict • Laravel Reverb
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Architecture
      link: /technical/architecture

features:
  - title: Automated Quality Enforcement
    details: ESLint, Stylelint, TypeScript strict, scaffold generator, and CI prevent inconsistency before it reaches code review. Every standard from the spec is enforced by tooling.
  - title: Clean Architecture
    details: Feature-first folder structure with unidirectional data flow. Zustand stores with TypeScript discriminated unions, Neverthrow for error handling, Zod for runtime validation.
  - title: Cross-Platform Documentation
    details: Technical docs explain the WHY behind each pattern — state management, API interceptors, navigation, theming, and more — so you can carry these concepts to any framework.
  - title: Real-Time WebSocket Communication
    details: A minimal Pusher-protocol client connects to Laravel Reverb. Order tracking and driver job discovery receive live events over private channels with auto-reconnect and exponential backoff; polling is only a fallback.
  - title: 3-Phase Driver Delivery
    details: Pickup → Start Delivery → Deliver. The driver delivery flow moves orders through assigned → picked_up → delivering → delivered, with active delivery recovery after app restart so no job is ever lost.
  - title: Dark Mode
    details: System theme detection plus a manual light/dark toggle, driven by typed theme tokens. The preference is persisted in SecureStore so it survives app restarts.
  - title: Offline Detection
    details: A connectivity layer watches the WebSocket state and probes the /health endpoint, driving an offline banner whenever the network drops — no silent failures.
  - title: Payment Method Selection
    details: Checkout lets customers choose Cash on Delivery or Card (simulated for the demo). The payment method is a first-class field in the place-order request.
---
