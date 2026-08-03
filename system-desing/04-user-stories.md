# 04 — User Stories: LightBite

**Date:** 2026-07-26
**Status:** Draft

---

## Epic 1: Authentication & Onboarding

### Customer Stories

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-A01 | As a customer, I want to register with my email and password so that I can create an account. | Given valid email + password (min 8 chars, 1 uppercase, 1 number), when I register, then my account is created and I receive a confirmation email. **Failure:** Duplicate email → "An account with this email already exists." Weak password → specific validation message. Network error → "Could not connect. Check your internet." |
| US-A02 | As a customer, I want to log in with my email and password so that I can access my account. | Given valid credentials, when I log in, then I receive a JWT and am redirected to the home screen. **Failure:** Invalid credentials → "Incorrect email or password." Account locked (5 failed attempts) → "Account temporarily locked. Try again in 15 minutes." Unverified email → "Please verify your email before logging in." |
| US-A03 | As a customer, I want to reset my password via email so that I can regain access if I forget it. | Given I request a reset, when I click the email link (valid for 1 hour), then I can set a new password. **Failure:** Expired link → "Reset link has expired. Request a new one." Already used link → "This link has already been used." Invalid email → "No account found with this email." |
| US-A04 | As a customer, I want my session to stay active via refresh tokens so that I don't have to log in every time. | Given an expired access token, when the app uses the refresh token, then a new access token is issued silently. **Failure:** Expired refresh token → redirect to login. Reused/revoked refresh token → all sessions revoked (security measure), redirect to login with message "Session expired for security. Please log in again." |

### Restaurant Stories

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-A05 | As a restaurant owner, I want to register my restaurant with email and business details so that I can start receiving orders. | Given valid business info + email + password + uploaded trade license, when I register, then my restaurant account is created pending verification. **Failure:** Missing required documents → "Please upload your trade license and food safety certificate." Duplicate restaurant name → "A restaurant with this name already exists." |
| US-A06 | As a restaurant owner, I want to log in and see my restaurant dashboard so that I can manage orders. | Given valid credentials, when I log in, then my restaurant dashboard is displayed. **Failure:** Unverified account → "Your restaurant is under review. We'll notify you when approved." Rejected account → "Your registration was not approved. Reason: [reason]." |

### Driver Stories

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-A07 | As a driver, I want to register with my license and vehicle info so that I can start delivering. | Given valid personal + vehicle + license + insurance info with photo uploads, when I register, then my driver account is created pending verification. **Failure:** Missing documents → "Please upload your driver's license, vehicle registration, and insurance." Expired license → "Your license appears to be expired. Please upload a valid license." |
| US-A08 | As a driver, I want to log in so that I can start accepting delivery jobs. | Given valid credentials, when I log in, then I see the driver home screen. **Failure:** Unverified account → "Your account is under review." Rejected → "Your registration was not approved. Reason: [reason]." Suspended → "Your account has been suspended. Contact support." |

---

## Epic 2: Restaurant Discovery

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-R01 | As a customer, I want to see a list of restaurants near me so that I can choose where to order. | Given my location, when I open the app, then restaurants are shown sorted by distance with name, image, cuisine, and rating. **Failure:** Location permission denied → show manual location entry or "Enable location to see nearby restaurants." No restaurants in range → "No restaurants available in your area yet. We're expanding soon!" Network error → show cached restaurants with staleness banner. |
| US-R02 | As a customer, I want to search for restaurants by name or cuisine so that I can find what I'm craving. | Given a search term (min 2 chars), when I search, then matching restaurants appear. **Failure:** No results → "No restaurants match 'xyz'. Try a different search." |
| US-R03 | As a customer, I want to filter restaurants by cuisine type so that I can narrow my options. | Given a cuisine filter, when applied, then only matching restaurants are shown. **Failure:** No matches for filter combination → "No restaurants match these filters. Try removing some filters." |
| US-R04 | As a customer, I want to view a restaurant's details so that I can decide whether to order. | Given I tap a restaurant, when the detail page loads, then I see name, image, rating, cuisine, hours, location, and full menu. **Failure:** Restaurant no longer active → "This restaurant is currently unavailable." Network error → show cached restaurant data with staleness banner. |
| US-R05 | As a customer, I want to search for a specific dish across all restaurants so that I can find which restaurants have what I'm craving. | Given a search term like "shawarma," when I search, then restaurants with matching menu items are shown with the matching item highlighted. Empty state: "No restaurants found serving 'shawarma' near you." |

