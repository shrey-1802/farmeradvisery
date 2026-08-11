-- ============================================================
-- Crop Advisory Platform — MySQL Schema (Final / v2)
-- Engine: InnoDB (FK support) | Charset: utf8mb4 (regional language support)
-- Tables are created in dependency order so FKs resolve cleanly.
-- ============================================================

CREATE DATABASE IF NOT EXISTS crop_advisory
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE crop_advisory;

-- ============================================================
-- SECTION A — Core identity & lookup tables
-- ============================================================

-- 1. FARMERS — core identity, phone-OTP based auth
CREATE TABLE farmers (
    farmer_id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phone_number        VARCHAR(15) NOT NULL,
    name                VARCHAR(100),
    preferred_language  VARCHAR(20) NOT NULL DEFAULT 'en',
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_farmers_phone UNIQUE (phone_number)
) ENGINE=InnoDB;

-- 2. DISTRICTS — shared by profiles, weather cache, schemes, yield refs
CREATE TABLE districts (
    district_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    district_name  VARCHAR(100) NOT NULL,
    state_name     VARCHAR(100) NOT NULL,
    CONSTRAINT uq_district_state UNIQUE (district_name, state_name)
) ENGINE=InnoDB;

-- 3. CROPS — lookup table (normalized, not free text)
CREATE TABLE crops (
    crop_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    crop_name     VARCHAR(100) NOT NULL,
    crop_category ENUM('cereal','pulse','vegetable','fruit','cash_crop','oilseed','other')
                  NOT NULL DEFAULT 'other',
    CONSTRAINT uq_crop_name UNIQUE (crop_name)
) ENGINE=InnoDB;

-- 4. PESTS — normalized pest/disease catalogue. Powers the outbreak
--    heatmap: instead of fuzzy-matching free text, AI diagnosis results
--    get matched to a pest_id, so aggregation is a plain GROUP BY.
CREATE TABLE pests (
    pest_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pest_name       VARCHAR(150) NOT NULL,
    crop_id         INT UNSIGNED,              -- NULL = affects multiple/any crop
    category        ENUM('pest','disease','deficiency') NOT NULL DEFAULT 'pest',
    standard_remedy TEXT,

    CONSTRAINT fk_pest_crop FOREIGN KEY (crop_id) REFERENCES crops(crop_id) ON DELETE SET NULL,
    INDEX idx_pest_crop (crop_id)
) ENGINE=InnoDB;

-- ============================================================
-- SECTION B — Farmer setup
-- ============================================================

-- 5. FARM_PROFILES — a farmer can have multiple plots
CREATE TABLE farm_profiles (
    profile_id    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farmer_id     BIGINT UNSIGNED NOT NULL,
    district_id   INT UNSIGNED NOT NULL,
    latitude      DECIMAL(9,6),
    longitude     DECIMAL(9,6),
    land_size     DECIMAL(10,2) NOT NULL,
    land_unit     ENUM('acre','hectare','bigha') NOT NULL DEFAULT 'acre',
    crop_id       INT UNSIGNED NOT NULL,
    water_source  ENUM('canal','tube_well','both','rainfed') NOT NULL,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_profile_farmer   FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    CONSTRAINT fk_profile_district FOREIGN KEY (district_id) REFERENCES districts(district_id),
    CONSTRAINT fk_profile_crop     FOREIGN KEY (crop_id) REFERENCES crops(crop_id),
    CONSTRAINT chk_land_size CHECK (land_size > 0),

    INDEX idx_profile_farmer (farmer_id),
    INDEX idx_profile_district (district_id)
) ENGINE=InnoDB;

-- ============================================================
-- SECTION C — Officers / Admin
-- ============================================================

-- 6. OFFICERS — Krishi Bhavan field officers AND platform admins,
--    distinguished by `role`. Keeps one login table instead of two
--    near-identical ones.
CREATE TABLE officers (
    officer_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    phone_number   VARCHAR(15) NOT NULL,
    email          VARCHAR(150),
    password_hash  VARCHAR(255),
    role           ENUM('field_officer','admin') NOT NULL DEFAULT 'field_officer',
    district_id    INT UNSIGNED,               -- NULL for platform-wide admins
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_officer_district FOREIGN KEY (district_id) REFERENCES districts(district_id),
    CONSTRAINT uq_officer_phone UNIQUE (phone_number),
    CONSTRAINT uq_officer_email UNIQUE (email),

    INDEX idx_officer_district (district_id),
    INDEX idx_officer_role (role)
) ENGINE=InnoDB;

