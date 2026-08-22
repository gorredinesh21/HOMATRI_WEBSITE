# HOMAATRI UNIFIED FULL-STACK PLATFORM
## Business Requirements Document (BRD) + Software Requirements Specification (SRS/PRD)

**Document Version:** 1.0  
**Document Status:** Baseline Draft  
**Prepared For:** Homaatri  
**Prepared By:** Enterprise IT Solution Architecture  
**Primary Product:** `homatri_website`  
**Frontend:** Next.js 14  
**Backend:** Python FastAPI  
**Primary Database:** GCP Cloud SQL PostgreSQL  
**Target Supporting Services:** Redis, GCP Cloud Storage  
**Cloud Runtime:** GCP Cloud Run  
**Primary Portals:** `/`, `/order`, `/chef`, `/rider`, `/admin`

---

# 1. Document Purpose

This document establishes the Business Requirements Document (BRD) and Software Requirements Specification (SRS/PRD) for the full-stack Homaatri platform.

The document translates the current Master Full-Stack Specification into an enterprise software requirements baseline covering:

- business objectives;
- product scope;
- user personas;
- multi-portal architecture;
- functional requirements;
- user journeys;
- interaction and authentication rules;
- operating workflows;
- data requirements;
- API and integration requirements;
- non-functional requirements;
- assumptions and constraints;
- identified specification gaps requiring future definition.

## 1.1 Source-of-Truth Principle

The attached Master Full-Stack Specification is the primary source for the detailed product behavior captured in this document.

Where the source specification is explicit, the requirement is stated as a committed requirement.

Where the source specification does **not** define a requested architectural detail, database schema, endpoint contract, or policy, this document explicitly marks the item as:

> **TBD / Requires Technical Design**

No unsupported implementation detail is silently presented as an already-approved requirement.

---

# 2. Executive Summary

Homaatri is a managed home-cooked tiffin and community food platform built around trusted homemakers.

The platform connects four operational actors:

1. **Customers** — discover homemakers, consume cooking stories/reels, view menus, subscribe/order lunch or dinner, receive meals, and provide feedback.
2. **Homemakers / Chefs** — manage their kitchen brand, menus, cooking workload, customer requests, content, orders, capacity, and earnings.
3. **Delivery Riders** — execute meal-window-based pickup and delivery routes from homemaker kitchens to customers.
4. **Administrators / Operations Managers** — control live operations, batching, route allocation, kitchen capacity, customer escalations, chef/menu data, rider assignments, and operational support.

The product combines:

- social discovery;
- homemaker storytelling;
- recurring tiffin ordering;
- verified kitchen discovery;
- food and packaging standards;
- customer trust mechanisms;
- order management;
- batch preparation;
- route-based delivery;
- operational monitoring.

The current platform is organized as five principal portal surfaces:

| Portal | Route | Primary User |
|---|---|---|
| Public Brand Website | `/` | Customer / Visitor |
| Customer Community & Ordering | `/order` | Customer |
| Homemaker / Chef Dashboard | `/chef` | Homemaker |
| Delivery Rider Portal | `/rider` | Delivery Rider |
| Admin Operations Dashboard | `/admin` | Admin / Operations |

---

# 3. Business Objectives

## 3.1 Primary Objectives

### BO-01 — Enable Trusted Home-Food Discovery
Provide customers with a visual, story-led way to discover nearby homemakers and their home kitchens.

### BO-02 — Enable Recurring Tiffin Commerce
Support lunch and dinner ordering with defined cutoff windows and recurring customer behavior.

### BO-03 — Build Trust Around Home Food
Expose homemaker identity, kitchen verification, hygiene indicators, ratings, and service standards.

### BO-04 — Reduce Operational Fragmentation
Aggregate customer demand into a homemaker-level cooking workload and a rider-level delivery batch.

### BO-05 — Give Homemakers Business Infrastructure
Provide profile, menu, content, order, capacity, request, earnings, and business-management capabilities.

### BO-06 — Provide Managed Delivery Operations
Convert confirmed orders into kitchen pickup and route-based customer delivery workflows.

### BO-07 — Centralize Operational Control
Give Homaatri operations teams a single control layer for order pipeline, cutoffs, capacity, escalations, chefs, and riders.

---

# 4. Business Vision and Product Principles

## 4.1 Product Identity

The platform is not a generic restaurant listing product. It is designed around:

> **Homemaker identity + community discovery + recurring tiffin commerce + trust + managed fulfillment.**

## 4.2 Key Product Principles

