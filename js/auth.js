/* =========================================
   AUTH.JS
   Prihlásenie / registrácia / odhlásenie
========================================= */


/* =========================================
   KONŠTANTY
========================================= */

const USERS_KEY =
  "nakupnyPouzivateliaV1";

const SESSION_KEY =
  "nakupnyPrihlasenyV1";

const DATABASE_PREFIX =
  "nakupnyKalendárV2_";


/* =========================================
   POUŽÍVATELIA
========================================= */

function getUsers(){

  try{

    return JSON.parse(
      localStorage.getItem(
        USERS_KEY
      ) || "{}"
    );

  }catch(error){

    return {};

  }

}


function saveUsers(users){

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(users)
  );

}


/* =========================================
   AKTUÁLNY POUŽÍVATEĽ
========================================= */

function getCurrentUser(){

  return localStorage.getItem(
    SESSION_KEY
  );

}


function isLoggedIn(){

  const email =
    getCurrentUser();

  if(!email){

    return false;

  }

  const users =
    getUsers();

  return !!users[email];

}


/* =========================================
   DATABÁZA POUŽÍVATEĽA
========================================= */

function getUserDatabaseKey(email){

  return DATABASE_PREFIX +
    email;

}


function createUserDatabase(email){

  const key =
    getUserDatabaseKey(email);

  if(
    !localStorage.getItem(key)
  ){

    localStorage.setItem(
      key,
      JSON.stringify({})
    );

  }

}


/* =========================================
   PRIHLÁSENIE
========================================= */

function loginUser(
  email,
  password
){

  email =
    email
      .trim()
      .toLowerCase();


  const users =
    getUsers();


  if(!users[email]){

    return {
      success:false,
      message:
        "Účet s týmto e-mailom neexistuje."
    };

  }


  if(
    users[email].password !==
    password
  ){

    return {
      success:false,
      message:
        "Nesprávne heslo."
    };

  }


  localStorage.setItem(
    SESSION_KEY,
    email
  );


  createUserDatabase(
    email
  );


  return {
    success:true
  };

}


/* =========================================
   REGISTRÁCIA
========================================= */

function registerUser(
  email,
  password,
  password2
){

  email =
    email
      .trim()
      .toLowerCase();


  /* Kontrola e-mailu */

  if(!email){

    return {
      success:false,
      message:
        "Zadaj e-mail."
    };

  }


  /* Kontrola hesla */

  if(password.length < 6){

    return {
      success:false,
      message:
        "Heslo musí mať aspoň 6 znakov."
    };

  }


  /* Kontrola hesiel */

  if(password !== password2){

    return {
      success:false,
      message:
        "Heslá sa nezhodujú."
    };

  }


  const users =
    getUsers();


  /* Existujúci účet */

  if(users[email]){

    return {
      success:false,
      message:
        "Účet s týmto e-mailom už existuje."
    };

  }


  /* Vytvorenie účtu */

  users[email] = {

    email:email,

    password:password

  };


  saveUsers(
    users
  );


  /* Vytvorenie databázy */

  createUserDatabase(
    email
  );


  /* Automatické prihlásenie */

  localStorage.setItem(
    SESSION_KEY,
    email
  );


  return {
    success:true
  };

}


/* =========================================
   ODHLÁSENIE
========================================= */

function logoutUser(){

  localStorage.removeItem(
    SESSION_KEY
  );

  window.location.href =
    "login.html";

}


/* =========================================
   OCHRANA APP.HTML
========================================= */

function requireLogin(){

  if(!isLoggedIn()){

    window.location.href =
      "login.html";

    return false;

  }

  return true;

}


/* =========================================
   OCHRANA LOGIN / REGISTER
========================================= */

function redirectIfLoggedIn(){

  if(isLoggedIn()){

    window.location.href =
      "app.html";

    return true;

  }

  return false;

}
