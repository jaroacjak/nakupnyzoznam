/* =====================================================
   js/map.js
   Mapa + moja poloha + najbližšie obchody
===================================================== */

let map = null;
let userMarker = null;
let storeMarkers = [];

let userLatitude = null;
let userLongitude = null;


/* =====================================================
   NASTAVENIA
===================================================== */

const SEARCH_RADIUS = 5000;

const ALLOWED_STORES = [
  "Lidl",
  "COOP Jednota",
  "Kaufland"
];


/* =====================================================
   SPUSTENIE MAPY
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function(){

    const mapElement =
      document.getElementById("map");

    if(!mapElement){
      return;
    }

    initMap();

  }
);


/* =====================================================
   VYTVORENIE MAPY
===================================================== */

function initMap(){

  map =
    L.map("map").setView(
      [48.7164, 18.5903],
      8
    );


  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom:19,

      attribution:
        '&copy; OpenStreetMap contributors'
    }
  ).addTo(map);


  /*
   * Kliknutie na mapu
   */

  map.on(
    "click",
    function(event){

      console.log(
        "Kliknutie na mapu:",
        event.latlng.lat,
        event.latlng.lng
      );

    }
  );

}


/* =====================================================
   MOJA POLOHA
===================================================== */

function mojaPoloha(){

  if(!navigator.geolocation){

    alert(
      "Tento prehliadač nepodporuje určovanie polohy."
    );

    return;
  }


  /*
   * Prehliadač zobrazí používateľovi
   * otázku na povolenie polohy.
   */

  navigator.geolocation.getCurrentPosition(

    function(position){

      userLatitude =
        position.coords.latitude;

      userLongitude =
        position.coords.longitude;


      showUserLocation(
        userLatitude,
        userLongitude
      );


      findNearbyStores(
        userLatitude,
        userLongitude
      );

    },


    function(error){

      let message =
        "Nepodarilo sa získať tvoju polohu.";


      if(
        error.code ===
        error.PERMISSION_DENIED
      ){

        message =
          "Prístup k polohe nebol povolený.";

      }


      if(
        error.code ===
        error.POSITION_UNAVAILABLE
      ){

        message =
          "Poloha momentálne nie je dostupná.";

      }


      if(
        error.code ===
        error.TIMEOUT
      ){

        message =
          "Získanie polohy trvalo príliš dlho.";

      }


      alert(message);

    },

    {
      enableHighAccuracy:true,

      timeout:10000,

      maximumAge:60000
    }

  );

}


/* =====================================================
   ZOBRAZENIE POUŽÍVATEĽA
===================================================== */

function showUserLocation(
  latitude,
  longitude
){

  if(!map){
    return;
  }


  if(userMarker){

    map.removeLayer(
      userMarker
    );

  }


  userMarker =
    L.marker(
      [
        latitude,
        longitude
      ]
    )
    .addTo(map)
    .bindPopup(
      "📍 Tvoja poloha"
    );


  userMarker.openPopup();


  map.setView(
    [
      latitude,
      longitude
    ],
    14
  );

}


/* =====================================================
   VYHĽADANIE OBCHODOV
===================================================== */

async function findNearbyStores(
  latitude,
  longitude
){

  showMapMessage(
    "🔎 Hľadám obchody v okolí..."
  );


  /*
   * Overpass vyhľadá:
   *
   * Lidl
   * COOP Jednota
   * Kaufland
   * a ďalšie obchody
   *
   * v okolí používateľa.
   */

  const query = `

[out:json][timeout:25];

(
  node
    ["shop"="supermarket"]
    (around:${SEARCH_RADIUS},${latitude},${longitude});

  way
    ["shop"="supermarket"]
    (around:${SEARCH_RADIUS},${latitude},${longitude});

  relation
    ["shop"="supermarket"]
    (around:${SEARCH_RADIUS},${latitude},${longitude});

  node
    ["name"~"Lidl|Kaufland|COOP",i]
    (around:${SEARCH_RADIUS},${latitude},${longitude});

  way
    ["name"~"Lidl|Kaufland|COOP",i]
    (around:${SEARCH_RADIUS},${latitude},${longitude});

);

out center tags;

`;


  try{

    const response =
      await fetch(
        "https://overpass-api.de/api/interpreter",
        {
          method:"POST",

          headers:{
            "Content-Type":
              "text/plain;charset=UTF-8"
          },

          body:query
        }
      );


    if(!response.ok){

      throw new Error(
        "Overpass API error"
      );

    }


    const data =
      await response.json();


    const stores =
      processStores(
        data.elements || [],
        latitude,
        longitude
      );


    displayStores(
      stores
    );


  }catch(error){

    console.error(
      error
    );


    showMapMessage(
      "❌ Obchody sa nepodarilo načítať."
    );

  }

}


