// src/utils/profileManager.js
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DESUME_DIR = join(__dirname, "../../.desume");
const PROFILE_PATH = join(DESUME_DIR, "profile.json");

async function ensureDesumeDir() {
  await fs.mkdir(DESUME_DIR, { recursive: true });
}

function now() {
  return new Date().toISOString();
}

async function readProfile() {
  try {
    const raw = await fs.readFile(PROFILE_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    // file missing or malformed -> return default skeleton
    return {
      meta: { createdAt: now(), updatedAt: now(), source: "manual" },
      profile: {
        firstName: "",
        lastName: "",
        fullName: "",
        headline: "",
        location: "",
        website: "",
      },
      contact: {
        emails: [], // array of strings
        phones: [], // array of strings
        links: [], // array of { id, type, label, url, primary }
      },
      skills: [], // array of strings
      about: "",
      education: [], // array of education objects
      experiences: [], // array of experience objects
      notes: "",
      raw: {},
    };
  }
}

async function saveProfile(profileObj) {
  await ensureDesumeDir();
  profileObj.meta = profileObj.meta || {};
  profileObj.meta.updatedAt = now();
  if (!profileObj.meta.createdAt)
    profileObj.meta.createdAt = profileObj.meta.updatedAt;
  // ensure profile.fullName sync
  if (profileObj.profile) {
    const f = (profileObj.profile.firstName || "").trim();
    const l = (profileObj.profile.lastName || "").trim();
    if (!profileObj.profile.fullName)
      profileObj.profile.fullName = [f, l].filter(Boolean).join(" ");
  }
  await fs.writeFile(PROFILE_PATH, JSON.stringify(profileObj, null, 2), {
    mode: 0o600,
  });
  return profileObj;
}

/* --- Targeted setter: set nested field by path array --- */
async function setField(pathArray, value) {
  if (!Array.isArray(pathArray) || pathArray.length === 0) {
    throw new Error("pathArray must be a non-empty array");
  }
  const p = await readProfile();
  let cur = p;
  for (let i = 0; i < pathArray.length - 1; i++) {
    const k = pathArray[i];
    if (cur[k] === undefined) cur[k] = {};
    cur = cur[k];
  }
  cur[pathArray[pathArray.length - 1]] = value;

  // auto-sync fullName when firstName/lastName changed
  if (
    pathArray[0] === "profile" &&
    (pathArray[1] === "firstName" || pathArray[1] === "lastName")
  ) {
    const fn = (p.profile.firstName || "").trim();
    const ln = (p.profile.lastName || "").trim();
    p.profile.fullName = [fn, ln].filter(Boolean).join(" ");
  }

  return saveProfile(p);
}

/* --- Bulk merge/replace top-level keys --- */
async function bulkUpdate(patchObject) {
  if (!patchObject || typeof patchObject !== "object") {
    throw new Error("patchObject required");
  }
  const p = await readProfile();
  for (const k of Object.keys(patchObject)) {
    if (k === "education" || k === "experiences") {
      // replace arrays entirely when arrays provided
      if (Array.isArray(patchObject[k])) p[k] = patchObject[k];
      else throw new Error(`${k} must be an array if provided`);
    } else if (k === "skills") {
      if (Array.isArray(patchObject[k])) p.skills = patchObject[k];
      else throw new Error("skills must be an array if provided");
    } else {
      p[k] = Object.assign({}, p[k] || {}, patchObject[k]);
    }
  }
  return saveProfile(p);
}

/* --- Contact helpers: emails / phones / links --- */
async function addEmail(email) {
  const p = await readProfile();
  p.contact = p.contact || { emails: [], phones: [], links: [] };
  if (!p.contact.emails.includes(email)) p.contact.emails.push(email);
  return saveProfile(p);
}
async function removeEmail(email) {
  const p = await readProfile();
  p.contact = p.contact || { emails: [], phones: [], links: [] };
  p.contact.emails = (p.contact.emails || []).filter((e) => e !== email);
  return saveProfile(p);
}
async function addPhone(phone) {
  const p = await readProfile();
  p.contact = p.contact || { emails: [], phones: [], links: [] };
  if (!p.contact.phones.includes(phone)) p.contact.phones.push(phone);
  return saveProfile(p);
}
async function removePhone(phone) {
  const p = await readProfile();
  p.contact = p.contact || { emails: [], phones: [], links: [] };
  p.contact.phones = (p.contact.phones || []).filter((pn) => pn !== phone);
  return saveProfile(p);
}
async function addLink(link) {
  // link: { type: 'linkedin'|'portfolio'|'twitter'|..., label: 'LinkedIn', url: 'https://..', primary: boolean }
  const p = await readProfile();
  p.contact = p.contact || { emails: [], phones: [], links: [] };
  const item = Object.assign({}, link);
  item.id = item.id || `link-${randomUUID()}`;
  item.type = item.type || "link";
  item.label = item.label || item.type;
  item.primary = !!item.primary;
  p.contact.links.push(item);
  return saveProfile(p);
}
async function updateLink(id, patch) {
  const p = await readProfile();
  p.contact = p.contact || { emails: [], phones: [], links: [] };
  const idx = (p.contact.links || []).findIndex((x) => x.id === id);
  if (idx === -1) throw new Error("link-not-found");
  p.contact.links[idx] = Object.assign({}, p.contact.links[idx], patch);
  return saveProfile(p);
}
async function deleteLink(id) {
  const p = await readProfile();
  p.contact = p.contact || { emails: [], phones: [], links: [] };
  p.contact.links = (p.contact.links || []).filter((x) => x.id !== id);
  return saveProfile(p);
}

/* --- Skills & about --- */
async function addSkill(skill) {
  const p = await readProfile();
  p.skills = p.skills || [];
  if (!p.skills.includes(skill)) p.skills.push(skill);
  return saveProfile(p);
}
async function removeSkill(skill) {
  const p = await readProfile();
  p.skills = (p.skills || []).filter((s) => s !== skill);
  return saveProfile(p);
}
async function setSkills(skillsArray) {
  if (!Array.isArray(skillsArray))
    throw new Error("skillsArray must be an array");
  const p = await readProfile();
  p.skills = skillsArray;
  return saveProfile(p);
}
async function setAbout(text) {
  const p = await readProfile();
  p.about = text || "";
  return saveProfile(p);
}

/* --- Education helpers --- */
async function addEducation(edu) {
  const p = await readProfile();
  const item = Object.assign({}, edu);
  item.id = item.id || `edu-${randomUUID()}`;
  p.education = p.education || [];
  p.education.push(item);
  return saveProfile(p);
}

async function updateEducation(id, patch) {
  const p = await readProfile();
  p.education = p.education || [];
  const idx = p.education.findIndex((x) => x.id === id);
  if (idx === -1) throw new Error("education-not-found");
  p.education[idx] = Object.assign({}, p.education[idx], patch);
  return saveProfile(p);
}

async function deleteEducation(id) {
  const p = await readProfile();
  p.education = (p.education || []).filter((x) => x.id !== id);
  return saveProfile(p);
}

/* --- Experience helpers --- */
async function addExperience(exp) {
  const p = await readProfile();
  const item = Object.assign({}, exp);
  item.id = item.id || `exp-${randomUUID()}`;
  p.experiences = p.experiences || [];
  p.experiences.push(item);
  return saveProfile(p);
}

async function updateExperience(id, patch) {
  const p = await readProfile();
  p.experiences = p.experiences || [];
  const idx = p.experiences.findIndex((x) => x.id === id);
  if (idx === -1) throw new Error("experience-not-found");
  p.experiences[idx] = Object.assign({}, p.experiences[idx], patch);
  return saveProfile(p);
}

async function deleteExperience(id) {
  const p = await readProfile();
  p.experiences = (p.experiences || []).filter((x) => x.id !== id);
  return saveProfile(p);
}

/* --- Utilities --- */
async function wipeProfile() {
  // resets to default skeleton
  const skeleton = {
    meta: { createdAt: now(), updatedAt: now(), source: "manual" },
    profile: {
      firstName: "",
      lastName: "",
      fullName: "",
      headline: "",
      location: "",
      website: "",
    },
    contact: { emails: [], phones: [], links: [] },
    skills: [],
    about: "",
    education: [],
    experiences: [],
    notes: "",
    raw: {},
  };
  return saveProfile(skeleton);
}

export default {
  PROFILE_PATH,
  readProfile,
  saveProfile,
  setField,
  bulkUpdate,
  // contact
  addEmail,
  removeEmail,
  addPhone,
  removePhone,
  addLink,
  updateLink,
  deleteLink,
  // skills/about
  addSkill,
  removeSkill,
  setSkills,
  setAbout,
  // education
  addEducation,
  updateEducation,
  deleteEducation,
  // experiences
  addExperience,
  updateExperience,
  deleteExperience,
  // utilities
  wipeProfile,
};
