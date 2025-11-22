const mapping = [
  {
    findText: "MENSAH LARTEY ISAIAH NII LARTEY",
    token: "{{profile.fullName}}",
  },
  {
    findText: "Accra, Ghana | +233 257 90 2700 | Email | GitHub | LinkedIn",
    token: "{{contact.line}}",
  },
  {
    findText: "SUMMARY",
    token: "{{section.SUMMARY.heading}}",
  },
  {
    findText:
      "Full-stack developer with hands-on experience in React, Next.js, Node.js, TypeScript, and database-driven applications. Skilled in backend logic, frontend design, CI/CD automation, and deployment. Passionate about building practical, secure, and maintainable applications.",
    token: "{{summary}}",
  },
  {
    findText: "TECHNICAL SKILLS",
    token: "{{section.SKILLS.heading}}",
  },
  {
    findText: "Languages: TypeScript, JavaScript, Python, Java",
    token: "{{skills.languages}}",
  },
  {
    findText: "Web & Mobile: React, Next.js, React Native, HTML, CSS",
    token: "{{skills.web}}",
  },
  {
    findText:
      "Backend & Tools: Node.js, Express.js, REST APIs, WebSockets, MongoDB, PostgreSQL",
    token: "{{skills.backend}}",
  },
  {
    findText:
      "DevOps / Deployment: GitHub Actions, Vercel, Render, CI/CD pipelines",
    token: "{{skills.devops}}",
  },
  {
    findText: "Other Tools: Figma, Postman, Bash, CLI tools, LangChain",
    token: "{{skills.tools}}",
  },
  {
    findText: "EDUCATION",
    token: "{{section.EDUCATION.heading}}",
  },
  {
    findText:
      "University of Ghana, Accra — BSc Computer Science (Expected 2026)",
    token: "{{education.0}}",
  },
  {
    findText:
      "Presbyterian Boys’ Secondary School (PRESEC), Accra — Graduated 2022",
    token: "{{education.1}}",
  },
  {
    findText: "PROJECTS",
    token: "{{section.PROJECTS.heading}}",
  },
  {
    findText:
      "CtxIQ: TypeScript-based backend toolkit for AI assistants; modular and plug-and-play architecture.",
    token: "{{project.CtxIQ}}",
  },
  {
    findText:
      "FINTECH-HACKATHON-PWA: Mobile-first PWA for Ghanaian businesses, enabling branded digital payments.",
    token: "{{project.FINTECH-HACKATHON-PWA}}",
  },
  {
    findText:
      "SnapMock / GitHub-README-Site-Preview: GitHub Actions automating responsive device previews; CI/CD & workflow automation.",
    token: "{{project.SnapMock}}",
  },
  {
    findText:
      "Chat-Application-Backend: Node.js + Express + WebSockets backend for real-time messaging with MongoDB/PostgreSQL storage.",
    token: "{{project.ChatApplicationBackend}}",
  },
  {
    findText:
      "SeekBeat-UI: React Native for Web frontend, offline-first music streaming platform with responsive design.",
    token: "{{project.SeekBeatUI}}",
  },
  {
    findText:
      "Blog Platform: Next.js dynamic blog with secure admin dashboard and multimedia support.",
    token: "{{project.BlogPlatform}}",
  },
  {
    findText: "ACHIEVEMENTS",
    token: "{{section.ACHIEVEMENTS.heading}}",
  },
  {
    findText: "Published SnapMock GitHub Action on Marketplace",
    token: "{{achievement.0}}",
  },
  {
    findText:
      "Completed 10+ full-stack, backend, and automation projects independently",
    token: "{{achievement.1}}",
  },
  {
    findText: "INTERESTS",
    token: "{{section.INTERESTS.heading}}",
  },
  {
    findText:
      "Full-stack systems, automation, CI/CD workflows, AI-enhanced developer tools",
    token: "{{interests}}",
  },
];

export default mapping;
