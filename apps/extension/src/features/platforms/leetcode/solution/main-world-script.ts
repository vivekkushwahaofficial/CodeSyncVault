import { SOLUTION_MESSAGE } from "./solution-message";


console.log(
  "CodeSyncVault Main World: Waiting for solution request",
);



window.addEventListener(
  "message",
  (event) => {


    console.log(
      "Main world received message:",
      event.data,
    );



    if (
      event.data?.type !== "CODEVAULT_REQUEST_SOLUTION"
    ) {

      return;

    }



    const model =
      window.monaco
        ?.editor
        ?.getModels()
        ?.[0];



    console.log(
      "Monaco model:",
      model,
    );



    const solution =
      model?.getValue() ?? "";



    console.log(
      "Solution length:",
      solution.length,
    );



    window.postMessage(

      {
        type: SOLUTION_MESSAGE,

        solution,

      },

      "*",

    );


  },
);