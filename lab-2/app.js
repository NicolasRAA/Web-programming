(function () {
  "use strict";

  // States
  var tasks = [];             // { id, title, due(YYYY-MM-DD), done }
  var sortMode = "manual";    // 'manual' | 'date-asc' | 'date-desc'
  var statusFilter = "all";   // 'all' | 'done' | 'not done'
  var searchQuery = "";       // minusc
  var draggedId = null;

  // Helpers
  function saveTasks() {
    try {
      localStorage.setItem("todo_tasks", JSON.stringify(tasks));
    } catch (e) {}
  }

  function loadTasks() {
    try {
      var raw = localStorage.getItem("todo_tasks");
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        tasks = parsed.filter(function (t) {
          return t && typeof t.id === "string" && typeof t.title === "string";
        });
      }
    } catch (e) {}
  }

  function getTodayISO() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    if (m.length === 1) m = "0" + m;
    if (day.length === 1) day = "0" + day;
    return y + "-" + m + "-" + day;
  }

  function isValidISODate(s) {
    var re = /^\d{4}-\d{2}-\d{2}$/;
    if (!re.test(s)) return false;
    var dt = new Date(s + "T00:00:00");
    return !isNaN(dt.getTime());
  }

  function compareByDate(a, b, asc) {
    var da = a.due ? new Date(a.due + "T00:00:00").getTime() : Number.POSITIVE_INFINITY;
    var db = b.due ? new Date(b.due + "T00:00:00").getTime() : Number.POSITIVE_INFINITY;
    if (isNaN(da)) da = Number.POSITIVE_INFINITY;
    if (isNaN(db)) db = Number.POSITIVE_INFINITY;
    return asc ? (da - db) : (db - da);
  }

  function moveTaskFromToIndex(fromIdx, toIdx) {
    if (fromIdx < 0 || fromIdx >= tasks.length) return;
    if (toIdx < 0) toIdx = 0;
    if (toIdx >= tasks.length) toIdx = tasks.length - 1;
    var item = tasks.splice(fromIdx, 1)[0];
    tasks.splice(toIdx, 0, item);
  }

  function findIndexById(id) {
    var i;
    for (i = 0; i < tasks.length; i++) if (tasks[i].id === id) return i;
    return -1;
  }

  function moveTaskByIds(sourceId, targetId) {
    var fromIdx = findIndexById(sourceId);
    var toIdx = targetId ? findIndexById(targetId) : -1;
    if (fromIdx === -1) return;
    if (toIdx === -1) {
      // moving to the end if not nalichie of vlaid targets
      var it = tasks.splice(fromIdx, 1)[0];
      tasks.push(it);
      return;
    }
    var it2 = tasks.splice(fromIdx, 1)[0];
    if (fromIdx < toIdx) toIdx = toIdx - 1;
    tasks.splice(toIdx, 0, it2);
  }

  function matchesFilter(task) {
    if (statusFilter === "done" && !task.done) return false;
    if (statusFilter === "todo" && task.done) return false;
    if (searchQuery && task.title.toLowerCase().indexOf(searchQuery) === -1) return false;
    return true;
  }

  // Days left/past and today + color
  // past, or today up to 3 days -> red
  // 4 to 7 days -> jellow
  // 8 or more days -> green
  function daysInfo(dueISO) {
    if (!dueISO || !isValidISODate(dueISO)) {
      return { text: "", color: "" };
    }
    var today = new Date(getTodayISO() + "T00:00:00");
    var due = new Date(dueISO + "T00:00:00");
    var diffMs = due.getTime() - today.getTime();
    var days = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { text: "(" + Math.abs(days) + " days past)", color: "red" };
    }
    if (days === 0) {
      return { text: "(Today)", color: "red" };
    }
    if (days >= 1 && days <= 3) {
      return { text: "(" + days + " days left)", color: "red" };
    }
    if (days >= 4 && days <= 7) {
      return { text: "(" + days + " days left)", color: "yellow" };
    }
    return { text: "(" + days + " days left)", color: "green" };
  }

  // Styles 
  function injectStyles() {
    var style = document.createElement("style");
    style.type = "text/css";
    style.textContent =
      "*,*::before,*::after{box-sizing:border-box}" +
      "html,body{height:100%}" +
      "body{margin:0;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif;background:#0f1117;color:#e6e7ea}" +
      "header{padding:20px 16px;border-bottom:1px solid #232635;background:#0f1117}" +
      "h1{margin:0;font-size:24px;text-align:center}" +
      "main{max-width:1100px;margin:0 auto;padding:24px 16px;display:flex;flex-direction:column;gap:16px}" +
      ".card{background:#141824;border:1px solid #232635;border-radius:14px}" +
      ".pad{padding:14px}" +
      ".toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center}" +
      "input[type=text],input[type=date],select{height:42px;padding:0 12px;border:1px solid #2a2f43;background:#0f1320;color:#e6e7ea;border-radius:10px}" +
      "input[type=text]::placeholder{color:#a2a7b7}" +
      "button{height:42px;padding:0 14px;border:1px solid #3a3f5c;background:#151a2b;color:#e6e7ea;border-radius:10px;cursor:pointer}" +
      "button:hover{background:#1a2033}" +
      "button.primary{background:#6d5efc;border-color:#6d5efc;color:white}" +
      "button.primary:hover{filter:brightness(0.95)}" +
      ".grow{flex:1}" +
      ".badge{font-size:12px;padding:4px 8px;border-radius:999px;border:1px solid #3a3f5c;background:#101528;color:#aeb3c7}" +
      "ul.task-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}" +
      "li.task-item{display:flex;align-items:center;gap:10px;background:#141824;border:1px solid #232635;border-radius:14px;padding:12px}" +
      "li.task-item.dragging{opacity:0.6}" +
      ".title{font-size:16px;font-weight:600}" +
      ".meta{display:flex;flex-wrap:wrap;gap:8px;align-items:center}" +
      ".due{font-size:13px;color:#b8bfd5}" +
      ".status{font-size:12px;padding:2px 8px;border-radius:999px;border:1px solid #2f344a}" +
      ".status.red{background:#2a1316;color:#ff7b82;border-color:#5a2a30}" +
      ".status.yellow{background:#2a2613;color:#ffd166;border-color:#5a4f20}" +
      ".status.green{background:#142a19;color:#6ee7a1;border-color:#245a36}" +
      ".done .title{text-decoration:line-through;color:#8f95a7}" +
      ".done .due{color:#8f95a7}" +
      ".empty{padding:28px;text-align:center;color:#a2a7b7;border:1px dashed #2a2f43;border-radius:14px;background:#141824}" +
      ".row{display:flex;gap:10px;align-items:center}" +
      ".row.wrap{flex-wrap:wrap}" +
      ".spacer{height:2px}" +
      ".handler{width:32px;min-width:32px;height:32px;border-radius:8px;border:1px solid #2a2f43;background:#101528;color:#cbd0e2;display:flex;align-items:center;justify-content:center}" +
      ".handler.hidden{display:none}" +
      ".handler:hover{background:#1a2033}" +
      ".actions{display:flex;gap:8px}" +
      "@media (max-width:560px){ main{padding:16px 12px} .title{font-size:15px} }";
    document.head.appendChild(style);
  }

  // Structure
  var rootHeader, rootMain;
  var formCard, formEl, inputTitle, inputDate, addBtn;
  var toolbarCard, searchInput, filterSelect, orderSelect, dndBadge;
  var listCard, listEl, emptyEl;

  function buildLayout() {
    // Header
    rootHeader = document.createElement("header");
    var h1 = document.createElement("h1");
    h1.textContent = "To-Do List";
    rootHeader.appendChild(h1);
    document.body.appendChild(rootHeader);

    // Main
    rootMain = document.createElement("main");
    document.body.appendChild(rootMain);

    // Form card
    formCard = document.createElement("div");
    formCard.className = "card pad";
    formEl = document.createElement("form");
    formEl.className = "row wrap";
    formEl.setAttribute("autocomplete", "off");

    inputTitle = document.createElement("input");
    inputTitle.type = "text";
    inputTitle.placeholder = "Task title";
    inputTitle.name = "title";
    inputTitle.className = "grow";

    inputDate = document.createElement("input");
    inputDate.type = "date";
    inputDate.name = "due";
    inputDate.value = getTodayISO(); // po umolchaniu date = today

    addBtn = document.createElement("button");
    addBtn.type = "submit";
    addBtn.className = "primary";
    addBtn.textContent = "Add";

    formEl.appendChild(inputTitle);
    formEl.appendChild(inputDate);
    formEl.appendChild(addBtn);
    formCard.appendChild(formEl);
    rootMain.appendChild(formCard);

    // Toolbar card
    toolbarCard = document.createElement("div");
    toolbarCard.className = "card pad";
    var toolbar = document.createElement("div");
    toolbar.className = "toolbar";

    searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search by title…";
    searchInput.className = "grow";

    filterSelect = document.createElement("select");
    var optAll = document.createElement("option"); optAll.value = "all";  optAll.textContent = "All";
    var optTodo = document.createElement("option"); optTodo.value = "todo"; optTodo.textContent = "Not done";
    var optDone = document.createElement("option"); optDone.value = "done"; optDone.textContent = "Done";
    filterSelect.appendChild(optAll); filterSelect.appendChild(optTodo); filterSelect.appendChild(optDone);

    orderSelect = document.createElement("select");
    var optManual = document.createElement("option"); optManual.value = "manual";   optManual.textContent = "Order: Manual";
    var optAsc    = document.createElement("option"); optAsc.value    = "date-asc"; optAsc.textContent    = "Order: Date ↑";
    var optDesc   = document.createElement("option"); optDesc.value   = "date-desc";optDesc.textContent   = "Order: Date ↓";
    orderSelect.appendChild(optManual); orderSelect.appendChild(optAsc); orderSelect.appendChild(optDesc);

    dndBadge = document.createElement("span");
    dndBadge.className = "badge";
    dndBadge.textContent = "Drag & drop: ON (manual)";

    toolbar.appendChild(searchInput);
    toolbar.appendChild(filterSelect);
    toolbar.appendChild(orderSelect);
    toolbar.appendChild(dndBadge);
    toolbarCard.appendChild(toolbar);
    rootMain.appendChild(toolbarCard);

    // List card
    listCard = document.createElement("div");
    listCard.className = "card pad";
    listEl = document.createElement("ul");
    listEl.className = "task-list";
    listCard.appendChild(listEl);

    emptyEl = document.createElement("div");
    emptyEl.className = "empty";
    emptyEl.textContent = "No tasks yet. Add your first task above.";
    listCard.appendChild(emptyEl);

    rootMain.appendChild(listCard);
  }

  // UI events
  function onAddSubmit(e) {
    e.preventDefault();
    var title = (inputTitle.value || "").trim();
    var due = (inputDate.value || "").trim();

    if (!title) {
      alert("Please enter a task title.");
      return;
    }
    if (!due) {
      alert("Please choose a due date.");
      return;
    }
    if (!isValidISODate(due)) {
      alert("Please enter a valid date (YYYY-MM-DD).");
      return;
    }

    var newTask = {
      id: String(Date.now()) + "_" + String(Math.floor(Math.random() * 100000)),
      title: title,
      due: due,
      done: false
    };
    tasks.push(newTask);
    saveTasks();
    inputTitle.value = "";
    inputDate.value = getTodayISO(); // reset to today
    renderList();
  }

  function onSearchInput() {
    searchQuery = (searchInput.value || "").toLowerCase();
    renderList();
  }

  function onFilterChange() {
    statusFilter = filterSelect.value;
    renderList();
  }

  function onOrderChange() {
    sortMode = orderSelect.value;
    if (sortMode === "manual") {
      dndBadge.textContent = "Drag & drop: ON (manual)";
    } else {
      dndBadge.textContent = "Drag & drop: OFF (sorted)";
    }
    renderList();
  }

  // Item render
  function makeTaskItem(task) {
    var li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");
    li.setAttribute("data-id", task.id);
    li.draggable = (sortMode === "manual"); // DnD if only manual

    // DnD desktop
    li.addEventListener("dragstart", function (ev) {
      if (sortMode !== "manual") { ev.preventDefault(); return; }
      draggedId = task.id;
      li.classList.add("dragging");
      if (ev.dataTransfer) {
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.setData("text/plain", task.id);
      }
    });
    li.addEventListener("dragend", function () {
      draggedId = null;
      li.classList.remove("dragging");
    });

    // Checkbox done
    var check = document.createElement("input");
    check.type = "checkbox";
    check.checked = !!task.done;
    check.addEventListener("change", function () {
      task.done = !!check.checked;
      saveTasks();
      renderList();
    });

    // Main content
    var content = document.createElement("div");
    content.className = "grow";
    var titleRow = document.createElement("div");
    titleRow.className = "row wrap";
    var titleSpan = document.createElement("span");
    titleSpan.className = "title";
    titleSpan.textContent = task.title;
    titleRow.appendChild(titleSpan);

    var meta = document.createElement("div");
    meta.className = "meta";

    var dueSpan = document.createElement("span");
    dueSpan.className = "due";
    dueSpan.textContent = "Due: " + task.due;

    var statusBadge = document.createElement("span");
    var di = daysInfo(task.due); // days left
    statusBadge.className = "status" + (di.color ? " " + di.color : "");
    statusBadge.textContent = di.text;

    meta.appendChild(dueSpan);
    if (di.text) meta.appendChild(statusBadge);

    content.appendChild(titleRow);
    content.appendChild(meta);

    // Edit button
    var editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", function () {
      var newTitle = window.prompt("Edit title:", task.title);
      if (newTitle === null) return;
      newTitle = (newTitle || "").trim();
      if (!newTitle) { alert("Title cannot be empty."); return; }

      var current = task.due || getTodayISO();
      var newDate = window.prompt("Edit due date (YYYY-MM-DD):", current);
      if (newDate === null) return;
      newDate = (newDate || "").trim();
      if (!newDate) { alert("Date is required."); return; }
      if (!isValidISODate(newDate)) { alert("Invalid date format."); return; }

      task.title = newTitle;
      task.due = newDate;
      saveTasks();
      renderList();
    });

    // Delete button
    var deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", function () {
      var ok = window.confirm("Delete this task?");
      if (!ok) return;
      var idx = findIndexById(task.id);
      if (idx !== -1) {
        tasks.splice(idx, 1);
        saveTasks();
        renderList();
      }
    });

    // DnD for mobile (netu if not on manual)
    var handlerBtn = document.createElement("button");
    handlerBtn.type = "button";
    handlerBtn.className = "handler" + (sortMode === "manual" ? "" : " hidden");
    handlerBtn.setAttribute("title", "Move (tap to set position)");
    handlerBtn.textContent = "⋮⋮"; // grip (to help the moving)
    handlerBtn.addEventListener("click", function () {
      if (sortMode !== "manual") return;
      var currentIndex = findIndexById(task.id);
      var total = tasks.length;
      var ask = window.prompt("Move to position (1.." + total + "):", String(currentIndex + 1));
      if (ask === null) return;
      var pos = parseInt(ask, 10);
      if (isNaN(pos) || pos < 1 || pos > total) {
        alert("Invalid position.");
        return;
      }
      moveTaskFromToIndex(currentIndex, pos - 1);
      saveTasks();
      renderList();
    });

    // Actions
    var actions = document.createElement("div");
    actions.className = "actions";
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    // Ensamble
    li.appendChild(check);
    li.appendChild(content);
    li.appendChild(actions);
    li.appendChild(handlerBtn); // handler to the right

    return li;
  }

  function renderList() {
    // Clear list
    while (listEl.firstChild) listEl.removeChild(listEl.firstChild);

    // Filtr
    var filtered = [];
    var i;
    for (i = 0; i < tasks.length; i++) if (matchesFilter(tasks[i])) filtered.push(tasks[i]);

    // Sort for date
    var view = filtered;
    if (sortMode === "date-asc") {
      view = filtered.slice().sort(function (a, b) { return compareByDate(a, b, true); });
    } else if (sortMode === "date-desc") {
      view = filtered.slice().sort(function (a, b) { return compareByDate(a, b, false); });
    }

    // what to even call this bruh
    // mb Populate list
    for (i = 0; i < view.length; i++) {
      var li = makeTaskItem(view[i]);
      // updating DnD/handler by mode
      li.draggable = (sortMode === "manual");
      var handler = li.querySelector(".handler");
      if (handler) handler.className = "handler" + (sortMode === "manual" ? "" : " hidden");
      listEl.appendChild(li);
    }

    // Empty
    emptyEl.style.display = view.length === 0 ? "block" : "none";
  }

  // Dragover/Drop on <ul> (dskt)
  function listElEventSetup() {
    if (!listEl) return;

    document.addEventListener("dragover", function (e) {
      if (sortMode !== "manual") return;
      e.preventDefault();
    });

    listEl.addEventListener("drop", function (e) {
      if (sortMode !== "manual") return;
      e.preventDefault();

      var targetLi = null;
      var node = e.target;
      while (node && node !== listEl) {
        if (node.nodeType === 1 && node.tagName.toLowerCase() === "li" &&
            node.className.indexOf("task-item") !== -1) {
          targetLi = node;
          break;
        }
        node = node.parentNode;
      }

      var targetId = targetLi ? targetLi.getAttribute("data-id") : null;
      if (draggedId && draggedId !== targetId) {
        moveTaskByIds(draggedId, targetId);
        saveTasks();
        renderList();
      }
      draggedId = null;
    });
  }

  function wireEvents() {
    formEl.addEventListener("submit", onAddSubmit);
    searchInput.addEventListener("input", onSearchInput);
    filterSelect.addEventListener("change", onFilterChange);
    orderSelect.addEventListener("change", onOrderChange);
  }

  // Init
  injectStyles();
  buildLayout();        // building DOM
  listElEventSetup();   // building <ul> esli est'
  wireEvents();
  loadTasks();
  renderList();
})();
