-- =====================================================================
-- CekGuard Edu — PostgreSQL schema
-- The demo build serves seed data from src/data/demo with the same shape
-- (see src/types/index.ts). Swap DemoContentRepository for a Postgres
-- implementation of ContentRepository to use this schema in production.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

CREATE TYPE role_name      AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');
CREATE TYPE learning_level AS ENUM ('pemula', 'menengah', 'lanjutan');
CREATE TYPE risk_level     AS ENUM ('high', 'medium', 'low', 'safe');
CREATE TYPE risk_category  AS ENUM ('judol', 'phishing', 'deepfake', 'scam', 'cyberbullying', 'misinformation');
CREATE TYPE scan_module    AS ENUM ('cekjudol', 'ceklink', 'cekdeepfake', 'cekteks');
CREATE TYPE input_type     AS ENUM ('url', 'text', 'image', 'video', 'audio');
CREATE TYPE question_type  AS ENUM ('multiple', 'truefalse', 'scenario');

-- ---------------------------------------------------------------- Users
CREATE TABLE institution (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE role (
  id    SMALLSERIAL PRIMARY KEY,
  name  role_name NOT NULL UNIQUE
);

CREATE TABLE app_user (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           CITEXT UNIQUE,
  password_hash   TEXT,                       -- managed by the auth provider
  role_id         SMALLINT NOT NULL REFERENCES role(id),
  institution_id  UUID REFERENCES institution(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE profile (
  user_id     UUID PRIMARY KEY REFERENCES app_user(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  level       learning_level NOT NULL DEFAULT 'pemula',
  class_name  TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE accessibility_preference (
  user_id     UUID PRIMARY KEY REFERENCES app_user(id) ON DELETE CASCADE,
  font_size   TEXT NOT NULL DEFAULT 'normal' CHECK (font_size IN ('normal', 'large', 'xl')),
  contrast    TEXT NOT NULL DEFAULT 'standard' CHECK (contrast IN ('standard', 'high')),
  theme       TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  tts         BOOLEAN NOT NULL DEFAULT TRUE,
  reading     BOOLEAN NOT NULL DEFAULT FALSE,
  simplified  BOOLEAN NOT NULL DEFAULT FALSE,
  keyboard    BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------- Learning
CREATE TABLE learning_module (
  id           risk_category PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL
);

CREATE TABLE lesson (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  module_id     risk_category NOT NULL REFERENCES learning_module(id),
  title         TEXT NOT NULL,
  level         learning_level NOT NULL,
  duration_min  SMALLINT NOT NULL CHECK (duration_min > 0),
  description   TEXT NOT NULL,
  objectives    TEXT[] NOT NULL DEFAULT '{}',
  steps         JSONB NOT NULL,              -- LessonStep[] (concept/example/danger/recognize/action/quiz)
  published     BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quiz (
  id           TEXT PRIMARY KEY,
  module_id    risk_category NOT NULL REFERENCES learning_module(id),
  title        TEXT NOT NULL,
  description  TEXT NOT NULL
);

CREATE TABLE question (
  id           TEXT PRIMARY KEY,
  quiz_id      TEXT NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
  position     SMALLINT NOT NULL,
  type         question_type NOT NULL,
  topic        TEXT NOT NULL,
  prompt       TEXT NOT NULL,
  scenario     TEXT,
  options      JSONB NOT NULL,              -- [{id, text}]
  correct_id   TEXT NOT NULL,
  explanation  TEXT NOT NULL,
  UNIQUE (quiz_id, position)
);

CREATE TABLE quiz_attempt (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  quiz_id          TEXT NOT NULL REFERENCES quiz(id),
  correct          SMALLINT NOT NULL,
  total            SMALLINT NOT NULL,
  score            SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  mastered_topics  TEXT[] NOT NULL DEFAULT '{}',
  review_topics    TEXT[] NOT NULL DEFAULT '{}',
  completed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX quiz_attempt_user_idx ON quiz_attempt(user_id, completed_at DESC);

CREATE TABLE learning_progress (
  user_id      UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  lesson_id    TEXT NOT NULL REFERENCES lesson(id),
  step         SMALLINT NOT NULL DEFAULT 0,
  total_steps  SMALLINT NOT NULL,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE achievement (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL
);

CREATE TABLE user_achievement (
  user_id         UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  achievement_id  TEXT NOT NULL REFERENCES achievement(id),
  unlocked_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

-- ---------------------------------------------------------------- Scans
CREATE TABLE scan (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES app_user(id) ON DELETE SET NULL,
  module      scan_module NOT NULL,
  input_type  input_type NOT NULL,
  input       TEXT NOT NULL,               -- URL or truncated text; images are never stored
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX scan_user_idx ON scan(user_id, created_at DESC);

CREATE TABLE scan_result (
  scan_id      UUID PRIMARY KEY REFERENCES scan(id) ON DELETE CASCADE,
  category     risk_category NOT NULL,
  risk_score   SMALLINT NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  risk_level   risk_level NOT NULL,
  headline     TEXT NOT NULL,
  summary      TEXT NOT NULL,
  details      JSONB NOT NULL,             -- module specific (comments, checks, …)
  is_demo      BOOLEAN NOT NULL DEFAULT TRUE,
  provider     TEXT NOT NULL
);

CREATE TABLE risk_indicator (
  id           BIGSERIAL PRIMARY KEY,
  scan_id      UUID NOT NULL REFERENCES scan_result(scan_id) ON DELETE CASCADE,
  code         TEXT NOT NULL,
  label        TEXT NOT NULL,
  description  TEXT NOT NULL,
  count        INTEGER
);

CREATE TABLE detected_domain (
  id         BIGSERIAL PRIMARY KEY,
  scan_id    UUID NOT NULL REFERENCES scan_result(scan_id) ON DELETE CASCADE,
  domain     TEXT NOT NULL,
  mentions   INTEGER NOT NULL,
  risk_level risk_level NOT NULL,
  activity   INTEGER[] NOT NULL DEFAULT '{}'
);
CREATE INDEX detected_domain_domain_idx ON detected_domain(domain);

CREATE TABLE ai_explanation (
  scan_id  UUID NOT NULL REFERENCES scan_result(scan_id) ON DELETE CASCADE,
  level    learning_level NOT NULL,
  text     TEXT NOT NULL,
  PRIMARY KEY (scan_id, level)
);

CREATE TABLE recommendation (
  scan_id    UUID PRIMARY KEY REFERENCES scan_result(scan_id) ON DELETE CASCADE,
  lesson_id  TEXT NOT NULL REFERENCES lesson(id),
  quiz_id    TEXT NOT NULL REFERENCES quiz(id),
  reason     TEXT NOT NULL
);

-- ------------------------------------- Knowledge base & sustainability loop
CREATE TABLE knowledge_entry (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_type   risk_category NOT NULL,
  indicator   TEXT NOT NULL,
  pattern     TEXT NOT NULL,
  example     TEXT NOT NULL,
  action      TEXT NOT NULL,
  lesson_id   TEXT REFERENCES lesson(id),
  version     INTEGER NOT NULL DEFAULT 1,
  source      TEXT NOT NULL CHECK (source IN ('curated', 'community', 'scan')),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES app_user(id) ON DELETE SET NULL,
  scan_id     UUID REFERENCES scan(id) ON DELETE SET NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('accurate', 'false-positive', 'false-negative', 'new-pattern')),
  category    risk_category NOT NULL,
  note        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'baru' CHECK (status IN ('baru', 'ditinjau', 'ditambahkan')),
  knowledge_entry_id UUID REFERENCES knowledge_entry(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO role (name) VALUES ('STUDENT'), ('TEACHER'), ('ADMIN');
