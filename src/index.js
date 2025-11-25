// // src/index.js
// import ResumeGenerator from "./resume/resume-generator.js";
// import resumeData from "./resumeData.js";
// import { fileURLToPath } from "url";

// async function main() {
//   const generator = new ResumeGenerator("Next"); // or "Base"

//   try {
//     await generator.generate(resumeData, "mensah-resume");
//     console.log("🎉 Resume generation complete!");
//   } catch (error) {
//     console.error("💥 Failed to generate resume:", error);
//     process.exit(1);
//   }
// }

// // CLI support
// if (process.argv[1] === fileURLToPath(import.meta.url)) {
//   main();
// }

// export default main;

// // Example usage in your code
// import InputParser from "./job-reader/index.js";

// const parser = new InputParser();

// // Parse text
// const textResult = parser.parse(`About the Role

// We are seeking a skilled C# Developer with strong experience in JSON data handling and database integration. The ideal candidate will work closely with our engineering and product teams to design, develop, and maintain high-performance applications that interact with various data sources and APIs.

// Experience with .NET or Transportation Management Systems (TMS) is a strong plus.

// Key Responsibilities

// Design, implement, and maintain software solutions using C#.
// Work with JSON data for configuration, serialization, and data exchange.
// Develop and optimize database queries (SQL or NoSQL) for data-driven applications.
// Collaborate with other developers to integrate application components and APIs.
// Write clean, efficient, and maintainable code following best practices.
// Participate in code reviews, debugging, and performance tuning.
// Assist in integrating systems with TMS platforms.`);

// // Parse URL
// const urlResult = await parser.parse(
//   "https://www.salafric.com/jobs/c-.net-developer-691d9c479704ce402340bb29"
// );

// // Parse image
// const imageResult = await parser.parseImage("./src/test.png");

// console.log(textResult);
// console.log(urlResult);
// console.log(imageResult);

// // Cleanup when done
// await parser.cleanup();
// src/index.js - UPDATED
import GitHubSource from "./sources/github.js";

