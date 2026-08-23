# 📱 HOMAATRI — MSG91 OTP WIDGET INTEGRATION SPECIFICATION

**Document Version:** 1.0 (Development & Testing Baseline)  
**Target Surface:** Customer OTP Authentication Modal (`PhoneOtpModal.jsx`), AuthContext (`src/context/AuthContext.jsx`), Backend Verification API (`POST /api/v1/auth/verify-msg91-widget`).  
**Primary Integration:** MSG91 OTP Widget Web SDK (Approach B — No DLT Required for Dev).

---

## 1. Credentials Configuration

### Frontend Public Environment Variables (`.env.local`):
```env
NEXT_PUBLIC_MSG91_WIDGET_ID=3668776a6f65313935373431
NEXT_PUBLIC_MSG91_WIDGET_TOKEN=563549TIHmC7w7bhL6a8acd1aP1
```

### Backend Private Environment Variables (`backend/.env`):
```env
MSG91_WIDGET_ID=3668776a6f65313935373431
MSG91_WIDGET_TOKEN=563549TIHmC7w7bhL6a8acd1aP1
```

---

## 2. System Control Flow

```text
Customer Browser (Homaatri Custom UI)
   │
   │ 1. Enter Indian Mobile Number (+91)
   ▼
MSG91 Web SDK (`https://verify.msg91.com/otp-provider.js`)
   │
   │ 2. `window.sendOtp(...)` -> MSG91 sends SMS using default template
   ▼
Customer receives OTP SMS on phone
   │
   │ 3. Enter 6-digit OTP code into Homaatri Custom UI
   ▼
MSG91 Web SDK (`window.verifyOtp(...)`)
   │
   │ 4. Verifies OTP code with MSG91 servers
   ▼
MSG91 returns Verified Access Token
   │
   │ 5. POST /api/v1/auth/verify-msg91-widget { phone, msg91_token }
   ▼
FastAPI Backend Engine
   │
   │ 6. Validates MSG91 verification token & creates/retrieves user
   ▼
Homaatri 30-Day Session JWT Issued -> Logged in!
```

---

## 3. Frontend Implementation Guidelines

1. **Script Injection**: Inject MSG91 Web SDK script `<script src="https://verify.msg91.com/otp-provider.js" async></script>` in `RootLayout`.
2. **Custom UI Integration**:
   - `PhoneOtpModal.jsx` renders Homaatri-themed custom UI (Terracotta Orange `#E53A00`).
   - Uses MSG91 exposed methods:
     ```javascript
     const configuration = {
       widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID,
       tokenAuth: process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN,
       identifier: "+91" + phone,
       exposeMethods: true,
       success: (data) => handleMsg91Success(data),
       failure: (error) => handleMsg91Error(error),
     };
     ```
3. **Security Guard**: `MSG91_AUTH_KEY` is NEVER exposed to the frontend browser.

---

## 4. Backend Verification Endpoint (`POST /api/v1/auth/verify-msg91-widget`)

- **Payload**:
  ```json
  {
    "phone": "9876543210",
    "msg91_token": "verified_access_token_string"
  }
  ```
- **Execution**:
  - FastAPI verifies the token with MSG91's verification endpoint.
  - Queries `customer_profiles` table:
    - If user exists ➔ Logs in.
    - If new user ➔ Inserts into `customer_profiles` ➔ Logs in.
  - Generates 30-Day Refresh Token + 1-Hour Access Token.
