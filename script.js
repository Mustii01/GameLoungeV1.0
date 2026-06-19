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
      id: "flappy-bird",
      title: "Flappy Bird",
      genre: "Arcade",
      developer: "Mustii01",
      releaseDate: "2024-01-01",
      shortDescription: "A classic Flappy Bird clone.",
      longDescription: "Story:\nTap to flap and avoid the pipes!\n\nGameplay:\nNavigate your bird through the gaps in the pipes to get the highest score possible.\n\nFeatures:\n• Classic arcade gameplay\n• Simple controls",
      itchEmbed: "https://itch.io/embed-upload/17985846?color=333333",
      itchLink: "https://mustii01.itch.io/flappy-bird",
      coverImage: "images/flappybirdcover.png"
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
      coverImage: "images/coming-soon-background-with-focus-light-effect-design_1017-27277.avif"
    },
    {
      id: "star-forge",
      title: "Star Forge",
      genre: "Action Roguelike",
      developer: "GameLounge Studio",
      releaseDate: "2025-11-21",
      shortDescription: "Build wild weapon combos and survive shifting nebula arenas.",
      longDescription:
        "Story:\nA broken forge drifts between stars — and it still hungers.\n\nGameplay:\nFast combat with modular weapons, perks, and enemies that evolve each run.\n\nFeatures:\n• Procedural encounters\n• Synergy-driven builds\n• Bosses with phase mechanics\n• Run modifiers for endless replay",
      coverImage: "images/coming-soon-background-with-focus-light-effect-design_1017-27277.avif"
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
      coverImage: "images/coming-soon-background-with-focus-light-effect-design_1017-27277.avif"
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
      coverImage: "images/coming-soon-background-with-focus-light-effect-design_1017-27277.avif"
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
      coverImage: "images/coming-soon-background-with-focus-light-effect-design_1017-27277.avif"
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

  /* ------------------------------ Firebase Helpers ------------------------------ */

  // Get game likes from Firestore
  async function getGameLikeCount(gameId) {
    try {
      const doc = await db.collection("games").doc(gameId).get();
      if (doc.exists) {
        const data = doc.data();
        return data.likes || 0;
      }
      return 0;
    } catch (e) {
      console.error("Error getting likes:", e);
      return 0;
    }
  }

  // Check if user likes a game
  async function userLikesGame(userEmail, gameId) {
    try {
      const doc = await db.collection("userLikes").doc(`${normalizeEmail(userEmail)}_${gameId}`).get();
      return doc.exists;
    } catch (e) {
      console.error("Error checking like:", e);
      return false;
    }
  }

  // Toggle like for a game
  async function toggleLike(userEmail, gameId) {
    const email = normalizeEmail(userEmail);
    const likeDocId = `${email}_${gameId}`;
    
    try {
      const doc = await db.collection("userLikes").doc(likeDocId).get();
      const currentlyLiked = doc.exists;
      
      // Update user like document
      if (currentlyLiked) {
        await db.collection("userLikes").doc(likeDocId).delete();
      } else {
        await db.collection("userLikes").doc(likeDocId).set({
          email,
          gameId,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      
      // Update game like count
      const gameDoc = await db.collection("games").doc(gameId).get();
      let currentLikes = 0;
      if (gameDoc.exists) {
        currentLikes = gameDoc.data().likes || 0;
      }
      
      const newLikes = currentlyLiked ? currentLikes - 1 : currentLikes + 1;
      await db.collection("games").doc(gameId).set({
        likes: Math.max(0, newLikes)
      }, { merge: true });
      
      return !currentlyLiked;
    } catch (e) {
      console.error("Error toggling like:", e);
      return false;
    }
  }

  // Get reviews from Firestore
  async function getGameReviews(gameId) {
    try {
      console.log("Getting reviews for game:", gameId);
      const snapshot = await db.collection("reviews")
        .where("gameId", "==", gameId)
        .get();
      
      const reviews = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log("Review doc:", doc.id, data);
        return {
          id: doc.id,
          ...data
        };
      });
      // Sort reviews manually by createdAt descending
      reviews.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return dateB - dateA;
      });
      console.log("Total reviews found:", reviews.length);
      return reviews;
    } catch (e) {
      console.error("Error getting reviews:", e);
      return [];
    }
  }

  // Add review to Firestore
  async function addReview({ gameId, email, username, rating, text }) {
    const safeRating = Math.max(1, Math.min(5, Number(rating) || 0));
    const review = {
      gameId,
      email: normalizeEmail(email),
      username: normalizeUsername(username),
      rating: safeRating,
      text: String(text || "").trim(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
      console.log("Adding review to Firestore:", review);
      const docRef = await db.collection("reviews").add(review);
      console.log("Review added with ID:", docRef.id);
      return { ...review, id: docRef.id };
    } catch (e) {
      console.error("Error adding review:", e);
      throw e;
    }
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

  /* ------------------------------- Review Rendering ------------------------------- */

  function renderStars(rating) {
    const r = Math.max(1, Math.min(5, Number(rating) || 0));
    const el = document.createElement("span");
    el.className = "stars";
    el.setAttribute("aria-label", `${r} out of 5 stars`);
    el.textContent = "★★★★★".slice(0, r) + "☆☆☆☆☆".slice(0, 5 - r);
    return el;
  }

  function renderReviewItem(review) {
    console.log("Rendering review:", review);
    const item = document.createElement("div");
    item.className = "review";

    const top = document.createElement("div");
    top.className = "review__top";

    const who = document.createElement("div");
    who.className = "review__who";
    who.textContent = review.username || review.email || "Anonymous";

    const meta = document.createElement("div");
    meta.className = "review__meta";
    let dateStr = "";
    if (review.createdAt) {
      if (review.createdAt.toDate) {
        dateStr = formatDate(review.createdAt.toDate().toISOString());
      } else if (typeof review.createdAt === "string") {
        dateStr = formatDate(review.createdAt);
      }
    }
    meta.textContent = dateStr || "Recently";

    top.appendChild(who);
    top.appendChild(meta);

    const stars = renderStars(review.rating || 3);

    const text = document.createElement("p");
    text.className = "review__text";
    text.textContent = review.text || "";

    item.appendChild(top);
    item.appendChild(stars);
    item.appendChild(text);
    return item;
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

  function createGameCard({ game, account, likeCount, userLiked }) {
    const card = document.createElement("article");
    card.className = "card game-card";
    card.dataset.gameId = game.id;

    const cover = document.createElement("div");
    cover.className = "game-card__cover";
    cover.style.backgroundImage = `url(${game.coverImage})`;
    cover.style.backgroundSize = "cover";
    cover.style.backgroundPosition = "center";
    cover.setAttribute("role", "img");
    cover.setAttribute("aria-label", `${game.title} cover image`);

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
    like.setAttribute("aria-pressed", String(userLiked));

    const icon = document.createElement("span");
    icon.className = "like-btn__icon";
    icon.textContent = "♥";

    const count = document.createElement("span");
    count.className = "small";
    count.dataset.likeCount = "true";
    count.textContent = String(likeCount);

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
    reviewCount.dataset.gameId = game.id;
    reviewCount.textContent = "0 reviews";

    meta.appendChild(genre);
    meta.appendChild(reviewCount);

    const actions = document.createElement("div");
            actions.className = "btn-row";

            const viewBtn = document.createElement("a");
            viewBtn.className = "btn btn--primary";
            viewBtn.href = `game.html?id=${encodeURIComponent(game.id)}`;
            viewBtn.textContent = "View Game";

            const reviewBtn = document.createElement("button");
            reviewBtn.type = "button";
            reviewBtn.className = "btn btn--ghost";
            reviewBtn.dataset.action = "review";
            reviewBtn.textContent = "Review";

            actions.appendChild(viewBtn);
            actions.appendChild(reviewBtn);

    body.appendChild(titleRow);
    body.appendChild(desc);
    body.appendChild(meta);
    body.appendChild(actions);

    card.appendChild(cover);
    card.appendChild(body);
    return card;
  }

  async function renderHome(account) {
    const heroTitle = qs("[data-hero-title]");
    const heroSub = qs("[data-hero-subtitle]");
    setText(heroTitle, "Indie releases, presented like a premium studio portfolio.");
    setText(
      heroSub,
      "Browse our Godot projects, read about our dev team, like your favourites, now with Firebase!"
    );

    const featured = GAMES[0];
    setText(qs("[data-featured-title]"), featured.title);
    setText(qs("[data-featured-genre]"), featured.genre);
    setText(qs("[data-featured-desc]"), featured.shortDescription);
    const featuredLink = qs("[data-featured-link]");
    if (featuredLink) featuredLink.href = `game.html?id=${encodeURIComponent(featured.id)}`;

    const featuredLikeCount = await getGameLikeCount(featured.id);
    const featuredLiked = await userLikesGame(account.email, featured.id);
    const featuredLikeBtn = qs("[data-featured-like]");
    if (featuredLikeBtn) {
      featuredLikeBtn.setAttribute("aria-pressed", String(featuredLiked));
      setText(qs("[data-featured-like-count]"), String(featuredLikeCount));
    }

    const grid = qs("[data-game-grid]");
    if (!grid) return;
    grid.innerHTML = "";
    
    for (const game of GAMES) {
      const likeCount = await getGameLikeCount(game.id);
      const userLikedGame = await userLikesGame(account.email, game.id);
      const card = createGameCard({ game, account, likeCount, userLiked: userLikedGame });
      grid.appendChild(card);
      
      // Load review count
      const reviews = await getGameReviews(game.id);
      const reviewCountEl = qs(`[data-review-count="true"][data-game-id="${game.id}"]`, card);
      if (reviewCountEl) {
        reviewCountEl.textContent = `${reviews.length} reviews`;
      }
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
    saveBtn.addEventListener("click", async () => {
      const text = String(textArea.value || "").trim();
      if (!text) {
        setAlert(alert, "error", "Please write a short review before saving.");
        return;
      }
      try {
        await addReview({
          gameId: game.id,
          email: account.email,
          username: account.displayName,
          rating: Number(ratingSelect.value),
          text,
        });
        if (typeof onSaved === "function") onSaved();
        closeModal();
      } catch (e) {
        setAlert(alert, "error", "Failed to save review. Please try again.");
      }
    });

    openModal({ title: `Review — ${game.title}`, contentNode: wrapper });
  }

  function wireHomeInteractions(account) {
    const root = qs("[data-game-grid]");
    if (root) {
      root.addEventListener("click", async (e) => {
        const target = e.target instanceof Element ? e.target.closest("[data-action]") : null;
        if (!target) return;
        const card = target.closest("[data-game-id]");
        const gameId = card?.dataset?.gameId;
        const game = GAMES.find((g) => g.id === gameId);
        if (!game) return;

        const action = target.getAttribute("data-action");
        if (action === "like") {
          const liked = await toggleLike(account.email, game.id);
          target.setAttribute("aria-pressed", String(liked));
          const newCount = await getGameLikeCount(game.id);
          const countEl = qs("[data-like-count=\"true\"]", target);
          if (countEl) countEl.textContent = String(newCount);
          
          // Update featured like count if it's the featured game
          if (gameId === GAMES[0].id) {
            setText(qs("[data-featured-like-count]"), String(newCount));
          }
          return;
        }
        if (action === "review") {
          openQuickReviewModal({
            game,
            account,
            onSaved: async () => {
              const countEl = qs("[data-review-count=\"true\"]", card);
              if (countEl) {
                const reviews = await getGameReviews(game.id);
                countEl.textContent = `${reviews.length} reviews`;
              }
            },
          });
        }
      });
    }

    const featuredLike = qs("[data-featured-like]");
    if (featuredLike) {
      featuredLike.addEventListener("click", async () => {
        const featured = GAMES[0];
        const liked = await toggleLike(account.email, featured.id);
        featuredLike.setAttribute("aria-pressed", String(liked));
        const newCount = await getGameLikeCount(featured.id);
        setText(qs("[data-featured-like-count]"), String(newCount));
      });
    }
  }

  /* ------------------------------ Game details ------------------------------ */

  async function renderGameDetails(account) {
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

    const cover = qs(".cover-lg");
    if (cover) {
      // Don't autostart Flappy Bird - just show cover image
      if (game.coverImage) {
        cover.style.backgroundImage = `url(${game.coverImage})`;
        cover.style.backgroundSize = "cover";
        cover.style.backgroundPosition = "center";
        cover.innerHTML = "";
      }
    }

    const likeCount = await getGameLikeCount(game.id);
    const liked = await userLikesGame(account.email, game.id);
    const likeBtn = qs("[data-game-like]");
    if (likeBtn) {
      likeBtn.setAttribute("aria-pressed", String(liked));
      setText(qs("[data-game-like-count]"), String(likeCount));
    }

    const reviews = await getGameReviews(game.id);
    const reviewCount = qs("[data-game-review-count]");
    if (reviewCount) reviewCount.textContent = `${reviews.length} reviews`;

    renderGameReviews(reviews);

    // Add controls section for Flappy Bird
    const aboutSection = qs(".section.grid.grid--2");
    if (aboutSection && game.id === "flappy-bird") {
      // Check if controls section already exists
      if (!qs("[data-controls-section]")) {
        const controlsCard = document.createElement("div");
        controlsCard.className = "card";
        controlsCard.setAttribute("data-controls-section", "true");
        controlsCard.innerHTML = `
          <div class="card__pad-lg">
            <h2 class="title" style="font-size: 18px; margin: 0">Controls</h2>
            <p class="subtitle" style="margin-top: 8px">spacebar to jump</p>
          </div>
        `;
        aboutSection.appendChild(controlsCard);
      }
    }

    // Update screenshots for Flappy Bird
    const screenshotsContainer = qs(".section.screenshots");
    if (screenshotsContainer && game.id === "flappy-bird") {
      const imageFiles = [
        "Screenshotflappybird1.png",
        "Screenshotflappybird2.png",
        "Screenshotflappybird3.png",
        "Screenshotflappybird4.png",
        "Screenshotflappybird5.png",
        "Screenshotflappybird6.png"
      ];
      screenshotsContainer.innerHTML = "";
      imageFiles.forEach((imgFile) => {
        const img = document.createElement("img");
        img.src = `images/${imgFile}`;
        img.alt = "Flappy Bird screenshot";
        img.className = "shot";
        img.style.height = "140px";
        img.style.width = "100%";
        img.style.objectFit = "cover";
        img.style.borderRadius = "var(--radius-md)";
        img.style.border = "1px solid var(--stroke)";
        screenshotsContainer.appendChild(img);
      });
    }
  }

  function renderGameReviews(reviews) {
    const list = qs("[data-review-list]");
    if (!list) return;
    list.innerHTML = "";
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
      likeBtn.addEventListener("click", async () => {
        const liked = await toggleLike(account.email, game.id);
        likeBtn.setAttribute("aria-pressed", String(liked));
        const newCount = await getGameLikeCount(game.id);
        setText(qs("[data-game-like-count]"), String(newCount));
      });
    }

    const playBtn = qs("[data-game-play]");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        if (game.itchEmbed) {
          const panel = document.createElement("div");
          panel.style.display = "flex";
          panel.style.justifyContent = "center";
          panel.style.alignItems = "center";
          panel.style.padding = "20px";
          panel.innerHTML = `<iframe height="600" frameborder="0" src="${game.itchEmbed}" width="800" style="max-width: 100%; border-radius: 8px; background: #000;"></iframe>`;
          openModal({ title: `Play — ${game.title}`, contentNode: panel });
          return;
        }
        if (game.itchLink) {
          window.open(game.itchLink, "_blank");
          return;
        }
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
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        setAlert(alert, "error", "");
        const reviewText = String(text?.value || "").trim();
        if (!reviewText) {
          setAlert(alert, "error", "Please write a review before submitting.");
          return;
        }
        try {
          console.log("Adding review...");
          await addReview({
            gameId: game.id,
            email: account.email,
            username: account.displayName,
            rating: Number(rating?.value || 3),
            text: reviewText,
          });
          console.log("Review added successfully!");
          if (text) text.value = "";
          setAlert(alert, "success", "Review saved.");
          const reviews = await getGameReviews(game.id);
          console.log("Fetched reviews:", reviews);
          setText(qs("[data-game-review-count]"), `${reviews.length} reviews`);
          renderGameReviews(reviews);
        } catch (e) {
          console.error("Error saving review:", e);
          setAlert(alert, "error", "Failed to save review. Please try again.");
        }
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
        if (help) help.textContent = "Password changes can be initiated via Firebase's built-in email actions.";
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
          "Clear ALL local data?\n\nThis removes:\n- Theme preference\n\nThis cannot be undone."
        );
        if (!ok) return;
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
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
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

        // Realtime listener for user document
        db.collection("users").doc(user.uid).onSnapshot((doc) => {
          if (doc.exists) {
            const data = doc.data();
            
            // Apply realtime username changes
            if (data.username) {
              renderUserChip({ displayName: data.username, email: user.email });
              if (page === "settings") {
                setText(qs("[data-profile-username]"), data.username);
              }
            }
            
            // Apply realtime theme changes (still using localStorage)
            if (data.theme) {
              setTheme(data.theme);
              if (page === "settings") {
                setText(qs("[data-settings-theme]"), data.theme);
                const dark = qs("#themeDark");
                const light = qs("#themeLight");
                if (dark) dark.checked = data.theme === "dark";
                if (light) light.checked = data.theme === "light";
              }
            }
          }
        });

        setActiveNav();
        renderUserChip(user);

        if (page === "home") {
          await renderHome(user);
          wireHomeInteractions(user);
        }
        if (page === "game") {
          await renderGameDetails(user);
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
