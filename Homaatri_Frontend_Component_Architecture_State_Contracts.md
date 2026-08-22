# HOMAATRI — FRONTEND COMPONENT ARCHITECTURE & STATE CONTRACT
## Next.js 14 / React / Tailwind CSS

**Document Version:** 1.0  
**Basis:** `Homaatri_Full_Stack_BRD_SRS_v1.md`  
**Application:** `homatri_website`  
**Frontend:** Next.js 14 + React + Tailwind CSS  
**Backend:** Python FastAPI  
**Primary UI Domains:** `/`, `/order`, `/chef`, `/rider`, `/admin`

---

# 1. Purpose

This specification defines the frontend component architecture and state contracts for the Homaatri unified web platform.

The source BRD/SRS establishes five major portals:

| Module | Route | Primary Role |
|---|---|---|
| Module 1 | `/` | Public Brand Website |
| Module 2 | `/order` | Customer Community & Ordering |
| Module 3 | `/chef` | Homemaker / Chef Dashboard |
| Module 4 | `/rider` | Delivery Rider Portal |
| Module 5 | `/admin` | Admin Operations Dashboard |

The frontend should be organized around shared state providers plus portal-specific feature components.

The source specification explicitly requires:
- location-aware discovery;
- customer cart/order state;
- Phone OTP authentication;
- Kitchen + Community Stories dual-tab discovery;
- swipeable kitchen cards;
- deep homemaker profiles;
- reels;
- chef cooking workload;
- rider next-stop delivery;
- admin operational control.

---

# 2. Architectural Principles

## 2.1 State Ownership

Use this rule:

> **Global contexts own cross-component UI/session state; FastAPI owns authoritative business state; PostgreSQL owns durable persistence.**

The browser must not be treated as the authoritative source for:
- prices;
- kitchen availability;
- capacity;
- order lifecycle;
- payment success;
- permissions.

## 2.2 Component Responsibilities

A React component should primarily:
- render;
- capture user interaction;
- call typed actions;
- manage local UI state;
- surface loading/error states.

A component should not:
- implement duplicated business rules;
- independently calculate authoritative pricing;
- directly mutate backend state without going through the API layer;
- infer payment confirmation from browser-only state.

## 2.3 Tailwind Responsibility

Tailwind CSS is responsible for:
- responsive layout;
- spacing;
- typography;
- state visuals;
- responsive breakpoints;
- mobile-first interaction patterns.

Business logic should remain in:
- hooks;
- context providers;
- typed service clients;
- domain utilities;
- backend APIs.

---

# 3. Suggested Frontend Project Structure

```text
src/
├── app/
│   ├── page.tsx                    # /
│   ├── order/
│   │   ├── page.tsx
│   │   └── tracking/
│   │       └── page.tsx
│   ├── chef/
│   │   └── page.tsx
│   ├── rider/
│   │   └── page.tsx
│   └── admin/
│       └── page.tsx
│
├── components/
│   ├── public/
│   │   ├── Hero.tsx
│   │   ├── Story.tsx
│   │   └── KitchenSpotlight.tsx
│   ├── order/
│   │   ├── DualTabHeader.tsx
│   │   ├── SwipeCardDeck.tsx
│   │   ├── ExpandedHingeProfile.tsx
│   │   ├── VerticalReelPlayer.tsx
│   │   └── CartDrawer.tsx
│   ├── chef/
│   │   ├── LeftSidebarNav.tsx
│   │   ├── CookChecklist.tsx
│   │   ├── MenuManager.tsx
│   │   └── DietaryRequestCard.tsx
│   ├── rider/
│   │   ├── LegByLegNavCard.tsx
│   │   └── GateDeliveryCard.tsx
│   └── admin/
│       ├── PipelineCounters.tsx
│       ├── LiveChatStream.tsx
│       └── CutoffControlPanel.tsx
│
├── context/
│   ├── LocationContext.tsx
│   ├── CartContext.tsx
│   └── AuthContext.tsx
│
├── hooks/
├── lib/
│   ├── api/
│   ├── auth/
│   └── validation/
├── types/
└── styles/
```

This structure is a recommendation for implementation organization. The BRD/SRS defines the portal/component behavior but does not prescribe exact filesystem structure.

---

# 4. GLOBAL CONTEXT PROVIDERS

# 4.1 `LocationContext`

## Responsibility

Own the currently active customer discovery/delivery locality and its associated location information.

The public website must capture a locality and persist it into global location state. The customer portal is location-sensitive and the kitchen deck is intended to show nearby homemakers.

The source examples include:
- Ghansoli;
- Vashi;
- Airoli.

The source also identifies kitchen/delivery coordinates as relevant to location-aware discovery.

## State Contract

```ts
export interface LocationState {
  activeCluster: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;

  isResolved: boolean;
  isLoading: boolean;
  error: string | null;
}
```

