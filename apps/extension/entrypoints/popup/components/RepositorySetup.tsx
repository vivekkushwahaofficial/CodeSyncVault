import { useEffect, useState } from "react";

import {
  createRepository,
  loadRepositories,
} from "../../../src/features/github/repository/repository-service";

import {
  saveSelectedRepository,
} from "../../../src/features/github/github-auth/github-storage";

import {
  getGithubUser,
} from "../../../src/features/github/api/github-user";

import type {
  GithubRepository,
} from "../../../src/features/github/api/github-create-repository";


interface RepositorySetupProps {

  onRepositoryConfigured: () => void;

}



export default function RepositorySetup({
  onRepositoryConfigured,
}: RepositorySetupProps) {


  const [mode, setMode] =
    useState<"create" | "existing">("create");


  const [repositoryName, setRepositoryName] =
    useState("codevault-solutions");


  const [repositories, setRepositories] =
    useState<GithubRepository[]>([]);


  const [selectedRepository, setSelectedRepository] =
    useState("");


  const [username, setUsername] =
    useState("");


  const [loading, setLoading] =
    useState(false);



  useEffect(() => {

    async function fetchUser() {

      try {

        const user =
          await getGithubUser();


        setUsername(
          user.login
        );


      } catch (error) {

        console.error(
          "Failed to load GitHub user",
          error,
        );

      }

    }


    fetchUser();


  }, []);




  useEffect(() => {

    async function fetchRepositories() {

      try {

        const result =
          await loadRepositories();


        setRepositories(result);


      } catch (error) {

        console.error(
          "Failed to load repositories",
          error,
        );

      }

    }


    if (mode === "existing") {

      fetchRepositories();

    }


  }, [mode]);





  async function handleContinue() {


    try {

      setLoading(true);



      if (mode === "existing") {


        const repository =
          repositories.find(
            (repo) =>
              repo.name === selectedRepository
          );



        if (!repository) {

          throw new Error(
            "Please select a repository."
          );

        }



        await saveSelectedRepository(

          repository.owner.login,

          repository.name,

          repository.default_branch,

        );



        onRepositoryConfigured();

        return;

      }





      const repository =
        await createRepository({

          name: repositoryName,

          description:
            "Repository created by CodeVault",

          private: false,

        });



      console.log(repository);



      onRepositoryConfigured();



    } catch (error) {


      console.error(error);



      if (error instanceof Error) {

        alert(error.message);

      } else {

        alert("Unknown error");

      }



    } finally {

      setLoading(false);

    }

  }





  return (

    <div
      style={{
        width: "340px",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >


      <h2>
        🚀 Welcome to CodeVault
      </h2>



      <p
        style={{
          color:"#888",
        }}
      >
        Connected as
      </p>



      <strong
        style={{
          color:"#22c55e",
        }}
      >

        {username || "Loading..."} ✅

      </strong>





      <div
        style={{
          marginTop:"20px",
        }}
      >


        <button
          onClick={() => setMode("create")}
        >

          📦 Create New Repository

        </button>



        <button
          onClick={() => setMode("existing")}
          style={{
            marginLeft:"10px",
          }}
        >

          🔗 Existing Repository

        </button>


      </div>





      {mode === "create" && (

        <div
          style={{
            marginTop:"20px",
          }}
        >

          <label>
            Repository Name
          </label>


          <input

            value={repositoryName}

            onChange={(event) =>
              setRepositoryName(
                event.target.value
              )
            }


            style={{
              width:"100%",
              padding:"10px",
            }}

          />


        </div>

      )}







      {mode === "existing" && (

        <div
          style={{
            marginTop:"20px",
          }}
        >

          <label>
            Select Repository
          </label>



          <select

            value={selectedRepository}

            onChange={(event) =>
              setSelectedRepository(
                event.target.value
              )
            }


            style={{
              width:"100%",
              padding:"10px",
            }}

          >


            <option value="">
              Select repository
            </option>



            {repositories.map(
              (repo) => (

                <option
                  key={repo.id}
                  value={repo.name}
                >

                  {repo.name}

                </option>

              )
            )}


          </select>


        </div>

      )}







      <button

        onClick={handleContinue}

        disabled={loading}


        style={{

          marginTop:"20px",

          width:"100%",

          padding:"12px",

        }}

      >

        {loading
          ? "Please wait..."
          : "Continue →"
        }


      </button>



    </div>

  );

}