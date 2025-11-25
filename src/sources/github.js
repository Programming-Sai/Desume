// src/sources/github.js - WITH EXCLUSION LIST
import keys from "../utils/keys.js";
import { loadProfile, saveProfile } from "../utils/profileManager.js";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

export class GitHubSource {
  constructor(options = {}) {
    this.token = keys.readKey("github");
    if (!this.token) {
      throw new Error("❌ No GitHub token found. Run 'desume setup' first.");
    }
    this.options = {
      excludeForks: true,
      excludeArchived: true,
      onlyOwned: true,
      excludePatterns: ["test-", "demo-", "example-", "tutorial-", ".github"],
      excludeRepos: [], // NEW: Explicit repo exclusion list
      ...options,
    };
  }

  async getProjects(username = null, limit = null, getAll = false) {
    try {
      const projects = getAll
        ? await this.getAllProjects(username)
        : await this.getRecentProjects(username, limit || 12);

      // Apply limit after filtering if specified
      const finalProjects = limit ? projects.slice(0, limit) : projects;

      return {
        projects: finalProjects,
        total: finalProjects.length,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Failed to fetch GitHub projects:", error.message);
      throw error;
    }
  }

  async getRecentProjects(username = null, limit = 12) {
    const query = this.getProjectsQuery(username, limit);
    const data = await this.graphqlRequest(query, username ? { username } : {});
    const projects = this.transformProjects(data);
    return this.filterProjects(projects);
  }

  async getAllProjects(username = null) {
    let allProjects = [];
    let hasNextPage = true;
    let endCursor = null;
    const pageSize = 50;

    console.log("📦 Fetching all GitHub repositories...");

    while (hasNextPage) {
      const query = this.getPaginatedProjectsQuery(
        username,
        pageSize,
        endCursor
      );
      const data = await this.graphqlRequest(
        query,
        username ? { username } : {}
      );
      const user = data.viewer || data.user;
      const pageInfo = user.repositories.pageInfo;
      const repos = user.repositories.nodes;

      const projects = this.transformProjects({
        [username ? "user" : "viewer"]: { repositories: { nodes: repos } },
      });

      allProjects = [...allProjects, ...projects];
      hasNextPage = pageInfo.hasNextPage;
      endCursor = pageInfo.endCursor;

      console.log(
        `   Fetched ${repos.length} repos (total: ${allProjects.length})`
      );

      if (hasNextPage) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    console.log(`✅ Total repositories found: ${allProjects.length}`);
    const filteredProjects = this.filterProjects(allProjects);
    console.log(
      `✅ Owned repositories after filtering: ${filteredProjects.length}`
    );
    return filteredProjects;
  }

  getProjectsQuery(username = null, limit = 12) {
    const userFilter = username ? `user(login: $username)` : "viewer";

    return `
      query ${username ? "($username: String!)" : ""} {
        ${userFilter} {
          repositories(
            first: ${limit}, 
            orderBy: {field: UPDATED_AT, direction: DESC}, 
            isFork: ${this.options.onlyOwned ? "false" : "null"}, 
            isArchived: ${this.options.excludeArchived ? "false" : "null"}
          ) {
            nodes {
              name
              description
              url
              homepageUrl
              isFork
              owner {
                login
              }
              primaryLanguage {
                name
              }
            }
          }
        }
      }
    `;
  }

  getPaginatedProjectsQuery(username = null, limit = 50, cursor = null) {
    const userFilter = username ? `user(login: $username)` : "viewer";
    const afterClause = cursor ? `, after: "${cursor}"` : "";

    return `
      query ${username ? "($username: String!)" : ""} {
        ${userFilter} {
          repositories(
            first: ${limit}, 
            orderBy: {field: UPDATED_AT, direction: DESC}, 
            isFork: ${this.options.onlyOwned ? "false" : "null"}, 
            isArchived: ${this.options.excludeArchived ? "false" : "null"}
            ${afterClause}
          ) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              name
              description
              url
              homepageUrl
              isFork
              owner {
                login
              }
              primaryLanguage {
                name
              }
            }
          }
        }
      }
    `;
  }

  // Add this to your GitHubSource class
  async saveProjectsToProfile(projects) {
    try {
      console.log("💾 Saving projects to profile...");

      const profile = await loadProfile();
      if (!profile) {
        throw new Error("No profile found. Run profile setup first.");
      }

      // Just save whatever projects array we pass in
      profile.projects = projects.map((project) => ({
        name: project.name,
        description: project.description,
        repoUrl: project.url || project.repoUrl,
        demoUrl: project.demoUrl || null,
        language: project.language,
        lastUpdated: new Date().toISOString(),
        isOwned:
          project.isOwned !== undefined ? project.isOwned : !project.isFork,
      }));

      await saveProfile(profile);
      console.log(`✅ Saved ${profile.projects.length} projects to profile!`);
      return profile.projects;
    } catch (error) {
      console.error("❌ Failed to save projects:", error.message);
      throw error;
    }
  }

  transformProjects(data) {
    const user = data.viewer || data.user;
    if (!user || !user.repositories) return [];

    return user.repositories.nodes.map((repo) => ({
      name: repo.name,
      description:
        repo.description ||
        `${repo.primaryLanguage?.name || "Software"} project`,
      url: repo.url,
      demoUrl: repo.homepageUrl || null,
      language: repo.primaryLanguage?.name,
      isFork: repo.isFork,
      owner: repo.owner?.login,
    }));
  }

  filterProjects(projects) {
    return projects.filter((project) => {
      // Filter out forks if onlyOwned is true
      if (this.options.onlyOwned && project.isFork) {
        return false;
      }

      // NEW: Filter out explicitly excluded repos
      if (this.options.excludeRepos && this.options.excludeRepos.length > 0) {
        const shouldExclude = this.options.excludeRepos.some(
          (repoName) => project.name.toLowerCase() === repoName.toLowerCase()
        );
        if (shouldExclude) {
          console.log(`   🚫 Excluding ${project.name} (explicitly excluded)`);
          return false;
        }
      }

      // Filter out excluded patterns
      if (
        this.options.excludePatterns &&
        this.options.excludePatterns.length > 0
      ) {
        const shouldExclude = this.options.excludePatterns.some((pattern) =>
          project.name.toLowerCase().includes(pattern.toLowerCase())
        );
        if (shouldExclude) return false;
      }

      return true;
    });
  }

  async graphqlRequest(query, variables = {}) {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(
        `GitHub GraphQL errors: ${data.errors.map((e) => e.message).join(", ")}`
      );
    }

    return data.data;
  }
}

export default GitHubSource;
