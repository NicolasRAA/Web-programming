(function () {
    "use strict";
  
    // So far:
    // - defining simple appState object
    // - waiting for DOMContentLoaded
    // - caching main root element
    // - basic geolocation flow -> success/error/unsupported
    // - status panel helper -> info/error/success
    // - wiring Refresh button (no HTTPcalls yet)
  
    var appState = {
      mainLocation: null,
      extraCities: [],
      weatherData: {},
      // simple runtime flag for geolocation state
      // "idle" | "pending" | "allowed" | "denied" | "unsupported"
      geoStatus: "idle"
    };
  
    // DOM cache (filled in start())
    var appRoot = null;
    var locationNoteEl = null;
    var statusPanelEl = null;
    var refreshBtn = null;
  
    /**
     * Helper update status panel with single message
     * type: "info" | "error" | "success"
     */
    function setStatusMessage(text, type) {
      if (!statusPanelEl) return;
  
      // cleaning previous content
      while (statusPanelEl.firstChild) {
        statusPanelEl.removeChild(statusPanelEl.firstChild);
      }
  
      var p = document.createElement("p");
      p.textContent = text;
      p.className = "status-message";
  
      if (type === "error") {
        p.className += " status-message--error";
      } else if (type === "success") {
        p.className += " status-message--success";
      } else {
        // default to info if unknown
        p.className += " status-message--info";
      }
  
      statusPanelEl.appendChild(p);
    }
  
    /**
     * Geolocation init:
     * - checking for support
     * - requesting current position
     * - updating appState + UI messages
     * Only gettingn cords, no HTTP requests yet
     */
    function initGeolocation() {
      if (!("geolocation" in navigator)) {
        appState.geoStatus = "unsupported";
  
        if (locationNoteEl) {
          locationNoteEl.textContent =
            "Браузер не поддерживает геолокацию. Укажите город вручную ниже.";
        }
  
        setStatusMessage(
          "Геолокация недоступна в этом браузере. Введите город вручную.",
          "error"
        );
        return;
      }
  
      appState.geoStatus = "pending";
      setStatusMessage(
        "Запрашиваем ваше текущее местоположение...",
        "info"
      );
  
      navigator.geolocation.getCurrentPosition(
        handleGeoSuccess,
        handleGeoError,
        {
          enableHighAccuracy: false,
          timeout: 8000
        }
      );
    }
  
    /**
     * Geolocation success handler
     * Stores cords in appState.mainLocation and updates UI (later 'll add API calls)
     */
    function handleGeoSuccess(position) {
      appState.geoStatus = "allowed";
  
      appState.mainLocation = {
        type: "geo",
        coords: {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        }
      };
  
      if (locationNoteEl) {
        locationNoteEl.textContent =
          "Текущее местоположение: геоданные получены.";
      }
  
      setStatusMessage(
        "Геолокация получена. Нажмите «Обновить», чтобы загрузить прогноз погоды (A bit latter will do it))).",
        "success"
      );
  
      console.log("Geolocation coords:", appState.mainLocation.coords);
    }
  
    /**
     * Geolocation error handler
     * Handles denied permission and other errors
     * Shows message that user should use manual city input
     */
    function handleGeoError(error) {
      appState.geoStatus = "denied";
  
      if (locationNoteEl) {
        locationNoteEl.textContent =
          "Доступ к геолокации отклонён или недоступен. Введите город вручную ниже.";
      }
  
      var msg =
        "Не удалось получить геолокацию. Введите город вручную ниже.";
  
      // PERMISSION_DENIED: user explicitly denied access
      if (
        error &&
        typeof error.code === "number" &&
        typeof error.PERMISSION_DENIED === "number" &&
        error.code === error.PERMISSION_DENIED
      ) {
        msg =
          "Вы отклонили доступ к геолокации. Введите город вручную ниже.";
      }
  
      setStatusMessage(msg, "error");
  
      console.warn("Geolocation error:", error);
    }
  
    /**
     * Click handler for update button
     * Logs action
     * Pozhe will trigger HTTP weather requests for current selection
     */
    function handleRefreshClick() {
      console.log(
        "Refresh click. Weather API calls will be wired here in next commits."
      );
  
      if (!appState.mainLocation && appState.geoStatus !== "pending") {
        setStatusMessage(
          "Сначала выберите город или настройте текущее местоположение, затем обновите прогноз.",
          "info"
        );
      }
    }
  
    /**
     * Entry point for app
     * Not modifying innerHTML – layout is written in HTML
     */
    function start() {
      appRoot = document.getElementById("app-root");
      if (!appRoot) {
        // Defensive check: if markup changes, failing loudly
        console.error("#app-root not found in DOM");
        return;
      }
  
      // Caching extra DOM elements 
      locationNoteEl = document.getElementById("location-note");
      statusPanelEl = document.getElementById("status-panel");
      refreshBtn = document.getElementById("refresh-btn");
  
      if (!statusPanelEl) {
        console.error("#status-panel not found in DOM");
      }
      if (!locationNoteEl) {
        console.error("#location-note not found in DOM");
      }
      if (!refreshBtn) {
        console.error("#refresh-btn not found in DOM");
      } else {
        // Wiring refresh button click
        refreshBtn.addEventListener("click", handleRefreshClick);
      }
  
      // logging that the app is alive
      console.log("Weather app initialized (layout + geolocation step).");
  
      // Start geolocation flow on first load
      initGeolocation();
    }
  
    // Bootstrapping: waiting for DOM to be ready, then starting app
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  })();
  