## Actions

```ts
export interface LocationActions {
  setCluster(cluster: string): void;
  setCoordinates(latitude: number, longitude: number): void;
  setAddress(address: string): void;

  setLocation(input: {
    activeCluster?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  }): void;

  clearLocation(): void;
}
```

## Provider Contract

```ts
export interface LocationContextValue
  extends LocationState,
    LocationActions {}
```

## Invariants

1. `latitude` must be in `[-90, 90]` when present.
2. `longitude` must be in `[-180, 180]` when present.
3. A cluster may exist without coordinates if the user has entered only a locality name.
4. The context should not claim a precise address when only a locality string is known.
5. Location selection should be reusable by `/` and `/order`.

## Public Website Integration

`Hero`:
- reads current cluster;
- writes locality into `LocationContext`;
- redirects to `/order?location=...`.

---

# 4.2 `CartContext`

## Responsibility

Own the client-side shopping/cart representation while treating the FastAPI backend as the authority for validation, availability, capacity, and final price.

The source requires:
- item array;
- meal window;
- quantity;
- dietary/custom notes;
- subtotal;
- delivery fee;
- checkout handoff to Razorpay.

The current implementation specification uses a ₹30 delivery fee, but pricing is intended to remain a business parameter.

## Data Types

```ts
export type MealWindow = 'LUNCH' | 'DINNER';

export interface CartItem {
  menuItemId: string;
  chefId: string;

  itemName: string;
  quantity: number;

  mealWindow: MealWindow;

  unitPriceDisplay: number;
  lineTotalDisplay: number;

  customNote?: string;
}
```

## State Contract

```ts
export interface CartState {
  items: CartItem[];

  mealWindow: MealWindow | null;

  subtotal: number;
  deliveryFee: number;
  total: number;

  customNotes: string;

  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
}
```

## Actions

```ts
export interface CartActions {
  addItem(item: CartItem): void;
  removeItem(menuItemId: string): void;

  updateQuantity(
    menuItemId: string,
    quantity: number
  ): void;

  updateItemNote(
    menuItemId: string,
    note: string
  ): void;

  setMealWindow(window: MealWindow): void;

  setCustomNotes(notes: string): void;

  openCart(): void;
  closeCart(): void;

  clearCart(): void;

  beginCheckout(): Promise<void>;
}
```

## Derived State Rules

Frontend may display:

```ts
subtotal = Σ(quantity × unitPriceDisplay)
deliveryFee = configured delivery fee
total = subtotal + deliveryFee
```

However:

> **These are display calculations only.**

The backend must recalculate authoritative:
- menu prices;
- stock;
- capacity;
- delivery fee;
- total.

## Cart Invariants

1. Quantity must be a positive integer.
2. A cart item must reference an existing menu item.
3. The cart must not assume an item remains in stock.
4. The cart must not assume a kitchen remains open.
5. Before checkout the cart must be revalidated by FastAPI.
6. A guest may browse menus but checkout requires authentication.
7. The cart should survive successful authentication where feasible.

---

# 4.3 `AuthContext`

## Responsibility

Own customer authentication/session state and the Phone OTP flow.

The BRD/SRS explicitly defines:
- Phone OTP authentication;
- JWT/session state via `AuthContext`;
- authentication at the restricted action boundary.

## State Contract

```ts
export type AuthStatus =
  | 'UNKNOWN'
  | 'GUEST'
  | 'OTP_REQUESTED'
  | 'OTP_SUBMITTING'
  | 'AUTHENTICATED'
  | 'EXPIRED'
  | 'ERROR';

export interface AuthState {
  status: AuthStatus;

  token: string | null;
  customerPhone: string | null;

  otpRequestId: string | null;

  otpError: string | null;
  isLoading: boolean;
}
```

## Actions

```ts
export interface AuthActions {
  requestOtp(phone: string): Promise<void>;

  verifyOtp(input: {
    phone: string;
    otp: string;
  }): Promise<void>;

  logout(): Promise<void>;

  refreshSession(): Promise<void>;

  requireAuthentication(
    continuation?: () => void
  ): void;
}
```

## Provider Contract

```ts
export interface AuthContextValue
  extends AuthState,
    AuthActions {}
```

## Auth Boundary Invariants

### Public

- kitchen discovery;
- reels;
- stories;
- menus;
- prices;
- trust/verification information.

### Authenticated

- order;
- subscribe;
- like;
- comment;
- review;
- follow.

The guest/auth boundary is explicitly based on the source's "YouTube model".

---

# 5. MODULE 1 — PUBLIC BRAND WEBSITE `/`

The public website is responsible for:
- brand communication;
- locality discovery;
- featured kitchen discovery;
- trust communication;
- tiffin education;
- navigation into `/order`.

---

