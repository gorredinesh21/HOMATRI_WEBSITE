# 🤖 MASTER PROMPT: PHASE 1 — BACKEND DATABASE MODELS & TABLES SYNC

> **INSTRUCTION FOR CURSOR / CLAUDE CODE / AI AGENT:**  
> You are acting as the Lead Database Engineer for Homaatri. Your mission in Phase 1 is to construct, update, and migrate all SQLAlchemy/SQLModel database models and PostgreSQL database tables on GCP Cloud SQL (`homatri_prod`) to support Bulk Catering, Onboarding Fields, 30-Day Sessions, MSG91 OTP Authentication, Google OAuth 2.0, and Social Video Reels.

---

## 📚 AUTHORITATIVE SPECIFICATION MARKDOWNS TO READ FIRST

Before writing any Python code or SQL migration scripts, YOU MUST READ THESE 6 SPECIFICATION FILES IN THIS EXACT SEQUENCE:

1. 📄 **`Homaatri_Database_ERD_Data_Dictionary.md`**: Core 14-table PostgreSQL ERD, column data types, foreign key cascade policies, and index strategies.
2. 📄 **`BULK_CATERING_SPEC.md`**: Schema definition for `chef_catering_templates`, `catering_template_items`, and `bulk_catering_orders`.
3. 📄 **`ONBOARDING_DATA_SCHEMA_SPEC.md`**: Onboarding fields by role:
   - Customers (`is_cartoon_avatar`, `dietary_preferences` JSONB, `google_sub`).
   - Homemakers (`fssai_license_number`, `hometown_region`, `payout_upi_id`).
   - Delivery Riders (`driving_license_number`, `vehicle_reg_number`, `assigned_cluster`).
4. 📄 **`Homaatri_Authentication_Authorization_Spec.md`**: Database schemas for `user_sessions` (30-day refresh sessions) and `otp_verifications`.
5. 📄 **`MSG91_OTP_WIDGET_SPEC.md`**: MSG91 OTP Widget token validation and auth credentials.
6. 📄 **`Homaatri_Video_Transcoding_HLS_Streaming_Pipeline.md`**: Schema for `chef_reels`, `reel_comments`, `reel_likes`, and `chef_followers`.

---

## 📍 WHERE WE LEFT OFF & WHERE TO START CODING

- **Backend Codebase Location**: `/home/dinesh/coding/PROJECTS/homatri/backend`
- **Active Database**: GCP Cloud SQL PostgreSQL (`homatri_prod` on Cloud SQL instance `homatri-503308:us-central1:homatri-db-instance`).
- **Target File to Update**: `/home/dinesh/coding/PROJECTS/homatri/backend/app/db/models.py` (or ORM models directory).

---

## ⚙️ EXACT IMPLEMENTATION TASKS FOR PHASE 1

