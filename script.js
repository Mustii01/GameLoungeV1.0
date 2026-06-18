/*
  GameLounge — Vanilla JavaScript with Firebase
*/

(() => {
  "use strict";

  const KEYS = Object.freeze({
    likes: "gl_likes_v1",
    reviews: "gl_reviews_v1",
    theme: "gl_theme_v1",
  });

  const GAMES = Object.freeze([
    {
      id: "neon-drift",
      title: "Neon Drift",
      genre: "Arcade Racer",
      developer: "GameLounge Studio",
      releaseDate: "2026-04-12",
      shortDescription: "A tight, neon-soaked time-trial racer built for perfect runs.",
      longDescription:
        "Story:\nA city of light, a debt of shadows.\n\nGameplay:\nMaster precision drifting, boost chaining, and risky shortcuts across handcrafted tracks.\n\nFeatures:\n• Responsive arcade handling\n• Unlockable cars and paint jobs\n• Weekly challenges and ghost races\n• Accessible difficulty options",
    },
    {
      id: "hollow-orchard",
      title: "Hollow Orchard",
      genre: "Narrative Adventure",
      developer: "GameLounge Studio",
      releaseDate: "2026-02-03",
      shortDescription: "A moody, choice-driven story in a quiet town that remembers too much.",
      longDescription:
        "Story:\nReturn to an orchard that no longer grows fruit — only secrets.\n\nGameplay:\nExplore, investigate, and make choices that reshape relationships and outcomes.\n\nFeatures:\n• Branching dialogue\n• Environmental storytelling\n• Multiple endings\n• Atmospheric soundtrack",
    },
    {
      id: "star-forge",
      title: "Star Forge",
      genre: "Action Roguelite",
      developer: "GameLounge Studio",
      releaseDate: "2025-11-21",
      shortDescription: "Build wild weapon combos and survive shifting nebula arenas.",
      longDescription:
        "Story:\nA broken forge drifts between stars — and it still hungers.\n\nGameplay:\nFast combat with modular weapons, perks, and enemies that evolve each run.\n\nFeatures:\n• Procedural encounters\n• Synergy-driven builds\n• Bosses with phase mechanics\n• Run modifiers for endless replay",
    },
    {
      id: "lumen-below",
      title: "Lumen Below",
      genre: "Puzzle Platformer",
      developer: "GameLounge Studio",
      releaseDate: "2025-08-09",
      shortDescription: "A soft-lit platformer where light becomes your tool and your map.",
      longDescription:
        "Story:\nA lighthouse goes dark. Something beneath it wakes.\n\nGameplay:\nManipulate beams, mirrors, and shadows to unlock paths and reveal hidden routes.\n\nFeatures:\n• Smart puzzles\n• Smooth movement\n• Secret rooms\n• Assist mode for accessibility",
    },
    {
      id: "iron-lullaby",
      title: "Iron Lullaby",
      genre: "Tactical RPG",
      developer: "GameLounge Studio",
      releaseDate: "2026-06-01",
      shortDescription: "Turn-based tactics with clean readability and powerful unit builds.",
      longDescription:
        "Story:\nIn a war of machines, the quiet decisions matter most.\n\nGameplay:\nPosition units, manage cooldowns, and chain abilities for decisive turns.\n\nFeatures:\n• Compact tactical maps\n• Class progression\n• Permissive experimentation\n• High-contrast UI options",
    },
    {
      id: "garden-bytes",
      title: "Garden Bytes",
      genre: "Cozy Builder",
      developer: "GameLounge Studio",
      releaseDate: "2025-05-18",
      shortDescription: "A relaxing garden builder with little robots and big vibes.",
      longDescription:
        "Story:\nYou inherit a forgotten greenhouse and a box of curious bots.\n\nGameplay:\nPlace rooms, grow plants, and automate your cozy space with friendly helpers.\n\nFeatures:\n• Low-stress progression\n• Decorative customization\n• Simple automation\n• Photo mode snapshots",
    },
  ]);

  /* ----------------------------- Storage helpers ---------------------------- */

  function getJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function removeKey(key) {
    localStorage.removeItem(key);
  }

  /* ------------------------------- DOM helpers ------------------------------ */

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function setText(el, value) {
    if (!el) return;
    el.textContent = value == null ? "" : String(value);
  }

  function setAlert(el, type, message) {
    if (!el) return;
    const msg = (message || "").trim();
    if (!msg) {
      el.hidden = true;
      el.classList.remove("alert--error", "alert--success");
      el.textContent = "";
      return;
    }
    el.hidden = false;
    el.classList.remove("alert--error", "alert--success");
    if (type === "error") el.classList.add("alert--error");
    if (type === "success") el.classList.add("alert--success");
    el.textContent = msg;
  }

  function formatDate(isoDate) {
    if (!isoDate) return "—";
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  }

  function getPageName() {
    const page = document.body?.dataset?.page;
    return page || "";
  }

  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  /* ------------------------------- Validation ------------------------------- */

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function isValidEmail(email) {
    const e = String(email || "").trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  function normalizeUsername(username) {
    return String(username || "").trim();
  }

  function isValidUsername(username) {
    const u = normalizeUsername(username);
    return /^[A-Za-z][A-Za-z0-9_]{2,15}$/.test(u);
  }

  function isValidPassword(password) {
    return String(password || "").length >= 6;
  }

  /* ------------------------------ Theme system ------------------------------ */

  function getTheme() {
    const t = getJSON(KEYS.theme, "dark");
    return t === "light" ? "light" : "dark";
  }

  function setTheme(theme) {
    const t = theme === "light" ? "light" : "dark";
    setJSON(KEYS.theme, t);
    document.documentElement.setAttribute("data-theme", t);
  }

  function initTheme() {
    setTheme(getTheme());
  }

  /* ------------------------------ Likes + data ------------------------------ */

  function getLikesState() {
    const likes = getJSON(KEYS.likes, {});
    return likes && typeof likes === "object" ? likes : {};
  }

  function saveLikesState(likes) {
    setJSON(KEYS.likes, likes);
  }

  function userLikesGame(userEmail, gameId) {
    const likes = getLikesState();
    const e = normalizeEmail(userEmail);
    return Boolean(likes?.[e]?.[gameId]);
  }

  function getGameLikeCount(gameId) {
    const likes = getLikesState();
    let count = 0;
    for (const email of Object.keys(likes)) {
      if (likes[email] && likes[email][gameId]) count += 1;
    }
    return count;
  }

  function toggleLike(userEmail, gameId) {
    const likes = getLikesState();
    const e = normalizeEmail(userEmail);
    const next = { ...likes };
    const userMap = { ...(next[e] || {}) };
    const currently = Boolean(userMap[gameId]);
    if (currently) delete userMap[gameId];
    else userMap[gameId] = true;
    next[e] = userMap;
    saveLikesState(next);
    return !currently;
  }

  /* ------------------------------- Reviews -------------------------------- */

  function getReviews() {
    const reviews = getJSON(KEYS.reviews, []);
    return Array.isArray(reviews) ? reviews : [];
  }

  function saveReviews(reviews) {
    setJSON(KEYS.reviews, reviews);
  }

  function getGameReviews(gameId) {
    return getReviews()
      .filter((r) => r && r.gameId === gameId)
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }

  function addReview({ gameId, email, username, rating, text }) {
    const safeRating = Math.max(1, Math.min(5, Number(rating) || 0));
    const review = {
      id: `${gameId}__${normalizeEmail(email)}__${Date.now()}`,
      gameId,
      email: normalizeEmail(email),
      username: normalizeUsername(username),
      rating: safeRating,
      text: String(text || "").trim(),
      createdAt: new Date().toISOString(),
    };
    const reviews = getReviews();
    reviews.unshift(review);
    saveReviews(reviews);
    return review;
  }

  function renderStars(rating) {
    const r = Math.max(1, Math.min(5, Number(rating) || 0));
    const el = document.createElement("span");
    el.className = "stars";
    el.setAttribute("aria-label", `${r} out of 5 stars`);
    el.textContent = "★★★★★".slice(0, r) + "☆☆☆☆☆".slice(0, 5 - r);
    return el;
  }

  function renderReviewItem(review) {
    const item = document.createElement("div");
    item.className = "review";

    const top = document.createElement("div");
    top.className = "review__top";

    const who = document.createElement("div");
    who.className = "review__who";
    who.textContent = review.username || review.email || "Anonymous";

    const meta = document.createElement("div");
    meta.className = "review__meta";
    meta.textContent = formatDate(review.createdAt);

    top.appendChild(who);
    top.appendChild(meta);

    const stars = renderStars(review.rating);

    const text = document.createElement("p");
    text.className = "review__text";
    text.textContent = review.text || "";

    item.appendChild(top);
    item.appendChild(stars);
    item.appendChild(text);
    return item;
  }

  /* ------------------------------- Downloads ------------------------------- */

  function downloadPlaceholder(game) {
    const title = game?.title || "Game";
    const fileName = `${(game?.id || "download").replace(/[^a-z0-9_-]+/gi, "_")}_placeholder.txt`;
    const content =
      `GameLounge Download Placeholder\n\n` +
      `Title: ${title}\n` +
      `This is a placeholder file for local development.\n\n` +
      `Replace this with your exported Godot build or a real download package.\n`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /* --------------------------------- Modal -------------------------------- */

  function getModal() {
    const modal = qs("#modal");
    if (!modal) return null;
    const title = qs("#modalTitle", modal);
    const body = qs("#modalBody", modal);
    const close = qs("[data-modal-close]", modal);
    return { modal, title, body, close };
  }

  function openModal({ title, contentNode }) {
    const m = getModal();
    if (!m) return;
    setText(m.title, title);
    m.body.innerHTML = "";
    if (contentNode) m.body.appendChild(contentNode);
    m.modal.setAttribute("aria-hidden", "false");
    m.modal.addEventListener("click", onModalBackdrop);
    document.addEventListener("keydown", onModalKeyDown);
    m.close?.focus?.();
  }

  function closeModal() {
    const m = getModal();
    if (!m) return;
    m.modal.setAttribute("aria-hidden", "true");
    m.modal.removeEventListener("click", onModalBackdrop);
    document.removeEventListener("keydown", onModalKeyDown);
    m.body.innerHTML = "";
  }

  function onModalBackdrop(e) {
    const m = getModal();
    if (!m) return;
    if (e.target === m.modal) closeModal();
  }

  function onModalKeyDown(e) {
    if (e.key === "Escape") closeModal();
  }

  function wireModalClose() {
    const m = getModal();
    if (!m) return;
    m.close?.addEventListener("click", closeModal);
  }

  /* ----------------------------- Shared topbar ----------------------------- */

  function setActiveNav() {
    const page = getPageName();
    const map = {
      home: "home.html",
      about: "about.html",
      settings: "settings.html",
      game: "home.html",
    };
    const currentHref = map[page] || "";
    qsa(".nav a").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href === currentHref) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function renderUserChip(account) {
    setText(qs("[data-user-name]"), account?.displayName || "Player");
    setText(qs("[data-user-email]"), account?.email || "");
  }

  /* ------------------------------- Home page ------------------------------- */

  function createGameCard({ game, account }) {
    const card = document.createElement("article");
    card.className = "card game-card";
    card.dataset.gameId = game.id;

    const cover = document.createElement("div");
    cover.className = "game-card__cover";
    cover.setAttribute("role", "img");
    cover.setAttribute("aria-label", `${game.title} cover image placeholder`);

    const body = document.createElement("div");
    body.className = "game-card__body";

    const titleRow = document.createElement("div");
    titleRow.className = "game-card__title-row";

    const title = document.createElement("h3");
    title.className = "game-card__title";
    title.textContent = game.title;

    const like = document.createElement("button");
    like.type = "button";
    like.className = "like-btn";
    like.dataset.action = "like";
    like.setAttribute("aria-pressed", String(userLikesGame(account.email, game.id)));

    const icon = document.createElement("span");
    icon.className = "like-btn__icon";
    icon.textContent = "♥";

    const count = document.createElement("span");
    count.className = "small";
    count.dataset.likeCount = "true";
    count.textContent = String(getGameLikeCount(game.id));

    like.appendChild(icon);
    like.appendChild(count);

    titleRow.appendChild(title);
    titleRow.appendChild(like);

    const desc = document.createElement("p");
    desc.className = "game-card__desc";
    desc.textContent = game.shortDescription;

    const meta = document.createElement("div");
    meta.className = "meta-row";

    const genre = document.createElement("span");
    genre.className = "pill";
    genre.textContent = game.genre;

    const reviewCount = document.createElement("span");
    reviewCount.className = "muted small";
    reviewCount.dataset.reviewCount = "true";
    reviewCount.textContent = `${getGameReviews(game.id).length} reviews`;

    meta.appendChild(genre);
    meta.appendChild(reviewCount);

    const actions = document.createElement("div");
    actions.className = "btn-row";

    const viewBtn = document.createElement("a");
    viewBtn.className = "btn btn--primary";
    viewBtn.href = `game.html?id=${encodeURIComponent(game.id)}`;
    viewBtn.textContent = "View Game";

    const downloadBtn = document.createElement("button");
    downloadBtn.type = "button";
    downloadBtn.className = "btn";
    downloadBtn.dataset.action = "download";
    downloadBtn.textContent = "Download";

    const reviewBtn = document.createElement("button");
    reviewBtn.type = "button";
    reviewBtn.className = "btn btn--ghost";
    reviewBtn.dataset.action = "review";
    reviewBtn.textContent = "Review";

    actions.appendChild(viewBtn);
    actions.appendChild(downloadBtn);
    actions.appendChild(reviewBtn);

    body.appendChild(titleRow);
    body.appendChild(desc);
    body.appendChild(meta);
    body.appendChild(actions);

    card.appendChild(cover);
    card.appendChild(body);
    return card;
  }

  function renderHome(account) {
    const heroTitle = qs("[data-hero-title]");
    const heroSub = qs("[data-hero-subtitle]");
    setText(heroTitle, "Indie releases, presented like a premium studio portfolio.");
    setText(
      heroSub,
      "Browse our Godot projects, read community notes, and keep track of your favorites — now with Firebase."
    );

    const featured = GAMES[0];
    setText(qs("[data-featured-title]"), featured.title);
    setText(qs("[data-featured-genre]"), featured.genre);
    setText(qs("[data-featured-desc]"), featured.shortDescription);
    const featuredLink = qs("[data-featured-link]");
    if (featuredLink) featuredLink.href = `game.html?id=${encodeURIComponent(featured.id)}`;

    const featuredLikeBtn = qs("[data-featured-like]");
    if (featuredLikeBtn) {
      featuredLikeBtn.setAttribute("aria-pressed", String(userLikesGame(account.email, featured.id)));
      setText(qs("[data-featured-like-count]"), String(getGameLikeCount(featured.id)));
    }

    const grid = qs("[data-game-grid]");
    if (!grid) return;
    grid.innerHTML = "";
    for (const game of GAMES) {
      grid.appendChild(createGameCard({ game, account }));
    }
  }

  function openQuickReviewModal({ game, account, onSaved }) {
    const wrapper = document.createElement("div");
    wrapper.className = "form";

    const alert = document.createElement("div");
    alert.className = "alert alert--error";
    alert.hidden = true;

    const ratingField = document.createElement("div");
    ratingField.className = "field";

    const ratingLabel = document.createElement("div");
    ratingLabel.className = "label";
    ratingLabel.textContent = "Rating";

    const ratingSelect = document.createElement("select");
    ratingSelect.className = "select";
    ratingSelect.innerHTML = `
      <option value="5">5 — Excellent</option>
      <option value="4">4 — Great</option>
      <option value="3" selected>3 — Good</option>
      <option value="2">2 — Needs work</option>
      <option value="1">1 — Not for me</option>
    `;

    ratingField.appendChild(ratingLabel);
    ratingField.appendChild(ratingSelect);

    const textField = document.createElement("div");
    textField.className = "field";

    const textLabel = document.createElement("div");
    textLabel.className = "label";
    textLabel.textContent = "Review";

    const textArea = document.createElement("textarea");
    textArea.className = "textarea";
    textArea.placeholder = "Share something helpful: what you liked, what to improve, and what kind of players will enjoy it.";

    const help = document.createElement("div");
    help.className = "help";
    help.textContent = "Reviews are public and associated with your account.";

    textField.appendChild(textLabel);
    textField.appendChild(textArea);
    textField.appendChild(help);

    const actions = document.createElement("div");
    actions.className = "btn-row";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "btn btn--primary";
    saveBtn.textContent = "Save Review";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn--ghost";
    cancelBtn.textContent = "Cancel";

    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);

    wrapper.appendChild(alert);
    wrapper.appendChild(ratingField);
    wrapper.appendChild(textField);
    wrapper.appendChild(actions);

    cancelBtn.addEventListener("click", closeModal);
    saveBtn.addEventListener("click", () => {
      const text = String(textArea.value || "").trim();
      if (!text) {
        setAlert(alert, "error", "Please write a short review before saving.");
        return;
      }
      addReview({
        gameId: game.id,
        email: account.email,
        username: account.displayName,
        rating: Number(ratingSelect.value),
        text,
      });
      if (typeof onSaved === "function") onSaved();
      closeModal();
    });

    openModal({ title: `Review — ${game.title}`, contentNode: wrapper });
  }

  function wireHomeInteractions(account) {
    const root = qs("[data-game-grid]");
    if (root) {
      root.addEventListener("click", (e) => {
        const target = e.target instanceof Element ? e.target.closest("[data-action]") : null;
        if (!target) return;
        const card = target.closest("[data-game-id]");
        const gameId = card?.dataset?.gameId;
        const game = GAMES.find((g) => g.id === gameId);
        if (!game) return;

        const action = target.getAttribute("data-action");
        if (action === "download") {
          downloadPlaceholder(game);
          return;
        }
        if (action === "like") {
          const liked = toggleLike(account.email, game.id);
          target.setAttribute("aria-pressed", String(liked));
          const countEl = qs("[data-like-count='true']", target);
          if (countEl) countEl.textContent = String(getGameLikeCount(game.id));
          return;
        }
        if (action === "review") {
          openQuickReviewModal({
            game,
            account,
            onSaved: () => {
              const countEl = qs("[data-review-count='true']", card);
              if (countEl) countEl.textContent = `${getGameReviews(game.id).length} reviews`;
            },
          });
        }
      });
    }

    const featuredLike = qs("[data-featured-like]");
    if (featuredLike) {
      featuredLike.addEventListener("click", () => {
        const featured = GAMES[0];
        const liked = toggleLike(account.email, featured.id);
        featuredLike.setAttribute("aria-pressed", String(liked));
        setText(qs("[data-featured-like-count]"), String(getGameLikeCount(featured.id)));
      });
    }
  }

  /* ------------------------------ Game details ------------------------------ */

  function renderGameDetails(account) {
    const gameId = getQueryParam("id");
    const game = GAMES.find((g) => g.id === gameId);
    const missing = qs("[data-game-missing]");
    const content = qs("[data-game-content]");

    if (!game) {
      if (missing) missing.hidden = false;
      if (content) content.hidden = true;
      return;
    }

    if (missing) missing.hidden = true;
    if (content) content.hidden = false;

    setText(qs("[data-game-title]"), game.title);
    setText(qs("[data-game-genre]"), game.genre);
    setText(qs("[data-game-dev]"), game.developer);
    setText(qs("[data-game-date]"), formatDate(game.releaseDate));
    setText(qs("[data-game-short]"), game.shortDescription);
    setText(qs("[data-game-long]"), game.longDescription);

    const likeBtn = qs("[data-game-like]");
    if (likeBtn) {
      likeBtn.setAttribute("aria-pressed", String(userLikesGame(account.email, game.id)));
      setText(qs("[data-game-like-count]"), String(getGameLikeCount(game.id)));
    }

    const reviewCount = qs("[data-game-review-count]");
    if (reviewCount) reviewCount.textContent = `${getGameReviews(game.id).length} reviews`;

    renderGameReviews(game.id);
  }

  function renderGameReviews(gameId) {
    const list = qs("[data-review-list]");
    if (!list) return;
    list.innerHTML = "";
    const reviews = getGameReviews(gameId);
    if (reviews.length === 0) {
      const empty = document.createElement("div");
      empty.className = "alert";
      empty.textContent = "No reviews yet. Be the first to share feedback.";
      list.appendChild(empty);
      return;
    }
    for (const r of reviews) list.appendChild(renderReviewItem(r));
  }

  function wireGameInteractions(account) {
    const gameId = getQueryParam("id");
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) return;

    const likeBtn = qs("[data-game-like]");
    if (likeBtn) {
      likeBtn.addEventListener("click", () => {
        const liked = toggleLike(account.email, game.id);
        likeBtn.setAttribute("aria-pressed", String(liked));
        setText(qs("[data-game-like-count]"), String(getGameLikeCount(game.id)));
      });
    }

    const downloadBtn = qs("[data-game-download]");
    if (downloadBtn) downloadBtn.addEventListener("click", () => downloadPlaceholder(game));

    const playBtn = qs("[data-game-play]");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        const panel = document.createElement("div");
        panel.className = "form";
        const msg = document.createElement("div");
        msg.className = "alert";
        msg.textContent =
          "Play is a placeholder in this local-only build. Replace this action with your exported Godot HTML5 build and open it here.";
        const actions = document.createElement("div");
        actions.className = "btn-row";
        const ok = document.createElement("button");
        ok.type = "button";
        ok.className = "btn btn--primary";
        ok.textContent = "Got it";
        ok.addEventListener("click", closeModal);
        actions.appendChild(ok);
        panel.appendChild(msg);
        panel.appendChild(actions);
        openModal({ title: `Play — ${game.title}`, contentNode: panel });
      });
    }

    const form = qs("[data-review-form]");
    if (form) {
      const alert = qs("[data-review-alert]");
      const rating = qs("[data-review-rating]");
      const text = qs("[data-review-text]");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        setAlert(alert, "error", "");
        const reviewText = String(text?.value || "").trim();
        if (!reviewText) {
          setAlert(alert, "error", "Please write a review before submitting.");
          return;
        }
        addReview({
          gameId: game.id,
          email: account.email,
          username: account.displayName,
          rating: Number(rating?.value || 3),
          text: reviewText,
        });
        if (text) text.value = "";
        setAlert(alert, "success", "Review saved.");
        setText(qs("[data-game-review-count]"), `${getGameReviews(game.id).length} reviews`);
        renderGameReviews(game.id);
      });
    }
  }

  /* ------------------------------ Settings page ----------------------------- */

  function renderSettings(account) {
    setText(qs("[data-profile-username]"), account.displayName);
    setText(qs("[data-profile-email]"), account.email);
    setText(qs("[data-settings-theme]"), getTheme());

    const dark = qs("#themeDark");
    const light = qs("#themeLight");
    const t = getTheme();
    if (dark) dark.checked = t === "dark";
    if (light) light.checked = t === "light";
  }

  function wireSettingsInteractions(account) {
    const nameForm = qs("[data-username-form]");
    const nameInput = qs("[data-username-input]");
    const nameAlert = qs("[data-username-alert]");
    if (nameForm) {
      nameForm.addEventListener("submit", (e) => {
        e.preventDefault();
        setAlert(nameAlert, "error", "");
        const nextName = normalizeUsername(nameInput?.value || "");
        if (!nextName) {
          setAlert(nameAlert, "error", "Username cannot be empty.");
          return;
        }
        if (!isValidUsername(nextName)) {
          setAlert(nameAlert, "error", "Username must be 3–16 characters and start with a letter (letters, numbers, _).");
          return;
        }
        const user = firebase.auth().currentUser;
        if (user) {
          user.updateProfile({ displayName: nextName }).then(() => {
            db.collection("users").doc(user.uid).update({ username: nextName });
            setText(qs("[data-profile-username]"), nextName);
            renderUserChip({ displayName: nextName, email: user.email });
            setAlert(nameAlert, "success", "Username updated.");
          }).catch((error) => {
            setAlert(nameAlert, "error", error.message);
          });
        }
      });
    }

    const passForm = qs("[data-password-form]");
    if (passForm) {
        passForm.style.display = "none";
        const help = qs(".help", passForm.parentElement);
        if(help) help.textContent = "Password changes can be initiated via Firebase's built-in email actions.";
    }

    const themeRadios = qsa("input[name='theme']");
    themeRadios.forEach((r) => {
      r.addEventListener("change", () => {
        const val = r instanceof HTMLInputElement ? r.value : "dark";
        setTheme(val);
        setText(qs("[data-settings-theme]"), getTheme());
      });
    });

    const logoutBtn = qs("[data-logout]");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        firebase.auth().signOut();
      });
    }

    const clearBtn = qs("[data-clear-data]");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        const ok = window.confirm(
          "Clear ALL local data?\n\nThis removes:\n- Likes\n- Reviews\n- Theme preference\n\nThis cannot be undone."
        );
        if (!ok) return;
        removeKey(KEYS.likes);
        removeKey(KEYS.reviews);
        removeKey(KEYS.theme);
        firebase.auth().signOut();
      });
    }
  }

  /* ------------------------------- Auth pages ------------------------------- */

  function wireLoginPage() {
    const form = qs("[data-login-form]");
    const email = qs("[data-email]");
    const password = qs("[data-password]");
    const alert = qs("[data-alert]");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      setAlert(alert, "error", "");
      const em = String(email?.value || "").trim();
      const pw = String(password?.value || "");
      if (!em || !pw) {
        setAlert(alert, "error", "Please enter your email and password.");
        return;
      }
      if (!isValidEmail(em)) {
        setAlert(alert, "error", "Please enter a valid email address.");
        return;
      }
      firebase.auth().signInWithEmailAndPassword(em, pw)
        .catch((error) => {
          setAlert(alert, "error", error.message);
        });
    });
  }

  function wireRegisterPage() {
    const form = qs("[data-register-form]");
    const username = qs("[data-username]");
    const email = qs("[data-email]");
    const password = qs("[data-password]");
    const alert = qs("[data-alert]");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      setAlert(alert, "error", "");
      const un = String(username?.value || "").trim();
      const em = String(email?.value || "").trim();
      const pw = String(password?.value || "");
      if (!un || !em || !pw) {
        setAlert(alert, "error", "Please fill in all fields.");
        return;
      }
      if (!isValidUsername(un)) {
        setAlert(alert, "error", "Username must be 3–16 characters and start with a letter (letters, numbers, _).");
        return;
      }
      if (!isValidEmail(em)) {
        setAlert(alert, "error", "Please enter a valid email address.");
        return;
      }
      if (!isValidPassword(pw)) {
        setAlert(alert, "error", "Password must be at least 6 characters.");
        return;
      }
      firebase.auth().createUserWithEmailAndPassword(em, pw)
        .then((userCredential) => {
          const user = userCredential.user;
          return user.updateProfile({
            displayName: un
          }).then(() => {
            return db.collection("users").doc(user.uid).set({
              username: un,
              email: em,
              createdAt: new Date().toISOString()
            });
          });
        })
        .catch((error) => {
          setAlert(alert, "error", error.message);
        });
    });
  }

  /* --------------------------- App initialization --------------------------- */

  function init() {
    initTheme();
    wireModalClose();

    firebase.auth().onAuthStateChanged(async (user) => {
      const page = getPageName();
      const isAuthPage = page === "login" || page === "register";

      if (user) {
        if (isAuthPage) {
          window.location.href = "home.html";
          return;
        }

        setActiveNav();
        renderUserChip(user);

        if (page === "home") {
          renderHome(user);
          wireHomeInteractions(user);
        }
        if (page === "game") {
          renderGameDetails(user);
          wireGameInteractions(user);
        }
        if (page === "settings") {
          renderSettings(user);
          wireSettingsInteractions(user);
        }
      } else {
        if (!isAuthPage) {
          window.location.href = "index.html";
          return;
        }

        if (page === "login") wireLoginPage();
        if (page === "register") wireRegisterPage();
      }
    });
  }

  // Run the app
  init();
})();