/* =====================================================
   SPRACOVANIE OBCHODOV
===================================================== */

function processStores(
  elements,
  userLat,
  userLng
){

  const result = [];

  const used = new Set();


  elements.forEach(
    element => {

      const tags =
        element.tags || {};


      let name =
        tags.name || "";


      /*
       * Ak objekt nemá názov,
       * preskočíme ho.
       */

      if(!name){
        return;
      }


      /*
       * Niektoré obchody môžu mať
       * centrum uložené vo way.
       */

      let latitude =
        element.lat;

      let longitude =
        element.lon;


      if(
        latitude === undefined &&
        element.center
      ){

        latitude =
          element.center.lat;

        longitude =
          element.center.lon;

      }


      if(
        latitude === undefined ||
        longitude === undefined
      ){

        return;

      }


      /*
       * Vyberieme iba relevantné
       * potravinové/supermarketové obchody.
       */

      const normalizedName =
        name.toLowerCase();


      const isKnownStore =
        normalizedName.includes("lidl") ||
        normalizedName.includes("kaufland") ||
        normalizedName.includes("coop") ||
        normalizedName.includes("jednota");


      const isSupermarket =
        tags.shop ===
        "supermarket";


      if(
        !isKnownStore &&
        !isSupermarket
      ){

        return;

      }


      /*
       * Určenie značky.
       */

      let brand =
        detectBrand(name);


      /*
       * Vzdialenosť.
       */

      const distance =
        calculateDistance(
          userLat,
          userLng,
          latitude,
          longitude
        );


      /*
       * Odstránenie duplicít.
       */

      const key =
        name.toLowerCase() +
        "_" +
        latitude.toFixed(5) +
        "_" +
        longitude.toFixed(5);


      if(
        used.has(key)
      ){

        return;

      }


      used.add(key);


      result.push({

        id:
          element.id,

        name:
          name,

        brand:
          brand,

        lat:
          latitude,

        lng:
          longitude,

        distance:
          distance,

        address:
          createAddress(tags)

      });

    }
  );


  /*
   * Najbližšie obchody prvé.
   */

  result.sort(
    function(a,b){

      return (
        a.distance -
        b.distance
      );

    }
  );


  /*
   * Maximálne 30 výsledkov.
   */

  return result.slice(
    0,
    30
  );

}


/* =====================================================
   ROZPOZNANIE ZNAČKY
===================================================== */

function detectBrand(
  name
){

  const value =
    name.toLowerCase();


  if(
    value.includes("lidl")
  ){

    return "Lidl";

  }


  if(
    value.includes("kaufland")
  ){

    return "Kaufland";

  }


  if(
    value.includes("coop") ||
    value.includes("jednota")
  ){

    return "COOP Jednota";

  }


  return name;

}


/* =====================================================
   ADRESA
===================================================== */

function createAddress(
  tags
){

  const parts = [];


  if(tags["addr:street"]){

    parts.push(
      tags["addr:street"]
    );

  }


  if(tags["addr:housenumber"]){

    parts.push(
      tags["addr:housenumber"]
    );

  }


  if(tags["addr:city"]){

    parts.push(
      tags["addr:city"]
    );

  }


  return parts.join(
    " "
  );

}


/* =====================================================
   VZDIALENOSŤ
===================================================== */

function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2
){

  const R =
    6371000;


  const dLat =
    degreesToRadians(
      lat2 - lat1
    );


  const dLon =
    degreesToRadians(
      lon2 - lon1
    );


  const a =
    Math.sin(
      dLat / 2
    ) *
    Math.sin(
      dLat / 2
    ) +

    Math.cos(
      degreesToRadians(lat1)
    ) *

    Math.cos(
      degreesToRadians(lat2)
    ) *

    Math.sin(
      dLon / 2
    ) *
    Math.sin(
      dLon / 2
    );


  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1-a)
    );


  return R * c;

}