```text
===================================================================================
TASK 1: UPDATE CUSTOMER, CHEF & DRIVER PROFILE MODELS (`models.py`)
===================================================================================
1. Customer Model (`CustomerProfile`):
   - `id` (UUID PK), `phone` (VARCHAR UK), `full_name`, `email`, `google_sub`, `avatar_url`.
   - `is_cartoon_avatar` (BOOLEAN default True).
   - `address_line1`, `address_line2`, `city`, `postal_code`, `latitude`, `longitude`.
   - `dietary_preferences` (JSONB default '["PURE_VEG"]').

2. Chef Model (`ChefProfile`):
   - `id` (UUID PK), `chef_phone` (VARCHAR UK), `chef_name`, `kitchen_name`, `bio`, `hometown_region`.
   - `fssai_license_number` (VARCHAR 20 NOT NULL).
   - `daily_capacity` (INT default 15), `accepting_orders` (BOOLEAN default True).
   - `avatar_url`, `address_line1`, `city`, `latitude`, `longitude`.
   - `payout_upi_id` (VARCHAR 100), `rating_average` (NUMERIC(3,2) default 4.8).

3. Driver Model (`DriverProfile`):
   - `id` (UUID PK), `driver_phone` (VARCHAR UK), `driver_name`, `driving_license_number`.
   - `vehicle_type` (VARCHAR default 'SCOOTER'), `vehicle_reg_number` (VARCHAR NOT NULL).
   - `assigned_cluster` (VARCHAR default 'Ghansoli'), `payout_upi_id`, `driver_photo_url`.
   - `is_active` (BOOLEAN default True), `on_shift` (BOOLEAN default False).

===================================================================================
TASK 2: ADD SESSION & OTP VERIFICATION MODELS
===================================================================================
1. `OtpVerification`:
   - `phone_number` (VARCHAR PK), `otp_hash`, `attempts_count`, `expires_at`, `created_at`.

2. `UserSession`:
   - `session_id` (UUID PK), `user_id` (VARCHAR), `user_role` (VARCHAR: CUSTOMER/CHEF/RIDER/ADMIN).
   - `refresh_token_hash`, `device_info`, `ip_address`, `expires_at`, `is_revoked`.

===================================================================================
TASK 3: ADD BULK CATERING MODELS
===================================================================================
1. `ChefCateringTemplate`:
   - `template_id` (UUID PK), `chef_phone` (FK to ChefProfile), `template_name`, `base_plate_price` (NUMERIC(10,2)), `min_guests` (default 10), `is_active`.

2. `CateringTemplateItem`:
   - `item_id` (UUID PK), `template_id` (FK), `item_name`, `category` (BREAD/RICE/SABZI/DAL/PROTEIN/DESSERT), `deduction_value` (NUMERIC(10,2)), `is_removable`.

3. `BulkCateringOrder`:
   - `bulk_order_id` (UUID PK), `customer_phone` (FK), `chef_phone` (FK).
   - `event_date` (DATE), `event_time` (TIME), `guest_count` (INT).
   - `per_plate_price` (NUMERIC(10,2)), `total_amount` (NUMERIC(10,2)), `advance_amount_paid` (NUMERIC(10,2)).
   - `status` (VARCHAR default 'PENDING_CHEF_ACCEPTANCE'), `special_event_note` (TEXT).

===================================================================================
TASK 4: ADD SOCIAL REELS & COMMUNITY MODELS
===================================================================================
1. `ChefReel`: `reel_id` (UUID PK), `chef_phone` (FK), `video_url`, `hls_playlist_url`, `thumbnail_url`, `title`, `dish_tag_name`, `dish_tag_price`, `likes_count`, `comments_count`.
2. `ReelComment`: `comment_id` (UUID PK), `reel_id` (FK), `customer_phone` (FK), `content`, `created_at`.
3. `ReelLike`: `like_id` (UUID PK), `reel_id` (FK), `customer_phone` (FK), `created_at`.

===================================================================================
TASK 5: DATABASE MIGRATION EXECUTION
===================================================================================
- Create and execute SQL migration script (or Alembic migration) against Cloud SQL PostgreSQL instance `homatri_prod`.
- Verify tables exist using `\dt` or python async engine check.
```

---

## 🔒 DEFENSIVE DATABASE CODING RULES

1. **UUID Primary Keys**: Always use UUID PKs (`UUID(as_uuid=True)` or `gen_random_uuid()`).
2. **Timezones**: Always store timestamps in UTC with timezone (`TIMESTAMPTZ` / `timestamptz=True`).
3. **Monetary Values**: Always use `NUMERIC(10,2)` or `NUMERIC(12,2)` for money (never float).
4. **Foreign Key Cascades**: Delete cascade only for true child items (e.g. `CateringTemplateItem` when `ChefCateringTemplate` is deleted).
5. **Soft Deletion**: Use `deleted_at` timestamps on critical business profiles (`CustomerProfile`, `ChefProfile`).
