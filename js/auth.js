/*
========================================
APPWRITE KONFIGURÁCIA
========================================
*/

const APPWRITE_ENDPOINT =
  "https://fra.cloud.appwrite.io/v1";

const APPWRITE_PROJECT_ID =
  "6a9c24ee00187d95fe1d";


/*
========================================
APPWRITE CLIENT
========================================
*/

const client =
  new Appwrite.Client();

client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);


/*
========================================
APPWRITE ACCOUNT
========================================
*/

const account =
  new Appwrite.Account(client);


/*
========================================
REGISTRÁCIA NOVÉHO POUŽÍVATEĽA
========================================
*/

async function registerUser(name, email, password){

  try{

    const user =
      await account.create({

        userId: Appwrite.ID.unique(),

        email: email,

        password: password,

        name: name

      });


    return {
      success: true,
      user: user
    };


  }catch(error){

    console.error(
      "Chyba registrácie:",
      error
    );


    return {
      success: false,
      message: error.message
    };

  }

}


/*
========================================
PRIHLÁSENIE
========================================
*/

async function loginUser(email, password){

  try{

    const session =
      await account.createEmailPasswordSession({

        email: email,

        password: password

      });


    return {
      success: true,
      session: session
    };


  }catch(error){

    console.error(
      "Chyba prihlásenia:",
      error
    );


    return {
      success: false,
      message: error.message
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

    await account.deleteSession({
      sessionId: "current"
    });


    window.location.href =
      "index.html";


  }catch(error){

    console.error(error);

    alert(
      "Nepodarilo sa odhlásiť."
    );

  }

}


/*
========================================
OCHRANA STRÁNKY APP.HTML
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
