(function () {
    "use strict";
  
    // So far:
    // - defining simple appState object
    // - waiting for DOMContentLoaded
    // - caching main root element
  
    var appState = {
      mainLocation: null,
      extraCities: [],
      weatherData: {}
    };
  
    // DOM cache (filled in start())
    var appRoot = null;
  
    /**
     * Entry point for app
     * Not modifying innerHTML – layout is written in HTML
     */
    function start() {
      appRoot = document.getElementById("app-root");
      if (!appRoot) {
        // Defensive check: if markup changes, failing loudly
        console.error("[lab-4] #app-root not found in DOM");
        return;
      }
  
      // logging that the app is alive
      console.log("[lab-4] Weather app initialized (layout-only step).");
    }
  
    // Bootstrapping: waiting for DOM to be ready, then starting app
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  })();
  