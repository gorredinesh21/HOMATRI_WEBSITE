# 🔒 HOMAATRI — AUTHENTICATION, AUTHORIZATION & SESSION PERSISTENCE SPECIFICATION

**Document Version:** 1.0  
**Target Services:** Customer Portal (`/order`), Homemaker Dashboard (`/chef`), Rider Portal (`/rider`), Admin Operations (`/admin`).  
**Primary Tech Stack:** Phone OTP SMS (Twilio/MSG91), Google OAuth 2.0, FastAPI JWT Engine, 30-Day Refresh Sessions.

---

## 1. Multi-Role Authentication Matrix

```text
┌────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION METHOD MATRIX                        │
├──────────────┬────────────────────────┬────────────────────────────────┤
│ USER ROLE    │ PRIMARY LOGIN METHOD   │ SECONDARY / ALTERNATIVE METHOD │
├──────────────┼────────────────────────┼────────────────────────────────┤
│ 🍛 CUSTOMER  │ Phone Number + OTP SMS │ Google OAuth 2.0 (1-Tap Login) │
│ 👩‍🍳 CHEF      │ Phone Number + OTP SMS │ Kitchen PIN Access             │
│ 🛵 RIDER     │ Phone Number + OTP SMS │ Driver ID Verification Check   │
│ 🛡️ ADMIN     │ Email + Password       │ Admin 2FA Token                │
└──────────────┴────────────────────────┴────────────────────────────────┘
```

---

## 2. Customer Authentication & YouTube Guest Model

### A. Guest Discovery Boundary (No Login Required)
- **Public Actions**: Customers browse kitchen cards, swipe deck, watch video reels, inspect homemaker stories, and view menus without authentication.
- **OTP / Login Trigger**: Phone OTP modal or Google OAuth popup is triggered **ONLY** when a guest attempts an action:
  - 🛒 `Add to Cart / Subscribe / Order`
  - ❤️ `Like a Reel or Dish`
  - 💬 `Comment / Post Review`
  - ➕ `Follow a Homemaker`

---

## 3. Google OAuth 2.0 Integration & Setup

### A. Setup Configuration (Google Cloud Console)
- **Provider**: Google Identity Services (`@react-oauth/google`).
- **OAuth Client ID**: Configured in `.env.local` (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`).
- **Authorized Domains**: `localhost:3005`, `homatri.com`.

### B. Google ID Token Payload Received:
```json
{
  "sub": "109238102938102938",                  // Unique Google User ID
  "email": "dinesh@gmail.com",                 // Verified Email Address
  "email_verified": true,                      // Email Verification Status
  "name": "Dinesh Chandan",                    // Customer Full Name
  "given_name": "Dinesh",                      // First Name
  "family_name": "Chandan",                    // Last Name
  "picture": "https://lh3.googleusercontent.com/a/AEd...", // Profile Avatar URL
  "locale": "en"
}
```

### C. First-Time Google Sign-Up Flow:
- When a customer signs in with Google for the first time, FastAPI registers their profile using Google Name, Email, and Avatar.
- **Delivery Phone Number Prompt**: If phone number is missing, a 5-second popup asks for their mobile number before checkout so drivers can call them during delivery.

---

## 4. 30-Day Session Persistence Architecture

```text
               CLIENT BROWSER                                FASTAPI BACKEND ENGINE
┌──────────────────────────────────────────┐             ┌────────────────────────────┐
│ • Access Token (Short-lived, 1 Hour)     │──Bearer JWT─► verify signature & role    │
│   Stored in AuthContext / Memory         │             │ (role = CUSTOMER/CHEF/etc) │
│                                          │             └────────────────────────────┘
│ • Refresh Token (Long-lived, 30 Days)    │
│   Stored in HttpOnly, Secure, SameSite   │──/auth/refresh─► Issue new Access Token
│   Cookies (Prevents XSS theft!)          │                  from Database Session
└──────────────────────────────────────────┘
```

- **No Re-login Prompts**: Customers remain logged in seamlessly for **30 days** across browser tab closes, app restarts, and device reboots.
- **Automatic Token Refresh**: Next.js automatically refreshes the short-lived access token in the background using the 30-day HttpOnly cookie.

---

## 5. Database Schemas for Auth & Sessions

```sql
-- 1. PHONE OTP VERIFICATIONS
CREATE TABLE otp_verifications (
    phone_number VARCHAR(20) PRIMARY KEY,
    otp_hash VARCHAR(255) NOT NULL,
    attempts_count INT DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USER SESSIONS & REFRESH TOKENS (30 Days)
CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(50) NOT NULL, -- Customer phone / Google sub / Chef phone
    user_role VARCHAR(20) CHECK (user_role IN ('CUSTOMER', 'CHEF', 'RIDER', 'ADMIN')),
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(45),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. UPDATED CUSTOMER PROFILES TABLE
ALTER TABLE customer_profiles 
ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

---

## 6. Next.js Route Protection (`middleware.js`)

- `src/middleware.js` intercepts incoming requests:
  - `/chef/*` ➔ Requires valid JWT with `role == 'CHEF'`.
  - `/rider/*` ➔ Requires valid JWT with `role == 'RIDER'`.
  - `/admin/*` ➔ Requires valid JWT with `role == 'ADMIN'`. Redirects to `/admin/login` if missing.
