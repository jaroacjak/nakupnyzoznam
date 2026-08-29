/* =========================================
   APP.JS
   Nákupný kalendár
========================================= */


/* =========================================
   OBCHODY
========================================= */

const STORES = [

  "Lidl",
  "Kaufland",
  "Tesco",
  "Billa",
  "COOP Jednota",
  "Terno",
  "Penny",
  "Iné"

];


/* =========================================
   PRIHLÁSENÝ POUŽÍVATEĽ
========================================= */

let currentUser =
  getCurrentUser();

let currentDate = null;

let currentStore = null;

let database = {};


/* =========================================
   KONTROLA PRIHLÁSENIA
========================================= */

if(
  !requireLogin()
){

  throw new Error(
    "Používateľ nie je prihlásený."
  );

}


/* =========================================
   NAČÍTANIE DATABÁZY
========================================= */

function loadUserDatabase(){

  const key =
    getUserDatabaseKey(
      currentUser
    );


  try{

    database =
      JSON.parse(
        localStorage.getItem(
          key
        ) || "{}"
      );

  }catch(error){

    database = {};

  }

}


/* =========================================
   ULOŽENIE
========================================= */

function save(){

  if(!currentUser){

    return;

  }


  const key =
    getUserDatabaseKey(
      currentUser
    );


  localStorage.setItem(
    key,
    JSON.stringify(
      database
    )
  );

}


/* =========================================
   FORMÁT DÁTUMU
========================================= */

function formatDate(date){

  return new Intl.DateTimeFormat(
    "sk-SK",
    {
      weekday:"long",
      day:"numeric",
      month:"long",
      year:"numeric"
    }
  ).format(
    new Date(
      date +
      "T12:00:00"
    )
  );

}


function shortDate(date){

  return new Intl.DateTimeFormat(
    "sk-SK",
    {
      day:"numeric",
      month:"numeric",
      year:"numeric"
    }
  ).format(
    new Date(
      date +
      "T12:00:00"
    )
  );

}


/* =========================================
   VYTVORENIE DÁTUMU
========================================= */

function ensureDate(date){

  if(!database[date]){

    database[date] = {};

  }


  STORES.forEach(
    store => {

      if(
        !Array.isArray(
          database[date][store]
        )
      ){

        database[date][store] = [];

      }

    }
  );

}


/* =========================================
   PRIDAŤ DÁTUM
========================================= */

function addDate(){

  const input =
    document.getElementById(
      "newDate"
    );


  const date =
    input.value;


  if(!date){

    input.focus();

    return;

  }


  ensureDate(
    date
  );


  save();

  openDate(
    date
  );

}


/* =========================================
   ZOBRAZENIE DÁTUMOV
========================================= */

function showDates(){

  currentDate = null;

  currentStore = null;


  document
    .getElementById(
      "shoppingPage"
    )
    .classList.add(
      "hidden"
    );


  document
    .getElementById(
      "datesPage"
    )
    .classList.remove(
      "hidden"
    );


  renderDates();

}


/* =========================================
   OTVORENIE DÁTUMU
========================================= */

function openDate(date){

  ensureDate(
    date
  );


  currentDate =
    date;


  currentStore =
    localStorage.getItem(
      "poslednyObchod_" +
      currentUser
    ) || "Lidl";


  if(
    !STORES.includes(
      currentStore
    )
  ){

    currentStore =
      "Lidl";

  }


  document
    .getElementById(
      "datesPage"
    )
    .classList.add(
      "hidden"
    );


  document
    .getElementById(
      "shoppingPage"
    )
    .classList.remove(
      "hidden"
    );


  document
    .getElementById(
      "selectedDate"
    )
    .textContent =
      "📅 " +
      formatDate(
        date
      );


  renderStores();

  renderItems();

}


/* =========================================
   ÚPRAVA DÁTUMU
========================================= */

function editDate(date){

  const value =
    prompt(
      "Uprav dátum (RRRR-MM-DD):",
      date
    );


  if(
    value === null ||
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ){

    return;

  }


  if(
    value === date
  ){

    return;

  }


  if(
    database[value]
  ){

    alert(
      "Tento dátum už existuje."
    );

    return;

  }


  database[value] =
    database[date];


  delete database[date];


  save();

  renderDates();

}


