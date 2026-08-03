# 11 — Design System: LightBite

**Date:** 2026-07-26
**Status:** Draft
**Version:** 1.0

---

This design system is the single source of truth for all 6 platforms (Flutter, React Native, Android, iOS, Ionic, Web). Every frontend implements these tokens idiomatically in its framework.

---

## 1. Brand

| Token | Value |
|---|---|
| **Brand Name** | LightBite |
| **Tagline** | Fast food, light experience |
| **Brand Personality** | Fast, transparent, warm, modern, trustworthy |

---

## 2. Colors

### 2.1 Primary Palette

| Token | Hex | HSL | Usage |
|---|---|---|---|
| `--color-primary-50` | `#FFF7ED` | 33, 100%, 96% | Background tint |
| `--color-primary-100` | `#FFEDD5` | 33, 100%, 91% | Light background |
| `--color-primary-200` | `#FED7AA` | 33, 96%, 83% | |
| `--color-primary-300` | `#FDBA74` | 33, 95%, 72% | |
| `--color-primary-400` | `#FB923C` | 33, 96%, 61% | |
| `--color-primary-500` | `#F97316` | 33, 95%, 53% | Primary action, brand |
| `--color-primary-600` | `#EA580C` | 33, 93%, 48% | Hover/pressed state |
| `--color-primary-700` | `#C2410C` | 33, 88%, 41% | Active state |
| `--color-primary-800` | `#9A3412` | 33, 80%, 34% | |
| `--color-primary-900` | `#7C2D12` | 33, 75%, 28% | Text on light |

**Primary: Warm Orange** — appetite-stimulating, energetic, friendly. Used for CTAs, brand elements, active states.

### 2.2 Neutral Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-neutral-0` | `#FFFFFF` | Surface, card backgrounds |
| `--color-neutral-50` | `#F9FAFB` | Page background |
| `--color-neutral-100` | `#F3F4F6` | Secondary background |
| `--color-neutral-200` | `#E5E7EB` | Borders, dividers |
| `--color-neutral-300` | `#D1D5DB` | Disabled state |
| `--color-neutral-400` | `#9CA3AF` | Placeholder text |
| `--color-neutral-500` | `#6B7280` | Secondary text |
| `--color-neutral-700` | `#374151` | Body text |
| `--color-neutral-900` | `#111827` | Heading text |

### 2.3 Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#16A34A` | Confirmed, delivered, success toasts |
| `--color-success-light` | `#DCFCE7` | Success background |
| `--color-warning` | `#F59E0B` | Preparing, pending states |
| `--color-warning-light` | `#FEF3C7` | Warning background |
| `--color-error` | `#DC2626` | Rejected, cancelled, errors |
| `--color-error-light` | `#FEE2E2` | Error background |
| `--color-info` | `#2563EB` | Driver assigned, info toasts |
| `--color-info-light` | `#DBEAFE` | Info background |

### 2.4 Order Status Colors

| Status | Color Token |
|---|---|
| Pending | `--color-warning` (Amber) |
| Confirmed | `--color-info` (Blue) |
| Preparing | `--color-warning` (Amber) |
| Ready | `--color-success` (Green) |
| Assigned / Picked Up / Delivering | `--color-primary-500` (Orange) |
| Delivered | `--color-success` (Green) |
| Rejected / Expired / Cancelled | `--color-error` (Red) |

---

## 3. Typography

### 3.1 Font Family

| Platform | Font |
|---|---|
| iOS | SF Pro (system) |
| Android | Roboto (system) |
| Flutter | Roboto (default) or SF Pro via Google Fonts |
| Web | Inter (Google Fonts, weights 400/500/600/700) |
| React Native | System default per platform |

### 3.2 Type Scale

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `--text-xs` | 12px | 16px | 400 | Captions, badges |
| `--text-sm` | 14px | 20px | 400 | Body small, secondary text |
| `--text-base` | 16px | 24px | 400 | Body text, inputs |
| `--text-lg` | 18px | 28px | 500 | Card titles, section headers |
| `--text-xl` | 20px | 28px | 600 | Screen titles |
| `--text-2xl` | 24px | 32px | 700 | Page headers |
| `--text-3xl` | 30px | 36px | 700 | Hero text |

---

## 4. Spacing