# 5.1 `Hero`

## Purpose

Location entry point and primary customer CTA.

## Props

```ts
export interface HeroProps {
  title: string;
  subtitle?: string;

  defaultCluster?: string;

  suggestedClusters?: string[];

  primaryCtaLabel?: string;

  onFindMenus?: (cluster: string) => void;
}
```

## Local State

```ts
interface HeroState {
  query: string;
  isSubmitting: boolean;
  error: string | null;
}
```

## Behavior

1. Initialize query from `LocationContext.activeCluster` if available.
2. User enters locality.
3. `setCluster(query)`.
4. Primary CTA navigates to:

```text
/order?location=<cluster>
```

5. Suggested chips such as Ghansoli, Vashi and Airoli populate the same location state.

## Required Interaction

The public-site specification explicitly requires:
- locality input;
- global location state;
- `/order?location=...`;
- quick locality chips.

---

# 5.2 `Story`

The provided BRD/SRS defines an `Our Story` section on the public site and describes the brand as being centered around homemaker identity, storytelling, trust and recurring tiffin commerce.

## Props

```ts
export interface StoryProps {
  id?: string;
  title: string;
  body: string;
  imageUrl?: string;

  ctaLabel?: string;
  onCtaClick?: () => void;
}
```

## Local State

```ts
interface StoryState {
  isExpanded: boolean;
}
```

## Contract

The component should:
- remain presentational;
- not own global application state;
- navigate/order through explicit callbacks where required.

---

# 5.3 `KitchenSpotlight`

## Purpose

Display featured homemaker/kitchen cards and route the user into `/order` with optional chef preselection.

## Props

```ts
export interface KitchenSpotlightKitchen {
  chefId: string;
  kitchenName: string;
  chefName: string;

  imageUrl?: string;
  cuisine?: string;
  signatureDish?: string;

  rating?: number;
}

export interface KitchenSpotlightProps {
  kitchens: KitchenSpotlightKitchen[];

  onViewAll?: () => void;

  onViewMenu?: (chefId: string) => void;
}
```

## Local State

```ts
interface KitchenSpotlightState {
  selectedChefId: string | null;
}
```

## Behavior

Featured kitchen cards must:
- show kitchen identity;
- offer a menu/order CTA;
- navigate to `/order`;
- optionally preselect the selected chef.

The current source identifies four example kitchens:
- Indravati Pure Veg;
- Konkan Coastal;
- Desi Punjabi Dhaba;
- Dakshin Annapoorna.

Their IDs should remain configuration/data rather than UI constants.

---

# 6. MODULE 2 — CUSTOMER COMMUNITY & ORDERING `/order`

The customer portal provides two top-level experiences:

1. `🎴 Kitchens`
2. `🎥 Community Stories`

It also supports:
- guest browsing;
- Phone OTP authentication;
- tiffin menu interaction;
- cart;
- ordering;
- reviews;
- follows;
- tracking.

---

# 6.1 `DualTabHeader`

## Purpose

Switch between:
- Kitchen discovery;
- Community Stories.

## Props

```ts
export type OrderTab = 'KITCHENS' | 'STORIES';

export interface DualTabHeaderProps {
  activeTab: OrderTab;

  onTabChange: (tab: OrderTab) => void;

  cartItemCount: number;
  onOpenCart: () => void;

  locationLabel?: string;

  isAuthenticated: boolean;
  onAuthClick?: () => void;
}
```

## Local State

```ts
interface DualTabHeaderState {
  isLocationMenuOpen: boolean;
}
```

## Invariants

- Active tab is controlled by the parent.
- Cart counter comes from `CartContext`.
- Auth state comes from `AuthContext`.
- Location label comes from `LocationContext`.

---

# 6.2 `SwipeCardDeck`

## Purpose

Provide Inshorts/Tinder-style discovery of nearby homemakers.

The source requires:
- swipe left/right on mobile;
- next/previous on desktop;
- visual card summaries;
- location-sensitive discovery.

## Props

```ts
export interface KitchenCardData {
  chefId: string;

  kitchenName: string;
  chefName?: string;

  photoUrl?: string;
  regionalIdentity?: string;
  rating?: number;

  signatureDish?: string;
  pricePreview?: number;

  isCurrentlyServing?: boolean;
  isVerified?: boolean;
}

export interface SwipeCardDeckProps {
  kitchens: KitchenCardData[];

  activeIndex?: number;

  onCardOpen: (chefId: string) => void;

  onSwipeLeft?: (chefId: string) => void;
  onSwipeRight?: (chefId: string) => void;

  onNext?: () => void;
  onPrevious?: () => void;
}
```

## Local State

```ts
interface SwipeCardDeckState {
  currentIndex: number;

  dragX: number;
  isDragging: boolean;

  isAnimating: boolean;
}
```