---

## Epic 3: Menu & Cart

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-C01 | As a customer, I want to browse a restaurant's menu organized by category so that I can find items easily. | Given a restaurant detail page, when I view the menu, then items are grouped by category (appetizers, mains, desserts, drinks). **Failure:** Empty menu → "This restaurant hasn't added menu items yet." |
| US-C02 | As a customer, I want to see item details including image, description, and price so that I can decide what to order. | Given a menu item, when I tap it, then image, description, price, and customization options are shown. **Failure:** Item no longer available → "This item is currently unavailable" with the "Add to Cart" button disabled. |
| US-C03 | As a customer, I want to add items to my cart so that I can build my order. | Given a menu item, when I tap "Add to Cart," then the item appears in my cart with quantity 1. **Failure:** Adding from different restaurant → confirmation dialog: "Adding from [Restaurant B] will clear your cart from [Restaurant A]. Continue?" |
| US-C04 | As a customer, I want to update quantities in my cart so that I can adjust my order. | Given items in cart, when I tap +/-, then quantities update and the total recalculates. **Failure:** Quantity set to 0 → remove item with confirmation. |
| US-C05 | As a customer, I want to remove items from my cart so that I can change my mind. | Given an item in cart, when I tap remove, then it is removed and the total recalculates. |
| US-C06 | As a customer, I want to add special instructions to my order so that the restaurant knows my preferences. | Given the cart, when I add a note like "no onions" (max 200 characters), then the note is attached to the order. |
| US-C07 | As a customer, I want to be warned when my cart is about to expire so that I don't lose my selections. | Given items have been in my cart for 23 hours, when I open the app, then I see a banner: "Your cart will expire in 1 hour. Place your order soon!" Expired carts clear automatically with a notification. |

---

## Epic 4: Ordering & Payments

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-O01 | As a customer, I want to select or add a delivery address so that my food arrives at the right place. | Given the checkout screen, when I select a saved address or add a new one, then it is set for this order. **Failure:** Address outside delivery zone → "This location is outside our delivery area." Max 10 saved addresses reached → "Remove an existing address before adding a new one." Map pin in inaccessible location → "Please select a location accessible by road." |
| US-O02 | As a customer, I want to see an order summary before confirming so that I can review what I'm ordering. | Given checkout, when I review, then items, quantities, prices, delivery fee, VAT, and total are shown as separate line items. **Failure:** Item became unavailable since adding to cart → "Chicken Shawarma is no longer available" with option to remove. Price increased → "Price updated: Chicken Shawarma is now AED 28.00 (was AED 25.00)." Below minimum order → "Minimum order is AED 20.00. Add AED X.XX more." |
| US-O03 | As a customer, I want to pay with my card via Stripe so that I can complete my order. | Given valid card details, when I pay, then payment is pre-authorized and the order is created. **Failure:** Card declined → show decline reason from Stripe. Allow retry with different card. Stripe timeout → "Payment is taking longer than expected. Please wait..." with 30s timeout. Network error during payment → "Payment could not be processed. Please check your connection and try again." No charge is made on any failure. |
| US-O04 | As a customer, I want to receive a confirmation after placing my order so that I know it was successful. | Given a successful order, when it's placed, then I see a confirmation with order number and estimated time. |
| US-O05 | As a customer, I want a clear error message when payment fails so that I can try again. | Given I submit payment, when the card is declined, then I see the decline reason (e.g., "Insufficient funds," "Card declined by bank") and can try a different card. Order is NOT created. No charge is made. |

---

