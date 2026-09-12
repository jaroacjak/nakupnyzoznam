/*
=========================================
  FIREBASE NASTAVENIE
  Nákupný zoznam
=========================================
*/

console.log("Načítavam Firebase...");


/*
=========================================
  FIREBASE CONFIG
=========================================
*/

const firebaseConfig = {

  apiKey:
    "AIzaSyB5Gv-H-Sm8JKz9pqfN6hhbKYUlfVK4vzE",

  authDomain:
    "nakupnyzoznam-1a04e.firebaseapp.com",

  databaseURL:
    "https://nakupnyzoznam-1a04e-default-rtdb.firebaseio.com",

  projectId:
    "nakupnyzoznam-1a04e",

  storageBucket:
    "nakupnyzoznam-1a04e.firebasestorage.app",

  messagingSenderId:
    "307268915654",

  appId:
    "1:307268915654:web:7de04a52585181dd0fe2c7",

  measurementId:
    "G-VZR504GLW7"

};


/*
=========================================
  KONTROLA FIREBASE SDK
=========================================
*/

if(
  typeof firebase === "undefined"
){

  console.error(
    "Firebase SDK sa nepodarilo načítať!"
  );

}


/*
=========================================
  FIREBASE INITIALIZÁCIA
=========================================
*/

let firebaseApp = null;

let auth = null;

let databaseRef = null;


