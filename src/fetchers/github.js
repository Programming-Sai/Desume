// const fetch = require("node-fetch");
const { readKey } = require("../utils/keys");

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const token = readKey("github"); // from .desume/.keys.key

if (!token) {
  console.error("❌ No GitHub token found in .desume/.keys.key");
  process.exit(1);
}

// Simple test query — get your GitHub username and repo count
const query = `
  {
    viewer {
      login
      name
      repositories(first: 5, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          name
          description
          stargazerCount
        }
      }
    }
  }
`;

async function run() {
  try {
    const res = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

run();
