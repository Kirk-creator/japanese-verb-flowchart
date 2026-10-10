(function (global) {
  "use strict";

  const GODAN_SHIFT = {
    う: { a: "わ", i: "い", u: "う", e: "え", o: "お" },
    く: { a: "か", i: "き", u: "く", e: "け", o: "こ" },
    ぐ: { a: "が", i: "ぎ", u: "ぐ", e: "げ", o: "ご" },
    す: { a: "さ", i: "し", u: "す", e: "せ", o: "そ" },
    つ: { a: "た", i: "ち", u: "つ", e: "て", o: "と" },
    ぬ: { a: "な", i: "に", u: "ぬ", e: "ね", o: "の" },
    ぶ: { a: "ば", i: "び", u: "ぶ", e: "べ", o: "ぼ" },
    む: { a: "ま", i: "み", u: "む", e: "め", o: "も" },
    る: { a: "ら", i: "り", u: "る", e: "れ", o: "ろ" },
  };

  const GODAN_ENDINGS = Object.keys(GODAN_SHIFT);

  const HIRA = "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔー";
  const KATA = "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴー";

  const DIGRAPHS = {
    きゃ: "kya", きゅ: "kyu", きょ: "kyo",
    しゃ: "sha", しゅ: "shu", しょ: "sho",
    ちゃ: "cha", ちゅ: "chu", ちょ: "cho",
    にゃ: "nya", にゅ: "nyu", にょ: "nyo",
    ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo",
    みゃ: "mya", みゅ: "myu", みょ: "myo",
    りゃ: "rya", りゅ: "ryu", りょ: "ryo",
    ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
    じゃ: "ja", じゅ: "ju", じょ: "jo",
    びゃ: "bya", びゅ: "byu", びょ: "byo",
    ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
    ぢゃ: "ja", ぢゅ: "ju", ぢょ: "jo",
  };

  const MONO = {
    あ: "a", い: "i", う: "u", え: "e", お: "o",
    か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
    さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
    た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
    な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
    は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
    ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
    や: "ya", ゆ: "yu", よ: "yo",
    ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
    わ: "wa", を: "o", ん: "n",
    が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
    ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
    だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
    ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
    ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
    ゔ: "vu", ー: "",
  };

  const ROMAJI_KANA = [
    ["kya", "きゃ"], ["kyu", "きゅ"], ["kyo", "きょ"],
    ["sha", "しゃ"], ["shu", "しゅ"], ["sho", "しょ"],
    ["cha", "ちゃ"], ["chu", "ちゅ"], ["cho", "ちょ"],
    ["nya", "にゃ"], ["nyu", "にゅ"], ["nyo", "にょ"],
    ["hya", "ひゃ"], ["hyu", "ひゅ"], ["hyo", "ひょ"],
    ["mya", "みゃ"], ["myu", "みゅ"], ["myo", "みょ"],
    ["rya", "りゃ"], ["ryu", "りゅ"], ["ryo", "りょ"],
    ["gya", "ぎゃ"], ["gyu", "ぎゅ"], ["gyo", "ぎょ"],
    ["ja", "じゃ"], ["ju", "じゅ"], ["jo", "じょ"],
    ["bya", "びゃ"], ["byu", "びゅ"], ["byo", "びょ"],
    ["pya", "ぴゃ"], ["pyu", "ぴゅ"], ["pyo", "ぴょ"],
    ["shi", "し"], ["chi", "ち"], ["tsu", "つ"],
    ["ka", "か"], ["ki", "き"], ["ku", "く"], ["ke", "け"], ["ko", "こ"],
    ["sa", "さ"], ["su", "す"], ["se", "せ"], ["so", "そ"],
    ["ta", "た"], ["te", "て"], ["to", "と"],
    ["na", "な"], ["ni", "に"], ["nu", "ぬ"], ["ne", "ね"], ["no", "の"],
    ["ha", "は"], ["hi", "ひ"], ["fu", "ふ"], ["he", "へ"], ["ho", "ほ"],
    ["ma", "ま"], ["mi", "み"], ["mu", "む"], ["me", "め"], ["mo", "も"],
    ["ya", "や"], ["yu", "ゆ"], ["yo", "よ"],
    ["ra", "ら"], ["ri", "り"], ["ru", "る"], ["re", "れ"], ["ro", "ろ"],
    ["wa", "わ"], ["wo", "を"],
    ["ga", "が"], ["gi", "ぎ"], ["gu", "ぐ"], ["ge", "げ"], ["go", "ご"],
    ["za", "ざ"], ["ji", "じ"], ["zu", "ず"], ["ze", "ぜ"], ["zo", "ぞ"],
    ["da", "だ"], ["de", "で"], ["do", "ど"],
    ["ba", "ば"], ["bi", "び"], ["bu", "ぶ"], ["be", "べ"], ["bo", "ぼ"],
    ["pa", "ぱ"], ["pi", "ぴ"], ["pu", "ぷ"], ["pe", "ぺ"], ["po", "ぽ"],
    ["nn", "ん"], ["n", "ん"],
    ["a", "あ"], ["i", "い"], ["u", "う"], ["e", "え"], ["o", "お"],
  ].sort((a, b) => b[0].length - a[0].length);

  const VERBS = [
    { id: "kaku", kanji: "書く", kana: "かく", meaning: "to write", group: "godan" },
    { id: "iku", kanji: "行く", kana: "いく", meaning: "to go", group: "godan" },
    { id: "yomu", kanji: "読む", kana: "よむ", meaning: "to read", group: "godan" },
    { id: "hanasu", kanji: "話す", kana: "はなす", meaning: "to speak", group: "godan" },
    { id: "nomu", kanji: "飲む", kana: "のむ", meaning: "to drink", group: "godan" },
    { id: "kau", kanji: "買う", kana: "かう", meaning: "to buy", group: "godan" },
    { id: "matsu", kanji: "待つ", kana: "まつ", meaning: "to wait", group: "godan" },
    { id: "oyogu", kanji: "泳ぐ", kana: "およぐ", meaning: "to swim", group: "godan" },
    { id: "asobu", kanji: "遊ぶ", kana: "あそぶ", meaning: "to play", group: "godan" },
    { id: "toru", kanji: "取る", kana: "とる", meaning: "to take", group: "godan" },
    { id: "tsukuru", kanji: "作る", kana: "つくる", meaning: "to make", group: "godan" },
    { id: "shinu", kanji: "死ぬ", kana: "しぬ", meaning: "to die", group: "godan" },
    { id: "tatsu", kanji: "立つ", kana: "たつ", meaning: "to stand", group: "godan" },
    { id: "kiku", kanji: "聞く", kana: "きく", meaning: "to listen / ask", group: "godan" },
    { id: "omou", kanji: "思う", kana: "おもう", meaning: "to think", group: "godan" },
    { id: "aru", kanji: "ある", kana: "ある", meaning: "to exist (inanimate)", group: "godan" },
    { id: "kaeru-g", kanji: "帰る", kana: "かえる", meaning: "to return (home)", group: "godan" },
    { id: "kiru-g", kanji: "切る", kana: "きる", meaning: "to cut", group: "godan" },
    { id: "shiru", kanji: "知る", kana: "しる", meaning: "to know", group: "godan" },
    { id: "hashiru", kanji: "走る", kana: "はしる", meaning: "to run", group: "godan" },
    { id: "hairu", kanji: "入る", kana: "はいる", meaning: "to enter", group: "godan" },
    { id: "au", kanji: "会う", kana: "あう", meaning: "to meet", group: "godan" },
    { id: "motsu", kanji: "持つ", kana: "もつ", meaning: "to hold", group: "godan" },
    { id: "yobu", kanji: "呼ぶ", kana: "よぶ", meaning: "to call", group: "godan" },
    { id: "isogu", kanji: "急ぐ", kana: "いそぐ", meaning: "to hurry", group: "godan" },
    { id: "dasu", kanji: "出す", kana: "だす", meaning: "to take out", group: "godan" },
    { id: "taberu", kanji: "食べる", kana: "たべる", meaning: "to eat", group: "ichidan" },
    { id: "miru", kanji: "見る", kana: "みる", meaning: "to see", group: "ichidan" },
    { id: "okiru", kanji: "起きる", kana: "おきる", meaning: "to wake up", group: "ichidan" },
    { id: "neru", kanji: "寝る", kana: "ねる", meaning: "to sleep", group: "ichidan" },
    { id: "akeru", kanji: "開ける", kana: "あける", meaning: "to open", group: "ichidan" },
    { id: "shimeru", kanji: "閉める", kana: "しめる", meaning: "to close", group: "ichidan" },
    { id: "oshieru", kanji: "教える", kana: "おしえる", meaning: "to teach", group: "ichidan" },
    { id: "oboeru", kanji: "覚える", kana: "おぼえる", meaning: "to remember", group: "ichidan" },
    { id: "iru", kanji: "いる", kana: "いる", meaning: "to exist (animate)", group: "ichidan" },
    { id: "kangaeru", kanji: "考える", kana: "かんがえる", meaning: "to think / consider", group: "ichidan" },
    { id: "hajimeru", kanji: "始める", kana: "はじめる", meaning: "to begin", group: "ichidan" },
    { id: "kiru-i", kanji: "着る", kana: "きる", meaning: "to wear", group: "ichidan" },
    { id: "kariru", kanji: "借りる", kana: "かりる", meaning: "to borrow", group: "ichidan" },
    { id: "oriru", kanji: "降りる", kana: "おりる", meaning: "to get off", group: "ichidan" },
    { id: "shinjiru", kanji: "信じる", kana: "しんじる", meaning: "to believe", group: "ichidan" },
    { id: "suteru", kanji: "捨てる", kana: "すてる", meaning: "to throw away", group: "ichidan" },
    { id: "shiraberu", kanji: "調べる", kana: "しらべる", meaning: "to check / look up", group: "ichidan" },
    { id: "suru", kanji: "する", kana: "する", meaning: "to do", group: "irregular" },
    { id: "kuru", kanji: "来る", kana: "くる", meaning: "to come", group: "irregular" },
    { id: "benkyou", kanji: "勉強する", kana: "べんきょうする", meaning: "to study", group: "irregular" },
    { id: "ryokou", kanji: "旅行する", kana: "りょこうする", meaning: "to travel", group: "irregular" },
  ];

  function kataToHira(str) {
    return String(str).replace(/[\u30A1-\u30F6ー]/g, (ch) => {
      const i = KATA.indexOf(ch);
      return i >= 0 ? HIRA[i] : ch;
    });
  }

  function isHiraganaChar(ch) {
    return HIRA.includes(ch);
  }

  function kanaToRomaji(input) {
    const s = kataToHira(String(input || ""));
    let out = "";
    for (let i = 0; i < s.length; i += 1) {
      const ch = s[i];
      const next = s[i + 1] || "";
      if (ch === "っ" || ch === "ッ") {
        const pair = DIGRAPHS[next + (s[i + 2] || "")];
        const mono = MONO[next];
        const rom = pair || mono || "";
        const cons = rom.replace(/[^bcdfghjklmnpqrstvwxyz].*$/i, "") || (rom[0] || "");
        out += cons;
        continue;
      }
      const two = ch + next;
      if (DIGRAPHS[two]) {
        out += DIGRAPHS[two];
        i += 1;
        continue;
      }
      if (MONO[ch] != null) {
        let piece = MONO[ch];
        if (ch === "ん" && /[aiueoy]/i.test((MONO[next] || DIGRAPHS[next + (s[i + 2] || "")] || "")[0] || "")) {
          piece = "n'";
        }
        out += piece;
        continue;
      }
      out += ch;
    }
    return out;
  }

  function romajiToHiragana(input) {
    let s = String(input || "").toLowerCase().replace(/['’]/g, "");
    s = s.replace(/ō|ô/g, "ou").replace(/ū|û/g, "uu").replace(/ā|â/g, "aa").replace(/ē|ê/g, "ei").replace(/ī|î/g, "ii");
    let out = "";
    let i = 0;
    while (i < s.length) {
      if (s[i] === "n" && (i === s.length - 1 || !"aeiouy".includes(s[i + 1]))) {
        out += "ん";
        i += 1;
        continue;
      }
      if (s[i] === s[i + 1] && !"aeiou n'".includes(s[i]) && /[bcdfghjklmnpqrstvwxyz]/.test(s[i])) {
        out += "っ";
        i += 1;
        continue;
      }
      let matched = false;
      for (const [rom, hira] of ROMAJI_KANA) {
        if (s.startsWith(rom, i)) {
          out += hira;
          i += rom.length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        out += s[i];
        i += 1;
      }
    }
    return out;
  }

  function lastKana(kana) {
    return kataToHira(kana).slice(-1);
  }

  function splitOkurigana(kanji, kana) {
    const k = kataToHira(kana);
    return {
      rootKanji: kanji.slice(0, -1),
      rootKana: k.slice(0, -1),
      ending: k.slice(-1),
    };
  }

  function form(kanji, kana, parts, extra) {
    return Object.assign({
      kanji,
      kana,
      romaji: kanaToRomaji(kana),
      parts,
    }, extra || {});
  }

  function parts(...items) {
    return items.filter((p) => p && p.text);
  }

  function suf(text) {
    return { text, kana: text, type: "suffix" };
  }

  function euph(text) {
    return { text, kana: text, type: "euphony" };
  }

  function add(stemKanji, stemKana, baseParts, suffix, extra) {
    return form(
      stemKanji + suffix,
      stemKana + suffix,
      parts(...baseParts, suffix ? suf(suffix) : null),
      extra
    );
  }

  function ichidanFamily(stemKanji, stemKana, baseParts) {
    const cell = (suffix, label) => add(stemKanji, stemKana, baseParts, suffix, { label, attach: suffix });
    return {
      chart: [
        { label: "Present", casual: cell("る", "Casual present"), polite: cell("ます", "Polite present") },
        { label: "Negative", casual: cell("ない", "Casual negative"), polite: cell("ません", "Polite negative") },
        { label: "Past", casual: cell("た", "Casual past"), polite: cell("ました", "Polite past") },
        { label: "Past neg.", casual: cell("なかった", "Casual past negative"), polite: cell("ませんでした", "Polite past negative") },
      ],
      extra: [
        cell("て", "Te-form"),
        cell("よう", "Volitional"),
        cell("れば", "If (ば)"),
        cell("たら", "If (たら)"),
        cell("ろ", "Imperative"),
        cell("なさい", "Soft command"),
      ],
    };
  }

  function naiFamily(preKanji, preKana, baseParts) {
    const cell = (suffix, label) => add(preKanji, preKana, baseParts, suffix, { label, attach: suffix });
    return {
      chart: [
        { label: "Present", casual: cell("ない", "Casual negative"), polite: cell("ないです", "Polite negative") },
        { label: "Past", casual: cell("なかった", "Casual past negative"), polite: cell("なかったです", "Polite past negative") },
      ],
      extra: [
        cell("なくて", "Te (なくて)"),
        cell("ないで", "Without / don't"),
        cell("なければ", "If not (ば)"),
        cell("なくても", "Even if not"),
      ],
    };
  }

  function taiFamily(iKanji, iKana, baseParts) {
    const cell = (suffix, label) => add(iKanji, iKana, baseParts, suffix, { label, attach: suffix });
    return {
      chart: [
        { label: "Present", casual: cell("たい", "Want to"), polite: cell("たいです", "Want to (polite)") },
        { label: "Negative", casual: cell("たくない", "Don't want to"), polite: cell("たくないです", "Don't want to (polite)") },
        { label: "Past", casual: cell("たかった", "Wanted to"), polite: cell("たかったです", "Wanted to (polite)") },
        { label: "Past neg.", casual: cell("たくなかった", "Didn't want to"), polite: cell("たくなかったです", "Didn't want to (polite)") },
      ],
      extra: [
        cell("たくて", "Te-form"),
        cell("たければ", "If (want to)"),
      ],
    };
  }

  function masuFamily(iKanji, iKana, baseParts) {
    const cell = (suffix, label) => add(iKanji, iKana, baseParts, suffix, { label, attach: suffix });
    return {
      chart: [
        { label: "Present", casual: null, polite: cell("ます", "Polite present") },
        { label: "Negative", casual: null, polite: cell("ません", "Polite negative") },
        { label: "Past", casual: null, polite: cell("ました", "Polite past") },
        { label: "Past neg.", casual: null, polite: cell("ませんでした", "Polite past negative") },
      ],
      extra: [
        cell("ましょう", "Let's (polite)"),
        cell("まして", "Te (polite)"),
      ],
    };
  }

  function headed(display, extra) {
    return Object.assign(display, extra);
  }

  function dictionaryFamily(dictKanji, dictKana, dictParts) {
    const cell = (suffix, label) => add(dictKanji, dictKana, dictParts, suffix, { label, attach: suffix });
    return {
      chart: [
        { label: "こと", casual: cell("こと", "Nominalizer こと"), polite: cell("ことです", "ことです") },
        { label: "の", casual: cell("の", "Nominalizer の"), polite: cell("のです", "のです") },
        { label: "と", casual: cell("と", "Quote / if と"), polite: cell("と思います", "と思います") },
      ],
      extra: [
        cell("ことができる", "Can (ことが)"),
        cell("ことにする", "Decide to"),
        cell("ことになる", "It is decided"),
        cell("ことがある", "There are times"),
        cell("んだ", "んだ (casual のだ)"),
        cell("という", "Called / that"),
        cell("つもりだ", "Intend to"),
        cell("はずだ", "Should / expected"),
        cell("べきだ", "Ought to"),
        cell("かもしれない", "Might"),
        cell("だろう", "Probably"),
        cell("でしょう", "Probably (polite)"),
        cell("らしい", "Apparently"),
        cell("そうだ", "I hear that"),
        cell("とき", "When"),
        cell("前に", "Before"),
        cell("ために", "In order to"),
        cell("ように", "So that"),
        cell("から", "Because"),
        cell("ので", "Because (ので)"),
        cell("のに", "Even though"),
        cell("まで", "Until"),
        cell("し", "And what's more"),
      ],
    };
  }

  function isIku(entry) {
    return entry.kana === "いく" || entry.kana === "ゆく" || entry.kanji === "行く";
  }

  function isAru(entry) {
    return entry.kana === "ある" && (entry.kanji === "ある" || entry.kanji === "有る" || entry.kanji === "在る");
  }

  function teRuleFor(ending, iku) {
    if (iku) {
      return {
        id: "iku",
        endings: "く (行く only)",
        te: "って",
        ta: "った",
        note: "行く is the famous exception: く verbs normally take いて / いた.",
      };
    }
    if ("うつる".includes(ending)) {
      return { id: "utta", endings: "う・つ・る", te: "って", ta: "った" };
    }
    if ("むぶぬ".includes(ending)) {
      return { id: "nda", endings: "む・ぶ・ぬ", te: "んで", ta: "んだ" };
    }
    if (ending === "く") {
      return { id: "ita", endings: "く", te: "いて", ta: "いた" };
    }
    if (ending === "ぐ") {
      return { id: "ida", endings: "ぐ", te: "いで", ta: "いだ" };
    }
    if (ending === "す") {
      return { id: "shita", endings: "す", te: "して", ta: "した" };
    }
    return { id: "unknown", endings: ending, te: "て", ta: "た" };
  }

  function conjugateGodan(entry) {
    const { rootKanji, rootKana, ending } = splitOkurigana(entry.kanji, entry.kana);
    const shift = GODAN_SHIFT[ending];
    if (!shift) {
      return { error: "Godan verbs must end in an う-row sound: う く ぐ す つ ぬ ぶ む る." };
    }

    const stem = (vowel) => ({
      kanji: rootKanji + shift[vowel],
      kana: rootKana + shift[vowel],
      romaji: kanaToRomaji(rootKana + shift[vowel]),
      vowelKana: shift[vowel],
    });

    const a = stem("a");
    const i = stem("i");
    const u = stem("u");
    const e = stem("e");
    const o = stem("o");

    const rootPart = { text: rootKanji, kana: rootKana, type: "root" };
    const aPart = { text: shift.a, kana: shift.a, type: "stem-a" };
    const iPart = { text: shift.i, kana: shift.i, type: "stem-i" };
    const uPart = { text: shift.u, kana: shift.u, type: "stem-u" };
    const ePart = { text: shift.e, kana: shift.e, type: "stem-e" };
    const oPart = { text: shift.o, kana: shift.o, type: "stem-o" };
    const aParts = [rootPart, aPart];
    const iParts = [rootPart, iPart];
    const uParts = [rootPart, uPart];
    const eParts = [rootPart, ePart];
    const oParts = [rootPart, oPart];

    const rule = teRuleFor(ending, isIku(entry));
    const te = form(rootKanji + rule.te, rootKana + rule.te, parts(rootPart, euph(rule.te)), {
      label: "Te-form",
      attach: rule.te,
    });
    const ta = form(rootKanji + rule.ta, rootKana + rule.ta, parts(rootPart, euph(rule.ta)), {
      label: "Past plain",
      attach: rule.ta,
    });
    const masu = add(i.kanji, i.kana, iParts, "ます", { label: "Polite present" });
    const masen = add(i.kanji, i.kana, iParts, "ません", { label: "Polite negative" });
    const mashita = add(i.kanji, i.kana, iParts, "ました", { label: "Polite past" });
    const masenDeshita = add(i.kanji, i.kana, iParts, "ませんでした", { label: "Polite past negative" });
    const nai = isAru(entry)
      ? form("ない", "ない", parts(suf("ない")), { label: "Casual negative" })
      : add(a.kanji, a.kana, aParts, "ない", { label: "Casual negative" });
    const nakatta = isAru(entry)
      ? form("なかった", "なかった", parts(suf("なかった")), { label: "Casual past negative" })
      : add(a.kanji, a.kana, aParts, "なかった", { label: "Casual past negative" });
    const dict = form(u.kanji, u.kana, uParts, { label: "Casual present" });

    const causativeParts = [rootPart, aPart, suf("せ")];
    const passiveParts = [rootPart, aPart, suf("れ")];
    const causPassParts = [rootPart, aPart, suf("せられ")];
    const potentialParts = [rootPart, ePart];
    const progParts = [rootPart, euph(rule.te), { text: "い", kana: "い", type: "stem-i" }];

    const naiFam = naiFamily(a.kanji, a.kana, aParts);
    const negative = headed(nai, {
      label: "Negative",
      attach: "ない",
      note: isAru(entry)
        ? "ある is irregular in the negative: あらない is replaced by ない. Polite is ありません."
        : "ない conjugates like an i-adjective. Polite speech usually switches to ません instead.",
      family: isAru(entry)
        ? {
          chart: [
            { label: "Present", casual: nai, polite: form("ありません", "ありません", parts(suf("ありません")), { label: "Polite negative" }) },
            { label: "Past", casual: nakatta, polite: form("ありませんでした", "ありませんでした", parts(suf("ありませんでした")), { label: "Polite past negative" }) },
          ],
          extra: [
            form("なくて", "なくて", parts(suf("なくて")), { label: "Te (なくて)" }),
            form("なければ", "なければ", parts(suf("なければ")), { label: "If not" }),
          ],
        }
        : {
          chart: [
            { label: "Present", casual: nai, polite: masen },
            { label: "Past", casual: nakatta, polite: masenDeshita },
          ],
          extra: naiFam.extra.concat([
            add(a.kanji, a.kana, aParts, "ないです", { label: "ないです" }),
            add(a.kanji, a.kana, aParts, "なかったです", { label: "なかったです" }),
          ]),
        },
    });

    const passiveFam = ichidanFamily(a.kanji + "れ", a.kana + "れ", passiveParts);
    const causativeFam = ichidanFamily(a.kanji + "せ", a.kana + "せ", causativeParts);
    const causPassFam = ichidanFamily(a.kanji + "せられ", a.kana + "せられ", causPassParts);
    const potentialFam = ichidanFamily(e.kanji, e.kana, potentialParts);
    const progressiveFam = ichidanFamily(rootKanji + rule.te + "い", rootKana + rule.te + "い", progParts);

    return {
      ending,
      shift,
      mechanism: ending === "う"
        ? "Change the final う to わ / い / え / お. The あ-stem uses わ, not あ."
        : `Change the final ${ending} to the matching あ・い・え・お column sound.`,
      stems: {
        a: Object.assign(a, {
          title: "あ-stem",
          jp: "未然形",
          mechanism: ending === "う" ? "final う → わ" : `final ${ending} → ${shift.a}`,
        }),
        i: Object.assign(i, {
          title: "い-stem",
          jp: "連用形",
          mechanism: `final ${ending} → ${shift.i}`,
        }),
        u: Object.assign(u, {
          title: "う-stem",
          jp: "終止形",
          mechanism: "Dictionary form stays unchanged",
        }),
        e: Object.assign(e, {
          title: "え-stem",
          jp: "仮定形・命令形",
          mechanism: `final ${ending} → ${shift.e}`,
        }),
        o: Object.assign(o, {
          title: "お-stem",
          jp: "意向形",
          mechanism: `final ${ending} → ${shift.o} + う`,
        }),
      },
      branches: {
        a: [
          negative,
          headed(passiveFam.chart[0].casual, {
            label: "Passive",
            attach: "れる",
            note: "The あ-stem + れる becomes a new Ichidan verb (be written). This is not the potential — that is え-stem + る (書ける).",
            family: passiveFam,
          }),
          headed(causativeFam.chart[0].casual, {
            label: "Causative",
            attach: "せる",
            note: "Make or let someone do it. Godan uses せる. Once formed, 書かせる conjugates like an Ichidan verb.",
            family: causativeFam,
          }),
          headed(causPassFam.chart[0].casual, {
            label: "Causative-passive",
            attach: "せられる",
            note: "Be made to do it. Godan also has a shorter される form (書かされる).",
            family: causPassFam,
            alt: add(a.kanji, a.kana, aParts, "される", { label: "Short causative-passive" }),
          }),
        ],
        i: [
          headed(masu, {
            label: "Polite ます",
            attach: "ます",
            note: "The い-stem + ます is the polite auxiliary. It has its own negative, past, and volitional.",
            family: masuFamily(i.kanji, i.kana, iParts),
          }),
          headed(add(i.kanji, i.kana, iParts, "たい", { label: "Desire" }), {
            label: "Desire たい",
            attach: "たい",
            note: "たい conjugates like an i-adjective: たくない, たかった, たいです.",
            family: taiFamily(i.kanji, i.kana, iParts),
          }),
          add(i.kanji, i.kana, iParts, "ながら", { label: "While", attach: "ながら", note: "Do this while doing something else." }),
          add(i.kanji, i.kana, iParts, "に行く", { label: "Go to do", attach: "に行く", note: "Go somewhere in order to do it. に来る / に帰る work the same way." }),
        ],
        u: [
          headed(dict, {
            label: "Dictionary form",
            attach: "こと / の / と",
            note: "Leave the dictionary form unchanged. こと and の turn it into a noun; と quotes it or means “when / if”.",
            family: dictionaryFamily(u.kanji, u.kana, uParts),
          }),
        ],
        e: [
          headed(add(e.kanji, e.kana, eParts, "ば", { label: "If (ば)" }), {
            label: "Conditional ば",
            attach: "ば",
            note: "If / when. The negative counterpart uses なければ on the あ-stem.",
            family: {
              chart: [
                { label: "If", casual: add(e.kanji, e.kana, eParts, "ば", { label: "If (ば)" }), polite: null },
                { label: "If not", casual: isAru(entry) ? form("なければ", "なければ", parts(suf("なければ")), { label: "If not" }) : add(a.kanji, a.kana, aParts, "なければ", { label: "If not" }), polite: null },
              ],
              extra: [
                add(rootKanji + rule.ta, rootKana + rule.ta, [rootPart, euph(rule.ta)], "ら", { label: "If (たら)" }),
                add(a.kanji, a.kana, aParts, "なかったら", { label: "If not (たら)" }),
              ],
            },
          }),
          headed(potentialFam.chart[0].casual, {
            label: "Potential",
            attach: "る",
            note: "The え-stem + る becomes a new Ichidan verb meaning “can …”. This is not the passive — that is あ-stem + れる (書かれる).",
            family: potentialFam,
          }),
          headed(form(e.kanji, e.kana, eParts, { label: "Imperative" }), {
            label: "Imperative",
            attach: "bare え",
            note: "Abrupt command. Everyday Japanese softens this with て / てください / なさい.",
            family: {
              chart: [
                { label: "Do it", casual: form(e.kanji, e.kana, eParts, { label: "Command" }), polite: add(i.kanji, i.kana, iParts, "なさい", { label: "なさい" }) },
                { label: "Don't", casual: add(u.kanji, u.kana, uParts, "な", { label: "Don't (な)" }), polite: add(rootKanji + rule.te, rootKana + rule.te, [rootPart, euph(rule.te)], "ください", { label: "てください" }) },
              ],
              extra: [
                te,
                add(a.kanji, a.kana, aParts, "ないで", { label: "ないで" }),
                add(a.kanji, a.kana, aParts, "ないでください", { label: "ないでください" }),
              ],
            },
          }),
        ],
        o: [
          headed(add(o.kanji, o.kana, oParts, "う", { label: "Volitional" }), {
            label: "Volitional “let’s”",
            attach: "う",
            note: "Let’s … / I think I will … Polite counterpart is ましょう on the い-stem.",
            family: {
              chart: [
                { label: "Let's", casual: add(o.kanji, o.kana, oParts, "う", { label: "Casual volitional" }), polite: add(i.kanji, i.kana, iParts, "ましょう", { label: "Polite volitional" }) },
              ],
              extra: [
                add(o.kanji, o.kana, oParts, "うと思います", { label: "I think I will" }),
              ],
            },
          }),
        ],
      },
      teForm: {
        rule,
        te: headed(te, {
          label: "Te-form",
          attach: rule.te,
          note: "Connecting form. ている is progressive / resultative; click for every tense of ている plus てください and the common て auxiliaries.",
          family: {
            chart: progressiveFam.chart,
            extra: progressiveFam.extra.concat([
              add(rootKanji + rule.te, rootKana + rule.te, [rootPart, euph(rule.te)], "ください", { label: "Please" }),
              add(rootKanji + rule.te, rootKana + rule.te, [rootPart, euph(rule.te)], "しまう", { label: "てしまう" }),
              add(rootKanji + rule.te, rootKana + rule.te, [rootPart, euph(rule.te)], "おく", { label: "ておく" }),
              add(rootKanji + rule.te, rootKana + rule.te, [rootPart, euph(rule.te)], "みる", { label: "てみる" }),
              add(rootKanji + rule.te, rootKana + rule.te, [rootPart, euph(rule.te)], "ある", { label: "てある" }),
              add(a.kanji, a.kana, aParts, "ないで", { label: "ないで" }),
              form(rootKanji + rule.te + "る", rootKana + rule.te + "る", parts(rootPart, euph(rule.te), suf("る")), { label: "てる (casual ている)" }),
            ]),
          },
        }),
        ta: headed(ta, {
          label: "Past plain",
          attach: rule.ta,
          note: "Casual past. Polite past is ました. たら is the “if / when” form built on た.",
          family: {
            chart: [
              { label: "Past", casual: ta, polite: mashita },
              { label: "Past neg.", casual: nakatta, polite: masenDeshita },
            ],
            extra: [
              add(rootKanji + rule.ta, rootKana + rule.ta, [rootPart, euph(rule.ta)], "ら", { label: "If (たら)" }),
              add(a.kanji, a.kana, aParts, "なかったら", { label: "If not (たら)" }),
            ],
          },
        }),
        paths: [
          { id: "utta", endings: "う・つ・る", te: "って", ta: "った", example: "買う → 買って / 待って / 取って" },
          { id: "nda", endings: "む・ぶ・ぬ", te: "んで", ta: "んだ", example: "飲む → 飲んで / 遊んで / 死んで" },
          { id: "ita", endings: "く", te: "いて", ta: "いた", example: "書く → 書いて  (行く → 行って)" },
          { id: "ida", endings: "ぐ", te: "いで", ta: "いだ", example: "泳ぐ → 泳いで" },
          { id: "shita", endings: "す", te: "して", ta: "した", example: "話す → 話して" },
        ],
      },
    };
  }

  function conjugateIchidan(entry) {
    if (lastKana(entry.kana) !== "る") {
      return { error: "Ichidan verbs drop a final る. Type a dictionary form that ends in る, such as 食べる." };
    }
    const { rootKanji, rootKana } = splitOkurigana(entry.kanji, entry.kana);
    const stemPart = { text: rootKanji, kana: rootKana, type: "stem-i" };
    const stemParts = [stemPart];
    const dict = form(entry.kanji, entry.kana, parts(stemPart, { text: "る", kana: "る", type: "drop" }), {
      label: "Dictionary form",
      attach: "る",
    });
    const nai = add(rootKanji, rootKana, stemParts, "ない", { label: "Casual negative" });
    const nakatta = add(rootKanji, rootKana, stemParts, "なかった", { label: "Casual past negative" });
    const ta = add(rootKanji, rootKana, stemParts, "た", { label: "Casual past" });
    const te = add(rootKanji, rootKana, stemParts, "て", { label: "Te-form" });
    const masu = add(rootKanji, rootKana, stemParts, "ます", { label: "Polite present" });
    const masen = add(rootKanji, rootKana, stemParts, "ません", { label: "Polite negative" });
    const mashita = add(rootKanji, rootKana, stemParts, "ました", { label: "Polite past" });
    const masenDeshita = add(rootKanji, rootKana, stemParts, "ませんでした", { label: "Polite past negative" });
    const naiFam = naiFamily(rootKanji, rootKana, stemParts);
    const potentialFam = ichidanFamily(rootKanji + "れ", rootKana + "れ", [stemPart, suf("れ")]);
    const passiveFam = ichidanFamily(rootKanji + "られ", rootKana + "られ", [stemPart, suf("られ")]);
    const causativeFam = ichidanFamily(rootKanji + "させ", rootKana + "させ", [stemPart, suf("させ")]);
    const causPassFam = ichidanFamily(rootKanji + "させられ", rootKana + "させられ", [stemPart, suf("させられ")]);
    const progParts = [stemPart, suf("て"), { text: "い", kana: "い", type: "stem-i" }];
    const progressiveFam = ichidanFamily(rootKanji + "てい", rootKana + "てい", progParts);

    return {
      stem: {
        kanji: rootKanji,
        kana: rootKana,
        romaji: kanaToRomaji(rootKana),
        mechanism: "Drop the final る. Every suffix attaches to this unchanged stem.",
      },
      dictionary: dict,
      branches: [
        headed(form(entry.kanji, entry.kana, parts(stemPart, { text: "る", kana: "る", type: "stem-u" }), { label: "Dictionary form" }), {
          label: "Dictionary form",
          attach: "こと / の / と",
          note: "After you know the dictionary form, keep る and attach こと, の, と, and other 終止形・連体形 endings. Tense and politeness live on the other cards.",
          family: dictionaryFamily(entry.kanji, entry.kana, [stemPart, { text: "る", kana: "る", type: "stem-u" }]),
        }),
        headed(masu, {
          label: "Polite ます",
          attach: "ます",
          note: "Polite auxiliary on the unchanged stem.",
          family: masuFamily(rootKanji, rootKana, stemParts),
        }),
        headed(nai, {
          label: "Negative",
          attach: "ない",
          note: "ない conjugates like an i-adjective. Polite speech usually uses ません.",
          family: {
            chart: [
              { label: "Present", casual: nai, polite: masen },
              { label: "Past", casual: nakatta, polite: masenDeshita },
            ],
            extra: naiFam.extra.concat([
              add(rootKanji, rootKana, stemParts, "ないです", { label: "ないです" }),
              add(rootKanji, rootKana, stemParts, "なかったです", { label: "なかったです" }),
            ]),
          },
        }),
        headed(te, {
          label: "Te-form",
          attach: "て",
          note: "Connecting form. ている is progressive / resultative.",
          family: {
            chart: progressiveFam.chart,
            extra: progressiveFam.extra.concat([
              add(rootKanji, rootKana, stemParts, "てください", { label: "Please" }),
              add(rootKanji, rootKana, stemParts, "てしまう", { label: "てしまう" }),
              add(rootKanji, rootKana, stemParts, "ておく", { label: "ておく" }),
              add(rootKanji, rootKana, stemParts, "てみる", { label: "てみる" }),
              add(rootKanji, rootKana, stemParts, "てある", { label: "てある" }),
              add(rootKanji, rootKana, stemParts, "ないで", { label: "ないで" }),
              add(rootKanji, rootKana, stemParts, "てる", { label: "てる (casual ている)" }),
            ]),
          },
        }),
        headed(potentialFam.chart[0].casual, {
          label: "Potential",
          attach: "れる",
          note: "Can do it. Ichidan potential is れる (食べれる), parallel to Godan 書ける. School grammar also allows られる, but that spelling is the passive.",
          family: {
            chart: potentialFam.chart,
            extra: [
              add(rootKanji, rootKana, stemParts, "られる", { label: "Textbook られる (= passive shape)" }),
            ].concat(potentialFam.extra),
          },
        }),
        headed(passiveFam.chart[0].casual, {
          label: "Passive",
          attach: "られる",
          note: "Be done to. Always られる (食べられる). Do not shorten to 食べれる — that is the potential.",
          family: passiveFam,
        }),
        headed(causativeFam.chart[0].casual, {
          label: "Causative",
          attach: "させる",
          note: "Make or let someone do it. Then conjugate させる like any Ichidan verb.",
          family: causativeFam,
        }),
        headed(causPassFam.chart[0].casual, {
          label: "Causative-passive",
          attach: "させられる",
          note: "Be made to do it.",
          family: causPassFam,
        }),
        headed(add(rootKanji, rootKana, stemParts, "たい", { label: "Desire" }), {
          label: "Desire たい",
          attach: "たい",
          note: "たい conjugates like an i-adjective.",
          family: taiFamily(rootKanji, rootKana, stemParts),
        }),
        headed(add(rootKanji, rootKana, stemParts, "れば", { label: "If (ば)" }), {
          label: "Conditional",
          attach: "れば",
          note: "ば, なければ, たら, and なかったら.",
          family: {
            chart: [
              { label: "If", casual: add(rootKanji, rootKana, stemParts, "れば", { label: "If (ば)" }), polite: null },
              { label: "If not", casual: add(rootKanji, rootKana, stemParts, "なければ", { label: "If not" }), polite: null },
            ],
            extra: [
              add(rootKanji, rootKana, stemParts, "たら", { label: "If (たら)" }),
              add(rootKanji, rootKana, stemParts, "なかったら", { label: "If not (たら)" }),
            ],
          },
        }),
        headed(add(rootKanji, rootKana, stemParts, "よう", { label: "Volitional" }), {
          label: "Volitional",
          attach: "よう",
          note: "Let’s … / I will … Polite counterpart is ましょう.",
          family: {
            chart: [
              { label: "Let's", casual: add(rootKanji, rootKana, stemParts, "よう", { label: "Casual volitional" }), polite: add(rootKanji, rootKana, stemParts, "ましょう", { label: "Polite volitional" }) },
            ],
            extra: [
              add(rootKanji, rootKana, stemParts, "ようと思います", { label: "I think I will" }),
            ],
          },
        }),
        headed(add(rootKanji, rootKana, stemParts, "ろ", { label: "Imperative" }), {
          label: "Imperative",
          attach: "ろ / よ",
          note: "ろ is the common command; よ is more literary. Soften with なさい or てください.",
          alt: add(rootKanji, rootKana, stemParts, "よ", { label: "Literary command" }),
          family: {
            chart: [
              { label: "Do it", casual: add(rootKanji, rootKana, stemParts, "ろ", { label: "ろ" }), polite: add(rootKanji, rootKana, stemParts, "なさい", { label: "なさい" }) },
              { label: "Don't", casual: add(entry.kanji, entry.kana, [stemPart, { text: "る", kana: "る", type: "stem-u" }], "な", { label: "るな" }), polite: add(rootKanji, rootKana, stemParts, "てください", { label: "てください" }) },
            ],
            extra: [
              add(rootKanji, rootKana, stemParts, "よ", { label: "よ" }),
              add(rootKanji, rootKana, stemParts, "ないで", { label: "ないで" }),
              add(rootKanji, rootKana, stemParts, "ないでください", { label: "ないでください" }),
            ],
          },
        }),
      ],
    };
  }

  function conjugateSuru(prefix) {
    const pKanji = prefix.kanji || "";
    const pKana = prefix.kana || "";
    const root = (pKanji || pKana) ? { text: pKanji, kana: pKana, type: "root" } : null;
    const shiParts = parts(root, { text: "し", kana: "し", type: "stem-i" });
    const saParts = parts(root, { text: "さ", kana: "さ", type: "stem-a" });
    const suParts = parts(root, { text: "す", kana: "す", type: "stem-u" });
    const shiK = pKanji + "し";
    const shiN = pKana + "し";
    const dict = form(pKanji + "する", pKana + "する", parts(root, { text: "する", kana: "する", type: "stem-u" }), { label: "Casual present" });
    const nai = add(shiK, shiN, shiParts, "ない", { label: "Casual negative" });
    const nakatta = add(shiK, shiN, shiParts, "なかった", { label: "Casual past negative" });
    const ta = add(shiK, shiN, shiParts, "た", { label: "Casual past" });
    const te = add(shiK, shiN, shiParts, "て", { label: "Te-form" });
    const masu = add(shiK, shiN, shiParts, "ます", { label: "Polite present" });
    const masen = add(shiK, shiN, shiParts, "ません", { label: "Polite negative" });
    const mashita = add(shiK, shiN, shiParts, "ました", { label: "Polite past" });
    const masenDeshita = add(shiK, shiN, shiParts, "ませんでした", { label: "Polite past negative" });
    const dekiParts = parts(root, { text: "でき", kana: "でき", type: "stem-e" });
    const dekiFam = ichidanFamily(pKanji + "でき", pKana + "でき", dekiParts);
    const saseParts = parts(root, { text: "さ", kana: "さ", type: "stem-a" }, suf("せ"));
    const sareParts = parts(root, { text: "さ", kana: "さ", type: "stem-a" }, suf("れ"));
    const saserareParts = parts(root, { text: "さ", kana: "さ", type: "stem-a" }, suf("せられ"));
    const causativeFam = ichidanFamily(pKanji + "させ", pKana + "させ", saseParts);
    const passiveFam = ichidanFamily(pKanji + "され", pKana + "され", sareParts);
    const causPassFam = ichidanFamily(pKanji + "させられ", pKana + "させられ", saserareParts);
    const progParts = parts(root, { text: "し", kana: "し", type: "stem-i" }, suf("て"), { text: "い", kana: "い", type: "stem-i" });
    const progressiveFam = ichidanFamily(pKanji + "してい", pKana + "してい", progParts);

    return [
      headed(dict, {
        label: "Dictionary form",
        attach: "こと / の / と",
        note: "する stays する. Attach こと, の, と, and the other dictionary-form endings here — not します or しない.",
        family: dictionaryFamily(pKanji + "する", pKana + "する", parts(root, { text: "する", kana: "する", type: "stem-u" })),
      }),
      headed(nai, {
        label: "Negative",
        attach: "ない",
        family: {
          chart: [
            { label: "Present", casual: nai, polite: masen },
            { label: "Past", casual: nakatta, polite: masenDeshita },
          ],
          extra: naiFamily(shiK, shiN, shiParts).extra,
        },
      }),
      headed(masu, {
        label: "Polite ます",
        attach: "ます",
        family: masuFamily(shiK, shiN, shiParts),
      }),
      headed(te, {
        label: "Te-form",
        attach: "て",
        family: {
          chart: progressiveFam.chart,
          extra: progressiveFam.extra.concat([
            add(shiK, shiN, shiParts, "てください", { label: "Please" }),
            add(shiK, shiN, shiParts, "てしまう", { label: "てしまう" }),
            add(shiK, shiN, shiParts, "ないで", { label: "ないで" }),
          ]),
        },
      }),
      headed(dekiFam.chart[0].casual, {
        label: "Potential",
        attach: "できる",
        note: "Suppletive: する does not become すれる. Use できる, then conjugate it as Ichidan.",
        family: dekiFam,
      }),
      headed(causativeFam.chart[0].casual, {
        label: "Causative",
        attach: "させる",
        note: "Make or let someone do it. させる then takes every Ichidan ending.",
        family: causativeFam,
      }),
      headed(passiveFam.chart[0].casual, {
        label: "Passive",
        attach: "される",
        family: passiveFam,
      }),
      headed(causPassFam.chart[0].casual, {
        label: "Causative-passive",
        attach: "させられる",
        family: causPassFam,
      }),
      headed(add(shiK, shiN, shiParts, "よう", { label: "Volitional" }), {
        label: "Volitional",
        attach: "よう",
        family: {
          chart: [
            { label: "Let's", casual: add(shiK, shiN, shiParts, "よう", { label: "しよう" }), polite: add(shiK, shiN, shiParts, "ましょう", { label: "しましょう" }) },
          ],
          extra: [],
        },
      }),
      headed(add(shiK, shiN, shiParts, "ろ", { label: "Imperative" }), {
        label: "Imperative",
        attach: "しろ",
        family: {
          chart: [
            { label: "Do it", casual: add(shiK, shiN, shiParts, "ろ", { label: "しろ" }), polite: add(shiK, shiN, shiParts, "なさい", { label: "しなさい" }) },
            { label: "Don't", casual: add(pKanji + "する", pKana + "する", suParts, "な", { label: "するな" }), polite: add(shiK, shiN, shiParts, "てください", { label: "してください" }) },
          ],
          extra: [
            form(pKanji + "せよ", pKana + "せよ", parts(root, { text: "せ", kana: "せ", type: "stem-e" }, suf("よ")), { label: "せよ" }),
          ],
        },
      }),
    ];
  }

  function conjugateKuru() {
    const ko = { text: "来", kana: "こ", type: "stem-a" };
    const ki = { text: "来", kana: "き", type: "stem-i" };
    const ku = { text: "来", kana: "く", type: "stem-u" };
    const dict = form("来る", "くる", parts(ku), { label: "Casual present" });
    const nai = add("来", "こ", [ko], "ない", { label: "Casual negative" });
    const nakatta = add("来", "こ", [ko], "なかった", { label: "Casual past negative" });
    const ta = add("来", "き", [ki], "た", { label: "Casual past" });
    const te = add("来", "き", [ki], "て", { label: "Te-form" });
    const masu = add("来", "き", [ki], "ます", { label: "Polite present" });
    const masen = add("来", "き", [ki], "ません", { label: "Polite negative" });
    const mashita = add("来", "き", [ki], "ました", { label: "Polite past" });
    const masenDeshita = add("来", "き", [ki], "ませんでした", { label: "Polite past negative" });
    const potentialFam = ichidanFamily("来れ", "これ", [ko, suf("れ")]);
    const passiveFam = ichidanFamily("来られ", "こられ", [ko, suf("られ")]);
    const causativeFam = ichidanFamily("来させ", "こさせ", [ko, suf("させ")]);
    const causPassFam = ichidanFamily("来させられ", "こさせられ", [ko, suf("させられ")]);
    const progressiveFam = ichidanFamily("来てい", "きてい", [ki, suf("て"), { text: "い", kana: "い", type: "stem-i" }]);

    return [
      headed(dict, {
        label: "Dictionary form",
        attach: "こと / の / と",
        note: "来る stays 来る. Attach こと, の, と, and the other dictionary-form endings here.",
        family: dictionaryFamily("来る", "くる", [ku]),
      }),
      headed(nai, {
        label: "Negative",
        attach: "ない",
        family: {
          chart: [
            { label: "Present", casual: nai, polite: masen },
            { label: "Past", casual: nakatta, polite: masenDeshita },
          ],
          extra: naiFamily("来", "こ", [ko]).extra,
        },
      }),
      headed(masu, {
        label: "Polite ます",
        attach: "ます",
        family: masuFamily("来", "き", [ki]),
      }),
      headed(te, {
        label: "Te-form",
        attach: "て",
        family: {
          chart: progressiveFam.chart,
          extra: progressiveFam.extra.concat([
            add("来", "き", [ki], "てください", { label: "Please" }),
            add("来", "こ", [ko], "ないで", { label: "ないで" }),
          ]),
        },
      }),
      headed(potentialFam.chart[0].casual, {
        label: "Potential",
        attach: "れる",
        note: "Can come: 来れる. Textbook 来られる matches the passive; spoken Japanese uses 来れる for “can”.",
        family: {
          chart: potentialFam.chart,
          extra: [
            add("来", "こ", [ko], "られる", { label: "Textbook 来られる (= passive shape)" }),
          ].concat(potentialFam.extra),
        },
      }),
      headed(causativeFam.chart[0].casual, {
        label: "Causative",
        attach: "させる",
        family: causativeFam,
      }),
      headed(passiveFam.chart[0].casual, {
        label: "Passive",
        attach: "られる",
        note: "Someone comes (affecting you), or honorific. Always 来られる — not 来れる.",
        family: passiveFam,
      }),
      headed(causPassFam.chart[0].casual, {
        label: "Causative-passive",
        attach: "させられる",
        family: causPassFam,
      }),
      headed(add("来", "こ", [ko], "よう", { label: "Volitional" }), {
        label: "Volitional",
        attach: "よう",
        family: {
          chart: [
            { label: "Let's", casual: add("来", "こ", [ko], "よう", { label: "来よう" }), polite: add("来", "き", [ki], "ましょう", { label: "来ましょう" }) },
          ],
          extra: [],
        },
      }),
      headed(form("来い", "こい", parts(ko, suf("い")), { label: "Imperative" }), {
        label: "Imperative",
        attach: "い",
        family: {
          chart: [
            { label: "Do it", casual: form("来い", "こい", parts(ko, suf("い")), { label: "来い" }), polite: add("来", "き", [ki], "なさい", { label: "来なさい" }) },
            { label: "Don't", casual: form("来るな", "くるな", parts(ku, suf("な")), { label: "来るな" }), polite: add("来", "き", [ki], "てください", { label: "来てください" }) },
          ],
          extra: [],
        },
      }),
    ];
  }

  function conjugateIrregular(entry) {
    const kana = kataToHira(entry.kana);
    if (kana.endsWith("する")) {
      const prefix = {
        kanji: entry.kanji.endsWith("する") ? entry.kanji.slice(0, -2) : entry.kanji.replace(/する$/, ""),
        kana: kana.slice(0, -2),
      };
      return {
        kind: "suru",
        title: prefix.kanji ? prefix.kanji + "する" : "する",
        note: "する replaces its whole stem: し・さ・でき. Compounds keep the noun and conjugate する.",
        branches: conjugateSuru(prefix),
      };
    }
    if (kana === "くる" || entry.kanji === "来る") {
      return {
        kind: "kuru",
        title: "来る",
        note: "来る swaps the first kana itself: く / き / こ. Nothing else in Japanese works quite like this.",
        branches: conjugateKuru(),
      };
    }
    return { error: "Irregular reference covers する, 来る, and 〜する compounds." };
  }

  function defaultVerb(group) {
    if (group === "ichidan") return VERBS.find((v) => v.id === "taberu");
    if (group === "irregular") return VERBS.find((v) => v.id === "suru");
    return VERBS.find((v) => v.id === "kaku");
  }

  function verbsFor(group) {
    return VERBS.filter((v) => v.group === group);
  }

  function normalizeLookup(raw) {
    const trimmed = String(raw || "").trim();
    if (!trimmed) return "";
    const hira = kataToHira(trimmed);
    if (/^[a-zA-Zāâēêīîōôūû'’\s-]+$/.test(trimmed)) {
      return romajiToHiragana(trimmed.replace(/\s+/g, ""));
    }
    return hira;
  }

  function findVerb(raw, group) {
    const trimmed = String(raw || "").trim();
    if (!trimmed) return null;
    const normalized = normalizeLookup(trimmed);
    const pool = group ? VERBS.filter((v) => v.group === group) : VERBS;
    const all = VERBS;

    const match = (list) =>
      list.find((v) =>
        v.kanji === trimmed ||
        v.kana === normalized ||
        v.kanji === normalized ||
        kanaToRomaji(v.kana) === trimmed.toLowerCase().replace(/\s+/g, "") ||
        v.id === trimmed.toLowerCase()
      );

    return match(pool) || match(all) || null;
  }

  function parseCustom(raw, group) {
    const trimmed = String(raw || "").trim();
    if (!trimmed) return { error: "Type a dictionary-form verb." };

    let kanji = trimmed;
    let kana = "";

    if (/^[a-zA-Zāâēêīîōôūû'’\s-]+$/.test(trimmed)) {
      kana = romajiToHiragana(trimmed.replace(/\s+/g, ""));
      kanji = kana;
    } else {
      kanji = kataToHira(trimmed) === trimmed ? kataToHira(trimmed) : trimmed;
      const maybeKana = kataToHira(trimmed);
      if ([...maybeKana].every((ch) => isHiraganaChar(ch) || ch === "ー")) {
        kana = maybeKana;
        kanji = maybeKana;
      } else {
        const okurigana = [...trimmed].filter((ch) => isHiraganaChar(kataToHira(ch)));
        kana = okurigana.length ? kataToHira(trimmed.replace(/[^\u3040-\u30FF]/g, (ch) => (KATA.includes(ch) ? kataToHira(ch) : ""))) : "";
        if (!kana) {
          const last = kataToHira(trimmed.slice(-1));
          if (isHiraganaChar(last)) {
            kana = last;
          }
        }
        if (!kana) kana = kataToHira(trimmed);
      }
    }

    const entry = {
      id: "custom",
      kanji,
      kana,
      meaning: "custom verb",
      group,
      custom: true,
    };

    if (group === "godan" && !GODAN_SHIFT[lastKana(entry.kana)]) {
      return { error: "That doesn’t look like a Godan dictionary form. Godan verbs end in う く ぐ す つ ぬ ぶ む る." };
    }
    if (group === "ichidan" && lastKana(entry.kana) !== "る") {
      return { error: "Ichidan dictionary forms end in る. Try 食べる or 見る." };
    }
    if (group === "irregular") {
      const k = kataToHira(entry.kana);
      if (!(k === "する" || k === "くる" || k.endsWith("する") || entry.kanji === "来る")) {
        return { error: "This section is for する, 来る, and 〜する compounds such as 勉強する." };
      }
    }
    return { entry };
  }

  function conjugate(entry, group) {
    const g = group || entry.group;
    if (g === "godan") return { entry, group: g, godan: conjugateGodan(entry) };
    if (g === "ichidan") return { entry, group: g, ichidan: conjugateIchidan(entry) };
    return { entry, group: "irregular", irregular: conjugateIrregular(entry) };
  }

  global.VerbEngine = {
    VERBS,
    GODAN_SHIFT,
    GODAN_ENDINGS,
    verbsFor,
    defaultVerb,
    findVerb,
    parseCustom,
    conjugate,
    kanaToRomaji,
    romajiToHiragana,
    kataToHira,
    lastKana,
  };
})(window);
