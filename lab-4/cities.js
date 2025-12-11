(function () {
    "use strict";
  
    var CITY_CATALOG = [
      { id: "moscow", name: "Москва", country: "Россия" },
      { id: "spb", name: "Санкт-Петербург", country: "Россия" },
      { id: "novosibirsk", name: "Новосибирск", country: "Россия" },
      { id: "yekaterinburg", name: "Екатеринбург", country: "Россия" },
      { id: "kazan", name: "Казань", country: "Россия" },
      { id: "sochi", name: "Сочи", country: "Россия" },
  
      { id: "london", name: "Лондон", country: "Великобритания" },
      { id: "paris", name: "Париж", country: "Франция" },
      { id: "berlin", name: "Берлин", country: "Германия" },
      { id: "helsinki", name: "Хельсинки", country: "Финляндия" }
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
  