| Principle | Requirement |
|---|---|
| People, not listings | Homemaker identity and story are first-class product objects |
| Social supports commerce | Reels/stories must connect naturally to menu/order behavior |
| Tiffin is recurring | Lunch and dinner are explicit operating windows |
| Trust is visible | Verification, hygiene, ratings, and standards are exposed to customers |
| Fulfillment is managed | Homaatri operations coordinate kitchen pickup and route delivery |
| Capacity is explicit | Kitchens expose/operate within meal capacity limits |
| Mobile-first operations | Rider and key homemaker workflows must work effectively on mobile |
| Guest-first discovery | Visitors may browse core content before authentication |
| Authentication at transaction | Login is required for order, follow, like, comment, and review actions |

---

# 5. Target Full-Stack Architecture

## 5.1 Logical Architecture

```text
                         ┌──────────────────────────┐
                         │       PUBLIC WEB         │
                         │       Next.js 14         │
                         │          `/`             │
                         └─────────────┬────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    ▼                                     ▼
         ┌──────────────────────┐             ┌──────────────────────┐
         │ CUSTOMER PORTAL      │             │ OPERATIONS PORTALS   │
         │ Next.js `/order`     │             │ `/chef` `/rider`     │
         │                      │             │ `/admin`              │
         └──────────┬───────────┘             └──────────┬───────────┘
                    │                                    │
                    └────────────────┬───────────────────┘
                                     ▼
                          ┌──────────────────────┐
                          │ Python FastAPI       │
                          │ Backend Engine       │
                          └──────────┬───────────┘
                                     │
          ┌──────────────────────────┼───────────────────────────┐
          │                          │                           │
          ▼                          ▼                           ▼
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│ GCP Cloud SQL        │   │ Redis                │   │ GCP Cloud Storage    │
│ PostgreSQL           │   │ Cache / transient    │   │ Media / uploaded     │
│ primary persistence  │   │ state / queues*      │   │ content*             │
└──────────────────────┘   └──────────────────────┘   └──────────────────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │ External Integrations│
                          │ Razorpay             │
                          │ Google Maps API       │
                          │ WhatsApp/Web chat*    │
                          └──────────────────────┘

* Use/behavior to be finalized during technical design where not explicitly specified.
```

## 5.2 Technology Stack

| Layer | Technology | Requirement Status |
|---|---|---|
| Web frontend | Next.js 14 | Explicitly requested |
| API backend | Python FastAPI | Explicitly requested |
| Relational database | GCP Cloud SQL PostgreSQL | Explicitly requested |
| Cache / transient state | Redis | Explicitly requested |
| Media storage | GCP Cloud Storage | Explicitly requested |
| Runtime | GCP Cloud Run | Explicitly requested |
| Payment | Razorpay | Specified |
| Navigation / route optimization | Google Maps API | Specified |
| Customer communication | WhatsApp/Web chat | Specified operationally |
| Authentication | Phone OTP / JWT session context | Specified |
| Video content | Upload and gallery functionality | Specified; storage architecture TBD |

---

# 6. Solution Components

## 6.1 Public Brand Website `/`

Purpose:
- brand communication;
- location discovery;
- featured kitchen discovery;
- trust communication;
- tiffin education;
- portal routing.

## 6.2 Customer Portal `/order`

Purpose:
- social discovery;
- kitchen discovery;
- homemaker profiles;
- reels;
- menu browsing;
- tiffin ordering;
- subscription;
- reviews and follows;
- checkout;
- tracking.

## 6.3 Homemaker Portal `/chef`

Purpose:
- kitchen/business operations;
- cooking workload;
- menu management;
- customer requests;
- content publishing;
- earnings;
- kitchen settings.

## 6.4 Rider Portal `/rider`

Purpose:
- shift management;
- kitchen pickup;
- route delivery;
- next-stop navigation;
- bulk delivery confirmation;
- exception handling.

## 6.5 Admin Portal `/admin`

Purpose:
- operational control tower;
- live pipeline;
- capacity;
- cutoffs;
- route batching;
- chat audit;
- escalation handling;
- chef/menu management;
- rider management;
- administrative system tools.

---

# 7. User Persona Profiles

## 7.1 Customer Persona

| Attribute | Description |
|---|---|
| Objective | Discover and regularly order home-cooked meals |
| Primary portal | `/order` |
| Secondary surface | `/` |
| Key actions | Discover, watch, follow, view menu, subscribe/order, pay, track, review |
| Authentication | Phone OTP for transactional/social actions |
| Device priority | Mobile and responsive desktop |
| Trust needs | Homemaker identity, standards, hygiene, consistency, delivery accountability |

## 7.2 Homemaker / Chef Persona

| Attribute | Description |
|---|---|
| Objective | Operate a home kitchen and fulfill tiffin demand |
| Primary portal | `/chef` |
| Key actions | Accept orders, manage menu, see demand, cook, pack, publish content, manage requests, view earnings |
| Device priority | Responsive web, strong mobile support |
| Operational concept | Meal-window-based cooking and handoff |
| Capacity concept | Daily meal capacity limit |
| Brand concept | Personal kitchen brand + story + social presence |

