// src/utils/keys.js
const fs = require("fs");
const path = require("path");

const KEYS_DIR = path.join(__dirname, "../../.desume");
const KEYS_FILE = path.join(KEYS_DIR, ".keys.key");

/** Ensure .desume dir exists */
function ensureDir() {
  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
  }
}

/** Read raw file content, return null if missing */
function _readRaw() {
  try {
    if (!fs.existsSync(KEYS_FILE)) return null;
    return fs.readFileSync(KEYS_FILE, "utf8");
  } catch (e) {
    return null;
  }
}

/** Write JSON object to keys file */
function _writeJson(obj) {
  ensureDir();
  const data = JSON.stringify(obj, null, 2);
  fs.writeFileSync(KEYS_FILE, data, { encoding: "utf8" });
  try {
    fs.chmodSync(KEYS_FILE, 0o600);
  } catch (e) {
    /* ignore on Windows */
  }
}

/**
 * Load file and normalise to object mapping.
 * Backwards-compat: if file contains a raw token (no JSON), convert to { default: token }.
 * Returns {} if no file.
 */
function _loadAll() {
  const raw = _readRaw();
  if (!raw) return {};
  // try parse JSON
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === "object") return obj;
  } catch (e) {
    // not JSON — treat as legacy single token
    const t = raw.trim();
    if (!t) return {};
    const converted = { default: t };
    // write back converted format for future use (non-destructive)
    try {
      _writeJson(converted);
    } catch (ee) {
      /* ignore */
    }
    return converted;
  }
  return {};
}

/** Save a named key (overwrites existing name) */
function writeKey(name, token) {
  if (!name || typeof name !== "string")
    throw new Error("key name is required (string)");
  if (!token) throw new Error("token is required");
  const all = _loadAll();
  all[name] = String(token).trim();
  _writeJson(all);
  return KEYS_FILE;
}

/** Read a named key. If name omitted, tries 'github' then 'default' then first key. */
function readKey(name) {
  const all = _loadAll();
  if (!name) {
    if (all.github) return all.github;
    if (all.default) return all.default;
    const first = Object.keys(all)[0];
    return first ? all[first] : null;
  }
  return all[name] || null;
}

/** Delete a named key. Returns true if deleted. */
function deleteKey(name) {
  if (!name) throw new Error("key name is required");
  const all = _loadAll();
  if (!all[name]) return false;
  delete all[name];
  _writeJson(all);
  return true;
}

/** List stored key names (not their values) */
function listKeys() {
  return Object.keys(_loadAll());
}

/** Completely remove the keys file */
function wipeAll() {
  try {
    if (fs.existsSync(KEYS_FILE)) fs.unlinkSync(KEYS_FILE);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  KEYS_DIR,
  KEYS_FILE,
  writeKey,
  readKey,
  deleteKey,
  listKeys,
  wipeAll,
};
