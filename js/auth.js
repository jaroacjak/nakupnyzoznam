/*
========================================
APPWRITE NASTAVENIA
========================================
*/

const APPWRITE_ENDPOINT =
  "https://fra.cloud.appwrite.io/v1";


const APPWRITE_PROJECT_ID =
  "6a9c24ee00187d95fe1d";


/*
========================================
VYTVOŘENIE APPWRITE CLIENTA
========================================
*/

const client =
  new Appwrite.Client();


client
  .setEndpoint(
    APPWRITE_ENDPOINT
  )
  .setProject(
    APPWRITE_PROJECT_ID
  );


/*
========================================
ACCOUNT
========================================
*/

const account =
  new Appwrite.Account(
    client
  );


/*
========================================
REGISTRÁCIA
========================================
*/

async function registerUser(
  name,
  email,
  password
){

  try{


    /*
     * Vytvorenie používateľa
     */

    const user =
      await account.create(

        Appwrite.ID.unique(),

        email,

        password,

        name

      );


    return {

      success:true,

      user:user

    };


  }catch(error){


    console.error(
      "Chyba registrácie:",
      error
    );


    return {

      success:false,

      message:
        error.message

    };

  }

}


/*
========================================
PRIHLÁSENIE
========================================
*/

async function loginUser(
  email,
  password
){

  try{


    /*
     * Vytvorenie email session
     */

    const session =
      await account.createEmailPasswordSession(

        email,

        password

      );


    return {

      success:true,

      session:session

    };


  }catch(error){


    console.error(
      "Chyba prihlásenia:",
      error
    );


    return {

      success:false,

      message:
        error.message

    };

  }

}


/*
========================================
AKTUÁLNY POUŽÍVATEĽ
========================================
*/

async function getCurrentUser(){

  try{


    const user =
      await account.get();


    return user;


  }catch(error){


    /*
     * Používateľ
     * nie je prihlásený
     */

    return null;

  }

}


/*
========================================
ODHLÁSENIE
========================================
*/

async function logoutUser(){

  try{


    await account.deleteSession(
      "current"
    );


    window.location.href =
      "index.html";


  }catch(error){


    console.error(
      "Chyba odhlásenia:",
      error
    );


    alert(
      "Nepodarilo sa odhlásiť."
    );

  }

}


/*
========================================
OCHRANA APP.HTML
========================================
*/

async function requireLogin(){

  const user =
    await getCurrentUser();


  if(!user){

    window.location.href =
      "login.html";


    return null;

  }


  return user;

}
