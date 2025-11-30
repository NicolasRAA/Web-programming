(function () {
    "use strict";
  
    // Constants
    var GRID_SIZE = 4;
    var STORAGE_STATE_KEY = "lb3_2048_state";
    var STORAGE_LB_KEY = "lb3_2048_leaderboard";
  
    // Game state
    // board[r][c] is either null or { id: string, value: number }
    var board = [];
    var score = 0;
    var isGameOver = false;
  
    // Undo (only onec)
    var undoAvailable = false;
    var undoSnapshot = null; // { board, score }
  
    // Moves count (for podzkaska)
    var movesCount = 0;
  
    // Record badge mode: if not saved leaderboard yet,
    // showing max(current score, 0). Once at least 1 record,
    // showing best saved record only
    var recordStaticMode = false;
  
    // DOM refs
    var gridLayer, tilesLayer;
    var scoreBadge, recordBadge;
    var btnUp, btnDown, btnLeft, btnRight;
    var btnRestart, btnUndo, btnToggleLeaderboard;
    var mobileControls, keyboardHint;
  
    // Game over modal
    var overlay, modalTitle, modalMsg, saveRow, nameInput, btnSaveScore, btnModalRestart, btnCloseModal;
    // Leaderboard modal
    var leaderOverlay, leaderboardBody, btnCloseLeader;
  
    // Tiles DOM cache
    var tileDomById = {}; // id -> HTMLElement
  
    // Helpers
    function el(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }
    function uid() { return String(Date.now()) + "_" + String(Math.floor(Math.random() * 1e6)); }
  
    function cloneBoard(src) {
      var out = new Array(GRID_SIZE);
      for (var r = 0; r < GRID_SIZE; r++) {
        out[r] = new Array(GRID_SIZE);
        for (var c = 0; c < GRID_SIZE; c++) {
          var t = src[r][c];
          out[r][c] = t ? { id: t.id, value: t.value } : null;
        }
      }
      return out;
    }
  
    function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    function choice(arr) { return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null; }
  
    function todayISO() {
      var d = new Date();
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1); if (m.length === 1) m = "0" + m;
      var day = String(d.getDate()); if (day.length === 1) day = "0" + day;
      return y + "-" + m + "-" + day;
    }
  
    // Persistence
    function saveState() {
      try {
        localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify({
          board: board, score: score, isGameOver: isGameOver
        }));
      } catch (e) {}
    }
    function loadState() {
      try {
        var raw = localStorage.getItem(STORAGE_STATE_KEY);
        if (!raw) return false;
        var parsed = JSON.parse(raw);
        if (!parsed || !parsed.board) return false;
        board = cloneBoard(parsed.board);
        score = parsed.score || 0;
        isGameOver = !!parsed.isGameOver;
        return true;
      } catch (e) { return false; }
    }
  
    function saveLeaderboardEntry(name, scoreValue) {
      try {
        var raw = localStorage.getItem(STORAGE_LB_KEY);
        var list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) list = [];
        list.push({ name: name || "Player", score: scoreValue, date: todayISO() });
        list.sort(function (a, b) { return b.score - a.score; });
        if (list.length > 10) list = list.slice(0, 10);
        localStorage.setItem(STORAGE_LB_KEY, JSON.stringify(list));
      } catch (e) {}
    }
    function getLeaderboard() {
      try {
        var raw = localStorage.getItem(STORAGE_LB_KEY);
        var list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) list = [];
        list.sort(function (a, b) { return b.score - a.score; });
        if (list.length > 10) list = list.slice(0, 10);
        return list;
      } catch (e) { return []; }
    }
    function bestSavedRecord() {
      var list = getLeaderboard();
      return list.length ? list[0].score : 0;
    }
  
    // Board & rendering
    function createEmptyBoard() {
      board = new Array(GRID_SIZE);
      for (var r = 0; r < GRID_SIZE; r++) {
        board[r] = new Array(GRID_SIZE);
        for (var c = 0; c < GRID_SIZE; c++) board[r][c] = null;
      }
    }
  
    function buildGridBackground() {
      while (gridLayer.firstChild) gridLayer.removeChild(gridLayer.firstChild);
      for (var i = 0; i < GRID_SIZE * GRID_SIZE; i++) gridLayer.appendChild(el("div", "cell"));
    }
  
    function gapPx() { return 12; } // must match CSS gap
    function cellRectInfo() {
      var rect = gridLayer.getBoundingClientRect();
      var gap = gapPx();
      var w = rect.width, h = rect.height;
      var cw = (w - gap * 3) / 4, ch = (h - gap * 3) / 4;
      return { cw: cw, ch: ch, gap: gap };
    }
    function tilePositionPx(row, col) {
      var info = cellRectInfo();
      return { left: col * (info.cw + info.gap), top: row * (info.ch + info.gap) };
    }
    function valueClass(v) { return "v" + v; }
  
    function placeOrUpdateTile(tileObj, row, col, opts) {
      var id = tileObj.id, v = tileObj.value;
      var node = tileDomById[id];
      var pos = tilePositionPx(row, col);
  
      if (!node) {
        node = el("div", "tile " + valueClass(v), String(v));
        node.setAttribute("data-id", id);
        node.style.left = pos.left + "px";
        node.style.top = pos.top + "px";
        tilesLayer.appendChild(node);
        tileDomById[id] = node;
        // spawn animation
        node.classList.add("spawn");
        setTimeout(function () { node.classList.add("show"); }, 0);
      } else {
        node.className = "tile " + valueClass(v);
        node.textContent = String(v);
        if (opts && opts.pulse) {
          node.classList.add("merge");
          setTimeout(function () { node.classList.remove("merge"); }, 140);
        }
        node.style.left = pos.left + "px";
        node.style.top = pos.top + "px";
      }
    }
    function removeTileDomById(id) {
      var n = tileDomById[id];
      if (!n) return;
      if (n.parentNode) n.parentNode.removeChild(n);
      delete tileDomById[id];
    }
    function renderTiles() {
      // removing orphan DOM tiles
      var seen = {};
      for (var r = 0; r < GRID_SIZE; r++)
        for (var c = 0; c < GRID_SIZE; c++)
          if (board[r][c]) seen[board[r][c].id] = true;
      for (var id in tileDomById) if (!seen[id]) removeTileDomById(id);
  
      // place/update
      for (var rr = 0; rr < GRID_SIZE; rr++)
        for (var cc = 0; cc < GRID_SIZE; cc++)
          if (board[rr][cc]) placeOrUpdateTile(board[rr][cc], rr, cc);
    }
  
    function renderBadges() {
      // score
      scoreBadge.textContent = "Score: " + String(score);
  
      // record: dynamic until at least 1 saved record exists
      var top = bestSavedRecord();
      if (top > 0) recordStaticMode = true;
      if (recordStaticMode) {
        recordBadge.textContent = "Record: " + String(top);
      } else {
        // no saved records yet — show max(current score, 0)
        var dyn = Math.max(score, 0);
        recordBadge.textContent = "Record: " + String(dyn);
      }
  
      // show/hide mobile controls & hint
      if (isGameOver || leaderOverlay.classList.contains("show")) {
        mobileControls.classList.add("hidden");
      } else {
        mobileControls.classList.remove("hidden");
      }
    }
  
    // Logic
    function emptyCells() {
      var list = [];
      for (var r = 0; r < GRID_SIZE; r++)
        for (var c = 0; c < GRID_SIZE; c++)
          if (!board[r][c]) list.push({ r: r, c: c });
      return list;
    }
    function spawnRandomTiles(n) {
      var empties = emptyCells();
      if (!empties.length) return;
      var k = Math.min(n, empties.length);
      for (var i = 0; i < k; i++) {
        empties = emptyCells();
        if (!empties.length) break;
        var spot = choice(empties);
        var value = Math.random() < 0.9 ? 2 : 4;
        var t = { id: uid(), value: value };
        board[spot.r][spot.c] = t;
        placeOrUpdateTile(t, spot.r, spot.c);
      }
    }
    function initNewGame() {
      for (var id in tileDomById) removeTileDomById(id);
      tileDomById = {};
      createEmptyBoard();
      score = 0;
      isGameOver = false;
      undoAvailable = false;
      undoSnapshot = null;
      movesCount = 0;
      renderBadges();
  
      // at start: 1~3 tiles rand
      spawnRandomTiles(randInt(1, 3));
      saveState();
    }
    function canMove() {
      if (emptyCells().length > 0) return true;
      for (var r = 0; r < GRID_SIZE; r++) {
        for (var c = 0; c < GRID_SIZE; c++) {
          var t = board[r][c];
          if (!t) continue;
          if (r + 1 < GRID_SIZE && board[r + 1][c] && board[r + 1][c].value === t.value) return true;
          if (c + 1 < GRID_SIZE && board[r][c + 1] && board[r][c + 1].value === t.value) return true;
        }
      }
      return false;
    }
  
    // Process a line (for left/up directions) | Using cascade merge until stable
    function processLine(getCell, setCell) {
      // extract non-null
      var tiles = [];
      for (var k = 0; k < GRID_SIZE; k++) {
        var cell = getCell(k);
        if (cell) tiles.push(cell);
      }
      if (!tiles.length) {
        for (var z = 0; z < GRID_SIZE; z++) setCell(z, null);
        return { changed: false, gain: 0 };
      }
  
      var mergedOnPass = true;
      var gain = 0;
      while (mergedOnPass) {
        mergedOnPass = false;
        var newTiles = [];
        for (var i = 0; i < tiles.length; i++) {
          if (i < tiles.length - 1 && tiles[i].value === tiles[i + 1].value) {
            tiles[i].value *= 2;
            gain += tiles[i].value;
            tiles[i + 1] = null;
            mergedOnPass = true;
            newTiles.push(tiles[i]);
            i++;
          } else if (tiles[i] != null) {
            newTiles.push(tiles[i]);
          }
        }
        tiles = newTiles;
      }
  
      var changed = false;
      for (var w = 0; w < GRID_SIZE; w++) {
        var newVal = tiles[w] || null;
        var old = getCell(w);
        setCell(w, newVal);
        if ((!old && newVal) || (old && !newVal)) changed = true;
        else if (old && newVal && (old.id !== newVal.id || old.value !== newVal.value)) changed = true;
      }
      return { changed: changed, gain: gain };
    }
  
    function move(dir) {
      if (isGameOver) return false;
  
      var prevBoard = cloneBoard(board);
      var prevScore = score;
      var changed = false;
      var totalGain = 0;
  
      if (dir === "left") {
        for (var r = 0; r < GRID_SIZE; r++) {
          var res = processLine(
            function (k) { return board[r][k]; },
            function (k, v) { board[r][k] = v; }
          );
          changed = changed || res.changed;
          totalGain += res.gain;
        }
      } else if (dir === "right") {
        for (var r2 = 0; r2 < GRID_SIZE; r2++) {
          var res2 = processLine(
            function (k) { return board[r2][GRID_SIZE - 1 - k]; },
            function (k, v) { board[r2][GRID_SIZE - 1 - k] = v; }
          );
          changed = changed || res2.changed;
          totalGain += res2.gain;
        }
      } else if (dir === "up") {
        for (var c = 0; c < GRID_SIZE; c++) {
          var res3 = processLine(
            function (k) { return board[k][c]; },
            function (k, v) { board[k][c] = v; }
          );
          changed = changed || res3.changed;
          totalGain += res3.gain;
        }
      } else if (dir === "down") {
        for (var c2 = 0; c2 < GRID_SIZE; c2++) {
          var res4 = processLine(
            function (k) { return board[GRID_SIZE - 1 - k][c2]; },
            function (k, v) { board[GRID_SIZE - 1 - k][c2] = v; }
          );
          changed = changed || res4.changed;
          totalGain += res4.gain;
        }
      } else {
        return false;
      }
  
      if (!changed) return false;
  
      // Updating score with move gain
      if (totalGain > 0) score += totalGain;
  
      // Enableling undo snapshot
      undoAvailable = true;
      undoSnapshot = { board: prevBoard, score: prevScore };
  
      // Repainting tiles and HUD
      renderTiles();
      renderBadges();
  
      // Spawn 1~2 tiles per move
      spawnRandomTiles(randInt(1, 2));
  
      // First move -> hide desktop hint
      movesCount++;
      if (isDesktop() && movesCount >= 1) {
        keyboardHint.classList.add("hidden");
      }
  
      // Game over? cheack
      if (!canMove()) {
        isGameOver = true;
        renderBadges();
        saveState();
        openGameOverModal();
        return true;
      }
  
      saveState();
      return true;
    }
  
    function undoLast() {
      if (isGameOver) return;
      if (!undoAvailable || !undoSnapshot) return;
  
      for (var id in tileDomById) removeTileDomById(id);
      tileDomById = {};
      board = cloneBoard(undoSnapshot.board);
      score = undoSnapshot.score;
      undoAvailable = false;
      undoSnapshot = null;
  
      renderTiles();
      renderBadges();
      saveState();
    }
  
    // Modals & leaderboard
    function openGameOverModal() {
      // preparing modal
      modalTitle.textContent = "Game Over";
      modalMsg.textContent = "Enter your name to save your record.";
      saveRow.classList.remove("hidden");
      nameInput.value = "";
      overlay.classList.add("show");
    }
    function closeModal() { overlay.classList.remove("show"); renderBadges(); }
  
    function saveRecordFromModal() {
      var name = (nameInput.value || "").trim();
      if (!name) name = "Player";
      saveLeaderboardEntry(name, score);
      saveRow.classList.add("hidden");
      modalMsg.textContent = "Your record has been saved.";
      // Updating record badge to static mode (since at least one saved)
      recordStaticMode = true;
      renderBadges();
      // If leaderboard modal is open, refresh its table
      if (leaderOverlay.classList.contains("show")) renderLeaderboardTable();
    }
  
    function renderLeaderboardTable() {
      while (leaderboardBody.firstChild) leaderboardBody.removeChild(leaderboardBody.firstChild);
      var list = getLeaderboard();
      for (var i = 0; i < list.length; i++) {
        var tr = el("tr");
        var rankCell = el("td");
        // medals for top 3
        if (i === 0)       rankCell.textContent = "🥇";
        else if (i === 1)  rankCell.textContent = "🥈";
        else if (i === 2)  rankCell.textContent = "🥉";
        else               rankCell.textContent = String(i + 1);
        tr.appendChild(rankCell);
  
        tr.appendChild(el("td", null, list[i].name));
        tr.appendChild(el("td", null, String(list[i].score)));
        tr.appendChild(el("td", null, list[i].date));
        leaderboardBody.appendChild(tr);
      }
    }
    function openLeaderboard() {
      renderLeaderboardTable();
      leaderOverlay.classList.add("show");
      // hiding mobile controls while modal is open
      mobileControls.classList.add("hidden");
    }
    function closeLeaderboard() {
      leaderOverlay.classList.remove("show");
      renderBadges();
    }
  
    // Controls & boot
    function onKeyDown(e) {
      var handled = false;
      if (e.key === "ArrowLeft")  handled = move("left");
      else if (e.key === "ArrowRight") handled = move("right");
      else if (e.key === "ArrowUp")    handled = move("up");
      else if (e.key === "ArrowDown")  handled = move("down");
      if (handled) e.preventDefault();
    }
    function isDesktop() {
      // no touch points -> most likely desktop/laptop
      return (navigator.maxTouchPoints || 0) === 0;
    }
  
    function wireControls() {
      btnRestart.addEventListener("click", function () {
        initNewGame(); renderTiles(); saveState();
      });
      btnUndo.addEventListener("click", function () { undoLast(); });
      btnToggleLeaderboard.addEventListener("click", function () { openLeaderboard(); });
  
      btnUp.addEventListener("click",   function () { move("up"); });
      btnDown.addEventListener("click", function () { move("down"); });
      btnLeft.addEventListener("click", function () { move("left"); });
      btnRight.addEventListener("click",function () { move("right"); });
  
      // Keyboard (desktop)
      document.addEventListener("keydown", onKeyDown, { passive: false });
  
      // Modals
      btnModalRestart.addEventListener("click", function () {
        closeModal(); initNewGame(); renderTiles(); saveState();
      });
      btnCloseModal.addEventListener("click", function () { closeModal(); });
      btnSaveScore.addEventListener("click", function () { saveRecordFromModal(); });
  
      btnCloseLeader.addEventListener("click", function () { closeLeaderboard(); });
    }
  
    function cacheDom() {
      gridLayer = document.getElementById("gridLayer");
      tilesLayer = document.getElementById("tilesLayer");
      scoreBadge = document.getElementById("scoreBadge");
      recordBadge = document.getElementById("recordBadge");
  
      btnUp = document.getElementById("btnUp");
      btnDown = document.getElementById("btnDown");
      btnLeft = document.getElementById("btnLeft");
      btnRight = document.getElementById("btnRight");
      btnRestart = document.getElementById("btnRestart");
      btnUndo = document.getElementById("btnUndo");
      btnToggleLeaderboard = document.getElementById("btnToggleLeaderboard");
  
      mobileControls = document.getElementById("mobileControls");
      keyboardHint = document.getElementById("keyboardHint");
  
      overlay = document.getElementById("overlay");
      modalTitle = document.getElementById("modalTitle");
      modalMsg = document.getElementById("modalMsg");
      saveRow = document.getElementById("saveRow");
      nameInput = document.getElementById("nameInput");
      btnSaveScore = document.getElementById("btnSaveScore");
      btnModalRestart = document.getElementById("btnModalRestart");
      btnCloseModal = document.getElementById("btnCloseModal");
  
      leaderOverlay = document.getElementById("leaderOverlay");
      leaderboardBody = document.getElementById("leaderboardBody");
      btnCloseLeader = document.getElementById("btnCloseLeader");
    }
  
    function start() {
      cacheDom();
      buildGridBackground();
      wireControls();
  
      // Showing keyboard hint only on desktop
      if (isDesktop()) keyboardHint.classList.remove("hidden");
  
      // Loading previous session or start new
      var restored = loadState();
      if (!restored) {
        initNewGame();
      } else {
        for (var id in tileDomById) removeTileDomById(id);
        tileDomById = {};
        renderTiles();
        renderBadges();
      }
    }
  
    // Preparing empty board early
    createEmptyBoard();
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  
  })();
  