## Rules

- Mobile supports touch/swipe.
- Desktop supports explicit next/previous controls.
- Do not encode kitchen eligibility in swipe animation.
- The backend remains authoritative for serving state.

---

# 6.3 `ExpandedHingeProfile`

## Purpose

Deep profile view inspired by Hinge-style scroll behavior.

The source requires profile sections for:
- story;
- hometown heritage;
- cooking philosophy;
- kitchen verification;
- hygiene badges;
- social links;
- dedicated chef reel gallery;
- lunch/dinner menu;
- quantities;
- dietary notes.

## Props

```ts
export interface ChefProfileData {
  chefId: string;

  chefName: string;
  kitchenName: string;

  bio?: string;
  hometownRegion?: string;
  cuisineSummary?: string;

  profileImageUrl?: string;

  isVerified?: boolean;
  hygieneBadges?: string[];

  instagramUrl?: string;
  youtubeUrl?: string;

  reels: {
    reelId: string;
    videoUrl: string;
    thumbnailUrl?: string;
    caption?: string;
  }[];

  lunchMenu: MenuItemViewModel[];
  dinnerMenu: MenuItemViewModel[];
}

export interface MenuItemViewModel {
  menuItemId: string;
  itemName: string;
  price: number;
  imageUrl?: string;

  availability: 'IN_STOCK' | 'SOLD_OUT';
  supportsCustomization: boolean;
}

export interface ExpandedHingeProfileProps {
  chef: ChefProfileData;

  onClose: () => void;

  onOrderItem: (
    menuItemId: string,
    quantity: number,
    note?: string
  ) => void;

  onFollow: () => void;
}
```

## Local State

```ts
interface ExpandedHingeProfileState {
  activeMealWindow: 'LUNCH' | 'DINNER';

  selectedQuantities: Record<string, number>;

  dietaryNotes: Record<string, string>;

  isFollowing: boolean;
}
```

## Invariants

- Displayed `IN_STOCK` does not guarantee checkout acceptance.
- Price display is informative until checkout.
- Follow action requires authentication.
- Menu and stories may remain public to guests.

---

# 6.4 `VerticalReelPlayer`

## Purpose

Provide a full-screen vertical community reel experience.

The source requires:
- full-screen vertical video;
- auto-play;
- sound toggle;
- progress;
- chef/dish overlay;
- direct order action;
- like;
- comment;
- follow.

## Props

```ts
export interface ReelData {
  reelId: string;
  chefId: string;

  chefName: string;
  kitchenName: string;

  videoUrl: string;
  thumbnailUrl?: string;

  dishName?: string;
  dishPrice?: number;

  likeCount: number;
  viewCount: number;

  isLiked?: boolean;
  isFollowed?: boolean;
}

export interface VerticalReelPlayerProps {
  reel: ReelData;

  onView: (reelId: string) => void;

  onLike: (reelId: string) => void;
  onComment: (reelId: string) => void;
  onFollow: (chefId: string) => void;

  onOrderDish?: (reelId: string) => void;
}
```

## Local State

```ts
interface VerticalReelPlayerState {
  isPlaying: boolean;
  isMuted: boolean;

  progressSeconds: number;
  durationSeconds: number;

  hasRegisteredInitialView: boolean;
}
```

## Auth Rules

- Watch: guest allowed.
- Like: authentication required.
- Comment: authentication required.
- Follow: authentication required.
- Order: authentication required.

The component should invoke `AuthContext.requireAuthentication()` for protected actions rather than embedding OTP logic inside the player.

---

# 6.5 `CartDrawer`

## Purpose

Display current cart, selected meal window, quantities, notes and checkout action.

## Props

```ts
export interface CartDrawerProps {
  isOpen: boolean;

  onClose: () => void;

  onCheckout: () => Promise<void>;

  onAuthenticate?: () => void;

  deliveryFee: number;
  currency?: 'INR';

  canCheckout: boolean;
  checkoutError?: string | null;
}
```

## Context Dependencies

Consumes:
- `CartContext`;
- `AuthContext`.

## Local State

```ts
interface CartDrawerState {
  isCheckoutLoading: boolean;
  isAuthModalOpen: boolean;
}
```

## Rendering Contract

Must show:
- line items;
- meal window;
- quantity controls;
- custom notes;
- subtotal;
- delivery fee;
- total;
- checkout action.

The source implementation checklist specifies a ₹30 delivery fee and Razorpay checkout trigger.

The frontend should display the configured amount, while the backend remains authoritative.

---

# 7. MODULE 3 — HOMEMAKER / CHEF `/chef`

The homemaker portal is designed around the promise:

> **Your Kitchen, Your Business.**

It manages:
- kitchen identity;
- current meal-window workload;
- menu;
- orders;
- content;
- dietary requests;
- earnings;
- settings.