| Token | Value | Usage |
|---|---|---|
| `--space-xs` | 4px | Icon-inside-button padding |
| `--space-sm` | 8px | Tight spacing, list item gaps |
| `--space-md` | 16px | Standard padding, card padding |
| `--space-lg` | 24px | Section spacing, screen margins |
| `--space-xl` | 32px | Large section breaks |
| `--space-2xl` | 48px | Screen-level separation |

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 6px | Buttons, inputs, chips |
| `--radius-md` | 12px | Cards, modals, bottom sheets |
| `--radius-lg` | 16px | Large cards, image containers |
| `--radius-full` | 9999px | Pills, avatars, badges |

---

## 6. Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation (cards) |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Elevated cards, dropdowns |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.10)` | Modals, bottom sheets |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Full-screen overlays |

---

## 7. Component Tokens

### 7.1 Buttons

| Variant | Background | Text | Border |
|---|---|---|---|
| Primary | `--color-primary-500` | `#FFFFFF` | None |
| Primary Hover | `--color-primary-600` | `#FFFFFF` | None |
| Secondary | `--color-neutral-0` | `--color-neutral-900` | `--color-neutral-200` |
| Danger | `--color-error` | `#FFFFFF` | None |
| Ghost | Transparent | `--color-primary-500` | None |
| Disabled | `--color-neutral-200` | `--color-neutral-400` | None |

**Sizes:** Small (h32, text-sm), Medium (h44, text-base), Large (h52, text-lg)
**Border radius:** `--radius-sm` (6px)
**Min touch target:** 44x44px (accessibility)

### 7.2 Input Fields

| State | Border | Background |
|---|---|---|
| Default | `--color-neutral-200` | `--color-neutral-0` |
| Focus | `--color-primary-500` | `--color-neutral-0` |
| Error | `--color-error` | `--color-error-light` |
| Disabled | `--color-neutral-200` | `--color-neutral-100` |

**Height:** 48px (comfortable tap target)
**Border radius:** `--radius-sm`
**Padding:** `--space-md` horizontal

### 7.3 Cards

| Variant | Usage |
|---|---|
| Restaurant Card | Image (160px height), name, cuisine tags, rating, delivery time, delivery fee |
| Menu Item Card | Optional image (80px), name, description (2-line clamp), price, add button |
| Order Card | Order number, status badge, items summary, total, timestamp |
| Status Card | Large status icon, title, description, action button |

**Border radius:** `--radius-md`
**Padding:** `--space-md`
**Shadow:** `--shadow-sm`
**Gap between cards:** `--space-md`

### 7.4 Status Badges

Display order status inline with color + icon + text.

| Status | Icon | Color |
|---|---|---|
| Confirmed | CheckCircle | `--color-success` |
| Preparing | Clock / ChefHat | `--color-warning` |
| Ready | Package | `--color-success` |
| Delivering | Truck / Motorcycle | `--color-primary-500` |
| Delivered | CheckDouble | `--color-success` |
| Rejected / Cancelled | XCircle | `--color-error` |

### 7.5 Bottom Navigation (Customer)

| Tab | Icon | Label |
|---|---|---|
| Home | House | Home |
| Search | MagnifyingGlass | Search |
| Orders | ClipboardList | Orders |
| Profile | User | Profile |

### 7.6 Bottom Navigation (Driver)

| Tab | Icon | Label |
|---|---|---|
| Home | House | Home |
| Earnings | ChartBar | Earnings |
| History | Clock | History |
| Profile | User | Profile |

---

## 8. Screen Inventory

### 8.1 Customer App Screens

| # | Screen | Key Elements |
|---|---|---|
| 1 | Onboarding | 3-slide carousel: "Discover restaurants", "Track in real-time", "Fast delivery" |
| 2 | Login / Register | Email, password fields. Role selector (customer only in customer app). Social login buttons (future) |
| 3 | Home | Location bar. Search bar. Cuisine filter chips (horizontal scroll). Restaurant cards (vertical list). Pull-to-refresh |
| 4 | Search | Search input (auto-focus). Recent searches. Results: restaurants + dishes tabs |
| 5 | Restaurant Detail | Cover image. Restaurant info (name, rating, cuisine, hours). Menu tabs (categories). Menu items list. Sticky "View Cart" bar |
| 6 | Menu Item Detail | Full image. Name, description, price. Quantity selector. "Add to Cart" button. Special instructions field |
| 7 | Cart | Item list with quantity controls. Special instructions per item. Subtotal, delivery fee, tax, total. "Checkout" button |
| 8 | Checkout | Delivery address selector + map picker. Order summary. Payment method (card). "Place Order" button |
| 9 | Order Confirmation | Success animation. Order number. Restaurant name. Estimated time. "Track Order" button |
| 10 | Order Tracking | Status timeline (vertical stepper). Current status with large icon. Driver location on mini-map (if delivering). Driver info (name, photo, rating). Estimated arrival |
| 11 | Order History | List of past orders. Each: restaurant, date, items summary, total, status. Tap → order detail |
| 12 | Profile | Avatar, name, email. Menu: Saved Addresses, Payment Methods, Settings, Logout |
| 13 | Address Management | List of saved addresses. Default badge. Add new button. Edit/delete per address. Map picker |
| 14 | Rate Order | Star rating (1-5, tappable). Optional review text field. Submit button |

