# HOMAATRI — BUSINESS LOGIC & EDGE-CASE RULES SPECIFICATION
## Time-Pool Cutoffs, Kitchen Capacity, Pricing, Delivery Fees, and Guest/Auth Boundaries

**Document Version:** 1.0  
**Basis:** `Homaatri_Full_Stack_BRD_SRS_v1.md`  
**Role:** Senior Business Rules Engine Architecture  
**Status:** Baseline business-rules specification with explicit proposed rules where the BRD/SRS is silent

---

# 0. Source Alignment and Rule Classification

This specification is based on the current Homaatri BRD/SRS.

The source explicitly establishes:

- Lunch cutoff: **11:30 AM**
- Dinner cutoff: **6:30 PM**
- Lunch/Dinner meal windows
- kitchen capacity limits
- `Accepting Orders` / `Kitchen Closed`
- `IN_STOCK` / `SOLD_OUT`
- cart subtotal + delivery fee
- current implementation checklist delivery fee: **₹30**
- guest discovery and viewing without authentication
- Phone OTP authentication for restricted actions
- customer capabilities such as ordering, subscribing, liking, commenting, reviewing, and following after authentication.

The source does **not** explicitly define the requested rollover behavior:

- after 11:30 AM → Dinner
- after 6:30 PM → Tomorrow's Lunch

Therefore, those rollover rules are documented below as a **proposed business-rule interpretation**, not as a previously approved source requirement.

The same principle applies to detailed cancellation, refund, tax, discount, subscription, and cross-day ordering behavior where the BRD/SRS is silent.

---

# 1. RULE PRIORITY AND TERMINOLOGY

| Term | Meaning |
|---|---|
| `LUNCH` | Current lunch meal pool |
| `DINNER` | Current dinner meal pool |
| `NEXT_LUNCH` | Next available lunch service date |
| `SERVICE_DATE` | Calendar date for which the meal is fulfilled |
| `CUTOFF` | Time after which the current meal pool should no longer accept new orders |
| `KITCHEN_CLOSED` | Kitchen is not accepting orders |
| `ACCEPTING_ORDERS` | Kitchen is accepting orders for the active meal window |
| `CAPACITY_REACHED` | Kitchen has reached the configured meal capacity |
| `IN_STOCK` | Menu item may be ordered |
| `SOLD_OUT` | Menu item must not be newly ordered |
| `GUEST` | Visitor without authenticated customer session |
| `AUTHENTICATED` | Customer with valid Phone OTP/JWT session |
| `HARD STOP` | Backend rejects the transaction rather than merely hiding a UI option |

## Core enforcement principle

> **The backend is the authoritative rule engine.**

The frontend may:
- display eligible options;
- pre-filter;
- show warnings;
- disable obvious actions.

The backend must still re-evaluate every business rule before accepting the transaction.

---

# 2. TIME-POOL / MEAL-WINDOW RULES

## 2.1 Source-Defined Cutoffs

| Meal Window | Cutoff | Source Status |
|---|---:|---|
| Lunch | **11:30 AM** | Explicit in BRD/SRS |
| Dinner | **6:30 PM** | Explicit in BRD/SRS |

The platform should evaluate cutoff using a single canonical application timezone.

The current BRD/SRS does not explicitly define timezone governance. The implementation should therefore choose one canonical operating timezone for the launch geography and make it configurable rather than hard-coding browser-local time.

---

# 3. PROPOSED TIME-POOL ROLLOVER RULES

The business request specifies the following desired behavior:

1. After **11:30 AM**, a new same-day lunch order is no longer accepted; the order should move to the **Dinner** pool.
2. After **6:30 PM**, a new same-day dinner order is no longer accepted; the order should move to **Tomorrow's Lunch**.

These are documented here as proposed rules because the current BRD/SRS does not explicitly state the rollover behavior.

## 3.1 Rollover Matrix

| Current Time | Requested Pool | Effective Pool | Service Date |
|---|---|---|---|
| Before 11:30 AM | Lunch | Lunch | Today |
| 11:30 AM to before 6:30 PM | Lunch | Dinner | Today |
| 11:30 AM to before 6:30 PM | Dinner | Dinner | Today |
| At/after 6:30 PM | Lunch | Tomorrow Lunch | Tomorrow |
| At/after 6:30 PM | Dinner | Tomorrow Lunch | Tomorrow |