## 7.3 Delivery Rider Persona

| Attribute | Description |
|---|---|
| Objective | Collect a meal batch and deliver all assigned orders |
| Primary portal | `/rider` |
| Device priority | Mobile-first smartphone web |
| Key actions | Shift on/off, pickup, next stop, navigate, call, bulk deliver, exception report |
| Route model | Kitchen-specific assignment per meal window |
| UX principle | Show only the immediate next stop to reduce cognitive overload |

## 7.4 Admin / Operations Persona

| Attribute | Description |
|---|---|
| Objective | Keep the Homaatri operation running end-to-end |
| Primary portal | `/admin` |
| Key actions | Monitor pipeline, capacity, cutoffs, routes, chats, escalations, chefs, riders |
| Operating mode | Real-time control tower |
| Escalation model | Human-in-the-loop (HITL) |

---

# 8. Scope of Work

## 8.1 In Scope

- Public brand website
- Customer discovery and community
- Homemaker profiles
- Verification/trust indicators
- Lunch/dinner menus
- Tiffin ordering
- Subscription/order flow
- Phone OTP authentication
- Social interactions
- Cart and checkout
- Razorpay payment initiation
- Order tracking
- Homemaker operational dashboard
- Content upload
- Rider operational dashboard
- Route-based delivery
- Admin operations dashboard
- Kitchen capacity monitoring
- Meal cutoff batching
- Route allocation
- Customer support escalation
- WhatsApp/Web message audit
- GCP-based full-stack deployment architecture

## 8.2 Portal Architecture

```text
/
├── Public Brand Website
│
├── /order
│   ├── Kitchens
│   ├── Community Stories
│   ├── Homemaker Profiles
│   ├── Menus
│   ├── Cart
│   ├── Checkout
│   └── /tracking
│
├── /chef
│   ├── Overview
│   ├── Checklist
│   ├── Orders
│   ├── Menu
│   ├── Content Studio
│   ├── Dietary Requests
│   ├── Earnings
│   └── Settings
│
├── /rider
│   ├── Shift
│   ├── Pickup
│   ├── Navigation
│   ├── Delivery
│   └── Exceptions
│
└── /admin
    ├── Pipeline
    ├── Chats
    ├── Cutoff
    ├── Escalations
    ├── Chefs
    ├── Drivers
    └── Tools
```

---

# 9. Detailed Functional Requirements — Public Website

## 9.1 Navigation

| ID | Requirement | Priority |
|---|---|---|
| PUB-NAV-001 | Logo must navigate to `/` | Must |
| PUB-NAV-002 | "Explore Kitchens" must smooth-scroll to `#kitchens` | Must |
| PUB-NAV-003 | "Our Story" must smooth-scroll to `#story` | Must |
| PUB-NAV-004 | "How It Works" must smooth-scroll to `#how-it-works` | Must |
| PUB-NAV-005 | "Hygiene & Trust" must smooth-scroll to `#trust` | Must |
| PUB-NAV-006 | "Explore Menus" must navigate to `/order` | Must |

## 9.2 Hero / Location Discovery

| ID | Requirement | Priority |
|---|---|---|
| PUB-HERO-001 | Provide locality input | Must |
| PUB-HERO-002 | Persist locality in location state | Must |
| PUB-HERO-003 | "Find Menus" redirects to `/order?location=...` | Must |
| PUB-HERO-004 | Provide quick locality chips for Ghansoli, Vashi and Airoli | Must |

## 9.3 Featured Kitchens

Featured kitchen cards must provide:
- kitchen identity;
- menu/order CTA;
- chef-specific preselection in `/order`.

The current specification identifies four featured kitchens:
- Indravati Pure Veg;
- Konkan Coastal;
- Desi Punjabi Dhaba;
- Dakshin Annapoorna.

The implementation should treat their current identifiers as sample/configuration data rather than hard-coded business constants unless explicitly required.

---

# 10. Detailed Functional Requirements — Customer Portal

# 10.1 Dual-Tab Experience

The customer portal shall provide:

1. `🎴 Kitchens`
2. `🎥 Community Stories`

## 10.1.1 Kitchens Tab

- Nearby homemaker card deck.
- Swipe left/right on mobile.
- Next/previous controls on desktop.
- Card contains:
  - homemaker photo;
  - kitchen name;
  - regional identity;
  - rating;
  - signature dish;
  - price preview.

## 10.1.2 Community Stories Tab

- Full-screen vertical reel feed.
- Cooking vlogs from local homemakers.
- Chef and dish overlay.
- Direct `Order [Dish Name] - ₹X` CTA.

---

# 10.2 Homemaker Profile

A deep profile shall include:

- homemaker story;
- hometown heritage;
- cooking philosophy;
- kitchen verification;
- hygiene badges;
- social links;
- dedicated chef reel gallery;
- interactive lunch menu;
- interactive dinner menu;
- quantity selection;
- dietary customization notes.

