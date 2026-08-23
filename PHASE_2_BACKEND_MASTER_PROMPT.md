# 🤖 MASTER PROMPT: PHASE 2 — BACKEND AUTHENTICATION & ONBOARDING APIS

> **INSTRUCTION FOR CURSOR / CLAUDE CODE / AI AGENT:**  
> You are acting as the Lead Backend API Engineer for Homaatri. Your mission in Phase 2 is to construct all authentication, social login, onboarding, and session management API endpoints in Python FastAPI (`/home/dinesh/coding/PROJECTS/homatri/backend/app/api/v1/auth.py`).

---

## 📚 AUTHORITATIVE SPECIFICATION MARKDOWNS TO READ FIRST

Before writing any FastAPI route handlers, YOU MUST READ THESE 4 SPECIFICATION FILES:

1. 📄 **`Homaatri_Authentication_Authorization_Spec.md`**: Master JWT session architecture, 30-day refresh sessions, HttpOnly cookies, and security rules.
2. 📄 **`MSG91_OTP_WIDGET_SPEC.md`**: Approach B MSG91 OTP Widget token verification contract (`Widget ID: 3668776a6f65313935373431`, `Widget Token: 563549TIHmC7w7bhL6a8acd1aP1`).
3. 📄 **`ONBOARDING_DATA_SCHEMA_SPEC.md`**: Required onboarding fields by role (FSSAI license number, cartoon avatars, vehicle reg, payout UPI IDs).
4. 📄 **`Homaatri_Frontend_Component_Architecture_State_Contracts.md`**: Frontend AuthContext payload expectations.

---

## 📍 CODEBASE LOCATION & ENVIRONMENT KEYS

- **Backend Repository**: `/home/dinesh/coding/PROJECTS/homatri/backend`
- **Target Route File**: `backend/app/api/v1/auth.py` (and register in `backend/app/api/v1/router.py`)
- **Environment Keys**:
  - `MSG91_WIDGET_ID=3668776a6f65313935373431`
  - `MSG91_WIDGET_TOKEN=563549TIHmC7w7bhL6a8acd1aP1`
  - `GOOGLE_CLIENT_ID=195132182954-ooatsl0i96re4hcd8fvm95s4g2g6lf8d.apps.googleusercontent.com`
  - `GOOGLE_CLIENT_SECRET` (Loaded from backend `.env` configuration file)

---

## ⚙️ EXACT ENDPOINT IMPLEMENTATION TASKS FOR PHASE 2

```text
===================================================================================
ENDPOINT 1: POST /api/v1/auth/verify-msg91-widget
===================================================================================
- Payload: { "phone": "9876543210", "msg91_token": "verified_access_token" }
- Logic:
  1. Validates token with MSG91 verification API (or accepts test token in dev).
  2. Queries `customer_profiles` table by phone number:
     - Existing Customer: Retrieves profile.
     - New Customer: Creates new record with default cartoon avatar (`avatar_tiffin_cartoon_1.png`).
  3. Creates 30-day refresh session record in `user_sessions` table.
  4. Returns: {
       "access_token": "<jwt>",
       "refresh_token": "<refresh_jwt>",
       "token_type": "bearer",
       "user": { "phone": "9876543210", "full_name": "...", "role": "CUSTOMER", "avatar_url": "..." }
     }

===================================================================================
ENDPOINT 2: POST /api/v1/auth/google-login
===================================================================================
- Payload: { "id_token": "google_id_token_string" }
- Logic:
  1. Verifies token with Google OAuth 2.0 API (`google.oauth2.id_token.verify_oauth2_token`).
  2. Extracts `sub` (Google User ID), `email`, `name`, `picture` avatar.
  3. Queries `customer_profiles` table by `google_sub` or `email`:
     - Existing Customer: Updates avatar/email if changed.
     - New Customer: Registers profile using Google Name, Email, and Picture URL.
  4. Returns user payload + 30-day session JWT.

===================================================================================
ENDPOINT 3: POST /api/v1/auth/onboarding/chef
===================================================================================
- Payload: {
    "chef_phone": "9876543210",
    "chef_name": "Indravati Devi",
    "kitchen_name": "Indravati Pure Veg",
    "fssai_license_number": "12345678901234",
    "bio": "Authentic Konkani recipes",
    "hometown_region": "Konkan",
    "daily_capacity": 15,
    "address_line1": "Sector 8, Ghansoli",
    "latitude": 19.123456,
    "longitude": 73.012345,
    "payout_upi_id": "indravati@upi"
  }
- Logic: Inserts or updates `chef_profiles` table with FSSAI license and kitchen details.

===================================================================================
ENDPOINT 4: POST /api/v1/auth/onboarding/rider
===================================================================================
- Payload: {
    "driver_phone": "9876543210",
    "driver_name": "Ramesh Kumar",
    "driving_license_number": "MH-03-2022-1234567",
    "vehicle_type": "SCOOTER",
    "vehicle_reg_number": "MH-43-AZ-1234",
    "assigned_cluster": "Ghansoli",
    "payout_upi_id": "ramesh@upi"
  }
- Logic: Inserts or updates `driver_profiles` table with driving license and vehicle registration.

===================================================================================
ENDPOINT 5: POST /api/v1/auth/refresh & GET /api/v1/auth/me
===================================================================================
- `/refresh`: Receives refresh token ➔ issues new short-lived access token.
- `/me`: Validates active Bearer JWT in request header ➔ returns current user role & profile details.
```

---

## 🔒 SECURITY & DEFENSIVE APIS RULES

1. **Password Hashing**: Use `passlib[bcrypt]` or `argon2-cffi` for Admin password hashes.
2. **JWT Secret**: Use `JWT_SECRET_KEY` from settings to sign tokens.
3. **Role Claims**: Always include `"role"` (`CUSTOMER`, `CHEF`, `RIDER`, `ADMIN`) in JWT claims.
4. **Token Expiry**: Access Token: 1 Hour (`exp = now + 60 mins`) | Refresh Token: 30 Days (`exp = now + 30 days`).