### Important clarification

The rollover applies to **new ordering intent**, not to already-confirmed orders.

Existing confirmed orders remain tied to their persisted `service_date` and `meal_window`.

---

# 4. TIME-POOL DECISION TREE

```text
START
 |
 |-- Is customer trying to place a new order?
 |        |
 |        No --> Do not apply time-pool assignment
 |        |
 |        Yes
 |
 |-- Current time < 11:30 AM?
 |        |
 |        Yes --> LUNCH / TODAY
 |        |
 |        No
 |
 |-- Current time < 6:30 PM?
 |        |
 |        Yes --> DINNER / TODAY
 |        |
 |        No --> LUNCH / TOMORROW
```

## Backend rule

```text
if now < 11:30:
    service_date = today
    meal_window = LUNCH

elif now < 18:30:
    service_date = today
    meal_window = DINNER

else:
    service_date = tomorrow
    meal_window = LUNCH
```

The exact timezone used by `now` must be the platform's canonical business timezone.

---

# 5. CUTOFF EDGE CASES

## 5.1 Exact Cutoff Timestamp

Recommended rule:

```text
now < cutoff  => current pool remains available
now >= cutoff => cutoff is closed
```

Therefore:

- `11:29:59` → Lunch eligible
- `11:30:00` → Lunch closed
- `18:29:59` → Dinner eligible
- `18:30:00` → Dinner closed

## 5.2 Race Condition at Cutoff

If a customer opens checkout at `11:29:58` but the request reaches the backend at `11:30:02`:

> **Backend arrival/validation time wins.**

The backend must recalculate the meal pool at the moment of transaction acceptance.

The browser's previously displayed pool is not authoritative.

### Example

```text
Browser:
11:29:58
"Order Lunch"

Backend receives:
11:30:02

Result:
Lunch is closed
→ apply current rollover rule
→ present/assign Dinner or reject depending on selected kitchen/meal availability
```

The recommended UX is to reprice/revalidate and ask the user to confirm any service-window change before charging.

---

# 6. MENU / KITCHEN AVAILABILITY AFTER ROLLOVER

Rollover does not automatically mean that every kitchen or item is eligible in the destination pool.

Example:

```text
11:35 AM
Customer selects Lunch
        ↓
Lunch is closed
        ↓
Destination = Dinner
        ↓
Is kitchen accepting Dinner?
   ├── YES → continue
   └── NO  → show next eligible option
```

The backend must check:
- chef accepting-orders state;
- destination meal window;
- menu item meal-window eligibility;
- item stock;
- remaining capacity;
- ordering cutoff.

---

# 7. ORDER SERVICE-DATE IMMUTABILITY

After the backend creates a confirmed order:

```text
service_date
meal_window
chef_id
delivery destination
```

must be treated as a committed business snapshot.

Time-pool evaluation should not silently rewrite an existing `CONFIRMED` or `BATCHED` order.

Any post-confirmation reschedule should be a separate explicit business operation.

The BRD/SRS does not currently define customer-initiated rescheduling; therefore automatic rescheduling of confirmed orders is out of scope.

---

# 8. KITCHEN CAPACITY RULES

The platform supports an explicit kitchen capacity concept and gives examples such as:

```text
Indravati: 8 / 15 meals
Konkan:    12 / 15 meals
```

The chef dashboard exposes:
- daily meal capacity;
- active meal window;
- accepting-orders toggle;
- consolidated cooking demand.

The exact daily-vs-meal-window capacity semantics are not fully specified in the BRD/SRS.

Therefore, the following should be treated as the recommended implementation rule.

---

# 9. PROPOSED CAPACITY MODEL

## 9.1 Capacity Scope

The most operationally consistent model is:

> **Capacity is enforced per active meal window, with a configured maximum number of meals that kitchen can fulfill for that window.**

If the business later wants a single total daily cap across lunch + dinner, the model can add a daily aggregate constraint.

## 9.2 Hard-Stop Rule

Let:

```text
capacity_limit = configured kitchen capacity
committed_meals = sum of accepted/confirmed meals for the relevant kitchen + service_date + meal_window
remaining_capacity = capacity_limit - committed_meals
```

Then:

```text
remaining_capacity <= 0
→ KITCHEN_CAPACITY_REACHED
→ reject new orders for that kitchen/window
```

This is a backend **hard stop**.

---

