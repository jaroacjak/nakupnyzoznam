/*
=========================================
  APPWRITE NASTAVENIE
=========================================
*/


console.log("Načítavam Appwrite...");


/*
=========================================
  KONTROLA SDK
=========================================
*/

if(typeof Appwrite === "undefined"){

  console.error(
    "Appwrite SDK sa nepodarilo načítať!"
  );

}



/*
=========================================
  APPWRITE CLIENT
=========================================
*/

const client =
  new Appwrite.Client();



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
  new Appwrite.Account(
    client
  );



console.log(
  "Appwrite je pripravený."
);



/*
=========================================
  REGISTRÁCIA
=========================================
*/

async function registerUser(
  email,
  name,
  password
){

  try{


    console.log(
      "Registrujem:",
      email
    );


    const user =
      await account.create(

        Appwrite.ID.unique(),

        email,

        password,

        name

      );



    console.log(
      "Registrácia úspešná:",
      user
    );


    return {

      success:true,

      user:user

    };


  }catch(error){


    console.error(
      "CHYBA REGISTRÁCIE:",
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


    console.log(
      "Prihlasujem:",
      email
    );


    /*
      Vytvorenie session
    */

    const session =
      await account.createEmailPasswordSession(
        email,
        password
      );



    console.log(
      "Prihlásenie úspešné:",
      session
    );


    return {

      success:true,

      session:session

    };


  }catch(error){


    console.error(
      "CHYBA PRIHLÁSENIA:",
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


    console.log(
      "Prihlásený používateľ:",
      user
    );


    return user;


  }catch(error){


    /*
      Toto nie je vážna chyba.

      Znamená to iba,
      že používateľ nie je prihlásený.
    */

    console.log(
      "Používateľ nie je prihlásený."
    );


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


    await account.deleteSession(
      "current"
    );


    console.log(
      "Používateľ bol odhlásený."
    );


    return {

      success:true

    };


  }catch(error){


    console.error(
      "CHYBA ODHLÁSENIA:",
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
*/

async function requireLogin(){


  const user =
    await getCurrentUser();



  if(!user){


    console.log(
      "Neprihlásený používateľ."
    );


    window.location.href =
      "login.html";


    return null;


  }



  return user;


}



/*
=========================================
  SPRACOVANIE CHÝB
=========================================
*/

function getErrorMessage(error){


  console.log(
    "Appwrite Error Code:",
    error.code
  );


  console.log(
    "Appwrite Error Message:",
    error.message
  );



  /*
    Účet už existuje
  */

  if(error.code === 409){

    return (
      "Účet s týmto e-mailom už existuje."
    );

  }



  /*
    Nesprávne heslo
  */

  if(error.code === 401){

    return (
      "Nesprávny e-mail alebo heslo."
    );

  }



  /*
    Neplatné údaje
  */

  if(error.code === 400){

    return (
      error.message ||
      "Skontroluj zadané údaje."
    );

  }



  /*
    Chyba siete
  */

  if(
    error.message &&
    error.message.toLowerCase()
      .includes("fetch")
  ){

    return (
      "Načítanie zlyhalo. Skontroluj internetové pripojenie."
    );

  }



  /*
    Iná chyba
  */

  if(error.message){

    return error.message;

  }



  return (
    "Nastala neočakávaná chyba."
  );


}