---

# 10.3 Guest vs Authenticated Access

The authentication model is intentionally similar to the "YouTube model":

| Capability | Guest | Authenticated |
|---|---:|---:|
| Swipe kitchen cards | Yes | Yes |
| Watch reels/vlogs | Yes | Yes |
| View menus/prices | Yes | Yes |
| Read stories | Yes | Yes |
| Add to cart | No | Yes |
| Subscribe/order | No | Yes |
| Like | No | Yes |
| Comment | No | Yes |
| Review | No | Yes |
| Follow | No | Yes |

## Authentication Rule

Authentication is required at the moment a visitor attempts a restricted action.

Current specification identifies:
- Phone OTP login;
- JWT/session state via `AuthContext`.

Exact token issuance/refresh/revocation contract is **TBD / Requires Technical Design**.

---

# 10.4 Filters and Serving Controls

The customer portal shall provide:

- Currently Serving Kitchens toggle;
- Meal Window:
  - Lunch
  - Dinner
- Dietary:
  - Veg
  - Non-Veg
  - Jain
- Regional Cuisine:
  - Telangana & Andhra;
  - Konkan Coastal;
  - Punjabi;
  - South Indian;
  - additional categories may be configurable.

---

# 10.5 Cart and Checkout

The detailed checklist requires:

- slide-over cart drawer;
- meal window on each cart item;
- quantity control;
- dietary note;
- subtotal;
- delivery fee;
- Razorpay payment trigger.

The current implementation checklist specifies a **₹30 delivery fee**.

Because pricing is a business parameter, the recommended implementation is configuration-driven rather than hard-coded.

---

# 10.6 Order Tracking

Current order tracking stages:

```text
PENDING_PAYMENT
      ↓
CONFIRMED
      ↓
BATCHED
      ↓
OUT_FOR_DELIVERY
      ↓
DELIVERED
```

Tracking must show:
- order summary;
- delivery address;
- status pipeline;
- customer support/HITL escalation action.

---

# 11. Detailed Functional Requirements — Homemaker Portal

## 11.1 Overview

The dashboard must show:
- active meal window;
- cutoff;
- total meals to prepare;
- consolidated cook summary;
- kitchen acceptance state;
- pack-ready action.

Current meal windows:
- Lunch — 11:30 AM cutoff
- Dinner — 6:30 PM cutoff

## 11.2 Cooking Checklist

The system shall aggregate demand into a consolidated cook summary.

Example:

```text
8 × Paneer Tikka Tiffins
6 × Dal Tadka & Jeera Rice
```

The user must also be able to access order-by-order detail.

## 11.3 Live Orders

Current operational lifecycle:

```text
COOKING
  ↓
PACKED_READY
  ↓
PICKED_UP_BY_DRIVER
```

Assigned driver information should be visible where available.

## 11.4 Menu Manager

Capabilities:
- add/edit dish;
- unit price;
- meal window;
- availability:
  - In Stock
  - Sold Out.

## 11.5 Content Studio

Capabilities:
- upload cooking video;
- attach signature dish;
- publish;
- observe likes/views/comments.

## 11.6 Dietary Requests

Customers may submit customization notes such as:
- less oil;
- no garlic;
- medium spice.

Current rule:
- Accept;
- Reject;
- Counter-offer;
- maximum two turns in the counter-offer protocol.

## 11.7 Earnings and Payouts

Current dashboard requirements:
- daily income;
- weekly payouts;
- completed orders;
- repeat-customer retention.

Exact accounting and settlement rules are **TBD / Requires Business + Finance Design**.

## 11.8 Kitchen Settings

Must support:
- kitchen name;
- kitchen photo;
- address;
- hometown region;
- daily meal capacity limit;
- YouTube/Instagram links.

---

# 12. Detailed Functional Requirements — Rider Portal

## 12.1 Rider Assignment

The specification requires:

> **1 Chef : 1 Driver Allocation**

for each meal window.

This means a rider is assigned to a specific kitchen for:
- Lunch;
- Dinner.

## 12.2 Rider Workflow

```text
Shift On
   ↓
Receive Kitchen Trip Assignment
   ↓
Navigate to Kitchen
   ↓
Confirm Kitchen Pickup
   ↓
Get Next Stop
   ↓
Navigate
   ↓
Deliver
   ↓
Repeat
   ↓
Complete Trip
```

## 12.3 Leg-by-Leg Navigation

Only the immediate next stop shall be shown as the primary navigation context.

The stop card must provide:
- stop number;
- customer name;
- address;
- Google Maps navigation link;
- call customer.

## 12.4 Multi-Order Gate Delivery

For multiple orders at the same residential gate/address, the rider may:
- confirm all deliveries together;
- independently mark one or more exceptions.