async function testGitHubProjects() {
  try {
    console.log("🚀 GITHUB PROJECTS DATA TEST\n");
    console.log("=".repeat(50));

    const options = {
      onlyOwned: true,
      excludeArchived: true,
      excludePatterns: [],
      excludeRepos: [
        "oysloe-webappbyedmund",
        "oysloeadmin",
        "gym-backend",
        "gym-frontend",
        "Ghana-Hack-AI",
      ],
    };

    const github = new GitHubSource(options);

    console.log("📊 Fetching owned repositories...");
    console.log("-".repeat(40));

    // Fetch projects first
    const result = await github.getProjects(null, null, true);

    // Show what we got
    const output = {
      metadata: {
        totalOwnedRepos: result.total,
        lastUpdated: result.lastUpdated,
        excludedRepos: options.excludeRepos,
      },
      projects: result.projects.map((project) => ({
        name: project.name,
        description: project.description,
        repoUrl: project.url,
        demoUrl: project.demoUrl,
        language: project.language,
        isOwned: !project.isFork,
      })),
    };

    console.log("\n✅ RAW JSON OUTPUT:");
    console.log(JSON.stringify(output, null, 2));

    console.log("\n📈 SUMMARY:");
    console.log(`   Total owned repositories: ${result.total}`);
    console.log(
      `   Projects with live demos: ${
        result.projects.filter((p) => p.demoUrl).length
      }`
    );
    console.log(
      `   Primary languages: ${[
        ...new Set(result.projects.map((p) => p.language).filter(Boolean)),
      ].join(", ")}`
    );

    // NEW: Just save the projects we already fetched
    console.log("\n💾 SAVING TO PROFILE...");
    console.log("-".repeat(40));

    const savedProjects = await github.saveProjectsToProfile(result.projects);
    console.log(`✅ Saved ${savedProjects.length} projects to profile!`);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testGitHubProjects();
// // src/index.js - PROFILE SETUP TEST
// import { setupProfile } from "./sources/profile.js";
// import { loadProfile, profileExists } from "./utils/profileManager.js";

// async function testProfileSetup() {
//   try {
//     console.log("🚀 Testing Profile Setup with Inquirer\n");
//     console.log("=".repeat(50));

//     // Check if profile already exists
//     if (await profileExists()) {
//       console.log("📁 Existing profile found:");
//       const existing = await loadProfile();
//       console.log(JSON.stringify(existing, null, 2));

//       const { overwrite } = await inquirer.prompt([
//         {
//           type: "confirm",
//           name: "overwrite",
//           message:
//             "Do you want to create a new profile? This will overwrite the existing one.",
//           default: false,
//         },
//       ]);

//       if (!overwrite) {
//         console.log("✅ Using existing profile.");
//         return existing;
//       }
//     }

//     // Create new profile
//     const profile = await setupProfile();

//     console.log("\n🎉 PROFILE SETUP COMPLETE!");
//     console.log("=".repeat(50));

//     console.log("\n📊 PROFILE DATA (Raw JSON):");
//     console.log(JSON.stringify(profile, null, 2));

//     console.log("\n📋 PROFILE SUMMARY:");
//     console.log(`   Name: ${profile.personal.name}`);
//     console.log(`   Email: ${profile.personal.email}`);
//     console.log(`   Location: ${profile.personal.location || "Not specified"}`);
//     console.log(`   Summary Length: ${profile.summary.length} characters`);
//     console.log(`   Experience Entries: ${profile.experience?.length || 0}`);
//     console.log(`   Education Entries: ${profile.education?.length || 0}`);
//     console.log(
//       `   Technologies: ${profile.skills?.technologies?.join(", ") || "None"}`
//     );
//     console.log(`   Tools: ${profile.skills?.tools?.join(", ") || "None"}`);

//     console.log("\n✅ Profile setup test completed successfully!");

//     return profile;
//   } catch (error) {
//     console.error("❌ Profile setup failed:", error.message);
//     if (error.isTtyError) {
//       console.log("⚠️  This environment does not support interactive prompts");
//     }
//   }
// }

// // Run the test
// testProfileSetup();

// // src/index.js - COMPLETE TEST FILE
// import { directSetters, editManager } from "./utils/editManager.js";
// import { loadProfile, saveProfile } from "./utils/profileManager.js";

// async function comprehensiveEditTest() {
//   try {
//     console.log("🚀 DESUME EDIT SYSTEM - COMPREHENSIVE TEST\n");
//     console.log("=".repeat(50));

//     // Load profile first
//     const profile = await loadProfile();
//     if (!profile) {
//       console.log("❌ No profile found. Please run profile setup first.");
//       return;
//     }

//     console.log("📁 Profile loaded successfully!\n");

//     // Show current state
//     await showCurrentState(profile);

//     // Test both modes
//     await testDirectSetters(profile);
//     await testInteractiveEditors(profile);

//     // Show final state
//     await showCurrentState(profile);

//     console.log("\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!");
//   } catch (error) {
//     console.error("❌ Test failed:", error.message);
//   }
// }

// async function showCurrentState(profile) {
//   console.log("\n📊 CURRENT PROFILE STATE:");
//   console.log("-".repeat(30));
//   console.log(`Name: ${profile.personal?.name || "(not set)"}`);
//   console.log(`Email: ${profile.personal?.email || "(not set)"}`);
//   console.log(`Summary length: ${profile.summary?.length || 0} chars`);
//   console.log(
//     `Technologies: ${profile.skills?.technologies?.join(", ") || "none"}`
//   );
//   console.log(`Tools: ${profile.skills?.tools?.join(", ") || "none"}`);
//   console.log(`Experience entries: ${profile.experience?.length || 0}`);
//   console.log(`Education entries: ${profile.education?.length || 0}`);
// }

// async function testDirectSetters(profile) {
//   console.log("\n🎯 TESTING DIRECT SETTERS (No Prompts)");
//   console.log("=".repeat(40));
//   console.log(
//     "These functions set values instantly without user interaction.\n"
//   );

//   // Test 1: Set personal information directly
//   console.log("1. Setting personal information directly...");
//   await directSetters.setPersonalField(profile, "name", "Mensah Lartey Isaiah");
//   await directSetters.setPersonalField(profile, "email", "isaiah@updated.com");
//   await directSetters.setPersonalField(
//     profile,
//     "location",
//     "Accra, Ghana (Updated)"
//   );
//   await directSetters.setPersonalField(
//     profile,
//     "linkedin",
//     "https://linkedin.com/in/isaiah-updated"
//   );
//   console.log("✅ Personal info updated instantly!\n");

//   // Test 2: Set summary directly
//   console.log("2. Setting professional summary directly...");
//   const newSummary =
//     "Experienced full-stack developer specializing in JavaScript, React, and Node.js. Passionate about building scalable web applications and open-source contributions. Strong background in AI integration and modern development practices.";
//   await directSetters.setSummary(profile, newSummary);
//   console.log("✅ Summary updated instantly!\n");

//   // Test 3: Set skills directly
//   console.log("3. Setting skills directly...");
//   await directSetters.setSkills(
//     profile,
//     "technologies",
//     "JavaScript,TypeScript,React,Node.js,Python,Next.js"
//   );
//   await directSetters.setSkills(
//     profile,
//     "tools",
//     "Git,VS Code,Docker,Postman,Figma,Webpack"
//   );
//   console.log("✅ Skills updated instantly!\n");

//   // Save after direct setters
//   await saveProfile(profile);
//   console.log("💾 Changes saved to profile.\n");
// }

// async function testInteractiveEditors(profile) {
//   console.log("\n🎮 TESTING INTERACTIVE EDITORS (With Prompts)");
//   console.log("=".repeat(40));
//   console.log("These functions will show prompts for user input.\n");

//   const { testInteractive } = await import("inquirer").then(
//     async (inquirerModule) => {
//       const inquirer = inquirerModule.default;
//       return await inquirer.prompt([
//         {
//           type: "confirm",
//           name: "testInteractive",
//           message:
//             "Do you want to test interactive editors? (This will show prompts)",
//           default: true,
//         },
//       ]);
//     }
//   );

//   if (!testInteractive) {
//     console.log("⏭️  Skipping interactive tests.");
//     return;
//   }

//   // Test 1: Interactive personal info editing
//   console.log("\n1. Testing interactive personal info editor...");
//   console.log("   This will ask you to update your phone number.");
//   await editManager.handlePersonalCommand(profile, "edit", "phone", {});
//   // ❓ Shows: "New phone: [current value]"
//   console.log("✅ Personal info interactive test completed!\n");

//   // Test 2: Interactive summary editing
//   console.log("2. Testing interactive summary editor...");
//   console.log("   This will open a text editor for your summary.");
//   const { testSummary } = await import("inquirer").then(
//     async (inquirerModule) => {
//       const inquirer = inquirerModule.default;
//       return await inquirer.prompt([
//         {
//           type: "confirm",
//           name: "testSummary",
//           message: "Open summary editor? (Press Enter to open editor)",
//           default: false,
//         },
//       ]);
//     }
//   );

//   if (testSummary) {
//     await editManager.handleSummaryCommand(profile, "edit", {});
//     // ❓ Opens text editor with current summary
//     console.log("✅ Summary interactive test completed!\n");
//   } else {
//     console.log("⏭️  Skipping summary editor.\n");
//   }

//   // Test 3: Interactive skills editing
//   console.log("3. Testing interactive skills editor...");
//   console.log("   This will ask you to update technologies.");
//   await editManager.handleSkillsCommand(profile, "edit", "technologies", {});
//   // ❓ Shows: "New technologies: [current skills]"
//   console.log("✅ Skills interactive test completed!\n");

//   // Save after interactive editors
//   await saveProfile(profile);
//   console.log("💾 All interactive changes saved to profile.");
// }

// // Additional test for viewing data
// async function testViewFunctions() {
//   console.log("\n👀 TESTING VIEW FUNCTIONS");
//   console.log("=".repeat(30));

//   const profile = await loadProfile();

//   console.log("\nViewing personal information:");
//   await editManager.handlePersonalCommand(profile, "view", null, {});

//   console.log("\nViewing summary:");
//   await editManager.handleSummaryCommand(profile, "view", {});

//   console.log("\nViewing skills:");
//   await editManager.handleSkillsCommand(profile, "view", null, {});
// }

// // Run the complete test
// async function runAllTests() {
//   await comprehensiveEditTest();

//   // Optional: Test view functions
//   const { testViews } = await import("inquirer").then(
//     async (inquirerModule) => {
//       const inquirer = inquirerModule.default;
//       return await inquirer.prompt([
//         {
//           type: "confirm",
//           name: "testViews",
//           message: "\nDo you want to test view functions?",
//           default: false,
//         },
//       ]);
//     }
//   );

//   if (testViews) {
//     await testViewFunctions();
//   }

//   console.log("\n✨ TESTING COMPLETE!");
//   console.log(
//     "💡 Your profile has been updated with both direct and interactive edits."
//   );
// }

// // Start the tests
// runAllTests();