# 10. CAPACITY DECISION TREE

```text
NEW ORDER REQUEST
 |
 |-- Kitchen Accepting Orders?
 |       |
 |       No --> REJECT
 |       |
 |       Yes
 |
 |-- Menu Item In Stock?
 |       |
 |       No --> REJECT / SOLD OUT
 |       |
 |       Yes
 |
 |-- Calculate requested meal quantity
 |
 |-- remaining_capacity >= requested_quantity?
 |       |
 |       Yes --> ACCEPT IF ALL OTHER GUARDS PASS
 |       |
 |       No --> REJECT / CAPACITY REACHED
```

---

# 11. CAPACITY EXAMPLES

## Example A — Enough Capacity

```text
Capacity = 15
Committed = 12
New order = 2

Remaining = 3
2 <= 3
→ Accept
Committed becomes 14
```

## Example B — Exact Fill

```text
Capacity = 15
Committed = 12
New order = 3

Remaining = 3
3 <= 3
→ Accept
Kitchen becomes SOLD OUT / CAPACITY_REACHED
```

## Example C — Capacity Exceeded

```text
Capacity = 15
Committed = 13
New order = 3

Remaining = 2
3 > 2
→ Reject
```

Recommended customer message:

> "This kitchen has reached today's meal capacity. Please choose another kitchen or meal option."

Do not partially accept the quantity unless a future product rule explicitly allows partial fulfillment.

---

# 12. CAPACITY RACE CONDITION

Two customers may try to consume the last available meal simultaneously.

Example:

```text
Capacity = 15
Committed = 14

Customer A requests 1
Customer B requests 1
```

A naive frontend count could make both appear eligible.

The backend must perform the final capacity check atomically.

Recommended conceptual transaction:

```text
BEGIN TRANSACTION

LOCK capacity/order allocation record

recalculate committed_meals

IF committed_meals + requested_quantity <= capacity:
    reserve/commit quantity
ELSE:
    reject

COMMIT
```

The exact locking mechanism remains a technical implementation decision.

---

# 13. KITCHEN ACCEPTING / CLOSED RULES

The chef portal has a master kitchen toggle:

```text
Accepting Orders
Kitchen Closed
```

## Rule

If:

```text
chef.accepting_orders = false
```

then no new order may be confirmed for that kitchen.

This is a hard backend guard.

The kitchen may still be visible in discovery if the product wants users to see the brand/profile; visibility and orderability are separate concepts.

---

# 14. CAPACITY STATE LOGIC

Recommended business state interpretation:

```text
KITCHEN_CLOSED
     |
     | open
     v
ACCEPTING_ORDERS
     |
     | committed_meals >= capacity_limit
     v
CAPACITY_REACHED
     |
     | new meal window / reset / admin action
     v
KITCHEN_CLOSED or ACCEPTING_ORDERS
```

`KITCHEN_PAUSED` can be used when an operational issue temporarily stops ordering independently of capacity.

---

# 15. IN-STOCK / SOLD-OUT RULES

The menu specification explicitly supports:

```text
IN_STOCK
SOLD_OUT
```

## Rule

If a menu item's:

```text
availability_status = SOLD_OUT
```

then:
- it must not be newly added to cart;
- backend checkout must reject it;
- existing orders already confirmed against the item are unaffected.

The UI should normally disable/hide the order CTA, but backend validation is mandatory.

---

# 16. STOCK RACE CONDITION

Example:

```text
Customer A sees Paneer Tikka = IN_STOCK
Chef switches it to SOLD_OUT
Customer A submits checkout
```

Backend must re-read the authoritative item state.

Result:

```text
SOLD_OUT
→ reject that item
→ do not create a confirmed order for it
```

The customer should receive a clear revalidation message.

The browser's cached "In Stock" state is not authoritative.

---

# 17. ITEM STOCK VS KITCHEN CAPACITY

These are separate guards.

### Item-level rule

```text
Item SOLD_OUT
→ that item cannot be ordered
```

### Kitchen-level rule

```text
Kitchen CAPACITY_REACHED
→ new meals cannot be ordered from that kitchen/window
```

A kitchen may have:
- some items sold out;
- some items available;
- remaining capacity.

Conversely, a kitchen can be:
- `CAPACITY_REACHED`
while some menu items still show `IN_STOCK`.

In that case the kitchen-level capacity rule wins.

---

