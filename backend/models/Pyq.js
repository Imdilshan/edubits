// models/Pyq.js  (MIGRATION SHIM)
// ─────────────────────────────────────────────────────────────
// The original Pyq model is replaced by the generic Resource model.
// This file is kept as a thin re-export so any code that still imports
// "../models/Pyq" continues to work during the migration period.
//
// ACTION REQUIRED (post-migration cleanup):
//   1. Migrate existing Pyq documents to the Resource collection
//      using the migration script at:  backend/scripts/migratePyqs.js
//   2. Update all routes that import Pyq to import Resource instead.
//   3. Delete this file once step 1 & 2 are complete.
// ─────────────────────────────────────────────────────────────

const Resource = require("./Resource");

// Re-export Resource as Pyq so old imports don't break immediately
module.exports = Resource;