---

# 7.1 `LeftSidebarNav`

## Props

```ts
export type ChefNavKey =
  | 'OVERVIEW'
  | 'CHECKLIST'
  | 'ORDERS'
  | 'MENU'
  | 'CONTENT'
  | 'DIETARY_REQUESTS'
  | 'EARNINGS'
  | 'SETTINGS';

export interface LeftSidebarNavProps {
  activeKey: ChefNavKey;

  onNavigate: (key: ChefNavKey) => void;

  kitchenName: string;
  kitchenPhotoUrl?: string;

  acceptingOrders: boolean;
}
```

## Local State

```ts
interface LeftSidebarNavState {
  isCollapsed: boolean;
  isMobileDrawerOpen: boolean;
}
```

## Navigation Items

The source identifies:

- Overview;
- Cooking Checklist;
- Live Orders;
- Menu Manager;
- Content Studio;
- Dietary Requests;
- Earnings;
- Kitchen Settings.

---

# 7.2 `CookChecklist`

## Purpose

Convert confirmed/batched demand into an aggregated preparation workload.

## Props

```ts
export interface CookSummaryLine {
  label: string;
  quantity: number;
}

export interface CookChecklistProps {
  mealWindow: 'LUNCH' | 'DINNER';

  cutoffTime: string;

  totalMeals: number;

  summary: CookSummaryLine[];

  orders: {
    orderId: string;
    customerName: string;
    items: CookSummaryLine[];
    notes?: string;
  }[];

  onMarkPacked: () => Promise<void>;

  isPackedReady: boolean;
}
```

## Local State

```ts
interface CookChecklistState {
  expandedOrderIds: Set<string>;
  isSubmitting: boolean;
}
```

## Behavior

Display:
- active meal window;
- cutoff;
- total meals;
- consolidated cook summary;
- order-level details;
- pack-ready action.

Current cutoffs:
- Lunch: 11:30 AM
- Dinner: 6:30 PM.

---

# 7.3 `MenuManager`

## Props

```ts
export interface ChefMenuItem {
  menuItemId: string;

  itemName: string;
  description?: string;

  unitPrice: number;

  mealWindow: 'LUNCH' | 'DINNER';

  availability:
    | 'IN_STOCK'
    | 'SOLD_OUT';

  isSignatureDish: boolean;
  supportsCustomization: boolean;
}

export interface MenuManagerProps {
  items: ChefMenuItem[];

  onCreate: (
    item: Omit<ChefMenuItem, 'menuItemId'>
  ) => Promise<void>;

  onUpdate: (
    item: ChefMenuItem
  ) => Promise<void>;

  onToggleAvailability: (
    menuItemId: string,
    availability: 'IN_STOCK' | 'SOLD_OUT'
  ) => Promise<void>;
}
```

## Local State

```ts
interface MenuManagerState {
  mealWindow: 'LUNCH' | 'DINNER';

  editingItemId: string | null;

  formDraft: Partial<ChefMenuItem>;

  isSaving: boolean;
  error: string | null;
}
```

## Rules

The frontend may change the toggle visually.

The backend must revalidate:
- item existence;
- kitchen authorization;
- valid price;
- valid meal window;
- availability state.

---

# 7.4 `DietaryRequestCard`

## Purpose

Handle customer customization requests such as:
- less oil;
- no garlic;
- medium spice.

The source requires:
- Accept;
- Reject;
- Counter-offer;
- maximum two counter turns.

## Props

```ts
export type DietaryRequestStatus =
  | 'NOTE_SUBMITTED'
  | 'CHEF_COUNTERED_1'
  | 'CHEF_COUNTERED_2'
  | 'CUSTOMER_ACCEPTED'
  | 'CHEF_ACCEPTED'
  | 'EXPIRED_DEFAULT';

export interface DietaryRequestCardProps {
  requestId: string;

  orderId: string;
  customerName: string;

  note: string;

  status: DietaryRequestStatus;

  counterTurnCount: number;

  maxCounterTurns: 2;

  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;

  onCounterOffer: (
    requestId: string,
    message: string
  ) => Promise<void>;
}
```

## Local State

```ts
interface DietaryRequestCardState {
  counterText: string;
  isSubmitting: boolean;
}
```

## Hard UI Guard

```ts
const canCounter =
  counterTurnCount < 2 &&
  status !== 'EXPIRED_DEFAULT';
```

This is only a UI convenience.

The FastAPI backend must enforce the two-turn hard cap.

---

# 8. MODULE 4 — RIDER `/rider`

The rider portal is mobile-first.

The source explicitly states:
- one chef : one driver allocation per meal window;
- route assignment;
- pickup confirmation;
- next-stop-only navigation;
- multi-order gate delivery;
- exceptions.

---

# 8.1 `LegByLegNavCard`

## Purpose

