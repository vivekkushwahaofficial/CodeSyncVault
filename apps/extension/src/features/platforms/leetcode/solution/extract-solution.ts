import { SOLUTION_MESSAGE } from "./solution-message";


export async function extractSolution(
  document: Document,
): Promise<string> {

  void document;


  return new Promise((resolve) => {


    let resolved = false;



    const cleanup = () => {

      window.removeEventListener(
        "message",
        handler,
      );

    };



    const handler = (
      event: MessageEvent,
    ) => {


      if (
        event.data?.type !== SOLUTION_MESSAGE
      ) {

        return;

      }



      if (resolved) {

        return;

      }



      const solution =
        event.data.solution ?? "";



      if (!solution.trim()) {

        console.log(
          "CodeSyncVault: Empty solution received",
        );

        return;

      }



      resolved = true;


      cleanup();



      console.log(
        "CodeSyncVault: Solution received",
        solution.length,
      );



      resolve(solution);


    };



    window.addEventListener(
      "message",
      handler,
    );



    function requestSolution() {

      window.postMessage(

        {
          type:
            "CODEVAULT_REQUEST_SOLUTION",
        },

        "*",

      );

    }



    // First request
    requestSolution();



    // Retry because Monaco may load late
    const retryTimer =
      setInterval(() => {


        if (resolved) {

          clearInterval(
            retryTimer,
          );

          return;

        }


        requestSolution();


      }, 2000);



    setTimeout(() => {


      if (resolved) {

        return;

      }



      resolved = true;


      clearInterval(
        retryTimer,
      );



      cleanup();



      console.log(
        "CodeSyncVault: Solution extraction timeout",
      );



      resolve("");

    }, 30000);



  });

}