try{

  if(
    typeof firebase !== "undefined"
  ){

    if(
      firebase.apps &&
      firebase.apps.length
    ){

      firebaseApp =
        firebase.app();

    }else{

      firebaseApp =
        firebase.initializeApp(
          firebaseConfig
        );

    }


    /*
    ======================================
      FIREBASE AUTHENTICATION
    ======================================
    */

    auth =
      firebase.auth();


    /*
    ======================================
      FIREBASE REALTIME DATABASE
    ======================================
    */

    databaseRef =
      firebase.database();


    console.log(
      "Firebase je pripravený."
    );

  }

}catch(error){

  console.error(
    "CHYBA PRI INICIALIZÁCII FIREBASE:",
    error
  );

}


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

    if(!auth){

      return {

        success:false,

        message:
          "Firebase Authentication nie je dostupná."

      };

    }


    console.log(
      "Registrujem:",
      email
    );


    const result =
      await auth.createUserWithEmailAndPassword(
        email.trim(),
        password
      );


    const user =
      result.user;


    /*
    ======================================
      ULOŽENIE MENA
    ======================================
    */

    if(
      name &&
      name.trim()
    ){

      await user.updateProfile({

        displayName:
          name.trim()

      });

    }


    /*
    ======================================
      VYTVORENIE PROFILU V DATABÁZE
    ======================================
    */

    if(
      databaseRef &&
      user
    ){

      try{

        await databaseRef
          .ref(
            "users/" +
            user.uid +
            "/profile"
          )
          .set({

            uid:
              user.uid,

            email:
              user.email || "",

            name:
              name
                ? name.trim()
                : "",

            createdAt:
              firebase.database.ServerValue
                .TIMESTAMP

          });

      }catch(databaseError){

        console.error(
          "CHYBA PRI UKLADANÍ PROFILU:",
          databaseError
        );

      }

    }


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

    if(!auth){

      return {

        success:false,

        message:
          "Firebase Authentication nie je dostupná."

      };

    }


    console.log(
      "Prihlasujem:",
      email
    );


    const result =
      await auth.signInWithEmailAndPassword(
        email.trim(),
        password
      );


    const user =
      result.user;


    console.log(
      "Prihlásenie úspešné:",
      user
    );


    return {

      success:true,

      session:result,

      user:user

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

function getCurrentUser(){

  try{

    if(!auth){

      return null;

    }


    const user =
      auth.currentUser;


    if(user){

      console.log(
        "Prihlásený používateľ:",
        user.email
      );

      return user;

    }


    return null;


  }catch(error){

    console.error(
      "CHYBA PRI ZÍSKAVANÍ POUŽÍVATEĽA:",
      error
    );


    return null;

  }

}


/*
=========================================
  ČAKANIE NA FIREBASE AUTH
=========================================
*/

function waitForAuth(){

  return new Promise(
    resolve => {

      if(!auth){

        resolve(null);

        return;

      }


      let finished =
        false;


      let unsubscribe =
        null;


      const finish =
        user => {

          if(finished){

            return;

          }


          finished = true;


          if(
            typeof unsubscribe ===
            "function"
          ){

            unsubscribe();

          }


          resolve(
            user || null
          );

        };


      unsubscribe =
        auth.onAuthStateChanged(
          user => {

            finish(
              user
            );

          }
        );

    }
  );

}


/*
=========================================
  ODHLÁSENIE
=========================================
*/

async function logoutUser(){

  try{

    if(!auth){

      return {

        success:false,

        message:
          "Firebase Authentication nie je dostupná."

      };

    }


    await auth.signOut();


    console.log(
      "Používateľ bol odhlásený."
    );


    window.location.href =
      "index.html";


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
    getCurrentUser();


  if(user){

    return user;

  }


  const loadedUser =
    await waitForAuth();


  if(!loadedUser){

    console.log(
      "Neprihlásený používateľ."
    );


    window.location.href =
      "login.html";


    return null;

  }


  return loadedUser;

}


/*
=========================================
  KĽÚČ DATABÁZY POUŽÍVATEĽA
=========================================
*/

function getUserDatabaseKey(
  user
){

  if(
    user &&
    typeof user === "object" &&
    user.uid
  ){

    return (
      "nakupnyKalendár_" +
      user.uid
    );

  }


  if(
    typeof user === "string"
  ){

    return (
      "nakupnyKalendár_" +
      user
    );

  }


  return "nakupnyKalendár_neznamy";

}


/*
=========================================
  FIREBASE CESTA POUŽÍVATEĽA
=========================================
*/

function getUserDatabasePath(
  user
){

  const current =
    user ||
    getCurrentUser();


  if(
    current &&
    typeof current === "object" &&
    current.uid
  ){

    return (
      "users/" +
      current.uid +
      "/shopping"
    );

  }


  if(
    typeof current === "string"
  ){

    return (
      "users/" +
      current +
      "/shopping"
    );

  }


  return null;

}


/*
=========================================
  FIREBASE REFERENCE
=========================================
*/

function getUserDatabaseRef(
  user
){

  if(!databaseRef){

    return null;

  }


  const path =
    getUserDatabasePath(
      user
    );


  if(!path){

    return null;

  }


  return databaseRef.ref(
    path
  );

}


/*
=========================================
  ULOŽENIE DÁT DO FIREBASE
=========================================
*/

async function saveUserDatabase(
  data,
  user
){

  try{

    const ref =
      getUserDatabaseRef(
        user
      );


    if(!ref){

      return {

        success:false,

        message:
          "Firebase databáza nie je dostupná."

      };

    }


    await ref.set(
      data || {}
    );


    return {

      success:true

    };


  }catch(error){

    console.error(
      "CHYBA PRI UKLADANÍ DÁT:",
      error
    );


    return {

      success:false,

      message:
        getDatabaseErrorMessage(
          error
        )

    };

  }

}


/*
=========================================
  NAČÍTANIE DÁT Z FIREBASE
=========================================
*/

async function loadUserDatabaseFromFirebase(
  user
){

  try{

    const ref =
      getUserDatabaseRef(
        user
      );


    if(!ref){

      return {

        success:false,

        data:{},

        message:
          "Firebase databáza nie je dostupná."

      };

    }


    const snapshot =
      await ref.once(
        "value"
      );


    const data =
      snapshot.val();


    return {

      success:true,

      data:
        data || {}

    };


  }catch(error){

    console.error(
      "CHYBA PRI NAČÍTANÍ DÁT:",
      error
    );


    return {

      success:false,

      data:{},

      message:
        getDatabaseErrorMessage(
          error
        )

    };

  }

}


/*
=========================================
  REALTIME SYNCHRONIZÁCIA
=========================================
*/

function listenToUserDatabase(
  callback,
  user
){

  try{

    const ref =
      getUserDatabaseRef(
        user
      );


    if(!ref){

      console.error(
        "Nie je možné spustiť synchronizáciu."
      );

      return null;

    }


    const handler =
      snapshot => {

        const data =
          snapshot.val();


        if(
          typeof callback ===
          "function"
        ){

          callback(
            data || {}
          );

        }

      };


    ref.on(
      "value",
      handler
    );


    return {

      ref:ref,

      handler:handler

    };


  }catch(error){

    console.error(
      "CHYBA REALTIME SYNCHRONIZÁCIE:",
      error
    );


    return null;

  }

}


/*
=========================================
  VYPNUTIE SYNCHRONIZÁCIE
=========================================
*/

function stopUserDatabaseListener(
  listener
){

  try{

    if(
      !listener ||
      !listener.ref ||
      !listener.handler
    ){

      return;

    }


    listener.ref.off(
      "value",
      listener.handler
    );


  }catch(error){

    console.error(
      "CHYBA PRI VYPÍNANÍ SYNCHRONIZÁCIE:",
      error
    );

  }

}


/*
=========================================
  EMAIL POUŽÍVATEĽA
=========================================
*/

function getCurrentUserEmail(){

  const user =
    getCurrentUser();


  if(
    user &&
    user.email
  ){

    return user.email;

  }


  return "";

}


/*
=========================================
  MENO POUŽÍVATEĽA
=========================================
*/

function getCurrentUserName(){

  const user =
    getCurrentUser();


  if(
    user &&
    user.displayName
  ){

    return user.displayName;

  }


  if(
    user &&
    user.email
  ){

    return user.email;

  }


  return "";

}


/*
=========================================
  FIREBASE UID
=========================================
*/

function getCurrentUserId(){

  const user =
    getCurrentUser();


  if(
    user &&
    user.uid
  ){

    return user.uid;

  }


  return "";

}


/*
=========================================
  KONTROLA PRIHLÁSENIA
=========================================
*/

function isLoggedIn(){

  return !!getCurrentUser();

}


/*
=========================================
  SPRACOVANIE DATABASE CHÝB
=========================================
*/

function getDatabaseErrorMessage(
  error
){

  console.log(
    "Firebase Database Error Code:",
    error &&
    error.code
  );


  console.log(
    "Firebase Database Error Message:",
    error &&
    error.message
  );


  if(!error){

    return (
      "Nastala chyba databázy."
    );

  }


  if(
    error.code ===
    "PERMISSION_DENIED"
  ){

    return (
      "Firebase databáza nepovolila čítanie alebo zápis. Skontroluj pravidlá Realtime Database."
    );

  }


  if(
    error.code ===
    "NETWORK_ERROR"
  ){

    return (
      "Nepodarilo sa pripojiť k Firebase databáze."
    );

  }


  if(error.message){

    return error.message;

  }


  return (
    "Nastala chyba pri práci s databázou."
  );

}


/*
=========================================
  SPRACOVANIE AUTH CHÝB
=========================================
*/

function getErrorMessage(
  error
){

  console.log(
    "Firebase Error Code:",
    error &&
    error.code
  );


  console.log(
    "Firebase Error Message:",
    error &&
    error.message
  );


  if(!error){

    return (
      "Nastala neočakávaná chyba."
    );

  }


  if(
    error.code ===
    "auth/email-already-in-use"
  ){

    return (
      "Účet s týmto e-mailom už existuje."
    );

  }


  if(
    error.code ===
    "auth/invalid-email"
  ){

    return (
      "Zadaný e-mail nie je platný."
    );

  }


  if(
    error.code ===
    "auth/weak-password"
  ){

    return (
      "Heslo je príliš slabé."
    );

  }


  if(
    error.code ===
      "auth/invalid-credential" ||

    error.code ===
      "auth/wrong-password" ||

    error.code ===
      "auth/user-not-found"
  ){

    return (
      "Nesprávny e-mail alebo heslo."
    );

  }


  if(
    error.code ===
    "auth/user-disabled"
  ){

    return (
      "Tento účet bol deaktivovaný."
    );

  }


  if(
    error.code ===
    "auth/too-many-requests"
  ){

    return (
      "Príliš veľa pokusov. Skús to neskôr."
    );

  }


  if(
    error.code ===
      "auth/network-request-failed"
  ){

    return (
      "Nepodarilo sa pripojiť k Firebase. Skontroluj internetové pripojenie."
    );

  }


  if(
    error.code ===
    "auth/operation-not-allowed"
  ){

    return (
      "Prihlásenie e-mailom a heslom nie je vo Firebase povolené. Zapni Authentication → Sign-in method → Email/Password."
    );

  }


  if(
    error.code ===
    "auth/password-does-not-meet-requirements"
  ){

    return (
      "Heslo nespĺňa požiadavky Firebase."
    );

  }


  if(
    error.code ===
    "auth/requires-recent-login"
  ){

    return (
      "Táto operácia vyžaduje nové prihlásenie."
    );

  }


  if(error.message){

    return error.message;

  }


  return (
    "Nastala neočakávaná chyba."
  );

}


/*
=========================================
  FIREBASE AUTH STATE
=========================================
*/

if(auth){

  auth.onAuthStateChanged(
    user => {

      if(user){

        console.log(
          "Firebase AUTH: prihlásený",
          user.email
        );

      }else{

        console.log(
          "Firebase AUTH: neprihlásený"
        );

      }

    }
  );

}


/*
=========================================
  HOTOVO
=========================================
*/

console.log(
  "Firebase auth.js je pripravený."
);