-- ============================================================
-- SECTION D — Advisory core
-- ============================================================

-- 7. ADVISORY_QUERIES — pest/disease + weather + general queries.
--    district_id is denormalized from farm_profiles here on purpose:
--    the outbreak heatmap runs GROUP BY district_id, detected_pest_id
--    constantly, and joining through farm_profiles every time isn't free.
CREATE TABLE advisory_queries (
    query_id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farmer_id         BIGINT UNSIGNED NOT NULL,
    profile_id        BIGINT UNSIGNED,
    district_id       INT UNSIGNED,
    query_type        ENUM('pest_disease','weather','general') NOT NULL,
    input_mode        ENUM('text','voice','photo') NOT NULL DEFAULT 'photo',
    photo_url         VARCHAR(255),
    audio_url         VARCHAR(255),
    ai_response       TEXT,
    ai_confidence     DECIMAL(5,2),
    detected_pest_id  INT UNSIGNED,
    status            ENUM('pending','resolved','escalated') NOT NULL DEFAULT 'pending',
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at       TIMESTAMP NULL,

    CONSTRAINT fk_query_farmer   FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    CONSTRAINT fk_query_profile  FOREIGN KEY (profile_id) REFERENCES farm_profiles(profile_id) ON DELETE SET NULL,
    CONSTRAINT fk_query_district FOREIGN KEY (district_id) REFERENCES districts(district_id),
    CONSTRAINT fk_query_pest     FOREIGN KEY (detected_pest_id) REFERENCES pests(pest_id) ON DELETE SET NULL,
    CONSTRAINT chk_confidence CHECK (ai_confidence IS NULL OR ai_confidence BETWEEN 0 AND 100),

    INDEX idx_query_farmer (farmer_id),
    INDEX idx_query_status (status),
    INDEX idx_query_type_status (query_type, status),
    INDEX idx_query_heatmap (district_id, detected_pest_id, created_at)
) ENGINE=InnoDB;

-- 8. ESCALATIONS — human-in-the-loop fallback
CREATE TABLE escalations (
    escalation_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    query_id          BIGINT UNSIGNED NOT NULL,
    officer_id        INT UNSIGNED,
    officer_response  TEXT,
    status            ENUM('pending','in_review','resolved') NOT NULL DEFAULT 'pending',
    escalated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    first_response_at TIMESTAMP NULL,          -- for officer SLA tracking
    resolved_at       TIMESTAMP NULL,

    CONSTRAINT fk_escalation_query   FOREIGN KEY (query_id) REFERENCES advisory_queries(query_id) ON DELETE CASCADE,
    CONSTRAINT fk_escalation_officer FOREIGN KEY (officer_id) REFERENCES officers(officer_id) ON DELETE SET NULL,
    CONSTRAINT uq_escalation_query UNIQUE (query_id),

    INDEX idx_escalation_officer_status (officer_id, status)
) ENGINE=InnoDB;

-- 9. WEATHER_CACHE — one row per district per day
CREATE TABLE weather_cache (
    cache_id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    district_id     INT UNSIGNED NOT NULL,
    weather_date    DATE NOT NULL,
    temperature_c   DECIMAL(5,2),
    humidity_pct    DECIMAL(5,2),
    rainfall_mm     DECIMAL(6,2),
    wind_speed_kmh  DECIMAL(5,2),
    raw_data        JSON,
    fetched_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_weather_district FOREIGN KEY (district_id) REFERENCES districts(district_id),
    CONSTRAINT uq_weather_district_date UNIQUE (district_id, weather_date)
) ENGINE=InnoDB;

-- 10. REPORTS — generated PDF advisories, WhatsApp delivery flag
CREATE TABLE reports (
    report_id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farmer_id          BIGINT UNSIGNED NOT NULL,
    query_id           BIGINT UNSIGNED,
    pdf_url             VARCHAR(255) NOT NULL,
    sent_via_whatsapp  BOOLEAN NOT NULL DEFAULT FALSE,
    generated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_report_farmer FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    CONSTRAINT fk_report_query  FOREIGN KEY (query_id) REFERENCES advisory_queries(query_id) ON DELETE SET NULL,

    INDEX idx_report_farmer (farmer_id)
) ENGINE=InnoDB;

