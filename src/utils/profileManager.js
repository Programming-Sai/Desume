import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILE_PATH = path.join(process.cwd(), ".desume", "profile.json");

export async function saveProfile(profileData) {
  try {
    // Ensure .desume directory exists
    const desumeDir = path.dirname(PROFILE_PATH);
    await fs.mkdir(desumeDir, { recursive: true });

    // Clean the profile data before saving
    const cleanedProfile = cleanProfile(profileData);

    // Save to file
    await fs.writeFile(PROFILE_PATH, JSON.stringify(cleanedProfile, null, 2));
    return true;
  } catch (error) {
    console.error("❌ Failed to save profile:", error.message);
    return false;
  }
}

export async function loadProfile() {
  try {
    const data = await fs.readFile(PROFILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log('📝 No profile found. Run "desume profile setup" first.');
      return null;
    }
    console.error("❌ Failed to load profile:", error.message);
    return null;
  }
}

export async function profileExists() {
  try {
    await fs.access(PROFILE_PATH);
    return true;
  } catch {
    return false;
  }
}

function cleanProfile(profile) {
  const cleaned = { ...profile };

  // Remove empty arrays
  if (cleaned.experience && cleaned.experience.length === 0) {
    delete cleaned.experience;
  }
  if (cleaned.education && cleaned.education.length === 0) {
    delete cleaned.education;
  }

  // Remove empty skills
  if (cleaned.skills) {
    if (
      cleaned.skills.technologies.length === 0 &&
      cleaned.skills.tools.length === 0
    ) {
      delete cleaned.skills;
    }
  }

  // Clean personal links (remove empty strings)
  if (cleaned.personal?.links) {
    Object.keys(cleaned.personal.links).forEach((key) => {
      if (!cleaned.personal.links[key]) {
        delete cleaned.personal.links[key];
      }
    });

    if (Object.keys(cleaned.personal.links).length === 0) {
      delete cleaned.personal.links;
    }
  }

  return cleaned;
}

export default {
  saveProfile,
  loadProfile,
  profileExists,
};