# 18. PRICING & DELIVERY FEE RULES

The current implementation checklist specifies:

> **₹30 flat delivery fee**

The BRD/SRS also requires:
- subtotal;
- delivery fee;
- total amount;
- server-side pricing validation.

## 18.1 Base Formula

```text
SUBTOTAL = Σ(line_item_quantity × authoritative_unit_price)

DELIVERY_FEE = ₹30

TOTAL = SUBTOTAL + ₹30
```

This is the current stated calculation.

---

# 19. QUANTITATIVE PRICING RULES

| Component | Rule |
|---|---|
| Quantity | Positive integer |
| Unit price | Server-authoritative |
| Line total | `quantity × unit_price` |
| Subtotal | Sum of all valid line totals |
| Delivery fee | ₹30 flat, currently |
| Total | `subtotal + delivery_fee` |
| Currency | INR |
| Client totals | Display only; not authoritative |

---

# 20. PRICING EXAMPLES

## Example A

```text
2 × ₹100 = ₹200
1 × ₹80  = ₹80

Subtotal = ₹280
Delivery = ₹30

Total = ₹310
```

## Example B

```text
1 × ₹150 = ₹150

Subtotal = ₹150
Delivery = ₹30

Total = ₹180
```

No free-delivery threshold is currently defined.

No distance-based fee is currently defined.

No surge fee is currently defined.

No tax/discount engine is currently defined in the BRD/SRS.

---

# 21. PRICING DECISION TREE

```text
CHECKOUT REQUEST
 |
 |-- Is customer authenticated?
 |       |
 |       No --> AUTH REQUIRED
 |       |
 |       Yes
 |
 |-- Re-read authoritative menu prices
 |
 |-- Validate item availability
 |
 |-- Validate kitchen capacity
 |
 |-- Calculate:
 |     line totals
 |     + subtotal
 |     + ₹30 delivery
 |
 |-- Does client-submitted total match server-calculated total?
 |       |
 |       No --> REJECT / REPRICE
 |       |
 |       Yes --> Create PENDING_PAYMENT
```

---

# 22. PRICE SNAPSHOT RULE

Once an order enters checkout and the backend creates its authoritative order record, the order should store:

```text
unit_price_snapshot
subtotal
delivery_fee
total_amount
```

The customer should not be charged based on a later menu price change.

This is especially important because menu prices are editable by the homemaker.

---

# 23. PRICE CHANGE EDGE CASE

Example:

```text
10:00 AM
Paneer Tikka = ₹120

Customer opens menu

10:05 AM
Chef changes price to ₹130

10:06 AM
Customer checks out
```

Recommended rule:

> Backend revalidates the current authoritative price at checkout.

If the cart snapshot differs from the server price:

```text
REPRICE REQUIRED
```

The customer should be shown the revised total before payment begins.

Do not silently charge the customer a different amount without user confirmation.

---

# 24. DELIVERY FEE EDGE CASES

Current rule:

```text
₹30 flat delivery fee
```

Therefore:

- no distance multiplier;
- no peak multiplier;
- no route-specific price;
- no kitchen-specific fee;

unless a later business decision changes the rule.

The BRD/SRS does not define:
- free delivery;
- promotional delivery;
- subscription delivery discounts;
- split delivery fee;
- refunds.

These remain TBD.

---

# 25. GUEST VS AUTHENTICATED BOUNDARY

The BRD/SRS explicitly follows:

> **Consumption is public; contribution/transaction requires authentication.**

---

# 26. GUEST PERMISSION MATRIX

| Capability | Guest | Authenticated Customer |
|---|:---:|:---:|
| Open public website `/` | ✅ | ✅ |
| Enter locality | ✅ | ✅ |
| Browse kitchen cards | ✅ | ✅ |
| Swipe kitchens | ✅ | ✅ |
| View homemaker profile | ✅ | ✅ |
| Read homemaker story | ✅ | ✅ |
| View verification/hygiene badges | ✅ | ✅ |
| View menus | ✅ | ✅ |
| View prices | ✅ | ✅ |
| Watch reels/vlogs | ✅ | ✅ |
| View kitchen/social links | ✅ | ✅ |
| View meal-window filters | ✅ | ✅ |
| Add to cart | 🔒 | ✅ |
| Subscribe | 🔒 | ✅ |
| Place order | 🔒 | ✅ |
| Checkout | 🔒 | ✅ |
| Payment | 🔒 | ✅ |
| Track authenticated order | 🔒* | ✅ |
| Like reel | 🔒 | ✅ |
| Comment | 🔒 | ✅ |
| Review | 🔒 | ✅ |
| Follow homemaker | 🔒 | ✅ |