Show only the immediate next delivery stop.

## Props

```ts
export interface RiderStop {
  stopNumber: number;

  orderId: string;

  customerName: string;

  address: string;

  latitude?: number;
  longitude?: number;
}

export interface LegByLegNavCardProps {
  stop: RiderStop | null;

  remainingStops: number;

  onNavigate: (stop: RiderStop) => void;

  onCallCustomer: (stop: RiderStop) => void;

  onMarkDelivered: (orderId: string) => Promise<void>;

  onReportAddressIssue: (orderId: string) => Promise<void>;
}
```

## Local State

```ts
interface LegByLegNavCardState {
  isActionPending: boolean;
}
```

## UX Contract

The component should expose:
- stop number;
- customer name;
- delivery address;
- Open Google Maps action;
- Call Customer action;
- delivery completion action.

Do not expose the full route at once on the rider screen.

---

# 8.2 `GateDeliveryCard`

## Purpose

Support multiple orders delivered to the same residential gate/address.

## Props

```ts
export interface GateOrder {
  orderId: string;
  customerName: string;
  address: string;

  status:
    | 'PENDING'
    | 'DELIVERED'
    | 'UNDELIVERED';
}

export interface GateDeliveryCardProps {
  orders: GateOrder[];

  onConfirmAll: (
    orderIds: string[]
  ) => Promise<void>;

  onMarkUndelivered: (
    orderId: string,
    reason: string
  ) => Promise<void>;
}
```

## Local State

```ts
interface GateDeliveryCardState {
  selectedOrderIds: Set<string>;
  isSubmitting: boolean;
}
```

## Rules

The rider may:
- bulk-confirm all deliveries at the same gate;
- individually mark an unavailable customer/order;
- complete the rest of the gate's deliveries independently.

This matches the source requirement that an unavailable customer must not prevent other orders at the same gate from being completed.

---

# 9. MODULE 5 — ADMIN `/admin`

The admin portal is the real-time operations control tower.

Core functions:
- pipeline;
- capacity;
- cutoff;
- route allocation;
- chat audit;
- escalations;
- chef management;
- rider management.

---

# 9.1 `PipelineCounters`

## Props

```ts
export type OrderStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'BATCHED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED';

export interface PipelineCountersProps {
  counts: Partial<Record<OrderStatus, number>>;

  serviceDate: string;

  isRefreshing?: boolean;

  onRefresh?: () => void;
}
```

## Local State

```ts
interface PipelineCountersState {
  lastUpdatedAt: string | null;
}
```

## Display Contract

The source requires real-time counts across:

```text
DRAFT
PENDING_PAYMENT
CONFIRMED
BATCHED
OUT_FOR_DELIVERY
DELIVERED
```

The dashboard may also display failure/cancellation states when relevant.

---

# 9.2 `LiveChatStream`

## Props

```ts
export type ChatChannel =
  | 'WHATSAPP'
  | 'WEB';

export type ChatDirection =
  | 'INBOUND'
  | 'OUTBOUND';

export interface ChatMessage {
  messageId: string;

  customerId: string;

  channel: ChatChannel;
  direction: ChatDirection;

  senderRole:
    | 'CUSTOMER'
    | 'ADMIN'
    | 'SYSTEM';

  messageText: string;

  createdAt: string;
}

export interface LiveChatStreamProps {
  messages: ChatMessage[];

  selectedCustomerId?: string;

  onSelectCustomer: (customerId: string) => void;

  onSendMessage: (
    customerId: string,
    message: string
  ) => Promise<void>;

  isLoading?: boolean;
}
```

## Local State

```ts
interface LiveChatStreamState {
  draftMessage: string;
  isSending: boolean;
  autoScrollEnabled: boolean;
}
```

## Source Integration

The BRD/SRS explicitly identifies:

```http
GET /api/admin/chats
```

as the source for the admin real-time chat/audit stream.

---

# 9.3 `CutoffControlPanel`

## Purpose

Control and monitor Lunch/Dinner cutoff execution.

## Props

```ts
export type MealWindow = 'LUNCH' | 'DINNER';

export interface CutoffControlPanelProps {
  mealWindow: MealWindow;

  cutoffTime: string;

  serverNow: string;

  isBatchRunning: boolean;

  canRunManualBatch: boolean;

  onRunBatchNow: () => Promise<void>;
}
```

## Local State

```ts
interface CutoffControlPanelState {
  confirmManualRunOpen: boolean;
  isSubmitting: boolean;
}
```

## Display Requirements

Must show:
- current meal window;
- cutoff;
- current status;
- batch execution control.

The source explicitly identifies:

```text
Lunch cutoff: 11:30 AM
Dinner cutoff: 6:30 PM
```

and the admin action:

> `Run Cutoff Batch & Route Allocation Now`

---