function degreesToRadians(
  degrees
){

  return (
    degrees *
    Math.PI /
    180
  );

}


/* =====================================================
   FORMÁT VZDIALENOSTI
===================================================== */

function formatDistance(
  meters
){

  if(
    meters < 1000
  ){

    return (
      Math.round(meters) +
      " m"
    );

  }


  return (
    (meters / 1000)
      .toFixed(1) +
    " km"
  );

}


/* =====================================================
   ZOBRAZENIE OBCHODOV
===================================================== */

function displayStores(
  stores
){

  clearStoreMarkers();


  if(!stores.length){

    showMapMessage(
      "😕 V okolí sa nenašli žiadne obchody."
    );

    return;

  }


  const bounds =
    [];


  stores.forEach(
    store => {

      const marker =
        L.marker(
          [
            store.lat,
            store.lng
          ]
        )
        .addTo(map);


      const popup = `

        <div>

          <strong>
            🛒 ${escapeMapHtml(store.name)}
          </strong>

          <br>

          📏
          ${formatDistance(store.distance)}

          ${
            store.address
              ? `<br>
                 📍 ${escapeMapHtml(store.address)}`
              : ""
          }

          <br><br>

          <button
            onclick="selectNearbyStore('${encodeURIComponent(
              JSON.stringify(store)
            )}')"
          >
            ⭐ Vybrať obchod
          </button>

        </div>

      `;


      marker.bindPopup(
        popup
      );


      storeMarkers.push(
        marker
      );


      bounds.push(
        [
          store.lat,
          store.lng
        ]
      );

    }
  );


  if(
    userLatitude !== null &&
    userLongitude !== null
  ){

    bounds.push(
      [
        userLatitude,
        userLongitude
      ]
    );

  }


  if(
    bounds.length
  ){

    map.fitBounds(
      bounds,
      {
        padding:[30,30]
      }
    );

  }


  showMapMessage(
    `🛒 Nájdilo sa ${stores.length} obchodov v okolí.`
  );

}


/* =====================================================
   VÝBER OBCHODU
===================================================== */

function selectNearbyStore(
  encodedStore
){

  try{

    const store =
      JSON.parse(
        decodeURIComponent(
          encodedStore
        )
      );


    /*
     * Uložíme vybraný obchod
     * používateľovi.
     */

    saveSelectedStore(
      store
    );


    showMapMessage(
      "⭐ Vybraný obchod: " +
      store.name
    );


    /*
     * Ak existuje tvoja funkcia
     * selectStore() z app.js,
     * nastavíme aj obchod v nákupnom
     * zozname.
     */

    if(
      typeof selectStore ===
      "function"
    ){

      const supportedStores = [
        "Lidl",
        "COOP Jednota",
        "Kaufland"
      ];


      if(
        supportedStores.includes(
          store.brand
        )
      ){

        selectStore(
          store.brand
        );

      }

    }


  }catch(error){

    console.error(
      error
    );

  }

}


/* =====================================================
   ULOŽENIE VYBRANÉHO OBCHODU
===================================================== */

function saveSelectedStore(
  store
){

  const user =
    typeof getCurrentUser ===
    "function"
      ? getCurrentUser()
      : null;


  if(!user){

    return;

  }


  const key =
    "vybranyObchod_" +
    user;


  localStorage.setItem(
    key,
    JSON.stringify(
      store
    )
  );

}


/* =====================================================
   VYMAZANIE MARKEROV
===================================================== */

function clearStoreMarkers(){

  storeMarkers.forEach(
    marker => {

      if(map){

        map.removeLayer(
          marker
        );

      }

    }
  );


  storeMarkers = [];

}


/* =====================================================
   SPRÁVA
===================================================== */

function showMapMessage(
  message
){

  const element =
    document.getElementById(
      "selectedStore"
    );


  if(element){

    element.textContent =
      message;

  }

}


/* =====================================================
   OCHRANA HTML
===================================================== */

function escapeMapHtml(
  text
){

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    text;


  return div.innerHTML;

}