## 12.5 Exceptions

At minimum:
- kitchen not ready / delay;
- customer unavailable;
- address issue.

Exception communication routes to the Admin/HITL process.

---

# 13. Detailed Functional Requirements — Admin Portal

## 13.1 Order Pipeline

Admin must see real-time counts across:

```text
DRAFT
PENDING_PAYMENT
CONFIRMED
BATCHED
OUT_FOR_DELIVERY
DELIVERED
```

## 13.2 Kitchen Capacity

Admin must see capacity utilization, e.g.:

```text
Indravati: 8 / 15 meals
Konkan:    12 / 15 meals
```

## 13.3 Cutoff Engine

Admin must monitor:
- lunch cutoff;
- dinner cutoff.

Admin must be able to manually trigger:

> `Run Cutoff Batch & Route Allocation Now`

This operation invokes the specified route optimization / driver assignment workflow.

## 13.4 Live Chat Audit

Admin must have a real-time audit stream for inbound/outbound:
- WhatsApp;
- web messages.

## 13.5 HITL Escalation

Admin must:
- view escalated issue;
- see order ID and failure context;
- send a custom customer reply;
- mark escalation resolved.

## 13.6 Chef and Menu Management

Admin can view:
- chef profile;
- address;
- daily capacity;
- menus;
- reels.

## 13.7 Rider and Route Management

Admin can view:
- rider roster;
- active status;
- vehicle information;
- assigned routes;
- delivery logs.

## 13.8 System Tools

Current specification identifies administrative tools for:
- production data seeding;
- production customer data wipe.

These are high-risk operations and should be strongly controlled, audited and protected behind elevated authorization.

---

# 14. User Journey Stories

## 14.1 Guest Customer Journey

**Given** a visitor has not authenticated:

1. Visit `/`.
2. Enter locality or select locality chip.
3. Enter `/order` with location filter.
4. Browse Kitchen cards.
5. Watch stories/reels.
6. Read homemaker story.
7. View menu and price.
8. Decide to order/subscribe.
9. Trigger authentication.
10. Complete phone OTP login.
11. Return to intended action.
12. Add to cart.
13. Checkout.
14. Pay.
15. Track order.
16. Receive meal.
17. Review/follow after authentication.

## 14.2 Homemaker Journey

1. Access `/chef`.
2. Set kitchen profile/configuration.
3. Set active/closed state.
4. Review meal-window demand.
5. Review consolidated cook summary.
6. Cook.
7. Handle custom dietary notes.
8. Mark batch packed.
9. Rider picks up.
10. Continue business/content activities.
11. Review earnings and repeat-customer indicators.

## 14.3 Rider Journey

1. Start shift.
2. Review assigned kitchen and meal window.
3. Navigate to kitchen.
4. Confirm pickup.
5. Receive next immediate stop.
6. Navigate.
7. Deliver.
8. Bulk-confirm where appropriate.
9. Handle exceptions if needed.
10. Report problems to admin/HITL.

## 14.4 Admin Journey

1. Open operations dashboard.
2. Monitor live pipeline.
3. Monitor kitchen capacity.
4. Monitor cutoff clock.
5. Run/confirm batch and route allocation.
6. Monitor rider status.
7. Monitor customer chat.
8. Resolve escalations.
9. Review chefs/menus.
10. Monitor operational completion.

---

# 15. Interaction Rules

## 15.1 YouTube Authentication Model

Principle:

> **Consumption is public; contribution/transaction requires authentication.**

Public:
- discover;
- view;
- watch;
- read.

Authenticated:
- order;
- subscribe;
- like;
- comment;
- review;
- follow.

## 15.2 Inshorts/Tinder Discovery

The deck experience should support:
- swipeable kitchen discovery;
- visual card summaries;
- next/previous controls on desktop;
- location-sensitive discovery.

## 15.3 Hinge-Style Deep Profile

A kitchen card may expand into a deep profile containing:
- identity;
- story;
- trust;
- content;
- menu.

This supports emotional trust before purchase.

---

# 16. Database Requirements

## 16.1 Relational Database

PostgreSQL on GCP Cloud SQL is the primary persistent datastore.

The provided Master Specification establishes several domain concepts but does **not** provide a complete canonical relational schema.

The following logical entities are therefore required at minimum, but exact columns, constraints, indexes, foreign keys, enum storage strategy, audit fields, and partitioning remain **TBD / Requires Database Design**.

