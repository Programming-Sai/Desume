import inquirer from "inquirer";
import { loadProfile, saveProfile } from "./profileManager.js";

export const editManager = {
  // Main entry point - handles both interactive and command modes
  async edit(options = {}) {
    const profile = await loadProfile();
    if (!profile) {
      console.log(
        '❌ No profile found. Please run "desume profile setup" first.'
      );
      return false;
    }

    const { section, action, field, value } = options;

    // Check if this is a direct value set command
    if (value !== undefined) {
      return await this.directValueMode(
        profile,
        section,
        field,
        value,
        options
      );
    } else if (section && action) {
      // Command mode: desume edit [section] [action] [field]
      return await this.commandMode(profile, section, action, field, options);
    } else {
      // Interactive mode: desume edit
      return await this.interactiveMode(profile);
    }
  },

  // NEW: Direct value setting mode (no prompts)
  async directValueMode(profile, section, field, value, options) {
    console.log(`🎯 Direct Set: ${section} ${field || ""} = "${value}"`.trim());

    try {
      const sectionMap = {
        pinfo: "personal",
        exp: "experience",
        edu: "education",
      };

      const actualSection = sectionMap[section] || section;

      switch (actualSection) {
        case "personal":
          await this.setPersonalFieldDirect(profile, field, value);
          break;
        case "summary":
          await this.setSummaryDirect(profile, value);
          break;
        case "experience":
          await this.handleExperienceDirect(profile, field, value, options);
          break;
        case "education":
          await this.handleEducationDirect(profile, field, value, options);
          break;
        case "skills":
          await this.handleSkillsDirect(profile, field, value, options);
          break;
        default:
          console.log(`❌ Unknown section: ${section}`);
          return false;
      }

      await saveProfile(profile);
      console.log("✅ Profile updated successfully!");
      return true;
    } catch (error) {
      console.log(`❌ Direct set failed: ${error.message}`);
      return false;
    }
  },

  // Interactive mode (what we already built)
  async interactiveMode(profile) {
    console.log("🎯 Profile Editor - Interactive Mode");
    console.log("=".repeat(40));

    const { section } = await inquirer.prompt([
      {
        type: "list",
        name: "section",
        message: "Which section do you want to edit?",
        choices: [
          { name: "👤 Personal Information", value: "personal" },
          { name: "💼 Professional Summary", value: "summary" },
          { name: "💻 Work Experience", value: "experience" },
          { name: "🎓 Education", value: "education" },
          { name: "🛠️ Skills", value: "skills" },
          { name: "❌ Cancel", value: "cancel" },
        ],
      },
    ]);

    if (section === "cancel") {
      console.log("Edit cancelled.");
      return false;
    }

    await this.editSection(profile, section);
    await saveProfile(profile);
    console.log("✅ Profile updated successfully!");
    return true;
  },

  // Command mode for targeted edits
  async commandMode(profile, section, action, field, options) {
    console.log(`🎯 Editing: ${section} ${action} ${field || ""}`.trim());

    try {
      switch (section) {
        case "pinfo": // Personal info shorthand
        case "personal":
          await this.handlePersonalCommand(profile, action, field, options);
          break;

        case "summary":
          await this.handleSummaryCommand(profile, action, options);
          break;

        case "exp": // Experience shorthand
        case "experience":
          await this.handleExperienceCommand(profile, action, field, options);
          break;

        case "edu": // Education shorthand
        case "education":
          await this.handleEducationCommand(profile, action, field, options);
          break;

        case "skills":
          await this.handleSkillsCommand(profile, action, field, options);
          break;

        default:
          console.log(`❌ Unknown section: ${section}`);
          return false;
      }

      await saveProfile(profile);
      console.log("✅ Profile updated successfully!");
      return true;
    } catch (error) {
      console.log(`❌ Edit failed: ${error.message}`);
      return false;
    }
  },

  // ============================================================================
  // NEW DIRECT VALUE SETTERS (No prompts - just set the value)
  // ============================================================================

  // Direct personal field setter
  async setPersonalFieldDirect(profile, field, value) {
    if (["website", "linkedin", "github", "portfolio"].includes(field)) {
      if (!profile.personal.links) profile.personal.links = {};
      profile.personal.links[field] = value || undefined;
    } else {
      profile.personal[field] = value || undefined;
    }
    console.log(`✅ ${field} set to: ${value}`);
  },

  // Direct summary setter
  async setSummaryDirect(profile, value) {
    profile.summary = value;
    console.log(`✅ Summary updated`);
  },

  // Direct skills setter
  async handleSkillsDirect(profile, field, value, options) {
    if (!["technologies", "tools"].includes(field)) {
      throw new Error('Field must be "technologies" or "tools"');
    }

    const skillsArray = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    if (!profile.skills) profile.skills = { technologies: [], tools: [] };
    profile.skills[field] = skillsArray;
    console.log(`✅ ${field} set to: ${skillsArray.join(", ")}`);
  },

  // Direct experience handlers
  async handleExperienceDirect(profile, field, value, options) {
    if (field === "add") {
      // For adding new experiences, we'd need more structured data
      console.log(
        "❌ Use interactive mode or provide structured data for adding experiences"
      );
      return;
    } else if (!isNaN(parseInt(field))) {
      // Editing existing experience: field is the index
      const index = parseInt(field);
      const subfield = options.subfield;

      if (!profile.experience?.[index]) {
        throw new Error(`Experience index ${index} not found`);
      }

      if (subfield) {
        profile.experience[index][subfield] = value;
        console.log(`✅ Experience ${index} ${subfield} set to: ${value}`);
      } else {
        console.log(
          "❌ Please specify which field to edit (company, position, etc.)"
        );
      }
    } else {
      console.log("❌ Invalid experience command");
    }
  },

  // Direct education handlers (similar to experience)
  async handleEducationDirect(profile, field, value, options) {
    if (!isNaN(parseInt(field))) {
      const index = parseInt(field);
      const subfield = options.subfield;

      if (!profile.education?.[index]) {
        throw new Error(`Education index ${index} not found`);
      }

      if (subfield) {
        profile.education[index][subfield] = value;
        console.log(`✅ Education ${index} ${subfield} set to: ${value}`);
      } else {
        console.log(
          "❌ Please specify which field to edit (institution, degree, etc.)"
        );
      }
    } else {
      console.log("❌ Invalid education command");
    }
  },

  // ============================================================================
  // EXISTING INTERACTIVE HANDLERS (Keep these as-is)
  // ============================================================================

  // Personal info command handlers
  async handlePersonalCommand(profile, action, field, options) {
    if (action === "edit" && field) {
      // desume edit personal edit name
      const currentValue = this.getPersonalField(profile, field);
      const { newValue } = await inquirer.prompt([
        {
          type: "input",
          name: "newValue",
          message: `New ${field}:`,
          default: currentValue,
        },
      ]);
      this.setPersonalField(profile, field, newValue);
    } else if (action === "view") {
      // desume edit personal view [field]
      if (field) {
        const value = this.getPersonalField(profile, field);
        console.log(`${field}: ${value || "(empty)"}`);
      } else {
        console.log(JSON.stringify(profile.personal, null, 2));
      }
    }
  },

  // Summary command handlers
  async handleSummaryCommand(profile, action, options) {
    if (action === "edit") {
      // desume edit summary edit
      const currentSummary = profile.summary || "";
      const { newSummary } = await inquirer.prompt([
        {
          type: "editor",
          name: "newSummary",
          message: "New professional summary:",
          default: currentSummary,
        },
      ]);
      profile.summary = newSummary || "";
    } else if (action === "view") {
      console.log(profile.summary || "(No summary)");
    }
  },

  // Experience command handlers
  async handleExperienceCommand(profile, action, field, options) {
    if (action === "add") {
      // desume edit experience add
      await this.addNewExperience(profile);
    } else if (action === "list") {
      // desume edit experience list
      this.listExperiences(profile);
    } else if (action === "edit" && field) {
      // desume edit experience edit 0 company
      const index = parseInt(field);
      if (isNaN(index)) {
        console.log("❌ Please provide a valid experience index");
        return;
      }
      await this.editExperienceByIndex(profile, index, options.subfield);
    } else if (action === "delete" && field) {
      // desume edit experience delete 0
      const index = parseInt(field);
      if (isNaN(index)) {
        console.log("❌ Please provide a valid experience index");
        return;
      }
      await this.deleteExperienceEntry(profile, index);
    }
  },

  // Skills command handlers
  async handleSkillsCommand(profile, action, field, options) {
    if (action === "add") {
      // desume edit skills add technologies
      if (!field) {
        console.log("❌ Please specify technologies or tools");
        return;
      }
      await this.addSkills(profile, field, options.values);
    } else if (action === "edit" && field) {
      // desume edit skills edit technologies
      await this.editSkillsCategory(profile, field);
    } else if (action === "view") {
      // desume edit skills view
      console.log(JSON.stringify(profile.skills || {}, null, 2));
    } else if (action === "list") {
      // desume edit skills list [technologies|tools]
      if (field) {
        const skills = profile.skills?.[field] || [];
        console.log(skills.join(", ") || "(empty)");
      } else {
        console.log(JSON.stringify(profile.skills || {}, null, 2));
      }
    }
  },

  // Helper methods for personal fields
  getPersonalField(profile, field) {
    if (["website", "linkedin", "github", "portfolio"].includes(field)) {
      return profile.personal.links?.[field] || "";
    }
    return profile.personal[field] || "";
  },

  setPersonalField(profile, field, value) {
    if (["website", "linkedin", "github", "portfolio"].includes(field)) {
      if (!profile.personal.links) profile.personal.links = {};
      profile.personal.links[field] = value || undefined;
    } else {
      profile.personal[field] = value || undefined;
    }
  },

  // List experiences with indexes
  listExperiences(profile) {
    if (!profile.experience || profile.experience.length === 0) {
      console.log("No work experience entries found.");
      return;
    }

    console.log("\n💻 Work Experience:");
    profile.experience.forEach((exp, index) => {
      console.log(
        `[${index}] ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate})`
      );
    });
  },

  // Edit specific experience by index
  async editExperienceByIndex(profile, index, subfield) {
    if (!profile.experience || !profile.experience[index]) {
      console.log(`❌ Experience entry ${index} not found`);
      return;
    }

    const exp = profile.experience[index];

    if (subfield) {
      // desume edit experience edit 0 company
      const currentValue = exp[subfield] || "";
      const { newValue } = await inquirer.prompt([
        {
          type: "input",
          name: "newValue",
          message: `New ${subfield}:`,
          default: currentValue,
        },
      ]);
      exp[subfield] = newValue || undefined;
    } else {
      // desume edit experience edit 0 (interactive)
      await this.editExperienceEntry(profile, index);
    }
  },

  // Add skills directly
  async addSkills(profile, category, values) {
    if (!["technologies", "tools"].includes(category)) {
      console.log('❌ Category must be "technologies" or "tools"');
      return;
    }

    if (values) {
      // From command line: desume edit skills add technologies "React,Node.js"
      const newSkills = values
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      if (!profile.skills) profile.skills = { technologies: [], tools: [] };
      profile.skills[category] = [
        ...new Set([...profile.skills[category], ...newSkills]),
      ];
    } else {
      // Interactive: desume edit skills add technologies
      const currentSkills = profile.skills?.[category]?.join(", ") || "";
      const { newSkills } = await inquirer.prompt([
        {
          type: "input",
          name: "newSkills",
          message: `Add ${category} (comma-separated):`,
          default: currentSkills,
        },
      ]);

      if (!profile.skills) profile.skills = { technologies: [], tools: [] };
      profile.skills[category] = newSkills
        ? newSkills
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : [];
    }
  },

  // Edit skills category
  async editSkillsCategory(profile, category) {
    const currentSkills = profile.skills?.[category]?.join(", ") || "";
    const { newSkills } = await inquirer.prompt([
      {
        type: "input",
        name: "newSkills",
        message: `New ${category} (comma-separated):`,
        default: currentSkills,
      },
    ]);

    if (!profile.skills) profile.skills = { technologies: [], tools: [] };
    profile.skills[category] = newSkills
      ? newSkills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
      : [];
  },

  // ... (keep all the existing interactive methods from previous implementation)
  // editSection, editPersonal, editSummary, editExperience, etc.
};

// NEW: Export direct setters for programmatic use
export const directSetters = {
  setPersonalField: editManager.setPersonalFieldDirect.bind(editManager),
  setSummary: editManager.setSummaryDirect.bind(editManager),
  setSkills: editManager.handleSkillsDirect.bind(editManager),
};

export default editManager;