/* =========================================
   VYMAZANIE DÁTUMU
========================================= */

function deleteDate(date){

  if(
    confirm(
      "Naozaj chceš vymazať tento dátum a všetky jeho nákupy?"
    )
  ){

    delete database[date];

    save();

    renderDates();

  }

}


/* =========================================
   ZOBRAZENIE DÁTUMOV
========================================= */

function renderDates(){

  const el =
    document.getElementById(
      "dateList"
    );


  const dates =
    Object.keys(
      database
    )
    .sort()
    .reverse();


  if(!dates.length){

    el.innerHTML =

      '<div class="empty">' +

      'Zatiaľ nemáš žiadny nákupný zoznam.' +

      '<br>' +

      'Vyber dátum a pridaj ho.' +

      '</div>';

    return;

  }


  el.innerHTML =
    dates
      .map(
        date => {

          const total =
            STORES.reduce(
              (
                sum,
                store
              ) =>

                sum +
                (
                  database[date][store]
                  || []
                ).length,

              0
            );


          const bought =
            STORES.reduce(
              (
                sum,
                store
              ) =>

                sum +
                (
                  database[date][store]
                  || []
                ).filter(
                  x =>
                    x.done
                ).length,

              0
            );


          return `

          <div class="date-row">

            <div
              class="date-info"
              onclick="openDate('${date}')"
            >

              <strong>
                📅 ${formatDate(date)}
              </strong>

              <div class="meta">

                ${total}
                položiek •

                ${bought}
                kúpených

              </div>

            </div>


            <div class="actions">

              <button
                class="primary"
                onclick="openDate('${date}')"
              >
                Otvoriť
              </button>


              <button
                class="secondary"
                onclick="editDate('${date}')"
              >
                ✏️
              </button>


              <button
                class="danger"
                onclick="deleteDate('${date}')"
              >
                🗑️
              </button>

            </div>

          </div>

          `;

        }
      )
      .join("");

}


/* =========================================
   OBCHODY
========================================= */

function renderStores(){

  const el =
    document.getElementById(
      "stores"
    );


  el.innerHTML =
    STORES
      .map(
        store => `

        <button
          class="store ${
            store === currentStore
              ? "active"
              : ""
          }"

          onclick=
            "selectStore('${store}')"
        >

          ${store}

        </button>

        `
      )
      .join("");


  document
    .getElementById(
      "shopTitle"
    )
    .textContent =
      "🛍️ Nákup v obchode: " +
      currentStore;

}


/* =========================================
   VÝBER OBCHODU
========================================= */

function selectStore(store){

  currentStore =
    store;


  localStorage.setItem(
    "poslednyObchod_" +
    currentUser,

    store
  );


  ensureDate(
    currentDate
  );


  save();

  renderStores();

  renderItems();

}


/* =========================================
   PRIDAŤ POLOŽKU
========================================= */

function addItem(){

  const nameInput =
    document.getElementById(
      "itemName"
    );


  const qtyInput =
    document.getElementById(
      "itemQty"
    );


  const name =
    nameInput.value.trim();


  const qty =
    Math.max(
      1,
      parseInt(
        qtyInput.value
      ) || 1
    );


  if(!name){

    nameInput.focus();

    return;

  }


  database
    [currentDate]
    [currentStore]
    .push({

      id:
        Date.now() +
        Math.random(),

      name:
        name,

      quantity:
        qty,

      done:
        false

    });


  save();


  nameInput.value = "";

  qtyInput.value = 1;


  renderItems();

  nameInput.focus();

}


/* =========================================
   ZMENA MNOŽSTVA
========================================= */

function changeQty(
  id,
  change
){

  const item =
    findItem(
      id
    );


  if(!item){

    return;

  }


  item.quantity =
    Math.max(
      1,
      item.quantity +
      change
    );


  save();

  renderItems();

}


/* =========================================
   OZNAČENIE KÚPENÉ
========================================= */

function toggleItem(id){

  const item =
    findItem(
      id
    );


  if(!item){

    return;

  }


  item.done =
    !item.done;


  save();

  renderItems();

}


/* =========================================
   ÚPRAVA POLOŽKY
========================================= */