### 8.2 Driver App Screens

| # | Screen | Key Elements |
|---|---|---|
| 1 | Login / Register | Same as customer but role=fixed "driver". Extra: license/vehicle upload |
| 2 | Home | Large online/offline toggle. Status indicator. "Waiting for jobs..." when online + idle. Active job card when on delivery |
| 3 | Job Offer | Slide-up card. Earnings (large, bold). Distance. Restaurant name + area. Customer area. Mini-map with pins. 30s countdown timer. Accept / Decline buttons |
| 4 | Pickup Navigation | Map (full screen). Restaurant pin. "Navigate" button (opens Google Maps). Arrived → "Confirm Pickup" button |
| 5 | Delivery Navigation | Map (full screen). Customer pin. "Navigate" button. Arrived → "Confirm Delivery" button. "Can't find customer" link |
| 6 | Earnings | Today's earnings (large, bold). This week. Trip list: each shows time, restaurant, earnings, distance |
| 7 | Profile | Avatar, name. Vehicle info. Settings. Logout |

### 8.3 Restaurant Dashboard Screens (Web)

| # | Screen | Key Elements |
|---|---|---|
| 1 | Login | Email + password. Restaurant-specific login |
| 2 | Dashboard Home | Today's stats cards (orders, revenue, avg prep time). Active orders count. Quick actions |
| 3 | Order Board | Real-time order list. Each: order number, items, customer name, time since placed, status badge. Accept/Reject buttons for pending. Status update for active |
| 4 | Order Detail | Full order items. Customer info. Special instructions. Status timeline. Action buttons |
| 5 | Menu Editor | Category tabs. Item list per category. Add/edit/delete item. Drag-to-reorder. Toggle availability |
| 6 | Item Editor (Modal) | Name, description, price, image upload, category selector, availability toggle |
| 7 | Earnings | Date range filter. Revenue chart (bar). Order list with commission breakdown. Export button |
| 8 | Settings | Restaurant profile (name, logo, cuisine, hours, location). Pause orders toggle |

---

## 9. Key User Flows

### 9.1 Customer Places Order (Visual)

```
[Home] → tap restaurant → [Restaurant Detail] → tap item → [Item Detail]
  → tap "Add to Cart" → toast "Added!" → tap cart icon → [Cart]
  → tap "Checkout" → [Checkout] → select address → tap "Place Order"
  → Stripe sheet slides up → pay → [Confirmation] → auto-advance to [Tracking]
```

### 9.2 Driver Completes Job (Visual)

```
[Home - Online] → job notification sound + vibration → [Job Offer] slides up
  → tap "Accept" → [Pickup Navigation] → "Navigate" → Google Maps
  → arrive → "Confirm Pickup" → [Delivery Navigation] → "Navigate" → Google Maps
  → arrive → "Confirm Delivery" → [Home - Online] with earnings updated toast
```

### 9.3 Restaurant Processes Order (Visual)

```
Audible alert + browser notification → [Order Board] with new order highlighted
  → tap order → [Order Detail] → tap "Accept" → status: Confirmed
  → tap "Start Preparing" → status: Preparing → tap "Ready for Pickup" → status: Ready
  → driver arrives → hands over food → driver confirms pickup → status: Picked Up
```

---

## 10. Responsive Breakpoints

| Breakpoint | Min Width | Target |
|---|---|---|
| Phone | 320px | All mobile apps (primary) |
| Tablet (portrait) | 768px | Restaurant dashboard tablet, iPad |
| Desktop | 1024px | Restaurant dashboard desktop, admin panel |

---

## Next Document

[12 — Screen Specifications](12-screen-specs.md)