| Logical Entity | Purpose |
|---|---|
| User | Customer/admin/other authenticated account |
| Homemaker/Chef | Homemaker business identity |
| Kitchen | Physical/home kitchen profile |
| Menu Item | Dish definition |
| Meal Window | Lunch/dinner availability |
| Order | Customer transaction |
| Order Item | Item-level order detail |
| Subscription / Tiffin Plan | Recurring order relationship |
| Payment | Payment state and provider metadata |
| Delivery | Delivery assignment/status |
| Rider | Delivery operator |
| Route / Trip | Batched delivery route |
| Kitchen Capacity | Meal capacity and utilization |
| Review | Customer review |
| Follow | Customer-homemaker relationship |
| Reel / Video | Homemaker content |
| Reel Like | Social engagement |
| Reel Comment | Social interaction |
| Dietary Request | Customer customization |
| Chat Message | WhatsApp/web communication |
| Escalation | HITL support item |
| Verification | Kitchen/identity/standards verification |
| Notification | Customer/chef/rider communication |

## 16.2 Social Document Models

The current specification explicitly references future social schemas such as:
- `chef_reels`;
- `reel_comments`;
- `reel_likes`.

The exact document structures, whether stored in PostgreSQL JSONB, Cloud Storage metadata, or another document model, are **not defined in the Master Specification**.

This requires a future data-model decision.

## 16.3 Media Storage

Cooking videos and media must be stored using an appropriate object-storage design.

Target platform:
- GCP Cloud Storage.

The Master Specification does not define:
- bucket names;
- object naming policy;
- signed URL model;
- transcoding;
- thumbnails;
- lifecycle/retention;
- CDN;
- virus scanning.

These are **TBD / Requires Technical Design**.

---

# 17. API Endpoint Contracts

The source specification provides several explicit API references but does not provide a complete endpoint catalog or formal OpenAPI contract.

## 17.1 Explicitly Referenced APIs

| Endpoint / Integration | Purpose |
|---|---|
| `POST /api/v1/orders/checkout` | Create/initiate Razorpay checkout/payment flow |
| `GET /api/admin/chats` | Admin real-time chat/audit stream source |
| `POST /api/admin/seed-chefs-and-riders` | Seed development/production sample operational data |
| `POST /api/admin/clear-all-data` | Wipe production customer data |
| Google Maps API | Route computation / navigation |
| Razorpay | Payment |
| WhatsApp integration | Customer communication / audit / escalation messaging |

## 17.2 API Contract Standards

A formal API standard should be established during technical design.

Minimum recommended contract attributes:

- API version;
- authentication requirement;
- actor/role;
- request schema;
- response schema;
- HTTP status codes;
- error schema;
- idempotency rules for financial/order operations;
- correlation/request ID;
- audit metadata;
- rate limits.

These are required architecture decisions but are not fully defined in the source specification.

## 17.3 Suggested Contract Example — Order Checkout

```text
POST /api/v1/orders/checkout

Purpose:
Create/initiate a payment transaction for a validated cart.

Authentication:
Authenticated customer required.

Request:
- cart/order reference
- delivery address reference
- meal window
- pricing snapshot
- customer notes where applicable

Response:
- order ID
- payment provider reference
- current order status
- checkout/payment state

Security:
- server-side price validation
- server-side order validation
- idempotency protection
- no trust of client-side totals

Exact fields: TBD.
```

This example is an architectural illustration, not a claim that the exact payload is already approved.

---

# 18. Webhooks and Event Rules

The Master Specification does not define a formal webhook catalog.

The platform will require event-driven handling for at least:

- Razorpay payment success/failure;
- payment verification;
- order state transition;
- kitchen batch completion;
- pickup confirmation;
- delivery completion;
- chat/escalation updates.

## 18.1 Required Webhook Design Principles

Financial/payment webhooks should:
- verify provider signature;
- be idempotent;
- persist event state;
- avoid duplicate order transitions;
- support retry handling;
- return appropriate HTTP acknowledgment.

## 18.2 Suggested Internal Events

```text
ORDER_CREATED
PAYMENT_PENDING
PAYMENT_CONFIRMED
ORDER_BATCHED
KITCHEN_PACKED
RIDER_PICKED_UP
DELIVERY_OUT
DELIVERY_COMPLETED
ORDER_ESCALATED
ORDER_RESOLVED
```

The exact event bus/queue mechanism is **TBD**. Redis is a target supporting service, but the precise role of Redis vs another managed queue must be established during technical design.

---

# 19. Order State Model

## 19.1 Customer/Admin Order State

```text
DRAFT
  ↓
PENDING_PAYMENT
  ↓
CONFIRMED
  ↓
BATCHED
  ↓
OUT_FOR_DELIVERY
  ↓
DELIVERED
```

## 19.2 Homemaker Fulfillment State

```text
COOKING
  ↓
PACKED_READY
  ↓
PICKED_UP_BY_DRIVER
```

The backend must define a clear mapping between:
- customer/order state;
- kitchen fulfillment state;
- rider delivery state.

A formal state machine and transition matrix is recommended as a dedicated technical artifact.

---

# 20. Integrations

## 20.1 Razorpay

Purpose:
- payment initiation;
- payment completion;
- payment status.

