import { useEffect, useState } from "react";

import {
  createRepository,
  loadRepositories,
} from "../../../src/features/github/repository/repository-service";

import { saveSelectedRepository } from "../../../src/features/github/github-auth/github-storage";

import { getGithubUser } from "../../../src/features/github/api/github-user";

import type { GithubRepository } from "../../../src/features/github/api/github-create-repository";

interface RepositorySetupProps {
  onRepositoryConfigured: () => void;
}

export default function RepositorySetup({
  onRepositoryConfigured,
}: RepositorySetupProps) {
  const [mode, setMode] = useState<"create" | "existing">("create");

  const [repositoryName, setRepositoryName] = useState("codesyncvault-solutions");

  const [repositories, setRepositories] = useState<GithubRepository[]>([]);

  const [selectedRepository, setSelectedRepository] = useState("");

  const [username, setUsername] = useState("");

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getGithubUser();

        setUsername(user.login);
      } catch (error) {
        console.error("Failed to load GitHub user", error);
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchRepositories() {
      try {
        const result = await loadRepositories();

        setRepositories(result);
      } catch (error) {
        console.error("Failed to load repositories", error);
      }
    }

    if (mode === "existing") {
      fetchRepositories();
    }
  }, [mode]);

  async function handleContinue() {
    try {
      setLoading(true);
      setErrorMessage("");

      if (mode === "existing") {
        const repository = repositories.find(
          (repo) => repo.name === selectedRepository,
        );

        if (!repository) {
          throw new Error("Please select a repository.");
        }

        await saveSelectedRepository(
          repository.owner.login,
          repository.name,
          repository.default_branch,
        );

        onRepositoryConfigured();

        return;
      }

      const repository = await createRepository({
        name: repositoryName,
        description: "Repository created by CodeSyncVault",
        private: false,
      });

      console.log(repository);

      onRepositoryConfigured();
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error &&
        (error.message.toLowerCase().includes("name already exists") ||
          error.message
            .toLowerCase()
            .includes("already exists on this account"))
      ) {
        setErrorMessage("Repository already exists.");
      } else {
        setErrorMessage("Unable to create repository. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: "340px",
        boxSizing: "border-box",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2
        style={{
          margin: "0 0 16px",
          fontSize: "20px",
        }}
      >
        🚀 Welcome to CodeSyncVault
      </h2>

      <p
        style={{
          margin: "0 0 6px",
          color: "#888",
          fontSize: "13px",
        }}
      >
        Connected as
      </p>

      <strong
        style={{
          color: "#22c55e",
          fontSize: "13px",
        }}
      >
        {username || "Loading..."} ✅
      </strong>

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "20px",
        }}
      >
        <button
          onClick={() => {
            setMode("create");
            setErrorMessage("");
          }}
          style={{
            flex: 1,
            height: "40px",
            padding: "0 8px",
            whiteSpace: "nowrap",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          📦 Create New Repository
        </button>

        <button
          onClick={() => {
            setMode("existing");
            setErrorMessage("");
          }}
          style={{
            flex: 1,
            height: "40px",
            padding: "0 8px",
            whiteSpace: "nowrap",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          🔗 Existing Repository
        </button>
      </div>

      {mode === "create" && (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "13px",
            }}
          >
            Repository Name
          </label>

          <input
            value={repositoryName}
            onChange={(event) => {
              setRepositoryName(event.target.value);
              setErrorMessage("");
            }}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px",
            }}
          />

          {errorMessage && (
            <p
              style={{
                margin: "7px 0 0",
                color: "#f87171",
                fontSize: "12px",
              }}
            >
              ⚠ {errorMessage}
            </p>
          )}
        </div>
      )}

      {mode === "existing" && (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "13px",
            }}
          >
            Select Repository
          </label>

          <select
            value={selectedRepository}
            onChange={(event) => setSelectedRepository(event.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px",
            }}
          >
            <option value="">Select repository</option>

            {repositories.map((repo) => (
              <option key={repo.id} value={repo.name}>
                {repo.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={handleContinue}
        disabled={loading}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "12px",
        }}
      >
        {loading ? "Please wait..." : "Continue →"}
      </button>
    </div>
  );
}
