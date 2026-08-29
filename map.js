/* =====================================================
   js/map.js
   MAPA + MOJA POLOHA
===================================================== */

let map = null;
let userMarker = null;
let accuracyCircle = null;


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

  /*
   * Začiatok mapy = celé Slovensko
   */

  map = L.map("map").setView(
    [48.669, 19.699],
    7
  );


  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom:19,

      attribution:
        "&copy; OpenStreetMap contributors"
    }
  ).addTo(map);

}


/* =====================================================
   MOJA POLOHA
===================================================== */

function mojaPoloha(){

  /*
   * Prehliadač musí požiadať používateľa
   * o povolenie GPS.
   */

  if(!navigator.geolocation){

    alert(
      "Tento prehliadač nepodporuje určovanie polohy."
    );

    return;
  }


  const info =
    document.getElementById(
      "mapInfo"
    );


  if(info){

    info.textContent =
      "📍 Zisťujem tvoju polohu...";

  }


  navigator.geolocation.getCurrentPosition(

    /*
     * ÚSPECH
     */

    function(position){

      const latitude =
        position.coords.latitude;

      const longitude =
        position.coords.longitude;

      const accuracy =
        position.coords.accuracy;


      console.log(
        "Moja poloha:",
        latitude,
        longitude
      );


      /*
       * Presun mapy na používateľa.
       */

      map.setView(
        [
          latitude,
          longitude
        ],
        15
      );


      /*
       * Ak už marker existuje,
       * odstránime ho.
       */

      if(userMarker){

        map.removeLayer(
          userMarker
        );

      }


      /*
       * Marker používateľa.
       */

      userMarker =
        L.marker(
          [
            latitude,
            longitude
          ]
        )
        .addTo(map)
        .bindPopup(
          "📍 <b>Tvoja poloha</b>"
        );


      userMarker.openPopup();


      /*
       * Kruh presnosti GPS.
       */

      if(accuracyCircle){

        map.removeLayer(
          accuracyCircle
        );

      }


      accuracyCircle =
        L.circle(
          [
            latitude,
            longitude
          ],
          {
            radius:accuracy
          }
        )
        .addTo(map);


      if(info){

        info.textContent =
          "📍 Tvoja poloha bola nájdená.";

      }


      /*
       * Po získaní polohy môžeme
       * vyhľadať obchody.
       */

      if(
        typeof findNearbyStores ===
        "function"
      ){

        findNearbyStores(
          latitude,
          longitude
        );

      }

    },


    /*
     * CHYBA
     */

    function(error){

      console.error(
        "GPS chyba:",
        error
      );


      let message =
        "Nepodarilo sa získať polohu.";


      if(
        error.code ===
        error.PERMISSION_DENIED
      ){

        message =
          "❌ Prístup k polohe bol zamietnutý. Povoľ polohu pre túto stránku v prehliadači.";

      }


      if(
        error.code ===
        error.POSITION_UNAVAILABLE
      ){

        message =
          "❌ Poloha momentálne nie je dostupná.";

      }


      if(
        error.code ===
        error.TIMEOUT
      ){

        message =
          "❌ Získanie polohy trvalo príliš dlho.";

      }


      if(info){

        info.textContent =
          message;

      }


      alert(message);

    },


    /*
     * NASTAVENIA GPS
     */

    {
      enableHighAccuracy:true,

      timeout:15000,

      maximumAge:0
    }

  );

}


/* =====================================================
   ZOBRAZENIE SLOVENSKA
===================================================== */

function showSlovakia(){

  if(!map){
    return;
  }


  map.setView(
    [48.669, 19.699],
    7
  );


  const info =
    document.getElementById(
      "mapInfo"
    );


  if(info){

    info.textContent =
      "🇸🇰 Zobrazené je celé Slovensko.";

  }

}


/* =====================================================
   VYHĽADANIE OBCHODOV
===================================================== */

async function findNearbyStores(
  latitude,
  longitude
){

  /*
   * Ak súradnice neprišli,
   * použijeme aktuálnu GPS polohu.
   */

  if(
    latitude === undefined ||
    longitude === undefined
  ){

    if(
      !navigator.geolocation
    ){

      return;

    }


    navigator.geolocation.getCurrentPosition(
      function(position){

        findNearbyStores(
          position.coords.latitude,
          position.coords.longitude
        );

      }
    );


    return;

  }


  const radius =
    5000;


  const query = `

[out:json][timeout:25];

(
  node["shop"](around:${radius},${latitude},${longitude});
  way["shop"](around:${radius},${latitude},${longitude});
  relation["shop"](around:${radius},${latitude},${longitude});
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
        "Overpass chyba"
      );

    }


    const data =
      await response.json();


    showStores(
      data.elements || [],
      latitude,
      longitude
    );


  }catch(error){

    console.error(
      error
    );


    const info =
      document.getElementById(
        "mapInfo"
      );


    if(info){

      info.textContent =
        "⚠️ Obchody sa momentálne nepodarilo načítať.";

    }

  }

}


/* =====================================================
   ZOBRAZENIE OBCHODOV
===================================================== */

function showStores(
  elements,
  userLat,
  userLng
){

  /*
   * Odstránime staré markery obchodov.
   */

  if(window.storeMarkers){

    window.storeMarkers.forEach(
      marker => map.removeLayer(marker)
    );

  }


  window.storeMarkers = [];


  elements.forEach(
    function(element){

      const tags =
        element.tags || {};


      const name =
        tags.name;


      if(!name){
        return;
      }


      let lat =
        element.lat;

      let lng =
        element.lon;


      if(
        lat === undefined &&
        element.center
      ){

        lat =
          element.center.lat;

        lng =
          element.center.lon;

      }


      if(
        lat === undefined ||
        lng === undefined
      ){

        return;

      }


      const marker =
        L.marker(
          [lat,lng]
        )
        .addTo(map);


      marker.bindPopup(
        `
          <strong>🛒 ${escapeMapHtml(name)}</strong>
          <br><br>
          <button onclick="vybratObchod('${escapeMapHtml(name)}')">
            Vybrať obchod
          </button>
        `
      );


      window.storeMarkers.push(
        marker
      );

    }
  );


  const info =
    document.getElementById(
      "mapInfo"
    );


  if(info){

    info.textContent =
      "🛒 Obchody v okolí sú zobrazené na mape.";

  }

}


/* =====================================================
   VÝBER OBCHODU
===================================================== */

function vybratObchod(
  name
){

  localStorage.setItem(
    "vybranyObchod",
    name
  );


  const selected =
    document.getElementById(
      "selectedMapStore"
    );


  if(selected){

    selected.style.display =
      "block";

    selected.innerHTML =
      "⭐ Vybraný obchod: <b>" +
      escapeMapHtml(name) +
      "</b>";

  }

}


/* =====================================================
   OCHRANA TEXTU
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
