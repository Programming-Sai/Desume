// scripts/test-profile.js
import store from "../utils/profileManager.js";

(async () => {
  console.log("== initial ==");
  console.log(await store.readProfile());

  console.log("== set name ==");
  await store.setField(["profile", "firstName"], "Isaiah");
  await store.setField(["profile", "lastName"], "Kwame");
  // fullName auto-synced from first + last if not set

  console.log("== bulk update contact (emails/phones) ==");
  await store.bulkUpdate({
    contact: {
      emails: ["isaiah@example.com"],
      phones: ["+233501234567"],
    },
  });

  console.log("== add link(s) ==");
  await store.addLink({
    type: "linkedin",
    label: "LinkedIn",
    url: "https://linkedin.com/in/isaiah",
    primary: true,
  });
  await store.addLink({
    type: "portfolio",
    label: "Portfolio",
    url: "https://isaiah.dev",
  });

  console.log("== add education ==");
  await store.addEducation({
    school: "University of Ghana",
    degree: "BSc Computer Science",
    fieldOfStudy: "Computer Science",
    startDate: "2021-08",
    endDate: "2025-06",
    description: "Focus on systems and algorithms.",
  });

  console.log("== add experience ==");
  await store.addExperience({
    company: "CtxIQ",
    title: "Backend Dev",
    startDate: "2025-07",
    endDate: null,
    isCurrent: true,
    location: "Accra (remote)",
    description: "Worked on backend features.",
    bulletPoints: ["Implemented REST endpoints", "Wrote unit tests"],
    technologies: ["Node.js", "Express", "Postgres"],
  });

  console.log("== add skills & about ==");
  await store.setSkills(["Node.js", "Java", "Django", "SQL"]);
  await store.setAbout(
    "Computer Science student building backend systems and automation tools."
  );

  console.log("== final ==");
  console.log(await store.readProfile());
})();
