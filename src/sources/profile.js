import inquirer from "inquirer";
import { saveProfile, loadProfile } from "../utils/profileManager.js";
// import profileSchema from "./profileSchema.json";

export const profileQuestions = {
  personal: [
    {
      type: "input",
      name: "name",
      message: "Full name:",
      validate: (input) => (input ? true : "Name is required"),
    },
    {
      type: "input",
      name: "email",
      message: "Email address:",
      validate: (input) =>
        /\S+@\S+\.\S+/.test(input) ? true : "Please enter a valid email",
    },
    {
      type: "input",
      name: "phone",
      message: "Phone number (optional):",
    },
    {
      type: "input",
      name: "location",
      message: "Location (City, Country - optional):",
    },
  ],

  links: [
    {
      type: "input",
      name: "website",
      message: "Personal website (optional):",
    },
    {
      type: "input",
      name: "linkedin",
      message: "LinkedIn URL (optional):",
    },
    {
      type: "input",
      name: "github",
      message: "GitHub URL (optional):",
      default: "https://github.com/Programming-Sai",
    },
    {
      type: "input",
      name: "portfolio",
      message: "Portfolio URL (optional):",
    },
  ],

  summary: [
    {
      type: "editor",
      name: "summary",
      message: "Professional summary (press Enter to open editor):",
      validate: (input) =>
        input && input.length > 50
          ? true
          : "Please write a summary (at least 50 characters)",
    },
  ],

  experience: [
    {
      type: "input",
      name: "company",
      message: "Company name:",
      validate: (input) => (input ? true : "Company name is required"),
    },
    {
      type: "input",
      name: "position",
      message: "Position:",
      validate: (input) => (input ? true : "Position is required"),
    },
    {
      type: "input",
      name: "location",
      message: "Location (optional):",
    },
    {
      type: "input",
      name: "startDate",
      message: "Start date (YYYY-MM):",
      validate: (input) =>
        /^\d{4}-\d{2}$/.test(input) ? true : "Please use YYYY-MM format",
    },
    {
      type: "input",
      name: "endDate",
      message: 'End date (YYYY-MM or "Present" - optional):',
      default: "Present",
    },
    {
      type: "editor",
      name: "description",
      message: "Job description (one bullet point per line - optional):",
    },
  ],

  education: [
    {
      type: "input",
      name: "institution",
      message: "Institution name:",
      validate: (input) => (input ? true : "Institution name is required"),
    },
    {
      type: "input",
      name: "degree",
      message: "Degree (optional):",
    },
    {
      type: "input",
      name: "field",
      message: "Field of study (optional):",
    },
    {
      type: "input",
      name: "startDate",
      message: "Start date (YYYY-MM - optional):",
    },
    {
      type: "input",
      name: "endDate",
      message: 'End date (YYYY-MM or "Expected YYYY" - optional):',
    },
  ],

  skills: [
    {
      type: "input",
      name: "technologies",
      message:
        "Technologies (comma-separated, e.g., JavaScript, Python, React):",
    },
    {
      type: "input",
      name: "tools",
      message: "Tools (comma-separated, e.g., Git, Docker, VS Code):",
    },
  ],
};

export async function setupProfile() {
  console.log("🎯 Desume Profile Setup\n");
  console.log("Let's build your professional profile...\n");

  const profile = {};

  // Personal Information
  console.log("📝 Personal Information");
  console.log("=".repeat(30));
  const personalAnswers = await inquirer.prompt(profileQuestions.personal);
  const linksAnswers = await inquirer.prompt(profileQuestions.links);

  profile.personal = {
    ...personalAnswers,
    links: linksAnswers,
  };

  // Professional Summary
  console.log("\n💼 Professional Summary");
  console.log("=".repeat(30));
  const summaryAnswers = await inquirer.prompt(profileQuestions.summary);
  profile.summary = summaryAnswers.summary;

  // Work Experience
  console.log("\n💻 Work Experience");
  console.log("=".repeat(30));
  profile.experience = [];

  let addMoreExperience = true;
  while (addMoreExperience) {
    console.log(`\nAdding experience entry #${profile.experience.length + 1}`);
    const experienceAnswers = await inquirer.prompt(
      profileQuestions.experience
    );

    const description = experienceAnswers.description
      ? experienceAnswers.description.split("\n").filter((line) => line.trim())
      : [];

    profile.experience.push({
      company: experienceAnswers.company,
      position: experienceAnswers.position,
      location: experienceAnswers.location || undefined,
      startDate: experienceAnswers.startDate,
      endDate: experienceAnswers.endDate || undefined,
      description: description.length > 0 ? description : undefined,
    });

    const { continueAdding } = await inquirer.prompt([
      {
        type: "confirm",
        name: "continueAdding",
        message: "Add another work experience?",
        default: false,
      },
    ]);

    addMoreExperience = continueAdding;
  }

  // Education
  console.log("\n🎓 Education");
  console.log("=".repeat(30));
  profile.education = [];

  let addMoreEducation = true;
  while (addMoreEducation) {
    console.log(`\nAdding education entry #${profile.education.length + 1}`);
    const educationAnswers = await inquirer.prompt(profileQuestions.education);

    profile.education.push({
      institution: educationAnswers.institution,
      degree: educationAnswers.degree || undefined,
      field: educationAnswers.field || undefined,
      startDate: educationAnswers.startDate || undefined,
      endDate: educationAnswers.endDate || undefined,
    });

    const { continueAdding } = await inquirer.prompt([
      {
        type: "confirm",
        name: "continueAdding",
        message: "Add another education entry?",
        default: false,
      },
    ]);

    addMoreEducation = continueAdding;
  }

  // Skills
  console.log("\n🛠️ Skills");
  console.log("=".repeat(30));
  const skillsAnswers = await inquirer.prompt(profileQuestions.skills);

  profile.skills = {
    technologies: skillsAnswers.technologies
      ? skillsAnswers.technologies
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill)
      : [],
    tools: skillsAnswers.tools
      ? skillsAnswers.tools
          .split(",")
          .map((tool) => tool.trim())
          .filter((tool) => tool)
      : [],
  };

  // Save to storage
  await saveProfile(profile);
  console.log("\n✅ Profile saved successfully to .desume/profile.json");

  return profile;
}

export default {
  profileQuestions,
  setupProfile,
};