`*` An unauthenticated user should not be able to access a private order/tracking record. The exact sharing/recovery mechanism is not defined in the BRD/SRS.

---

# 27. AUTHENTICATION RULE

Authentication should trigger **at the restricted action**, not at discovery entry.

Example:

```text
Guest watches reel
      ↓
Guest opens menu
      ↓
Guest adds item
      ↓
Guest clicks Subscribe
      ↓
Phone OTP modal
```

This preserves low-friction discovery.

---

# 28. AUTH DECISION TREE

```text
USER ACTION
 |
 |-- Is action public discovery?
 |       |
 |       Yes --> ALLOW
 |       |
 |       No
 |
 |-- Is authenticated session valid?
 |       |
 |       No --> OPEN PHONE OTP
 |       |
 |       Yes --> ALLOW
```

---

# 29. AUTH SESSION EDGE CASES

## Case A — Guest starts checkout

```text
Guest
→ Cart exists
→ Checkout
→ Auth modal
→ OTP success
→ Return to checkout intent
```

The cart should persist through successful authentication unless an implementation constraint prevents it.

## Case B — OTP fails

User remains unauthenticated.

Do not submit the order.

## Case C — Session expires during checkout

Backend returns authentication error.

Frontend should:
- preserve cart if possible;
- prompt login;
- resume intended transaction after re-authentication.

## Case D — Guest attempts like/comment/follow

Prompt Phone OTP.

Do not require login merely to watch content.

---

# 30. BACKEND AUTHORIZATION RULES

The backend must independently verify authentication on:

- order/subscribe APIs;
- checkout API;
- like API;
- comment API;
- follow API;
- review API.

The backend must not assume that a hidden frontend button is sufficient protection.

---

# 31. COMBINED CHECKOUT RULE TREE

The full checkout decision should conceptually be:

```text
START
 |
 |-- Authenticated?
 |      |
 |      No --> PHONE OTP --> success?
 |                         |
 |                         No --> STOP
 |                         |
 |                         Yes
 |
 |-- Resolve service meal pool using current time
 |
 |-- Kitchen accepting orders?
 |      |
 |      No --> STOP
 |
 |-- Meal window still available?
 |      |
 |      No --> APPLY ROLLOVER / OFFER NEXT ELIGIBLE WINDOW
 |
 |-- Every item still IN_STOCK?
 |      |
 |      No --> STOP / REPRICE
 |
 |-- Sufficient kitchen capacity?
 |      |
 |      No --> STOP / ALTERNATIVE KITCHEN
 |
 |-- Recalculate authoritative prices
 |
 |-- Calculate subtotal
 |
 |-- Add ₹30 delivery fee
 |
 |-- Create PENDING_PAYMENT
 |
 |-- Initiate Razorpay
 |
 |-- Payment verified?
 |      |
 |      No --> PAYMENT_FAILED
 |      |
 |      Yes --> CONFIRMED
```

---

# 32. RULE EVALUATION ORDER

The recommended backend evaluation order is:

1. Authentication / authorization
2. Customer/account validity
3. Resolve service date + meal window
4. Kitchen active/accepting state
5. Menu item existence
6. Menu item stock/availability
7. Kitchen capacity
8. Quantity validation
9. Server-side pricing
10. Delivery address validation
11. Idempotency check
12. Create `PENDING_PAYMENT`
13. Start payment

This order reduces expensive and irreversible work before basic business rules are satisfied.

---

# 33. EDGE-CASE MATRIX