Requirements:
- server-side amount calculation;
- webhook verification;
- idempotency;
- transaction auditability.

Exact SDK/version is TBD.

## 20.2 Google Maps API

Purpose:
- route optimization;
- stored route computation;
- navigation handoff;
- address/route support.

Rider UX should display only the next immediate stop while the route itself is stored/managed by the system.

## 20.3 WhatsApp

Purpose:
- customer support;
- operational communication;
- escalation updates;
- message audit.

The source specification does not define the exact WhatsApp provider/API configuration in this document.

## 20.4 Web Chat

Purpose:
- customer support;
- operational audit;
- escalation handling.

---

# 21. Non-Functional Requirements

## 21.1 Performance

### NFR-PERF-001
Public pages shall be responsive and optimized for initial page rendering.

### NFR-PERF-002
Customer discovery interactions should feel immediate on supported devices.

### NFR-PERF-003
Operational dashboards shall support near-real-time pipeline and capacity refresh.

### NFR-PERF-004
Checkout/payment requests must avoid duplicate order creation.

### NFR-PERF-005
Media-heavy reel feeds should use appropriate lazy-loading, pagination, and media optimization.

Exact latency SLAs are **TBD**.

---

# 22. Mobile Responsiveness

## NFR-MOB-001
Public website must be responsive.

## NFR-MOB-002
Customer portal must support touch-first discovery interactions.

## NFR-MOB-003
Homemaker dashboard must be usable on mobile/responsive web.

## NFR-MOB-004
Rider portal shall be mobile-first and optimized for one-handed use during delivery operations.

## NFR-MOB-005
Rider portal must avoid exposing excessive simultaneous information and should prioritize the immediate next action.

---

# 23. Security Requirements

## NFR-SEC-001 — Authentication
Phone OTP authentication shall protect transactional/social actions.

## NFR-SEC-002 — Authorization
Role-based authorization shall separate:
- customer;
- homemaker;
- rider;
- admin.

## NFR-SEC-003 — Administrative Privileges
Admin operations, especially data-seeding and data-wipe controls, require elevated authorization and audit logging.

## NFR-SEC-004 — Payment Security
Payment amounts and order state must be validated server-side.

## NFR-SEC-005 — PII
Customer addresses, phone numbers, and operational data shall be treated as sensitive application data.

## NFR-SEC-006 — Media Access
Private media, where applicable, should be accessed through controlled/signed access rather than unrestricted buckets.

## NFR-SEC-007 — API Protection
API endpoints should implement:
- authentication;
- authorization;
- input validation;
- rate limiting where required;
- consistent error handling;
- audit logging for sensitive operations.

---

# 24. Scalability Requirements

The architecture must support independent scaling of:

- Next.js workloads;
- FastAPI workloads;
- background processing;
- database load;
- media delivery;
- operational dashboard queries.

Cloud Run is the target runtime.

Cloud SQL PostgreSQL is the primary persistent datastore.

Redis is targeted for cache/transient state/use cases.

GCP Storage is targeted for media/object storage.

Exact autoscaling values and database sizing are **TBD** based on pilot traffic.

---

# 25. Reliability and Resilience

The system should support:

- retry-safe external integration operations;
- idempotent payment operations;
- recoverable background processing;
- operational visibility;
- audit logs for critical state changes;
- graceful failure of third-party services;
- human escalation where automation cannot complete a task.

Critical workflows:
- payment;
- cutoff batching;
- rider assignment;
- delivery completion;
- customer support.

These must prioritize data integrity over convenience.

---

# 26. Observability

The final implementation should provide visibility into:

- API health;
- application errors;
- payment errors;
- failed delivery transitions;
- batch failures;
- route allocation failures;
- authentication problems;
- support escalations;
- job/queue failures.

The source specification does not define the observability toolchain.

Recommended architecture should be finalized during deployment design.

---

# 27. Data and Audit Requirements

Critical operational actions should be auditable, including:

- order state changes;
- payment state;
- cutoff batch execution;
- route allocation;
- pickup confirmation;
- delivery confirmation;
- exception reporting;
- admin escalation resolution;
- data-wipe operations;
- chef verification changes.

Audit retention policy is **TBD**.

---

# 28. Assumptions

1. Next.js 14 is the web frontend baseline.
2. Python FastAPI is the backend baseline.
3. GCP Cloud SQL PostgreSQL is the relational system of record.
4. Redis will be available as a supporting service.
5. GCP Cloud Storage will be available for object/media storage.
6. Cloud Run is the runtime platform.
7. Razorpay is the current payment integration.
8. Google Maps API is the current route/navigation integration.
9. Phone OTP is the current customer authentication mechanism.
10. Lunch cutoff is 11:30 AM.
11. Dinner cutoff is 6:30 PM.
12. Customer checkout/order actions require authentication.
13. Customer discovery/content consumption can remain guest-accessible.
14. Homaatri operations use a human-in-the-loop escalation model.
15. Riders operate on smartphones.