function editItem(id){

  const item =
    findItem(
      id
    );


  if(!item){

    return;

  }


  const newName =
    prompt(
      "Uprav názov položky:",
      item.name
    );


  if(
    newName === null
  ){

    return;

  }


  const name =
    newName.trim();


  if(!name){

    return;

  }


  const newQty =
    prompt(
      "Uprav počet kusov:",
      item.quantity
    );


  if(
    newQty === null
  ){

    return;

  }


  const qty =
    Math.max(
      1,
      parseInt(
        newQty
      ) || 1
    );


  item.name =
    name;


  item.quantity =
    qty;


  save();

  renderItems();

}


/* =========================================
   VYMAZANIE POLOŽKY
========================================= */

function deleteItem(id){

  database
    [currentDate]
    [currentStore] =

    database
      [currentDate]
      [currentStore]
      .filter(
        item =>
          item.id !== id
      );


  save();

  renderItems();

}


/* =========================================
   VYMAZANIE KÚPENÝCH
========================================= */

function clearBought(){

  database
    [currentDate]
    [currentStore] =

    database
      [currentDate]
      [currentStore]
      .filter(
        item =>
          !item.done
      );


  save();

  renderItems();

}


/* =========================================
   NÁJDENIE POLOŽKY
========================================= */

function findItem(id){

  return database
    [currentDate]
    [currentStore]
    .find(
      item =>
        item.id === id
    );

}


/* =========================================
   ZOBRAZENIE POLOŽIEK
========================================= */

function renderItems(){

  const items =
    database
      [currentDate]
      [currentStore]
      || [];


  const list =
    document.getElementById(
      "itemList"
    );


  if(!items.length){

    list.innerHTML =

      '<div class="empty">' +

      'V tomto obchode zatiaľ nič nemáš.' +

      '</div>';

  }else{

    list.innerHTML =
      items
        .map(
          item => `

          <div
            class="item ${
              item.done
                ? "done"
                : ""
            }"
          >

            <input
              type="checkbox"

              ${
                item.done
                  ? "checked"
                  : ""
              }

              onchange=
                "toggleItem(${item.id})"
            >


            <span class="item-name">

              ${escapeHtml(
                item.name
              )}

            </span>


            <div class="qty">

              <button
                onclick=
                  "changeQty(${item.id},-1)"
              >
                −
              </button>


              <b>
                ${item.quantity}
              </b>


              <button
                onclick=
                  "changeQty(${item.id},1)"
              >
                +
              </button>

            </div>


            <button
              class="edit-item"

              onclick=
                "editItem(${item.id})"
            >
              ✏️
            </button>


            <button
              class="delete-item"

              onclick=
                "deleteItem(${item.id})"
            >
              🗑️
            </button>

          </div>

          `
        )
        .join("");

  }


  const bought =
    items.filter(
      x =>
        x.done
    ).length;


  document
    .getElementById(
      "itemCount"
    )
    .textContent =

      `${items.length} položiek • ` +
      `${bought} kúpených`;

}


/* =========================================
   OCHRANA HTML
========================================= */

function escapeHtml(text){

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    text;


  return div.innerHTML;

}


/* =========================================
   ODHLÁSENIE
========================================= */

function logout(){

  logoutUser();

}


/* =========================================
   ENTER – NÁZOV
========================================= */

document
  .getElementById(
    "itemName"
  )
  .addEventListener(
    "keydown",
    event => {

      if(
        event.key ===
        "Enter"
      ){

        addItem();

      }

    }
  );


/* =========================================
   ENTER – MNOŽSTVO
========================================= */

document
  .getElementById(
    "itemQty"
  )
  .addEventListener(
    "keydown",
    event => {

      if(
        event.key ===
        "Enter"
      ){

        addItem();

      }

    }
  );


/* =========================================
   SPUSTENIE
========================================= */

loadUserDatabase();


const userElement =
  document.getElementById(
    "currentUser"
  );


if(userElement){

  userElement.textContent =
    currentUser;

}


const shoppingUser =
  document.getElementById(
    "shoppingUser"
  );


if(shoppingUser){

  shoppingUser.textContent =
    currentUser;

}


const today =
  new Date()
    .toISOString()
    .slice(
      0,
      10
    );


const dateInput =
  document.getElementById(
    "newDate"
  );


if(dateInput){

  dateInput.value =
    today;

}


renderDates();