| Scenario | Expected Rule |
|---|---|
| 11:29:59 order | Lunch eligible |
| 11:30:00 order | Lunch closed |
| 11:35 Lunch selection | Apply proposed rollover to Dinner if kitchen supports Dinner |
| 18:29:59 order | Dinner eligible |
| 18:30:00 order | Dinner closed |
| 18:35 Dinner selection | Apply proposed rollover to Tomorrow Lunch |
| Kitchen closed | Reject |
| Kitchen capacity exactly reached | Reject new meal quantity |
| Requested quantity exceeds remaining capacity | Reject entire request |
| Item SOLD_OUT | Reject item |
| Item becomes SOLD_OUT during checkout | Backend revalidation rejects/reprices |
| Price changed before checkout | Server price wins; ask customer to confirm revised total |
| Duplicate payment webhook | Ignore duplicate state transition |
| Payment failure | `PAYMENT_FAILED` |
| Guest tries to order | Phone OTP required |
| Guest watches reel | Allowed |
| Guest likes reel | Phone OTP required |
| Auth session expired | Re-authenticate |
| Two simultaneous last-seat orders | Backend atomic capacity guard decides |
| Kitchen visible but closed | Profile may remain visible; ordering disabled |
| Meal window changes at checkout boundary | Backend re-resolves time pool |
| Existing confirmed order after cutoff | Service date/window remain unchanged |
| Existing batched order | Not automatically rolled forward |
| Delivery fee | ₹30 flat under current rule |
| Discount/tax | Not currently defined; do not invent |
| Refund | Not fully defined in BRD/SRS |
| Subscription pricing | Not fully defined |

---

# 34. IMPLEMENTATION RULES FOR THE BUSINESS RULE ENGINE

The business-rule implementation should expose reusable server-side functions/services conceptually equivalent to:

```text
resolve_meal_window(now, requested_window)
validate_kitchen_accepting(chef_id, service_date, meal_window)
validate_menu_item_available(menu_item_id)
validate_kitchen_capacity(chef_id, service_date, meal_window, quantity)
calculate_order_pricing(cart)
validate_guest_auth(action, session)
validate_checkout(cart, customer, context)
```

These should be centralized rather than duplicated independently across UI/API endpoints.

---

# 35. RULES THAT MUST NOT LIVE ONLY IN THE FRONTEND

The following are security/integrity-critical and must be server-enforced:

- cutoff eligibility;
- rollover;
- kitchen accepting state;
- capacity;
- item availability;
- price;
- delivery fee;
- authentication;
- authorization;
- payment state;
- duplicate transaction prevention.

Frontend controls should be treated as usability optimizations.

---

# 36. RULES CURRENTLY NOT DEFINED BY THE BRD/SRS

Do not invent these without product/business approval:

- exact refund rules;
- cancellation windows and penalties;
- tax calculation;
- coupons/discounts;
- free delivery rules;
- subscription pricing;
- subscription pause/resume;
- subscription rollover;
- partial-order acceptance;
- partial stock acceptance;
- post-confirmation rescheduling;
- no-show delivery charges;
- COD;
- multi-kitchen order composition;
- split payment;
- delivery fee waivers;
- loyalty/reward rules.

These require separate approved business rules.

---

# 37. ARCHITECTURE SUMMARY

Homaatri's rule engine should maintain three distinct layers:

## Availability
> **Can this kitchen/item accept the requested meal?**

## Commercial
> **What should the customer pay?**

## Authorization
> **Is this user allowed to perform this action?**

A transaction is valid only when all three pass.

The final principle is:

> **The UI helps the customer choose. The backend decides whether the transaction is actually valid.**

---

# 38. Source Alignment

The current BRD/SRS explicitly supports:
- Lunch 11:30 AM and Dinner 6:30 PM windows;
- kitchen accepting/closed state;
- daily meal capacity;
- menu availability;
- cart subtotal + delivery fee;
- current ₹30 delivery fee;
- guest discovery;
- authenticated ordering, subscription, likes, comments, reviews and follows;
- server-side price validation;
- payment idempotency;
- order lifecycle integrity. 

The guest/auth boundary is explicitly described as public consumption with authenticated transaction/contribution, and the customer portal defines the lunch/dinner filters and checkout boundary. fileciteturn2file3L450-L475 fileciteturn2file3L479-L512

The kitchen dashboard explicitly defines lunch/dinner cutoffs, total meals to prepare, kitchen acceptance state, and consolidated cook summary, while the admin dashboard defines capacity monitoring and cutoff execution. fileciteturn3file0L579-L606 fileciteturn4file0L104-L123

The BRD/SRS also explicitly requires server-side price validation, idempotent payment handling, and secure transaction processing. fileciteturn4file0L380-L456

The specific **post-11:30 → Dinner** and **post-6:30 → Tomorrow Lunch** rollover behavior requested here is a **proposed business-rule interpretation**, because that exact rollover is not stated in the BRD/SRS.
