# 🤖 CONSOLIDATED MASTER PROMPT: PHASE 2 — FULL-STACK AUTHENTICATION & ONBOARDING (FRONTEND + BACKEND)

> **INSTRUCTION FOR CURSOR / CLAUDE CODE / AI AGENT:**  
> You are acting as the Lead Full-Stack Software Engineer for Homaatri. Your mission in Phase 2 is to construct the COMPLETE Full-Stack Authentication & Onboarding system across both the Frontend Next.js 14 App (`homatri_website`) and the Backend Python FastAPI Engine (`homatri/backend`).

---

## 📚 AUTHORITATIVE SPECIFICATION MARKDOWNS TO READ FIRST

Before writing any code or updating components, YOU MUST READ THESE 5 SPECIFICATION FILES IN THIS EXACT SEQUENCE:

1. 📄 **`Homaatri_Authentication_Authorization_Spec.md`**: Master JWT session architecture, 30-day refresh sessions, HttpOnly cookies, and security rules.
2. 📄 **`MSG91_OTP_WIDGET_SPEC.md`**: Approach B MSG91 OTP Widget token verification contract (`Widget ID: 3668776a6f65313935373431`, `Widget Token: 563549TIHmC7w7bhL6a8acd1aP1`).
3. 📄 **`ONBOARDING_DATA_SCHEMA_SPEC.md`**: Required onboarding fields by role (FSSAI license number, cartoon avatars, vehicle reg, payout UPI IDs).
4. 📄 **`BULK_CATERING_SPEC.md`**: Specification for the dedicated Bulk & Event Catering Portal (`/bulk`) and dynamic plate calculator.
5. 📄 **`Homaatri_Frontend_Component_Architecture_State_Contracts.md`**: Props contracts & AuthContext expectations.

---

## 📍 CODEBASE LOCATIONS & ENVIRONMENT KEYS

- **Frontend App**: `/home/dinesh/coding/PROJECTS/homatri_website` (Next.js 14)
- **Backend App**: `/home/dinesh/coding/PROJECTS/homatri/backend` (Python FastAPI)
- **Environment Keys**:
  - `NEXT_PUBLIC_MSG91_WIDGET_ID=3668776a6f65313935373431`
  - `NEXT_PUBLIC_MSG91_WIDGET_TOKEN=563549TIHmC7w7bhL6a8acd1aP1`
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID=195132182954-ooatsl0i96re4hcd8fvm95s4g2g6lf8d.apps.googleusercontent.com`
  - `GOOGLE_CLIENT_SECRET` (Loaded from backend `.env`)

---

## ⚙️ PART 1: FRONTEND UI DELIVERABLES (`homatri_website`)

```text
===================================================================================
TASK 1: CUSTOMER AUTH MODAL (`src/app/order/_components/PhoneOtpModal.jsx`)
===================================================================================
- Integrate MSG91 Web SDK (`https://verify.msg91.com/otp-provider.js`).
- Render Terracotta-themed custom OTP UI (+91 phone input -> 6-digit OTP boxes).
- Add 🔴 "Continue with Google" 1-Tap Button using `@react-oauth/google`.
- Add 🎨 Pre-built Cartoonish Avatar Picker:
  - 4 Selectable Avatar Icons (`Chef Mom`, `Happy Foodie`, `Tiffin Box`, `Spices`).
- Connect to `AuthContext` to set 30-day session state upon successful login.

===================================================================================
TASK 2: HOMEMAKER ONBOARDING PAGE (`src/app/chef/onboarding/page.js`)
===================================================================================
- Create a multi-step onboarding wizard for Homemakers:
  - Step 1: Legal Name, Kitchen Name (*Indravati Pure Veg*), Bio, Hometown Region.
  - Step 2: 14-Digit FSSAI License Number (Mandatory validation).
  - Step 3: Daily Meal Capacity (default 15), Address Line 1, GPS Lat/Lng pin.
  - Step 4: Bank Payout UPI ID (*homemaker@upi*) & Cartoonish/Photo Chef Avatar.
- On Submit: Calls `POST /api/v1/auth/onboarding/chef`.

===================================================================================
TASK 3: RIDER ONBOARDING PAGE (`src/app/rider/onboarding/page.js`)
===================================================================================
- Create an onboarding form for Delivery Riders:
  - Full Legal Name & Phone Number.
  - Driving License Number.
  - Vehicle Type (Scooter / Bike / EV) & Vehicle Registration Number (*MH-43-AZ-1234*).
  - Service Cluster Area (*Ghansoli, Vashi, Airoli*) & Bank Payout UPI ID.
- On Submit: Calls `POST /api/v1/auth/onboarding/rider`.

===================================================================================
TASK 4: DEDICATED BULK CATERING PORTAL (`src/app/bulk/page.js`)
===================================================================================
- Build the `/bulk` portal route:
  - Guest Count Selector (10 to 50+ meals).
  - Tiered Catering Thali Templates (Standard ₹149, Deluxe ₹199, Grand Feast ₹299).
  - Dynamic Interactive Plate Customizer: Unchecking items (e.g. Sweet -₹29, Sabzi -₹35) dynamically recalculates per-plate price!
  - Event Date & Time Selector + Custom Menu Notes input.
```

---

## ⚙️ PART 2: BACKEND API DELIVERABLES (`homatri/backend`)

```text
===================================================================================
TASK 5: FASTAPI AUTH & ONBOARDING ROUTER (`backend/app/api/v1/auth.py`)
===================================================================================
1. POST /api/v1/auth/verify-msg91-widget:
   - Validates MSG91 token, checks/creates `CustomerProfile`, issues 30-day JWT session.
2. POST /api/v1/auth/google-login:
   - Verifies Google ID Token, extracts sub/email/name/avatar, issues 30-day JWT session.
3. POST /api/v1/auth/onboarding/chef:
   - Saves FSSAI license, kitchen name, bio, capacity, address, and lat/lng to `chef_profiles`.
4. POST /api/v1/auth/onboarding/rider:
   - Saves driving license, vehicle reg number, cluster area to `driver_profiles`.
5. POST /api/v1/auth/refresh & GET /api/v1/auth/me:
   - Handles token refresh & active session validation.
```

---

## 🔒 VERIFICATION COMMAND

After completing Phase 2 code:
1. Run `npm run build` in `homatri_website` to confirm 100% clean frontend compilation.
2. Test FastAPI backend endpoints and confirm 200 OK responses.
