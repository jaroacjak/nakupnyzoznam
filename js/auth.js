/*
=========================================
  APPWRITE NASTAVENIE
=========================================
*/


const {
  Client,
  Account,
  ID
} = Appwrite;



/*
=========================================
  CLIENT
=========================================
*/

const client = new Client();


client
  .setEndpoint(
    "https://fra.cloud.appwrite.io/v1"
  )
  .setProject(
    "6a9c24ee00187d95fe1d"
  );



/*
=========================================
  ACCOUNT
=========================================
*/

const account =
  new Account(client);



/*
=========================================
  REGISTRÁCIA
=========================================

  email
  password
*/

async function registerUser(
  email,
  name,
  password
){

  try{


    const user =

      await account.create(
        ID.unique(),
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
        getErrorMessage(error)

    };


  }

}



/*
=========================================
  PRIHLÁSENIE
=========================================
*/

async function loginUser(
  email,
  password
){

  try{


    /*
      Vytvorenie e-mailovej session
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
        getErrorMessage(error)

    };


  }

}



/*
=========================================
  AKTUÁLNY POUŽÍVATEĽ
=========================================
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
=========================================
  ODHLÁSENIE
=========================================
*/

async function logoutUser(){

  try{


    /*
      Vymažeme aktuálnu session
    */

    await account.deleteSession(
      "current"
    );


    return {

      success:true

    };


  }catch(error){


    console.error(
      "Chyba odhlásenia:",
      error
    );


    return {

      success:false,

      message:
        getErrorMessage(error)

    };


  }

}



/*
=========================================
  OCHRANA APP.HTML
=========================================

  Ak používateľ nie je prihlásený,
  presmeruje ho na login.html.
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



/*
=========================================
  SPRÁVY CHÝB
=========================================
*/

function getErrorMessage(error){


  /*
    Účet už existuje
  */

  if(
    error.code === 409
  ){

    return "Účet s týmto e-mailom už existuje.";

  }



  /*
    Nesprávne údaje
  */

  if(
    error.code === 401
  ){

    return "Nesprávny e-mail alebo heslo.";

  }



  /*
    Príliš krátke heslo
  */

  if(
    error.code === 400
  ){

    return (
      error.message ||
      "Skontroluj zadané údaje."
    );

  }



  /*
    Internet alebo Appwrite
  */

  if(
    error.message
  ){

    return error.message;

  }



  return (
    "Nastala neočakávaná chyba."
  );


}