## Epic 5: Real-Time Order Tracking

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-T01 | As a customer, I want to see my order status update in real time so that I know when to expect my food. | Given an active order, when the restaurant or driver updates status, then my screen updates without refresh. |
| US-T02 | As a customer, I want to see the driver's location on a map so that I can track my delivery. | Given an order in "delivering" status, when I view tracking, then the driver's position updates on a map. |
| US-T03 | As a restaurant owner, I want to receive new order notifications in real time so that I can start preparing immediately. | Given a new order is placed, when it reaches the backend, then my dashboard shows the new order within 2 seconds. |
| US-T04 | As a restaurant owner, I want to accept or reject an incoming order so that customers know if their order will be fulfilled. | Given a new order, when I tap Accept, then status changes to "confirmed." When I tap Reject, the customer is notified. |
| US-T05 | As a restaurant owner, I want to update order preparation status so that drivers and customers know when food is ready. | Given an accepted order, when I tap "Ready," then the status updates for all parties. |
| US-T06 | As a driver, I want to receive delivery job notifications in real time so that I can accept work quickly. | Given I'm online and a nearby order is ready, when the job is created, then I receive a notification with earnings, distance, and locations. |
| US-T07 | As a driver, I want to accept or decline a delivery job so that I can choose jobs that work for me. | Given a job notification, when I tap Accept, then the job is assigned to me. When I decline, the next driver is notified. Timer: 30 seconds to respond before auto-decline. **Failure:** If I'm the 3rd driver to decline, the order is system-cancelled (no driver available) and the customer is notified + refunded. |
| US-T08 | As a customer, I want to know immediately if the restaurant can't fulfill my order so that I can find an alternative. | Given my order is in "pending" status, when the restaurant does not respond within 2 minutes, then the order is auto-rejected, I receive a push notification: "Spice Route is unavailable — your order has been cancelled," and my payment pre-auth is voided automatically. |

---

## Epic 6: Maps & Navigation

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-M01 | As a customer, I want to pick my delivery address on a map so that the location is precise. | Given the address screen, when I move the pin on the map, then the address updates to the pin location via reverse geocoding. **Failure:** GPS unavailable → "Could not determine your location. Enter address manually." Pin placed in inaccessible location (water, highway) → "Please select a location accessible by road." Geocoding fails → show raw coordinates with "Address unavailable for this location." |
| US-M02 | As a driver, I want turn-by-turn navigation to the restaurant so that I can pick up the order. | Given an accepted job, when I tap "Navigate to Restaurant," then Google Maps opens with the route. **Failure:** Google Maps not installed → show in-app map with route. GPS signal weak → "Searching for GPS..." with last known position. |
| US-M03 | As a driver, I want turn-by-turn navigation to the customer so that I can deliver the order. | Given I've picked up the order, when I tap "Navigate to Customer," then Google Maps opens with the route. **Failure:** Same as US-M02. Address invalid → "Customer address could not be located. Call customer for directions." |
| US-M04 | As a customer, I want to see the driver's real-time location on a map so that I know exactly when they'll arrive. | Given an active delivery, when I view the tracking screen, then the driver's position updates every 10 seconds with smooth animation. **Failure:** Location update delayed > 30s → show last known position with "Location update delayed" indicator. WebSocket disconnected → show last position with banner "Tracking paused — reconnecting..." |

---

## Epic 7: Push Notifications

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-N01 | As a customer, I want push notifications when my order status changes so that I don't need to keep the app open. | Given an order status change, when it happens, then I receive a push notification with the new status. Notification is silent between 11pm-7am (configurable). **Failure:** Push permission denied → use in-app notification badge only. FCM token not registered → app polls order status every 30 seconds as fallback. |
| US-N02 | As a restaurant owner, I want push notifications for new orders so that I don't miss any. | Given a new order, when it's created, then I receive a push notification immediately with sound (overrides silent mode). **Failure:** Push not delivered within 5 seconds → also play audible alert in dashboard. |
| US-N03 | As a driver, I want push notifications for new delivery jobs so that I can respond quickly. | Given a new nearby job, when I'm in the pool, then I receive a push notification with job details and 30-second countdown. **Failure:** Push delayed > 10 seconds → job may have been offered to another driver. Show "Job may no longer be available" if > 15 seconds old. |

---

