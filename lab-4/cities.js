(function () {
    "use strict";
  
    var CITY_CATALOG = [
      { id: "moscow",       name: "Москва",           country: "Россия",         lat: 55.7558, lon: 37.6176 },
      { id: "spb",          name: "Санкт-Петербург",  country: "Россия",         lat: 59.9375, lon: 30.3086 },
      { id: "novosibirsk",  name: "Новосибирск",      country: "Россия",         lat: 55.0084, lon: 82.9357 },
      { id: "yekaterinburg",name: "Екатеринбург",     country: "Россия",         lat: 56.8389, lon: 60.6057 },
      { id: "kazan",        name: "Казань",           country: "Россия",         lat: 55.7903, lon: 49.1125 },
      { id: "sochi",        name: "Сочи",             country: "Россия",         lat: 43.5855, lon: 39.7231 },
  
      { id: "london",       name: "Лондон",           country: "Великобритания", lat: 51.5074, lon: -0.1278 },
      { id: "paris",        name: "Париж",            country: "Франция",        lat: 48.8566, lon: 2.3522 },
      { id: "berlin",       name: "Берлин",           country: "Германия",       lat: 52.5200, lon: 13.4050 },
      { id: "helsinki",     name: "Хельсинки",        country: "Финляндия",      lat: 60.1699, lon: 24.9384 }
    ];
  
    /**
     * Returns shallow copy of the full catalog
     */
    function getCityCatalog() {
      return CITY_CATALOG.slice();
    }
  
    /**
     * Find city by internal string id
     */
    function findCityById(id) {
      if (!id) return null;
      for (var i = 0; i < CITY_CATALOG.length; i++) {
        if (CITY_CATALOG[i].id === id) return CITY_CATALOG[i];
      }
      return null;
    }
  
    /**
     * Find city by display name (case-insensitive)
     */
    function findCityByName(name) {
      if (!name) return null;
      var norm = String(name).toLowerCase();
      for (var i = 0; i < CITY_CATALOG.length; i++) {
        if (CITY_CATALOG[i].name.toLowerCase() === norm) {
          return CITY_CATALOG[i];
        }
      }
      return null;
    }
  
    /**
     * prefix-based suggestion search by name
     * Returns up to maxResults items
     */
    function findCitySuggestions(query, maxResults) {
      if (!query) return [];
      var norm = String(query).toLowerCase();
      var out = [];
      var i;
  
      // First pass: prefix match
      for (i = 0; i < CITY_CATALOG.length; i++) {
        var city = CITY_CATALOG[i];
        if (city.name.toLowerCase().indexOf(norm) === 0) {
          out.push(city);
        }
      }
  
      // Second pass: substring match if nothing found
      if (out.length === 0) {
        for (i = 0; i < CITY_CATALOG.length; i++) {
          var city2 = CITY_CATALOG[i];
          if (city2.name.toLowerCase().indexOf(norm) !== -1) {
            out.push(city2);
          }
        }
      }
  
      if (typeof maxResults === "number" && out.length > maxResults) {
        out = out.slice(0, maxResults);
      }
      return out;
    }
  
    // Exposing minimal API on window for app.js
    window.WEATHER_CITY_CATALOG = {
      getAll: getCityCatalog,
      findById: findCityById,
      findByName: findCityByName,
      suggest: findCitySuggestions
    };
  })();
  