# 10. CROSS-PORTAL CONTEXT DEPENDENCY MAP

```text
                         ┌────────────────────┐
                         │ LocationContext     │
                         └─────────┬──────────┘
                                   │
               ┌───────────────────┴───────────────────┐
               ▼                                       ▼
           Public `/`                              Customer `/order`
               │                                       │
               │                               ┌───────┴────────┐
               │                               ▼                ▼
               │                         CartContext       AuthContext
               │                               │                │
               └───────────────────────────────┼────────────────┘
                                               │
                                               ▼
                                      FastAPI Backend
                                               │
                            ┌──────────────────┼─────────────────┐
                            ▼                  ▼                 ▼
                          /chef              /rider            /admin
```

---

# 11. STATE PROVIDER COMPOSITION

Recommended top-level composition:

```tsx
<LocationProvider>
  <AuthProvider>
    <CartProvider>
      {children}
    </CartProvider>
  </AuthProvider>
</LocationProvider>
```

Recommended responsibility boundaries:

### `LocationProvider`
Available to:
- `/`;
- `/order`;
- any location-aware discovery component.

### `AuthProvider`
Available to:
- customer portal;
- any public component that needs protected-action handling.

### `CartProvider`
Available primarily to:
- `/order`;
- checkout-related customer UI.

Do not expose cart business logic globally to unrelated operational portals.

---

# 12. COMPONENT DATA-FLOW CONTRACT

## Public

```text
Hero
 ↓
LocationContext
 ↓
/order?location=...
 ↓
SwipeCardDeck
```

## Customer discovery

```text
LocationContext
       ↓
SwipeCardDeck
       ↓
ExpandedHingeProfile
       ↓
CartContext
       ↓
AuthContext
       ↓
Checkout
```

## Social

```text
VerticalReelPlayer
       ↓
AuthContext
       ↓
FastAPI
       ↓
Social API
```

## Homemaker

```text
/chef
 ↓
Overview / CookChecklist / MenuManager / DietaryRequestCard
 ↓
FastAPI
```

## Rider

```text
/rider
 ↓
LegByLegNavCard / GateDeliveryCard
 ↓
FastAPI
 ↓
Delivery state
```

## Admin

```text
/admin
 ↓
PipelineCounters / LiveChatStream / CutoffControlPanel
 ↓
FastAPI
 ↓
Operational state
```

---

# 13. TYPES THAT SHOULD BE SHARED ACROSS COMPONENTS

A shared frontend type layer should define canonical types for:

```ts
export type MealWindow =
  | 'LUNCH'
  | 'DINNER';

export type OrderStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'BATCHED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED';

export type KitchenAvailability =
  | 'IN_STOCK'
  | 'SOLD_OUT';

export type ChefKitchenState =
  | 'KITCHEN_CLOSED'
  | 'ACCEPTING_ORDERS'
  | 'CAPACITY_REACHED'
  | 'KITCHEN_PAUSED';
```

These should be imported consistently instead of re-declared differently per component.

---

# 14. FRONTEND / BACKEND CONTRACT RULES

## Rule 1 — Backend validation wins

The frontend may pre-validate but must expect the backend to reject:
- stale prices;
- sold-out items;
- closed kitchens;
- capacity reached;
- invalid cutoff;
- expired authentication.

## Rule 2 — Components should handle server rejection gracefully

Examples:

```text
CAPACITY_REACHED
→ show "Kitchen has reached today's capacity"
```

```text
SOLD_OUT
→ show "This item is sold out"
```

```text
AUTH_REQUIRED
→ open Phone OTP
```

```text
PRICE_CHANGED
→ refresh cart and ask for confirmation
```

## Rule 3 — Server time should be authoritative

Meal-window/cutoff components should not depend exclusively on device clock.

The Admin/Cutoff UI should display server-derived time where possible.

---

# 15. LOADING / ERROR / EMPTY STATES

Every data-connected component should support at minimum:

```ts
interface AsyncViewState {
  isLoading: boolean;
  error: string | null;
}
```

Recommended component states:

### `SwipeCardDeck`
- loading skeleton;
- no nearby kitchens;
- location unavailable;
- API error.

### `ExpandedHingeProfile`
- profile loading;
- profile not found;
- menu unavailable.

### `VerticalReelPlayer`
- video loading;
- video unavailable;
- engagement error.

### `CartDrawer`
- empty cart;
- stale item;
- checkout loading;
- checkout error.

### `CookChecklist`
- no active meal window;
- zero meals;
- loading;
- pack action failure.

### Rider components
- no assigned batch;
- no next stop;
- route unavailable;
- delivery action failure.

### Admin components
- no pipeline data;
- chat loading;
- batch execution running;
- batch execution failure.

---

# 16. ACCESSIBILITY / RESPONSIVENESS CONTRACT