---

# 29. Constraints

1. The provided Master Specification is primarily a product/UX and operational requirements document, not a complete backend engineering specification.
2. The complete PostgreSQL schema is not defined.
3. Full API schemas are not defined.
4. Formal webhook contracts are not defined.
5. Exact Redis usage is not defined.
6. Cloud Storage media architecture is not defined.
7. Detailed financial/accounting requirements are not defined.
8. Formal legal/compliance requirements are not defined in the Master Specification.
9. Exact operational SLAs are not defined.
10. Exact scale targets are not defined.

---

# 30. Out-of-Scope / Not Yet Specified

Unless added in a later approved version, the following are not considered fully specified:

- formal accounting/ERP system;
- advanced financial ledger;
- detailed subscription billing engine;
- automated refund policy;
- advanced recommendation system;
- advanced AI personalization;
- full CMS;
- native iOS/Android applications;
- fleet optimization beyond the specified route-allocation behavior;
- external partner APIs beyond the referenced services;
- complete data warehouse;
- BI platform;
- advanced fraud detection;
- formal legal/compliance framework;
- complete production DevOps runbook.

Some may become future scope.

---

# 31. Requirements Traceability Summary

| Business Objective | Primary Modules |
|---|---|
| Trusted home-food discovery | `/`, `/order`, profiles, trust |
| Recurring tiffin commerce | `/order`, chef, admin cutoff engine |
| Homemaker business operation | `/chef` |
| Managed fulfillment | `/rider`, `/admin` |
| Operational control | `/admin` |
| Social/community discovery | `/order`, `/chef` |
| Customer support | `/order`, `/admin` |
| Route efficiency | `/admin`, `/rider` |
| Kitchen capacity planning | `/chef`, `/admin` |

---

# 32. Recommended Technical Design Artifacts After This BRD/SRS

The following artifacts should be created before production implementation is considered complete:

1. **Architecture Decision Record (ADR)**
   - Redis role;
   - storage architecture;
   - background jobs;
   - API gateway/security;
   - eventing.

2. **Canonical PostgreSQL ERD**
   - all tables;
   - foreign keys;
   - indexes;
   - constraints;
   - state enums.

3. **OpenAPI Specification**
   - all API routes;
   - authentication;
   - schemas;
   - error contracts.

4. **Order State Machine**
   - customer state;
   - kitchen state;
   - rider state;
   - reconciliation rules.

5. **Webhook Contract**
   - Razorpay;
   - future external callbacks.

6. **RBAC Matrix**
   - Customer;
   - Homemaker;
   - Rider;
   - Admin.

7. **Media Architecture**
   - Cloud Storage;
   - upload;
   - signed access;
   - thumbnails;
   - transcoding;
   - lifecycle.

8. **Observability / Incident Runbook**
   - dashboards;
   - alerts;
   - operational escalation.

9. **Deployment Architecture**
   - Cloud Run services;
   - environments;
   - secrets;
   - CI/CD;
   - migrations.

---

# 33. Acceptance Baseline

The platform should be considered functionally aligned with this baseline when:

### Public website
- users can navigate the public site;
- locality can be captured and passed into ordering;
- kitchens can be discovered;
- trust and tiffin information is accessible.

### Customer portal
- guests can browse;
- users can watch reels;
- users can inspect homemaker profiles;
- authentication activates on restricted actions;
- users can add items to cart;
- checkout can initiate payment;
- orders can be tracked;
- users can follow/like/comment/review after authentication.

### Homemaker portal
- kitchen can be opened/closed;
- lunch/dinner demand is visible;
- cook summary is visible;
- menus can be managed;
- orders can be progressed;
- content can be uploaded;
- dietary requests can be handled;
- earnings are visible.

### Rider portal
- rider can start a shift;
- assigned kitchen is visible;
- pickup can be confirmed;
- next stop can be navigated;
- deliveries can be marked complete;
- multi-order gates can be handled;
- exceptions can be reported.

### Admin portal
- order pipeline is visible;
- capacity is visible;
- cutoff can be monitored;
- route batching can be initiated;
- escalations can be resolved;
- chefs and riders can be managed.

---

# 34. Document Status and Governance

This BRD/SRS should be treated as a controlled baseline.

### Version 1.0 represents:
- the current full-stack product scope from the supplied Master Specification;
- explicit technology assumptions requested for the solution architecture;
- explicit operational behavior present in the source.

### Changes requiring a new version:
- portal scope changes;
- authentication model changes;
- order-state model changes;
- meal-window changes;
- payment provider changes;
- delivery model changes;
- database model changes;
- major architecture changes.

### Classification
**Enterprise Software Requirements — Homaatri Unified Platform**