## Epic 8: Restaurant Management

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-RM01 | As a restaurant owner, I want to create and edit my restaurant profile so that customers see accurate information. | Given the dashboard, when I edit name, logo, cuisine, hours, or location, then changes save and appear in the customer app within 60 seconds (cache invalidation). **Failure:** Image upload fails → "Could not upload image. Try a smaller file (max 3MB)." Invalid hours → "Closing time must be after opening time." |
| US-RM02 | As a restaurant owner, I want to add menu items with name, description, price, and photo so that my menu is complete. | Given the menu editor, when I add an item with all required fields (name, price, category), then it appears in the customer-facing menu. **Failure:** Image too large → "Image must be under 3MB." Price invalid → "Price must be greater than AED 0." Max items reached (200) → "You've reached the maximum of 200 menu items." |
| US-RM03 | As a restaurant owner, I want to organize items into categories so that my menu is easy to browse. | Given the menu editor, when I create categories (max 20) and assign items, then the customer menu shows grouped items. **Failure:** Delete category with items → "Move or delete X items before removing this category." |
| US-RM04 | As a restaurant owner, I want to mark an item as unavailable so that customers can't order it. | Given the menu editor, when I toggle an item off, then it's hidden from the customer menu immediately. **Failure:** Item is in active orders → toggle still works; historical orders retain item snapshot. |
| US-RM05 | As a restaurant owner, I want to see my order history and earnings so that I can track my business. | Given the dashboard, when I view history, then orders are listed with date, items, total, status, commission deducted, and net earnings. Default view: today's orders. Filterable by date range. |
| US-RM06 | As a restaurant owner, I want to temporarily pause incoming orders so that I can catch up when the kitchen is overwhelmed. | Given the dashboard, when I tap "Pause Orders," then my restaurant status changes to "Closed" and new orders are blocked. Customers see "Temporarily unavailable" on my restaurant card. Active orders continue processing. I can tap "Resume Orders" to re-open. **Failure:** Pause fails → error toast "Could not update status. Try again." |

---

## Epic 9: Driver Features

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-D01 | As a driver, I want to toggle my availability on and off so that I control when I work. | Given the driver app, when I tap "Go Online," then I'm visible for job assignments and my location sharing starts. When I tap "Go Offline," I stop receiving jobs and location sharing stops. **Failure:** Network error on toggle → "Could not update status. Check your connection." Active delivery in progress → "Complete your current delivery before going offline." |
| US-D02 | As a driver, I want to confirm that I've picked up the order so that the system knows I have the food. | Given I'm at the restaurant (GPS verified within 50m), when I tap "Confirm Pickup," then the order status advances to "picked_up" → "delivering." **Failure:** GPS shows > 50m from restaurant → "You appear to be too far from the restaurant. Please move closer." GPS accuracy > 30m → show 4-digit PIN from customer for manual confirmation. |
| US-D03 | As a driver, I want to confirm that I've delivered the order so that the job is complete. | Given I'm at the customer (GPS verified within 50m), when I tap "Confirm Delivery," then the order is marked "delivered," my earnings update, and location sharing stops. **Failure:** GPS too far from customer → "You appear to be too far from the delivery location." GPS accuracy > 30m → show PIN confirmation. Customer unreachable → "Can't find customer" option triggers customer notification. |
| US-D04 | As a driver, I want to see my trip history and total earnings so that I can track my income. | Given the driver app, when I view earnings, then I see: today's earnings, this week's earnings, and a list of completed trips (each showing: time, restaurant, earnings, distance). Filterable by date. |

---

## Epic 10: Rating & Reviews

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-RV01 | As a customer, I want to rate my completed order (1-5 stars) so that I can share my experience. | Given a delivered order within 7 days, when I tap a star rating, then the rating is saved. Given I already rated this order, when I try to rate again, then I see my existing rating (cannot change after 24 hours). **Failure:** Rating submission fails → error toast "Could not save rating. Try again." |
| US-RV02 | As a customer, I want to see the average rating of a restaurant so that I can decide where to order. | Given restaurant discovery or detail view, when displayed, then the average rating (1.0-5.0, 1 decimal) and review count are shown. Restaurants with < 5 ratings display "New" instead of a rating. |
| US-RV03 | As a restaurant owner, I want to see my ratings and reviews so that I can improve my service. | Given the dashboard, when I view ratings, then I see: average rating, total review count, and recent reviews sorted by date (most recent first). |

---