The BRD/SRS explicitly requires responsive/mobile-first operation, especially for rider workflows and key homemaker workflows.

## Customer

Must support:
- touch swiping;
- desktop next/previous;
- readable card hierarchy;
- clear action affordances.

## Homemaker

Must be usable on:
- desktop;
- responsive tablet/mobile.

## Rider

Must be:
- mobile-first;
- one-handed where practical;
- action focused;
- next-stop prioritized.

## Admin

Must prioritize:
- dense operational visibility;
- readable counters;
- responsive but desktop-oriented control-tower layouts.

---

# 17. FRONTEND SECURITY CONTRACT

The frontend must:

- store and handle authentication tokens according to approved security architecture;
- never expose secret API credentials;
- never trust client-side payment status;
- never treat client-side price totals as authoritative;
- never use client-side role checks as the sole authorization control;
- avoid exposing sensitive customer information unnecessarily.

The backend remains the authorization authority.

---

# 18. TESTING CONTRACTS

Every stateful component should have tests for:

## Context
- initial state;
- action transitions;
- invalid action handling.

## Customer

### `SwipeCardDeck`
- card progression;
- boundary conditions;
- touch vs desktop navigation.

### `CartDrawer`
- quantity updates;
- note updates;
- empty cart;
- authentication boundary;
- checkout failure.

### `VerticalReelPlayer`
- public view;
- auth-triggered like;
- auth-triggered follow;
- failed engagement.

## Chef

### `CookChecklist`
- aggregated data rendering;
- packed transition;
- loading/error.

### `MenuManager`
- create;
- edit;
- stock toggle;
- stale-state rejection.

### `DietaryRequestCard`
- accept;
- reject;
- first counter;
- second counter;
- block third counter.

## Rider

### `LegByLegNavCard`
- next-stop display;
- delivery confirmation;
- exception.

### `GateDeliveryCard`
- bulk confirmation;
- one failed order;
- successful completion of remaining orders.

## Admin

### `PipelineCounters`
- all statuses;
- refresh.

### `LiveChatStream`
- incoming messages;
- outgoing messages;
- scroll behavior.

### `CutoffControlPanel`
- cutoff display;
- manual batch confirmation;
- duplicate-run prevention UI.

---

# 19. FINAL COMPONENT CONTRACT SUMMARY

| Component | Primary State Source | Local State | Critical Interaction |
|---|---|---|---|
| `Hero` | LocationContext | Query/submission | Find menus |
| `Story` | None | Expansion | Story CTA |
| `KitchenSpotlight` | Location/API data | Selected chef | Open menu |
| `DualTabHeader` | Location/Auth/Cart | Location menu | Switch tabs/open cart/auth |
| `SwipeCardDeck` | Location/API | Index/drag | Swipe/open profile |
| `ExpandedHingeProfile` | API + Auth/Cart | Meal tab/qty/notes | Add/order/follow |
| `VerticalReelPlayer` | Auth + API | Playback | Like/comment/follow/order |
| `CartDrawer` | Cart + Auth | Checkout modal/loading | Checkout |
| `LeftSidebarNav` | Portal routing | Collapse/mobile | Navigate |
| `CookChecklist` | API | Expand/submit | Mark packed |
| `MenuManager` | API | Edit form | Save/toggle stock |
| `DietaryRequestCard` | API | Counter draft | Accept/reject/counter |
| `LegByLegNavCard` | API | Action loading | Navigate/deliver |
| `GateDeliveryCard` | API | Selection | Bulk delivery |
| `PipelineCounters` | API | Timestamp | Refresh |
| `LiveChatStream` | API | Draft/scroll | Send message |
| `CutoffControlPanel` | API/admin state | Confirmation/loading | Run batch |

---

# 20. Source Alignment

The source BRD/SRS explicitly defines:
- the five portals;
- public locality discovery;
- the customer Kitchens + Community Stories experience;
- swipeable kitchen discovery;
- deep homemaker profiles;
- reel interaction;
- guest vs authenticated behavior;
- cart and checkout;
- Phone OTP/JWT session state;
- homemaker cook checklist/menu/content/dietary modules;
- rider next-stop and gate-delivery workflows;
- admin pipeline/chat/cutoff modules. fileciteturn5file0L86-L94 fileciteturn5file0L398-L511 fileciteturn5file0L578-L670 fileciteturn5file0L674-L812

The BRD/SRS also establishes that authentication is required at restricted actions, while discovery/consumption remains available to guests, and that the customer and operational portals depend on the FastAPI backend. fileciteturn5file0L486-L511 fileciteturn5file0L149-L210

Where the BRD/SRS does not specify exact React prop names, TypeScript interfaces, file paths, or component-local state, the interfaces above are an implementation-oriented frontend contract derived from the documented behavior rather than source-defined API contracts.
