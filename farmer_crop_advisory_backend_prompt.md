# Farmer Crop Advisory Backend Prompt

## Purpose

Use this prompt with Cursor, Claude, ChatGPT, Gemini, or another AI coding tool to build the backend for an Indian farmer crop-advisory application.

## Master Prompt

```text
You are a principal backend architect and senior software engineer with 25+ years of experience designing secure, scalable and multilingual agricultural platforms.

Build the backend for my Indian farmer crop-advisory application.

==================================================
IMPORTANT DATABASE CONSTRAINT
==================================================

The database already exists.

Use:

- Node.js
- TypeScript
- NestJS
- MySQL 8+
- mysql2/promise
- Raw parameterized SQL only

Do not use:

- PostgreSQL
- Prisma
- TypeORM
- Sequelize
- MikroORM
- Drizzle ORM
- Knex query builder
- Any ORM or query builder
- Automatic database migrations
- Automatic table creation
- Automatic schema modification

The existing MySQL database is the source of truth.

Before implementing repositories, inspect and understand the existing schema using read-only SQL such as:

- SHOW TABLES;
- DESCRIBE table_name;
- SHOW CREATE TABLE table_name;
- INFORMATION_SCHEMA queries.

Do not assume table names, column names, data types or relationships.

If the existing schema does not contain a required field or table, do not silently change the database. First report:

1. Missing table or column.
2. Why it is required.
3. Suggested SQL ALTER or CREATE statement.
4. Whether the change is required for MVP or optional.

Never execute schema-changing SQL automatically.

==================================================
PROJECT OBJECTIVE
==================================================

Build a backend where farmers can:

1. Register and log in using mobile number and OTP.
2. Select Gujarati, Hindi or English.
3. Provide farm location using GPS or manual village selection.
4. Enter land area.
5. Select crop, crop variety, sowing date and growth stage.
6. Enter water source and irrigation method.
7. View current and forecast weather.
8. Receive weather-based crop advisories.
9. Upload crop photos for pest or disease analysis.
10. Receive a cautious AI diagnosis with confidence score.
11. Escalate uncertain cases to a human agricultural officer.
12. Receive multilingual PDF reports.
13. Receive reports through WhatsApp when configured.
14. Allow officers and admins to manage expert cases.

This is a decision-support system. It must not present AI results as guaranteed diagnoses or automatically prescribe unsafe chemical treatment.

==================================================
REQUIRED TECHNOLOGY STACK
==================================================

- Node.js
- TypeScript
- NestJS
- MySQL 8+
- mysql2/promise
- Redis
- BullMQ
- JWT authentication
- Swagger/OpenAPI
- Jest
- Docker and Docker Compose
- ESLint
- Prettier

Use a modular monolith architecture suitable for a solo developer.

Use this database access structure:

src/
  database/
    database.module.ts
    database.service.ts
    database.types.ts
    sql/
  common/
  modules/
  providers/
  jobs/

==================================================
RAW SQL DATABASE RULES
==================================================

All database queries must use raw SQL through mysql2/promise.

Use a centralized database service with:

- MySQL connection pooling.
- Parameterized queries.
- Transactions using mysql2 connections.
- Connection release in finally blocks.
- Query error handling.
- Connection failure handling.
- Query timeouts where practical.

Use this style:

const [rows] = await this.database.getPool().execute<RowDataPacket[]>(
  `
    SELECT id, name, preferred_language AS preferredLanguage
    FROM farmer_profiles
    WHERE user_id = ?
    LIMIT 1
  `,
  [userId],
);

For INSERT or UPDATE queries, use placeholders:

const [result] = await this.database.getPool().execute<ResultSetHeader>(
  `
    UPDATE farmer_profiles
    SET name = ?, preferred_language = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `,
  [name, preferredLanguage, userId],
);

Never concatenate user input into SQL. Never use string interpolation for SQL values. Never use SELECT * in production repositories. Select only required columns.

==================================================
DATABASE SCHEMA DISCOVERY
==================================================

Create a read-only database inspection script or service for local development.

It must support:

SHOW TABLES;
DESCRIBE table_name;
SHOW CREATE TABLE table_name;

Also support:

SELECT
  TABLE_NAME,
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_KEY,
  COLUMN_DEFAULT,
  EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, ORDINAL_POSITION;

Before writing repositories:

1. Inspect the existing database.
2. Create a schema mapping document.
3. Map existing tables to backend modules.
4. Identify missing relationships.
5. Identify naming differences such as farmer_id versus farmerId.
6. Use SQL aliases or mapper functions where necessary.
7. Do not change the existing schema without approval.

==================================================
MODULES
==================================================

Create these backend modules:

1. AuthModule
2. UsersModule
3. FarmerProfilesModule
4. FarmsModule
5. CropsModule
6. WeatherModule
7. AdvisoryModule
8. DiagnosisModule
9. ExpertEscalationModule
10. ReportsModule
11. NotificationsModule
12. AdminModule
13. HealthModule
14. AuditModule

Each module should contain a controller, service, repository, DTOs, interfaces/types, validation, error handling and tests.

Controllers must not contain SQL. Services must not contain large SQL statements. SQL must remain inside repository classes or dedicated query files.

==================================================
REPOSITORY PATTERN
==================================================

Use this architecture:

Controller
   ↓
Service
   ↓
Repository
   ↓
DatabaseService/mysql2
   ↓
Existing MySQL database

Use separate mapper functions whenever database naming differs from TypeScript naming.

==================================================
AUTHENTICATION AND ROLES
==================================================

Implement:

- Mobile OTP login.
- OTP expiration.
- OTP attempt limits.
- Hashed OTP storage if OTP is stored locally.
- JWT access token.
- Refresh token rotation.
- Logout and token revocation.
- Role-based access control.
- Farmer ownership checks.

Roles:

- FARMER
- OFFICER
- ADMIN

Never trust a role received from the client. A farmer must not access another farmer’s farm, crop, image, diagnosis, report or expert case.

==================================================
FARMER, FARM AND CROP DATA
==================================================

Use the existing database schema if these records already exist.

Required farmer data:

- Name
- Mobile number
- WhatsApp number
- Preferred language
- State
- District
- Taluka
- Village
- Latitude
- Longitude
- Notification consent
- Image-storage consent

Required farm data:

- Farmer ID
- Farm name
- Area value
- Area unit
- Area in hectares
- Soil type
- Water source
- Irrigation method
- Location

Required crop data:

- Farm ID
- Crop name
- Crop variety
- Season
- Sowing date
- Expected harvest date
- Growth stage
- Status

If required data is missing from the existing database, report it before implementation.

==================================================
WEATHER AND ADVISORY
==================================================

Create a weather provider interface with current-weather and forecast methods. Initially use Open-Meteo through a provider adapter.

Implement weather caching, retries, timeout, cached fallback, provider error logging and rate limiting.

Use a rule-based advisory engine before using an LLM.

Advisary inputs must include location, crop, variety, growth stage, sowing date, soil type, water source, irrigation method, current weather and forecast weather.

Advisory outputs must include type, title, message, language, severity, recommended actions, actions to avoid, reason, validity, source and disclaimer.

Do not automatically generate dangerous pesticide dosage.

==================================================
AI DIAGNOSIS
==================================================

Create a replaceable CropDiagnosisProvider interface.

Workflow:

1. Validate image.
2. Store it privately.
3. Create a diagnosis job.
4. Process through BullMQ.
5. Call the AI provider.
6. Store the model result.
7. Generate a safe advisory.
8. Escalate uncertain cases.

Confidence handling:

- 0.85 or above: probable result with disclaimer.
- 0.60 to 0.84: possible result and request a better image.
- Below 0.60: no confirmed diagnosis; create an expert case.

Never expose internal prompts, API keys or model credentials. Never present a low-confidence result as a confirmed diagnosis.

==================================================
EXPERT ESCALATION
==================================================

Create an expert case when:

- Confidence is below the configured threshold.
- The farmer requests an expert.
- Severity is high.
- Image quality is poor.
- The farmer reports that advice did not help.

Support district-based officer assignment, case priority, case status, officer response, response language, case history and reminder notifications.

==================================================
PDF AND WHATSAPP
==================================================

Generate multilingual PDF reports containing farmer information, farm location, crop and growth stage, land area, weather, advisory, AI result and confidence, officer response, recommended actions, disclaimer, report ID and timestamp.

Use an HTML template and Puppeteer. Store PDFs privately and generate temporary signed URLs.

Create a WhatsApp provider abstraction. Store WhatsApp message ID, recipient number, delivery status, failure reason, retry count and sent timestamp.

==================================================
BACKGROUND JOBS
==================================================

Use BullMQ with Redis for:

- Weather refresh.
- Diagnosis processing.
- Advisory generation.
- PDF generation.
- WhatsApp delivery.
- Expert reminders.

Jobs must support idempotency, retries, exponential backoff, dead-letter handling, failure logging and job status tracking.

==================================================
API AND SECURITY RULES
==================================================

Use REST APIs with /api/v1, DTO validation, Swagger, pagination, filtering, sorting, request IDs, centralized error handling, rate limiting, CORS and Helmet.

Use consistent success and error response formats.

Implement parameterized SQL only, input validation, role-based access control, resource ownership checks, secure private file storage, file validation, audit logs, no secrets in logs and no permanent public image or PDF URLs.

==================================================
ENVIRONMENT VARIABLES
==================================================

Create .env.example with:

NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

DB_HOST=localhost
DB_PORT=3306
DB_NAME=farmer_advisory
DB_USER=app_user
DB_PASSWORD=
DB_CONNECTION_LIMIT=10

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

WEATHER_PROVIDER=open_meteo
WEATHER_BASE_URL=
AI_PROVIDER=
AI_API_KEY=

STORAGE_PROVIDER=
STORAGE_BUCKET=
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

WHATSAPP_ENABLED=false
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=

PDF_FONT_PATH=

Validate environment variables at startup. Never commit .env.

==================================================
DEVELOPMENT PROCESS
==================================================

Do not generate the entire project in one answer.

PHASE 1:
1. Inspect the existing MySQL database.
2. Show the read-only inspection script.
3. Produce a schema mapping document.
4. Identify existing tables and columns.
5. Identify missing required tables or columns.
6. Present architecture and module boundaries.
7. Present the API list.
8. Present authentication, weather, diagnosis, escalation, PDF and WhatsApp flows.
9. Present risks and assumptions.

PHASE 2:
1. Configure NestJS.
2. Configure mysql2 connection pooling.
3. Add environment validation.
4. Add database health check.
5. Add Redis connection.
6. Add global error handling and logging.
7. Do not create or modify database tables.

PHASE 3:
1. Implement authentication.
2. Implement farmer profiles.
3. Implement farms and crops.
4. Use raw SQL repositories.
5. Add tests.

PHASE 4:
1. Implement weather provider.
2. Implement caching.
3. Implement advisory rules.

PHASE 5:
1. Implement secure image upload.
2. Implement AI provider abstraction.
3. Implement diagnosis jobs.
4. Implement confidence-based escalation.

PHASE 6:
1. Implement expert cases.
2. Implement officer APIs.
3. Implement audit logs.

PHASE 7:
1. Implement PDF generation.
2. Implement WhatsApp notification adapter.
3. Implement delivery webhooks.

After every phase, provide:

- Files created or changed.
- Complete code.
- Environment variables.
- SQL queries used.
- API examples.
- Test commands.
- Known limitations.
- Manual verification checklist.

Start with PHASE 1 only. Do not write implementation code until the existing MySQL schema has been inspected and mapped.
```

## Safety instruction for the coding AI

Use this instruction before running the prompt:

```text
The database is already created and contains real data. You may run only read-only inspection queries at the beginning. Do not run CREATE, ALTER, DROP, TRUNCATE, DELETE or database migration commands. If a schema change is needed, show the SQL separately and wait for my approval.
```

## Recommended project structure

```text
src/
├── common/
├── config/
├── database/
│   ├── database.module.ts
│   ├── database.service.ts
│   └── database.types.ts
├── modules/
│   ├── auth/
│   ├── users/
│   ├── farmer-profiles/
│   ├── farms/
│   ├── crops/
│   ├── weather/
│   ├── advisory/
│   ├── diagnosis/
│   ├── expert-escalation/
│   ├── reports/
│   ├── notifications/
│   └── admin/
├── providers/
│   ├── weather/
│   ├── diagnosis/
│   ├── storage/
│   └── notifications/
├── jobs/
└── main.ts
```

## Key implementation rule

First inspect and map the existing MySQL schema. Then write raw-SQL repositories around that schema. Do not let the coding AI invent a new database structure or silently modify existing tables.