## Epic 11: Platform Economics

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-EC01 | As a customer, I want to see the delivery fee before paying so that I understand the total cost. | Given checkout, when I review the order, then subtotal, delivery fee, VAT (5%), and total are displayed as separate line items. **Failure:** Fee calculation fails → show "Calculating..." with spinner. If persists > 5 seconds, show estimated fee with "Fee may vary" note. |
| US-EC02 | As a driver, I want to see the estimated earnings for a job before accepting so that I can decide if it's worth my time. | Given a job notification, when it appears, then estimated earnings (AED), estimated distance (km), pickup restaurant name, and dropoff area are displayed. Actual earnings recalculated with actual distance after delivery. **Failure:** If actual distance > estimated by 20%, difference credited automatically. |
| US-EC03 | As a restaurant owner, I want to see the commission breakdown on each order so that I understand my net earnings. | Given the earnings dashboard, when I view a completed order, then I see: food subtotal, commission rate (%), commission amount (AED), and net earnings (AED). |

---

## Epic 12: Admin & Verification

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-AD01 | As an admin, I want to review and approve/reject restaurant registrations so that only legitimate restaurants use the platform. | Given a pending restaurant registration, when I review the submitted details (trade license, food safety certificate, location, menu), then I can approve (restaurant status → verified, can receive orders) or reject with a reason (email sent to restaurant with reason). |
| US-AD02 | As an admin, I want to review and approve/reject driver registrations so that only verified drivers deliver orders. | Given a pending driver registration, when I review license, vehicle registration, and insurance documents, then I can approve (driver status → verified, can go online) or reject with a reason. |
| US-AD03 | As an admin, I want to view a dashboard of platform activity so that I can monitor operations. | Given the admin panel, when I view the dashboard, then I see: active order count, online driver count, active restaurant count, orders stuck in a status > 10 minutes, and today's revenue. Auto-refresh every 30 seconds. |

---

## Epic 13: Cross-Role Integration

These stories test interactions that span two or more roles, ensuring the system works as a connected whole.

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-X01 | As a customer, when a restaurant rejects my order, I want to be notified and receive a refund so that I can order elsewhere. | Given my order is in "pending" status, when the restaurant rejects it, then I receive a push notification "Order Declined" with the reason, the payment pre-auth is voided, and the app suggests nearby alternatives. |
| US-X02 | As a customer, when no driver accepts my order, I want to be notified so that I'm not waiting indefinitely. | Given my order is "ready" with no driver assigned for 15 minutes or 3 drivers declined, when the system cancels, then I receive a push notification "No driver available — order cancelled" and a full refund is issued automatically. |
| US-X03 | As a driver, when I decline a job, I want the system to offer it to another driver so that the customer isn't left waiting. | Given I decline a job within 30 seconds, when I tap "Decline," then the job is immediately offered to the next nearest driver. I remain in the pool for other jobs. |
| US-X04 | As a restaurant owner, when a driver is assigned, I want to see the driver's name and ETA so that I know when to expect pickup. | Given an order in "ready" status, when a driver accepts, then my dashboard shows the driver's name, photo, and estimated arrival time at the restaurant. |
| US-X05 | As a customer, when my order status has not changed for an unexpected duration, I want to be notified so that I know there might be a delay. | Given an order stuck in "confirmed" for > 20 minutes or "preparing" for > 30 minutes, when the threshold is exceeded, then I receive a push notification: "Your order is taking longer than expected. We're checking with the restaurant." |

---

## Story Count Summary

| Epic | Stories | Priority |
|---|---|---|
| Auth & Onboarding | 8 | P0 |
| Restaurant Discovery | 5 | P0 |
| Menu & Cart | 7 | P0 |
| Ordering & Payments | 5 | P0 |
| Real-Time Tracking | 8 | P0 |
| Maps & Navigation | 4 | P0 |
| Push Notifications | 3 | P0 |
| Restaurant Management | 6 | P0 |
| Driver Features | 4 | P0 |
| Rating & Reviews | 3 | P0 |
| Platform Economics | 3 | P0 |
| Admin & Verification | 3 | P0 |
| Cross-Role Integration | 5 | P0 |
| **Total** | **64 user stories** | |

---

## Next Document

[05 — Functional Requirements](05-functional-requirements.md)
