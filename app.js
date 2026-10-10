(function () {
  "use strict";

  const engine = window.VerbEngine;
  const stage = document.getElementById("stage");
  const input = document.getElementById("verb-input");
  const meta = document.getElementById("verb-meta");
  const chips = document.getElementById("verb-chips");
  const suggestions = document.getElementById("verb-suggestions");
  const status = document.getElementById("status");

  const state = {
    group: "godan",
    script: "kanji",
    entry: engine.defaultVerb("godan"),
    openStems: { a: false, i: false, u: false, e: false, o: false },
    openForms: {},
    teOpen: false,
    activeSuggestion: -1,
  };

  const VOWELS = [
    { key: "a", glyph: "あ" },
    { key: "i", glyph: "い" },
    { key: "u", glyph: "う" },
    { key: "e", glyph: "え" },
    { key: "o", glyph: "お" },
  ];

  function textOf(form) {
    if (!form) return "";
    if (state.script === "kana") return form.kana;
    if (state.script === "romaji") return form.romaji;
    return form.kanji;
  }

  function partText(part) {
    if (state.script === "romaji") return engine.kanaToRomaji(part.kana || part.text);
    if (state.script === "kana") return part.kana || part.text;
    return part.text;
  }

  function morphHTML(form) {
    if (!form || !form.parts) return escapeHTML(textOf(form));
    return form.parts.map((part) =>
      `<span class="${part.type}">${escapeHTML(partText(part))}</span>`
    ).join("");
  }

  function secondaryLine(form) {
    if (state.script === "kanji") return `${form.kana} · ${form.romaji}`;
    if (state.script === "kana") return `${form.kanji} · ${form.romaji}`;
    return `${form.kanji} · ${form.kana}`;
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showStatus(message) {
    if (!message) {
      status.hidden = true;
      status.textContent = "";
      return;
    }
    status.hidden = false;
    status.textContent = message;
  }

  function currentResult() {
    return engine.conjugate(state.entry, state.group);
  }

  function renderChips() {
    const list = engine.verbsFor(state.group).slice(0, 8);
    chips.innerHTML = list.map((verb) => `
      <button type="button" class="chip${verb.id === state.entry.id ? " is-active" : ""}" data-verb-id="${verb.id}">
        ${escapeHTML(verb.kanji)}<small>${escapeHTML(verb.meaning.replace(/^to /, ""))}</small>
      </button>
    `).join("");
  }

  function renderMini(form) {
    if (!form) return `<div class="paradigm-cell is-empty">—</div>`;
    return `
      <div class="paradigm-cell">
        <span class="morph">${morphHTML(form)}</span>
        <p class="form-sub">${escapeHTML(secondaryLine(form))}</p>
      </div>
    `;
  }

  function renderFamily(form) {
    if (!form.family) return "";
    const fam = form.family;
    let html = "";
    if (fam.chart && fam.chart.length) {
      const hasCasual = fam.chart.some((row) => row.casual);
      const hasPolite = fam.chart.some((row) => row.polite);
      html += `<div class="chart cols-${(hasCasual ? 1 : 0) + (hasPolite ? 1 : 0)}">`;
      html += `<span class="chart-h"></span>`;
      if (hasCasual) html += `<span class="chart-h">Casual</span>`;
      if (hasPolite) html += `<span class="chart-h">Polite</span>`;
      fam.chart.forEach((row) => {
        html += `<span class="chart-h">${escapeHTML(row.label)}</span>`;
        if (hasCasual) html += renderMini(row.casual);
        if (hasPolite) html += renderMini(row.polite);
      });
      html += `</div>`;
    }
    if (fam.extra && fam.extra.length) {
      html += `<p class="extra-label">Also</p><div class="extra-grid">`;
      html += fam.extra.map((item) => `
        <div class="paradigm-cell">
          <span class="cell-label">${escapeHTML(item.label || "")}</span>
          <span class="morph">${morphHTML(item)}</span>
          <p class="form-sub">${escapeHTML(secondaryLine(item))}</p>
        </div>
      `).join("");
      html += `</div>`;
    }
    return html;
  }

  function previewLine(form) {
    if (!form.family || !form.family.chart) return "";
    const bits = [];
    form.family.chart.forEach((row) => {
      if (row.casual && row.casual.kanji !== form.kanji) bits.push(textOf(row.casual));
      if (row.polite) bits.push(textOf(row.polite));
    });
    return bits.slice(0, 4).join(" · ");
  }

  function renderFormCard(form, id, stemKey) {
    const open = !!state.openForms[id];
    const preview = previewLine(form);
    const stemVar = stemKey && "aiueo".includes(stemKey) ? stemKey : "u";
    return `
      <article class="form-card${open ? " is-open" : ""}${form.family ? " has-family" : ""}" style="--stem: var(--${stemVar})">
        <button type="button" class="form-head" data-form-id="${escapeHTML(id)}" aria-expanded="${open}">
          <span class="form-label">${escapeHTML(form.label)} <span class="more" aria-hidden="true"></span></span>
          <span class="morph">${morphHTML(form)}</span>
          <p class="form-sub">${escapeHTML(secondaryLine(form))}</p>
          ${preview ? `<p class="form-preview">${escapeHTML(preview)}</p>` : ""}
        </button>
        <div class="form-detail">
          <span class="attach">+ ${escapeHTML(form.attach || "")}</span>
          <p>${escapeHTML(form.note || "Attach this ending to the stem shown above.")}</p>
          ${form.alt ? `<p>Also: <span class="morph" style="display:inline-flex">${morphHTML(form.alt)}</span> (${escapeHTML(form.alt.romaji)})</p>` : ""}
          ${renderFamily(form)}
        </div>
      </article>
    `;
  }

  function renderGodan(result) {
    const g = result.godan;
    if (g.error) {
      stage.innerHTML = `<div class="rule-banner"><h2>Need a Godan verb</h2><p>${escapeHTML(g.error)}</p></div>`;
      return;
    }
    const entry = result.entry;
    const sourceForm = { kanji: entry.kanji, kana: entry.kana, romaji: engine.kanaToRomaji(entry.kana), parts: g.branches.u[0].parts };

    stage.innerHTML = `
      <div class="rule-banner">
        <h2>Godan vowel-shift map</h2>
        <p>${escapeHTML(g.mechanism)} Click a family (causative, passive, ます…) to open every casual and polite tense of that form.</p>
      </div>
      <div class="flow-source">
        <p class="source-label">Dictionary form · 終止形</p>
        <p class="source-verb morph">${morphHTML(sourceForm)}</p>
        <p class="source-reading">${escapeHTML(entry.kana)} · ${escapeHTML(engine.kanaToRomaji(entry.kana))} · ${escapeHTML(entry.meaning)}</p>
      </div>
      <div class="flow-tree">
        <div class="vowel-rail">
          ${VOWELS.map(({ key, glyph }) => {
            const stem = g.stems[key];
            const open = !!state.openStems[key];
            const stemForm = { kanji: stem.kanji, kana: stem.kana, romaji: stem.romaji, parts: [{ text: stem.kanji.slice(0, -1), kana: stem.kana.slice(0, -1), type: "root" }, { text: stem.vowelKana, kana: stem.vowelKana, type: "stem-" + key }] };
            return `
              <article class="stem-card${open ? " is-open" : ""}" data-stem="${key}">
                <button type="button" class="stem-head" data-stem-toggle="${key}" aria-expanded="${open}">
                  <span class="vowel-glyph">${glyph}</span>
                  <span class="stem-title">${escapeHTML(stem.title)} · ${escapeHTML(stem.jp)}</span>
                  <span class="stem-form morph">${morphHTML(stemForm)}</span>
                  <span class="stem-rule">${escapeHTML(stem.mechanism)}</span>
                  <span class="more" aria-hidden="true"></span>
                </button>
                <div class="stem-body">
                  <div class="stem-body-inner">
                    <div class="form-stack">
                      ${g.branches[key].map((form, index) => renderFormCard(form, `g-${key}-${index}`, key)).join("")}
                    </div>
                  </div>
                </div>
              </article>
            `;
          }).join("")}
        </div>
      </div>
      <section class="te-panel${state.teOpen ? " is-open" : ""}">
        <button type="button" class="te-toggle" data-te-toggle aria-expanded="${state.teOpen}">
          <span>
            <strong>Special path: te / ta form · 音便</strong>
            <span>Godan does not simply add て / た. The last sound picks a euphony rule.</span>
          </span>
          <span class="caret">${state.teOpen ? "▾" : "▸"} ${escapeHTML(g.teForm.te.kanji)} / ${escapeHTML(g.teForm.ta.kanji)}</span>
        </button>
        <div class="te-body">
          <div class="path-grid">
            ${g.teForm.paths.map((path) => `
              <button type="button" class="path-card${path.id === g.teForm.rule.id || (g.teForm.rule.id === "iku" && path.id === "ita") ? " is-current" : ""}" data-path="${path.id}" disabled>
                <strong>${escapeHTML(path.endings)}</strong>
                <div>→ ${escapeHTML(path.ta)} / ${escapeHTML(path.te)}</div>
                <small>${escapeHTML(path.example)}</small>
              </button>
            `).join("")}
          </div>
          <div class="result-row">
            ${renderFormCard(g.teForm.te, "g-te", "u")}
            ${renderFormCard(g.teForm.ta, "g-ta", "u")}
          </div>
          ${g.teForm.rule.id === "iku" ? `<p class="form-sub" style="padding:8px 4px 0">行く is highlighted on the く path because it breaks the usual いて / いた pattern.</p>` : ""}
        </div>
      </section>
    `;
  }

  function renderIchidan(result) {
    const data = result.ichidan;
    if (data.error) {
      stage.innerHTML = `<div class="rule-banner"><h2>Need an Ichidan verb</h2><p>${escapeHTML(data.error)}</p></div>`;
      return;
    }
    const entry = result.entry;
    stage.innerHTML = `
      <div class="rule-banner">
        <h2>Ichidan drop-る rule</h2>
        <p>${escapeHTML(data.stem.mechanism)} Click a family to open negative, past, polite, te, and the rest — not just the citation form.</p>
      </div>
      <div class="ichidan-flow">
        <div class="flow-source">
          <p class="source-label">Dictionary base</p>
          <p class="source-verb morph">${morphHTML(data.dictionary)}</p>
          <p class="source-reading">${escapeHTML(entry.kana)} · ${escapeHTML(engine.kanaToRomaji(entry.kana))} · ${escapeHTML(entry.meaning)}</p>
        </div>
        <div class="drop-arrow" aria-hidden="true"></div>
        <div class="stem-pill">${escapeHTML(state.script === "romaji" ? data.stem.romaji : state.script === "kana" ? data.stem.kana : data.stem.kanji)}</div>
      </div>
      <div class="ichidan-grid">
        ${data.branches.map((form, index) => renderFormCard(form, `i-${index}`, "i")).join("")}
      </div>
    `;
  }

  function renderIrregular(result) {
    const data = result.irregular;
    if (data.error) {
      stage.innerHTML = `<div class="rule-banner"><h2>Need する or 来る</h2><p>${escapeHTML(data.error)}</p></div>`;
      return;
    }

    const suruEntry = engine.findVerb("する") || engine.VERBS.find((v) => v.id === "suru");
    const kuruEntry = engine.findVerb("来る") || engine.VERBS.find((v) => v.id === "kuru");
    const suru = engine.conjugate(state.entry.kana.endsWith("する") ? state.entry : suruEntry, "irregular").irregular;
    const kuru = engine.conjugate(kuruEntry, "irregular").irregular;
    const focus = data.kind;

    stage.innerHTML = `
      <div class="rule-banner">
        <h2>Irregular verbs · 不規則</h2>
        <p>Only two verbs are truly irregular. Click a family on either card to see casual vs polite, present vs past, and the related endings.</p>
      </div>
      <div class="irregular-grid">
        ${renderIrregularCard(suru, "suru", focus === "suru")}
        ${renderIrregularCard(kuru, "kuru", focus === "kuru")}
      </div>
    `;
  }

  function renderIrregularCard(data, kind, featured) {
    return `
      <section class="irregular-card" data-kind="${kind}" style="${featured ? "outline:2px solid var(--ink)" : ""}">
        <h2>${escapeHTML(data.title)}</h2>
        <p class="lead">${escapeHTML(data.note)}</p>
        <div class="irregular-list">
          ${data.branches.map((form, index) => renderFormCard(form, `${kind}-${index}`, kind === "kuru" ? "a" : "i")).join("")}
        </div>
      </section>
    `;
  }

  function render() {
    renderChips();
    meta.textContent = `${state.entry.kanji} · ${state.entry.kana} · ${engine.kanaToRomaji(state.entry.kana)} — ${state.entry.meaning}`;
    if (document.activeElement !== input) {
      input.value = state.entry.kanji;
    }
    document.querySelectorAll(".group-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.group === state.group);
    });
    document.querySelectorAll(".script-toggle button").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.script === state.script);
    });

    const result = currentResult();
    const err = result.godan?.error || result.ichidan?.error || result.irregular?.error;
    showStatus(err || "");

    if (state.group === "godan") renderGodan(result);
    else if (state.group === "ichidan") renderIchidan(result);
    else renderIrregular(result);
  }

  function applyVerb(entry, group) {
    state.entry = entry;
    if (group) state.group = group;
    else if (entry.group) state.group = entry.group;
    state.openForms = {};
    render();
  }

  function tryInput(raw, commit) {
    const found = engine.findVerb(raw, state.group) || engine.findVerb(raw);
    if (found) {
      if (commit) applyVerb(found, found.group === state.group ? state.group : found.group);
      return found;
    }
    if (!commit) return null;
    const parsed = engine.parseCustom(raw, state.group);
    if (parsed.error) {
      showStatus(parsed.error);
      return null;
    }
    applyVerb(parsed.entry, state.group);
    return parsed.entry;
  }

  function updateSuggestions() {
    const q = input.value.trim().toLowerCase();
    const pool = engine.verbsFor(state.group);
    const matches = pool.filter((verb) =>
      !q ||
      verb.kanji.includes(input.value.trim()) ||
      verb.kana.includes(engine.kataToHira(input.value.trim())) ||
      engine.kanaToRomaji(verb.kana).startsWith(q) ||
      verb.meaning.toLowerCase().includes(q)
    ).slice(0, 8);

    if (!q || matches.length === 0) {
      suggestions.hidden = true;
      suggestions.innerHTML = "";
      state.activeSuggestion = -1;
      return;
    }

    suggestions.hidden = false;
    suggestions.innerHTML = matches.map((verb, index) => `
      <li>
        <button type="button" data-verb-id="${verb.id}" class="${index === state.activeSuggestion ? "is-active" : ""}">
          <span>${escapeHTML(verb.kanji)} · ${escapeHTML(verb.kana)}</span>
          <span>${escapeHTML(verb.meaning)}</span>
        </button>
      </li>
    `).join("");
  }

  document.querySelector(".group-select").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-group]");
    if (!btn) return;
    state.group = btn.dataset.group;
    state.entry = engine.defaultVerb(state.group);
    state.openForms = {};
    state.openStems = { a: false, i: false, u: false, e: false, o: false };
    state.teOpen = false;
    render();
  });

  document.querySelector(".script-toggle").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-script]");
    if (!btn) return;
    state.script = btn.dataset.script;
    render();
  });

  chips.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-verb-id]");
    if (!btn) return;
    const verb = engine.VERBS.find((item) => item.id === btn.dataset.verbId);
    if (verb) applyVerb(verb, state.group);
  });

  suggestions.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-verb-id]");
    if (!btn) return;
    const verb = engine.VERBS.find((item) => item.id === btn.dataset.verbId);
    suggestions.hidden = true;
    if (verb) applyVerb(verb, state.group);
  });

  input.addEventListener("input", () => {
    updateSuggestions();
    const raw = input.value.trim();
    if (!raw) return;
    const found = engine.findVerb(raw) || engine.findVerb(raw, state.group);
    if (found) {
      state.entry = found;
      if (found.group) state.group = found.group;
      render();
      return;
    }
    const parsed = engine.parseCustom(raw, state.group);
    if (!parsed.error) {
      state.entry = parsed.entry;
      render();
    }
  });

  input.addEventListener("keydown", (event) => {
    const buttons = [...suggestions.querySelectorAll("button")];
    if (event.key === "ArrowDown" && !suggestions.hidden) {
      event.preventDefault();
      state.activeSuggestion = Math.min(buttons.length - 1, state.activeSuggestion + 1);
      updateSuggestions();
    } else if (event.key === "ArrowUp" && !suggestions.hidden) {
      event.preventDefault();
      state.activeSuggestion = Math.max(0, state.activeSuggestion - 1);
      updateSuggestions();
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (!suggestions.hidden && state.activeSuggestion >= 0 && buttons[state.activeSuggestion]) {
        buttons[state.activeSuggestion].click();
      } else {
        suggestions.hidden = true;
        tryInput(input.value, true);
      }
    } else if (event.key === "Escape") {
      suggestions.hidden = true;
    }
  });

  input.addEventListener("blur", () => {
    window.setTimeout(() => {
      suggestions.hidden = true;
      if (input.value.trim() && input.value.trim() !== state.entry.kanji) {
        tryInput(input.value, true);
      }
    }, 120);
  });

  stage.addEventListener("click", (event) => {
    const stemBtn = event.target.closest("[data-stem-toggle]");
    if (stemBtn) {
      const key = stemBtn.dataset.stemToggle;
      state.openStems[key] = !state.openStems[key];
      const card = stemBtn.closest(".stem-card");
      card.classList.toggle("is-open", state.openStems[key]);
      stemBtn.setAttribute("aria-expanded", String(state.openStems[key]));
      return;
    }
    const teBtn = event.target.closest("[data-te-toggle]");
    if (teBtn) {
      state.teOpen = !state.teOpen;
      const panel = teBtn.closest(".te-panel");
      panel.classList.toggle("is-open", state.teOpen);
      teBtn.setAttribute("aria-expanded", String(state.teOpen));
      const caret = teBtn.querySelector(".caret");
      if (caret) caret.textContent = caret.textContent.replace(/^[▾▸]/, state.teOpen ? "▾" : "▸");
      return;
    }
    const formBtn = event.target.closest("[data-form-id]");
    if (formBtn) {
      const id = formBtn.dataset.formId;
      state.openForms[id] = !state.openForms[id];
      const card = formBtn.closest(".form-card");
      card.classList.toggle("is-open", state.openForms[id]);
      formBtn.setAttribute("aria-expanded", String(state.openForms[id]));
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".verb-field")) suggestions.hidden = true;
  });

  render();
})();
