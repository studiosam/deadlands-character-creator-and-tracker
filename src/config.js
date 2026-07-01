/**
 * Application-wide storage keys and version identifiers.
 *
 * Keep these constants stable unless a migration path exists. Browser saves,
 * character-library slots, creation drafts, demo mode, and welcome state all
 * depend on these keys remaining predictable across releases.
 */
const STORAGE_KEY = "deadlands-tracker-v2";
const CHARACTER_LIBRARY_KEY = "deadlands-character-library-v1";
const APP_VERSION = "0.1.0";
const APP_SCHEMA_VERSION = 1;
const CREATION_KEY = "deadlands-creation-draft-v1";
const SETUP_DRAFT_KEY = "deadlands-setup-draft-v1";
const SETUP_PROGRESS_KEY = "deadlands-setup-progress-v1";
const DEMO_MODE_KEY = "deadlands-tracker-demo-mode-v1";
const WELCOME_DISMISSED_KEY = "deadlands-tracker-welcome-dismissed-v1";
const DEMO_URL =
  "https://studiosam.github.io/deadlands-character-creator-and-tracker/";
