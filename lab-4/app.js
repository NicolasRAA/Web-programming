(function () {
  "use strict";

  // So far:
  // - defining simple appState object
  // - waiting for DOMContentLoaded
  // - caching main root element
  // - basic geolocation flow -> success/error/unsupported
  // - status panel helper -> info/error/success
  // - wiring Refresh button (no HTTPcalls yet)
  // - basic city form wiring + suggestions dropdown (no HTTP yet)
  // - rendering city list (main location + extra cities)
  // - basic weather HTTP request (open-meteo) for current selection
  // - rendering simple 3-day forecast cards (today + 2 days)

  var appState = {
    mainLocation: null,
    extraCities: [],
    weatherData: {},
    // simple runtime flag for geolocation state
    // "idle" | "pending" | "allowed" | "denied" | "unsupported"
    geoStatus: "idle",
    // which location is currently selected for forecast
    // { kind: "geo" } or { kind: "city", cityId: string }
    currentSelection: null,
    // basic http state flags
    isLoading: false,
    lastError: null
  };

  // DOM cache (filled in start())
  var appRoot = null;
  var locationNoteEl = null;
  var statusPanelEl = null;
  var refreshBtn = null;
  var forecastContainerEl = null;

  // City-related DOM (filled in start())
  var cityFormEl = null;
  var cityInputEl = null;
  var cityErrorEl = null;
  var suggestionsListEl = null;
  var cityListEl = null;
  var cityFieldWrapperEl = null; // wrapper around input + dropdown

  // City catalog API from cities.js
  var cityCatalog = null;

  var EMPTY_CITY_LIST_TEXT =
    "Пока пусто. После настройки геолокации или добавления города они появятся в этом списке";

  // Simple config for open-meteo API
  var WEATHER_API_BASE = "https://api.open-meteo.com/v1/forecast";

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
   * Helper for city input error message (under the input field)
   */
  function setCityError(message) {
    if (!cityErrorEl) return;
    cityErrorEl.textContent = message || "";
  }

  /**
   * Hiding suggestions dropdown and clearing its items
   */
  function hideSuggestions() {
    if (!suggestionsListEl) return;
    while (suggestionsListEl.firstChild) {
      suggestionsListEl.removeChild(suggestionsListEl.firstChild);
    }
    suggestionsListEl.classList.remove("suggestions-list--open");
  }

  /**
   * Creating click handler for suggestion item
   * Keeping city reference via closure (tak avoids var-loop issues)
   */
  function createSuggestionClickHandler(city) {
    return function (evt) {
      // Using mousedown/click handler to prevent blur issues on mobile
      evt.preventDefault();
      if (!cityInputEl) return;
      // put just plain city name into the input
      cityInputEl.value = city.name;
      // remembering chosen city id on the input element
      cityInputEl.setAttribute("data-city-id", city.id);
      hideSuggestions();
      setCityError("");
    };
  }

  /**
   * Render suggestions list for given query using cityCatalog.suggest
   */
  function showSuggestionsForQuery(query) {
    if (!suggestionsListEl || !cityCatalog) return;

    var trimmed = query ? query.trim() : "";
    if (trimmed.length < 2) {
      hideSuggestions();
      return;
    }

    var suggestions = cityCatalog.suggest(trimmed, 8);
    if (!suggestions || !suggestions.length) {
      hideSuggestions();
      return;
    }

    // clearing old items
    while (suggestionsListEl.firstChild) {
      suggestionsListEl.removeChild(suggestionsListEl.firstChild);
    }

    for (var i = 0; i < suggestions.length; i++) {
      var city = suggestions[i];
      var li = document.createElement("li");
      li.textContent = city.name + " (" + city.country + ")";
      li.setAttribute("data-city-id", city.id);
      li.addEventListener("mousedown", createSuggestionClickHandler(city));
      suggestionsListEl.appendChild(li);
    }

    suggestionsListEl.classList.add("suggestions-list--open");
  }

  /**
   * Input handler for city text field
   * Updates suggestions dropdown while the user types
   */
  function handleCityInput(event) {
    setCityError("");

    // Any manual typing resets explicit selected city id
    if (cityInputEl) {
      cityInputEl.removeAttribute("data-city-id");
    }

    var value = event.target.value || "";
    showSuggestionsForQuery(value);
  }

  /**
   * Click handler for document:
   * hides suggestions when clicking outside of city input block
   */
  function handleDocumentClick(evt) {
    if (!cityFieldWrapperEl || !suggestionsListEl) return;
    if (!cityFieldWrapperEl.contains(evt.target)) {
      hideSuggestions();
    }
  }

  /**
   * Helper: is geo location currently selected
   */
  function isGeoSelected() {
    return (
      appState.currentSelection &&
      appState.currentSelection.kind === "geo"
    );
  }

  /**
   * Helper: is specific cityId currently selected
   */
  function isCitySelected(cityId) {
    return (
      appState.currentSelection &&
      appState.currentSelection.kind === "city" &&
      appState.currentSelection.cityId === cityId
    );
  }

  /**
   * Find city by id in our current "state" (mainLocation as city + extraCities)
   */
  function findCityInStateById(cityId) {
    if (!cityId) return null;

    var i;
    for (i = 0; i < appState.extraCities.length; i++) {
      if (appState.extraCities[i].id === cityId) {
        return appState.extraCities[i];
      }
    }

    if (
      appState.mainLocation &&
      appState.mainLocation.type === "city" &&
      appState.mainLocation.cityId === cityId
    ) {
      return {
        id: appState.mainLocation.cityId,
        name: appState.mainLocation.name,
        country: appState.mainLocation.country
      };
    }

    return null;
  }

  /**
   * Update currentSelection and refresh city list + status message
   */
  function setCurrentSelection(selection) {
    appState.currentSelection = selection;

    renderCityList();

    var msg = null;

    if (!selection) {
      msg =
        "Выберите город или текущее местоположение, чтобы увидеть прогноз.";
    } else if (selection.kind === "geo") {
      msg =
        "Выбрано текущее местоположение. Нажмите «Обновить», чтобы загрузить прогноз.";
    } else if (selection.kind === "city") {
      var city = findCityInStateById(selection.cityId);
      if (city) {
        msg =
          'Выбран город: "' +
          city.name +
          '". Нажмите «Обновить», чтобы загрузить прогноз.';
      }
    }

    if (msg) {
      setStatusMessage(msg, "info");
    }
  }

  /**
   * Remove city from extraCities by id
   * If was current selection, fallback to mainLocation (if exists)
   */
  function removeExtraCity(cityId) {
    var beforeLen = appState.extraCities.length;

    appState.extraCities = appState.extraCities.filter(function (city) {
      return city.id !== cityId;
    });

    if (beforeLen === appState.extraCities.length) {
      // nothing actually removed
      return;
    }

    // If we removed current selected city, fall back
    if (
      appState.currentSelection &&
      appState.currentSelection.kind === "city" &&
      appState.currentSelection.cityId === cityId
    ) {
      if (appState.mainLocation) {
        if (appState.mainLocation.type === "geo") {
          appState.currentSelection = { kind: "geo" };
        } else {
          appState.currentSelection = {
            kind: "city",
            cityId: appState.mainLocation.cityId
          };
        }
      } else {
        appState.currentSelection = null;
      }
    }

    renderCityList();
    setStatusMessage("Город удалён из списка.", "info");
  }

  /**
   * Create handler for "Выбрать" button for extra city via closure
   */
  function createSelectCityHandler(cityId) {
    return function () {
      setCurrentSelection({ kind: "city", cityId: cityId });
    };
  }

  /**
   * Create handler for "Удалить" button for extra city | closure
   */
  function createDeleteCityHandler(cityId) {
    return function () {
      removeExtraCity(cityId);
    };
  }

  /**
   * Render left column list: current location + extra cities
   */
  function renderCityList() {
    if (!cityListEl) return;

    while (cityListEl.firstChild) {
      cityListEl.removeChild(cityListEl.firstChild);
    }

    var hasAny = false;

    // Main location entry (geo or city)
    if (appState.mainLocation) {
      hasAny = true;

      var mainLi = document.createElement("li");
      mainLi.className = "city-list-item";

      var isActive = false;
      if (appState.mainLocation.type === "geo") {
        isActive = isGeoSelected();
      } else if (appState.mainLocation.type === "city") {
        isActive = isCitySelected(appState.mainLocation.cityId);
      }

      if (isActive) {
        mainLi.className += " city-list-item--active";
      }

      var infoDiv = document.createElement("div");
      var nameSpan = document.createElement("span");
      nameSpan.className = "city-name";

      if (appState.mainLocation.type === "geo") {
        nameSpan.textContent = "Текущее местоположение";
      } else {
        nameSpan.textContent = appState.mainLocation.name;
      }

      var tagSpan = document.createElement("span");
      tagSpan.className = "city-tag";

      if (appState.mainLocation.type === "geo") {
        tagSpan.textContent = "по геолокации";
      } else {
        tagSpan.textContent = "основной город";
      }

      infoDiv.appendChild(nameSpan);
      infoDiv.appendChild(document.createElement("br"));
      infoDiv.appendChild(tagSpan);

      var actionsDiv = document.createElement("div");
      actionsDiv.className = "city-list-item-buttons";

      if (isActive) {
        var currentTag = document.createElement("span");
        currentTag.className = "city-tag";
        currentTag.textContent = "текущий";
        actionsDiv.appendChild(currentTag);
      } else {
        var selectBtn = document.createElement("button");
        selectBtn.type = "button";
        selectBtn.className = "btn btn-secondary";
        selectBtn.textContent = "Выбрать";

        selectBtn.addEventListener("click", function () {
          if (appState.mainLocation.type === "geo") {
            setCurrentSelection({ kind: "geo" });
          } else {
            setCurrentSelection({
              kind: "city",
              cityId: appState.mainLocation.cityId
            });
          }
        });

        actionsDiv.appendChild(selectBtn);
      }

      mainLi.appendChild(infoDiv);
      mainLi.appendChild(actionsDiv);
      cityListEl.appendChild(mainLi);
    }

    // Extra cities list
    if (appState.extraCities && appState.extraCities.length) {
      hasAny = true;

      for (var i = 0; i < appState.extraCities.length; i++) {
        var city = appState.extraCities[i];

        var li = document.createElement("li");
        li.className = "city-list-item";
        if (isCitySelected(city.id)) {
          li.className += " city-list-item--active";
        }

        var info = document.createElement("div");
        var name = document.createElement("span");
        name.className = "city-name";
        name.textContent = city.name;

        var tag = document.createElement("span");
        tag.className = "city-tag";
        tag.textContent = "дополнительный город";

        info.appendChild(name);
        info.appendChild(document.createElement("br"));
        info.appendChild(tag);

        var buttons = document.createElement("div");
        buttons.className = "city-list-item-buttons";

        var selectCityBtn = document.createElement("button");
        selectCityBtn.type = "button";
        selectCityBtn.className = "btn btn-secondary";
        selectCityBtn.textContent = "Выбрать";
        selectCityBtn.addEventListener(
          "click",
          createSelectCityHandler(city.id)
        );

        var deleteCityBtn = document.createElement("button");
        deleteCityBtn.type = "button";
        deleteCityBtn.className = "btn btn-secondary";
        deleteCityBtn.textContent = "Удалить";
        deleteCityBtn.addEventListener(
          "click",
          createDeleteCityHandler(city.id)
        );

        buttons.appendChild(selectCityBtn);
        buttons.appendChild(deleteCityBtn);

        li.appendChild(info);
        li.appendChild(buttons);
        cityListEl.appendChild(li);
      }
    }

    if (!hasAny) {
      var emptyLi = document.createElement("li");
      emptyLi.className = "city-list-empty";
      emptyLi.textContent = EMPTY_CITY_LIST_TEXT;
      cityListEl.appendChild(emptyLi);
    }
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

    // set geo as current selection by default
    appState.currentSelection = { kind: "geo" };

    if (locationNoteEl) {
      locationNoteEl.textContent =
        "Текущее местоположение: геоданные получены.";
    }

    setStatusMessage(
      "Геолокация получена. Нажмите «Обновить», чтобы загрузить прогноз погоды.",
      "success"
    );

    renderCityList();

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
   * Small helper: clearing forecast container before rendering new cards
   */
  function clearForecast() {
    if (!forecastContainerEl) return;
    while (forecastContainerEl.firstChild) {
      forecastContainerEl.removeChild(forecastContainerEl.firstChild);
    }
  }

  /**
   * Helper: building open-meteo URL for given coordinates
   * Requesting daily max/min temp and weather code for 3 days
   */
  function buildForecastUrl(lat, lon) {
    var params = [
      "latitude=" + encodeURIComponent(lat),
      "longitude=" + encodeURIComponent(lon),
      "daily=temperature_2m_max,temperature_2m_min,weathercode",
      "timezone=auto",
      "forecast_days=3"
    ];
    return WEATHER_API_BASE + "?" + params.join("&");
  }

  /**
   * Helper: describing open-meteo weather code in simple text po russki
   */
  function describeWeatherCode(code) {
    if (code === 0) return "Ясно";
    if (code === 1 || code === 2 || code === 3) return "Переменная облачность";
    if (code === 45 || code === 48) return "Туман / иней";
    if (code === 51 || code === 53 || code === 55) return "Морось";
    if (code === 61 || code === 63 || code === 65) return "Дождь";
    if (code === 66 || code === 67) return "Ледяной дождь";
    if (code === 71 || code === 73 || code === 75) return "Снегопад";
    if (code === 77) return "Снежные зерна";
    if (code === 80 || code === 81 || code === 82) return "Ливневый дождь";
    if (code === 95) return "Гроза";
    if (code === 96 || code === 99) return "Гроза с градом";
    return "Погода: код " + code;
  }

  /**
   * Helper: displaying title for day index (0..2) with small hint
   */
  function formatDayTitle(dateStr, index) {
    if (index === 0) return "Сегодня (" + dateStr + ")";
    if (index === 1) return "Завтра (" + dateStr + ")";
    if (index === 2) return "Послезавтра (" + dateStr + ")";
    return dateStr;
  }

  /**
   * Render simple 3-day forecast cards from open-meteo response
   */
  function renderForecastFromResponse(data) {
    if (!forecastContainerEl) return;

    clearForecast();

    if (
      !data ||
      !data.daily ||
      !data.daily.time ||
      !data.daily.temperature_2m_max ||
      !data.daily.temperature_2m_min
    ) {
      setStatusMessage(
        "Не удалось разобрать ответ сервера погоды.",
        "error"
      );
      return;
    }

    var times = data.daily.time;
    var tMax = data.daily.temperature_2m_max;
    var tMin = data.daily.temperature_2m_min;
    var codes = data.daily.weathercode || [];

    var totalDays = times.length;
    var limit = totalDays < 3 ? totalDays : 3; // at least today + 2 if available

    for (var i = 0; i < limit; i++) {
      var card = document.createElement("article");
      card.className = "forecast-card";

      var titleEl = document.createElement("h3");
      titleEl.className = "forecast-day-title";
      titleEl.textContent = formatDayTitle(times[i], i);

      var tempEl = document.createElement("p");
      tempEl.className = "forecast-temp";
      tempEl.textContent =
        "от " +
        Math.round(tMin[i]) +
        "°C до " +
        Math.round(tMax[i]) +
        "°C";

      var descEl = document.createElement("p");
      descEl.className = "forecast-desc";
      var code = typeof codes[i] === "number" ? codes[i] : null;
      if (code !== null) {
        descEl.textContent = describeWeatherCode(code);
      } else {
        descEl.textContent = "Описание погоды недоступно.";
      }

      card.appendChild(titleEl);
      card.appendChild(tempEl);
      card.appendChild(descEl);

      forecastContainerEl.appendChild(card);
    }
  }

  /**
   * Helper: geting coordinates object { lat, lon } for current selection
   * For geo -> taking from appState.mainLocation.coords
   * For city -> takign from cityCatalog (where lat/lon)
   */
  function getCoordsForSelection(selection) {
    if (!selection) return null;

    if (selection.kind === "geo") {
      if (
        appState.mainLocation &&
        appState.mainLocation.type === "geo" &&
        appState.mainLocation.coords
      ) {
        return {
          lat: appState.mainLocation.coords.lat,
          lon: appState.mainLocation.coords.lon
        };
      }
      return null;
    }

    if (selection.kind === "city") {
      if (!cityCatalog || !cityCatalog.findById) return null;
      var city = cityCatalog.findById(selection.cityId);
      if (!city) return null;
      if (typeof city.lat !== "number" || typeof city.lon !== "number") {
        return null;
      }
      return { lat: city.lat, lon: city.lon };
    }

    return null;
  }

  /**
   * Performing HTTP request to open-meteo for current selection
   * and rendering forecast cards
   */
  function fetchForecastForSelection() {
    if (!appState.currentSelection) {
      setStatusMessage(
        "Сначала выберите город или текущее местоположение, затем обновите прогноз.",
        "info"
      );
      return;
    }

    var coords = getCoordsForSelection(appState.currentSelection);
    if (!coords) {
      setStatusMessage(
        "Не удалось определить координаты для выбранного города.",
        "error"
      );
      return;
    }

    var url = buildForecastUrl(coords.lat, coords.lon);

    appState.isLoading = true;
    appState.lastError = null;
    clearForecast();

    // Showing simple loading state through status panel
    setStatusMessage("Загружаем прогноз погоды...", "info");

    fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        appState.isLoading = false;
        appState.weatherData = data;

        setStatusMessage("Прогноз обновлён.", "success");
        renderForecastFromResponse(data);
      })
      .catch(function (error) {
        appState.isLoading = false;
        appState.lastError = String(error);
        setStatusMessage(
          "Ошибка при загрузке прогноза. Попробуйте ещё раз позже.",
          "error"
        );
        console.error("Weather API error:", error);
      });
  }

  /**
   * Click handler for update button
   * Logs action and checks that some location is selected
   * Pozhe will trigger HTTP weather requests for current selection
   */
  function handleRefreshClick() {
    console.log(
      "Refresh click. Will request weather for selection:",
      appState.currentSelection
    );

    if (!appState.currentSelection) {
      setStatusMessage(
        "Сначала выберите город или текущее местоположение, затем обновите прогноз.",
        "info"
      );
      return;
    }

    if (appState.isLoading) {
      // Basic guard against parallel requests
      setStatusMessage(
        "Запрос уже выполняется, подождите завершения.",
        "info"
      );
      return;
    }

    fetchForecastForSelection();
  }

  /**
   * Submit handler for city form
   * Validating city name and adds it to state (as main or extra)
   */
  function handleCityFormSubmit(evt) {
    evt.preventDefault();
    if (!cityInputEl || !cityCatalog) return;

    var raw = cityInputEl.value;
    var name = raw ? raw.trim() : "";

    if (!name) {
      setCityError("Введите название города.");
      hideSuggestions();
      return;
    }

    // Try to resolve city:
    // by explicit data-city-id set from suggestions
    // or by exact name (case-insensitive) in catalog
    var selectedId = cityInputEl.getAttribute("data-city-id");
    var city = null;

    if (selectedId) {
      city = cityCatalog.findById(selectedId);
    }
    if (!city) {
      city = cityCatalog.findByName(name);
    }

    if (!city) {
      setCityError(
        "Город не найден. Выберите город из списка подсказок."
      );
      hideSuggestions();
      return;
    }

    // Duplicate check: already main city?
    if (
      appState.mainLocation &&
      appState.mainLocation.type === "city" &&
      appState.mainLocation.cityId === city.id
    ) {
      setCityError("Этот город уже выбран как основной.");
      hideSuggestions();
      return;
    }

    // Duplicate check: already extra city?
    var existsInExtra = appState.extraCities.some(function (c) {
      return c.id === city.id;
    });
    if (existsInExtra) {
      setCityError("Этот город уже есть в списке.");
      hideSuggestions();
      return;
    }

    // If there no mainLocation yet (or geolocation denied/unsupported)
    // -> treat this city as "main" location
    if (
      !appState.mainLocation ||
      appState.geoStatus === "denied" ||
      appState.geoStatus === "unsupported"
    ) {
      appState.mainLocation = {
        type: "city",
        cityId: city.id,
        name: city.name,
        country: city.country
      };
      appState.currentSelection = { kind: "city", cityId: city.id };
    } else {
      // Otherwise add to extraCities
      appState.extraCities.push({
        id: city.id,
        name: city.name,
        country: city.country
      });

      // If there is no current selection yet, set it
      if (!appState.currentSelection) {
        appState.currentSelection = { kind: "city", cityId: city.id };
      }
    }

    // Reset form state
    cityInputEl.value = "";
    cityInputEl.removeAttribute("data-city-id");
    hideSuggestions();
    setCityError("");

    renderCityList();

    setStatusMessage(
      'Город "' +
        city.name +
        '" добавлен. Нажмите «Обновить», чтобы получить прогноз.',
      "success"
    );
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
    forecastContainerEl = document.getElementById("forecast-container");

    cityFormEl = document.getElementById("city-form");
    cityInputEl = document.getElementById("city-input");
    cityErrorEl = document.getElementById("city-error");
    suggestionsListEl = document.getElementById("city-suggestions");
    cityListEl = document.getElementById("city-list");
    cityFieldWrapperEl = appRoot.querySelector(".field-with-dropdown");

    // get city catalog API from cities.js
    if (window.WEATHER_CITY_CATALOG) {
      cityCatalog = window.WEATHER_CITY_CATALOG;
    } else {
      console.warn(
        "WEATHER_CITY_CATALOG helper not found. City suggestions will be disabled."
      );
    }

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

    if (!forecastContainerEl) {
      console.error("#forecast-container not found in DOM");
    }

    if (!cityFormEl) {
      console.error("#city-form not found in DOM");
    } else {
      cityFormEl.addEventListener("submit", handleCityFormSubmit);
    }

    if (cityInputEl && suggestionsListEl && cityCatalog) {
      cityInputEl.addEventListener("input", handleCityInput);
    }

    // Global click handler to close suggestions when clicking outside
    document.addEventListener("click", handleDocumentClick);

    // logging that the app is alive
    console.log(
      "Weather app initialized (layout + geolocation + city form + basic forecast)."
    );

    // initial render of city list (will show "empty" placeholder)
    renderCityList();

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
