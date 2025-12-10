(function () {
    "use strict";
  
    // Poka:
    // - basic appState container
    // - entry point that waits for DOMContentLoaded
    // Real logic Iñll add later
  
    var appState = {
      mainLocation: null,
      extraCities: [],
      weatherData: {}
    };
  
    // DOM cache (filled in start())
    var appRoot = null;
  
    /**
     * Entry point for app
     * caching root element
     * rendering simple placeholder
     */
    function start() {
      appRoot = document.getElementById("app-root");
      if (!appRoot) {
        // Defensive check: if markup changes, failing loudly
        console.error("[lab-4] #app-root not found in DOM");
        return;
      }
  
      // Later replace with real weather UI
      renderPlaceholder();
    }
  
    /**
     * to see something on the page
     */
    function renderPlaceholder() {
      appRoot.innerHTML = "";
  
      var p = document.createElement("p");
      p.className = "app-placeholder";
      p.textContent =
        "Здесь будет интерфейс приложения прогноза погоды. " +
        "Следующие коммиты добавят разметку, логику и работу с API.";
      appRoot.appendChild(p);
    }
  
    // Bootstrapping: waiting for DOM to be ready, then starting app
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  })();
  