-- ============================================================
-- SECTION E — Engagement (notifications, devices, broadcasts)
-- ============================================================

-- 11. DEVICE_TOKENS — for push notifications (a farmer may have >1 device)
CREATE TABLE device_tokens (
    token_id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farmer_id     BIGINT UNSIGNED NOT NULL,
    device_token  VARCHAR(255) NOT NULL,
    platform      ENUM('android','ios') NOT NULL,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_token_farmer FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    CONSTRAINT uq_device_token UNIQUE (device_token),

    INDEX idx_token_farmer (farmer_id)
) ENGINE=InnoDB;

-- 12. BROADCASTS — officer/admin pushes a regional advisory
--     (e.g. "locust swarm sighted, spray now") to every farmer in a district.
CREATE TABLE broadcasts (
    broadcast_id  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    officer_id    INT UNSIGNED NOT NULL,
    district_id   INT UNSIGNED NOT NULL,
    crop_id       INT UNSIGNED,               -- NULL = all crops in the district
    title         VARCHAR(150) NOT NULL,
    message       TEXT NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_broadcast_officer  FOREIGN KEY (officer_id) REFERENCES officers(officer_id),
    CONSTRAINT fk_broadcast_district FOREIGN KEY (district_id) REFERENCES districts(district_id),
    CONSTRAINT fk_broadcast_crop     FOREIGN KEY (crop_id) REFERENCES crops(crop_id),

    INDEX idx_broadcast_district (district_id)
) ENGINE=InnoDB;

-- 13. OUTBREAK_ALERTS — auto-detected when query_count for a
--     (district, pest) pair crosses a threshold within a time window.
--     Feeds proactive notifications to nearby farmers before they ask.
CREATE TABLE outbreak_alerts (
    alert_id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    district_id       INT UNSIGNED NOT NULL,
    pest_id           INT UNSIGNED NOT NULL,
    query_count       INT UNSIGNED NOT NULL,
    threshold_used    INT UNSIGNED NOT NULL,
    first_detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status            ENUM('active','resolved') NOT NULL DEFAULT 'active',

    CONSTRAINT fk_outbreak_district FOREIGN KEY (district_id) REFERENCES districts(district_id),
    CONSTRAINT fk_outbreak_pest     FOREIGN KEY (pest_id) REFERENCES pests(pest_id),

    INDEX idx_outbreak_lookup (district_id, pest_id, status)
) ENGINE=InnoDB;

-- 14. NOTIFICATIONS — single delivery log for push/SMS/WhatsApp,
--     covering weather alerts, outbreak alerts, broadcasts, reports,
--     and escalation updates. One table instead of one-per-alert-type.
CREATE TABLE notifications (
    notification_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farmer_id            BIGINT UNSIGNED NOT NULL,
    channel              ENUM('push','sms','whatsapp') NOT NULL,
    notification_type    ENUM('weather_alert','outbreak_alert','broadcast','report_ready','escalation_update') NOT NULL,
    title                 VARCHAR(150) NOT NULL,
    message               TEXT NOT NULL,
    related_query_id     BIGINT UNSIGNED,
    related_broadcast_id BIGINT UNSIGNED,
    related_outbreak_id  BIGINT UNSIGNED,
    status                ENUM('sent','delivered','failed','read') NOT NULL DEFAULT 'sent',
    sent_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at               TIMESTAMP NULL,

    CONSTRAINT fk_notif_farmer    FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_query     FOREIGN KEY (related_query_id) REFERENCES advisory_queries(query_id) ON DELETE SET NULL,
    CONSTRAINT fk_notif_broadcast FOREIGN KEY (related_broadcast_id) REFERENCES broadcasts(broadcast_id) ON DELETE SET NULL,
    CONSTRAINT fk_notif_outbreak  FOREIGN KEY (related_outbreak_id) REFERENCES outbreak_alerts(alert_id) ON DELETE SET NULL,

    INDEX idx_notif_farmer_status (farmer_id, status),
    INDEX idx_notif_type (notification_type)
) ENGINE=InnoDB;

-- ============================================================
-- SECTION F — Intelligence layer (calculators, schemes, yield)
-- ============================================================

