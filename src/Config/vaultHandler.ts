// const vault = Vault({

//     apiVersion: "v1",

//     endpoint: "http://127.0.0.1:8200", // Replace with your Vault server URL

//     token: "hvs.ChfjZq5vwPEK0D4DufU03BYD", // Replace with your Vault access token

//   });

  //make sure that vault is installed and running

  // use the following commands to set data in vault

  // vault kv put -mount=secret kc username=xxxxxx

  // vault kv put -mount=secret kc password=xxxxxx

// secret path secret/data/kc

  // Example: Read a secret from Vault

//   vault.read("secret/data/kc")

//     .then((result) => {

//       const secretData = result.data;

//       console.log("Vault secret data:", secretData);

      //const username = secretData.data.username

      //const password = secretData.data.password

      // use them in kc credentials

    //   Logger.info("Vault secret data retrieved successfully")

 

    // })

    // .catch((err) => {

    // Logger.error(`Error reading secret from Vault: ${err.message}`)

    //   console.error("Error reading secret from Vault:", err);

    // });