-- 15. SCHEMES — government scheme finder (PMFBY, subsidies, etc.)
CREATE TABLE schemes (
    scheme_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    scheme_name   VARCHAR(150) NOT NULL,
    description   TEXT,
    state_name    VARCHAR(100),               -- NULL = central/all-India scheme
    crop_id       INT UNSIGNED,               -- NULL = applies to all crops
    apply_link    VARCHAR(255),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_scheme_crop FOREIGN KEY (crop_id) REFERENCES crops(crop_id) ON DELETE SET NULL,
    INDEX idx_scheme_state (state_name)
) ENGINE=InnoDB;

-- 16. FERTILIZER_GUIDELINES — dosage calculator reference data
CREATE TABLE fertilizer_guidelines (
    guideline_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    crop_id          INT UNSIGNED NOT NULL,
    land_unit        ENUM('acre','hectare','bigha') NOT NULL DEFAULT 'acre',
    fertilizer_name  VARCHAR(100) NOT NULL,
    dosage_per_unit  DECIMAL(8,2) NOT NULL,
    dosage_unit      VARCHAR(20) NOT NULL DEFAULT 'kg',
    growth_stage     VARCHAR(50),              -- e.g. 'sowing', 'flowering'
    notes            TEXT,

    CONSTRAINT fk_fertilizer_crop FOREIGN KEY (crop_id) REFERENCES crops(crop_id) ON DELETE CASCADE,
    INDEX idx_fertilizer_crop (crop_id)
) ENGINE=InnoDB;

-- 17. YIELD_REFERENCES — reference data for the yield/ROI estimator
CREATE TABLE yield_references (
    reference_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    crop_id           INT UNSIGNED NOT NULL,
    district_id       INT UNSIGNED NOT NULL,
    season            ENUM('kharif','rabi','zaid','perennial') NOT NULL,
    avg_yield_per_unit DECIMAL(10,2) NOT NULL,
    yield_unit        VARCHAR(20) NOT NULL DEFAULT 'quintal/acre',
    avg_market_price  DECIMAL(10,2),
    reference_year    YEAR NOT NULL,

    CONSTRAINT fk_yield_crop     FOREIGN KEY (crop_id) REFERENCES crops(crop_id) ON DELETE CASCADE,
    CONSTRAINT fk_yield_district FOREIGN KEY (district_id) REFERENCES districts(district_id) ON DELETE CASCADE,
    CONSTRAINT uq_yield_lookup UNIQUE (crop_id, district_id, season, reference_year)
) ENGINE=InnoDB;

-- ============================================================
-- SECTION G — Trust / quality loop
-- ============================================================

-- 18. FEEDBACK — farmer rates AI advisory or officer response.
--     This is the data you'd later use to tune the confidence threshold
--     instead of guessing at it.
CREATE TABLE feedback (
    feedback_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farmer_id       BIGINT UNSIGNED NOT NULL,
    query_id        BIGINT UNSIGNED,
    escalation_id   BIGINT UNSIGNED,
    rating          TINYINT UNSIGNED NOT NULL,
    comment         TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_feedback_farmer     FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_query      FOREIGN KEY (query_id) REFERENCES advisory_queries(query_id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_escalation FOREIGN KEY (escalation_id) REFERENCES escalations(escalation_id) ON DELETE CASCADE,
    CONSTRAINT chk_feedback_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT chk_feedback_target CHECK (query_id IS NOT NULL OR escalation_id IS NOT NULL),

    INDEX idx_feedback_farmer (farmer_id)
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA (optional) — unblock local dev without empty lookups
-- ============================================================

INSERT INTO districts (district_name, state_name) VALUES
    ('Ahmedabad', 'Gujarat'),
    ('Anand', 'Gujarat'),
    ('Rajkot', 'Gujarat');

INSERT INTO crops (crop_name, crop_category) VALUES
    ('Wheat', 'cereal'),
    ('Cotton', 'cash_crop'),
    ('Groundnut', 'oilseed'),
    ('Bajra', 'cereal'),
    ('Tomato', 'vegetable');

INSERT INTO pests (pest_name, crop_id, category, standard_remedy) VALUES
    ('Pink Bollworm', 2, 'pest', 'Use pheromone traps; spray recommended insecticide at first sighting.'),
    ('Late Blight', 5, 'disease', 'Apply copper-based fungicide; avoid overhead irrigation.'),
    ('Aphid Infestation', NULL, 'pest', 'Spray neem oil solution; introduce ladybird beetles if severe.');
