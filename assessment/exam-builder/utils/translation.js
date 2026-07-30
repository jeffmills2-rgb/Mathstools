/*
  MMT Exam Builder — Translation Helpers
  --------------------------------------
  Curated bilingual support for selected student-facing text.

  This is deliberately not a live/automatic translator. It keeps maths notation,
  variables, diagrams and units intact while translating the surrounding prompt.
*/

export const LANGUAGE_OPTIONS = [
  { id: "en", label: "English only" },
  { id: "ar", label: "Arabic + English underneath" },
  { id: "fa", label: "Farsi + English underneath" }
];

const RTL_LANGUAGES = new Set(["ar", "fa"]);

const UI_TRANSLATIONS = {
  ar: {
    "English only": "الإنجليزية فقط",
    "Arabic + English underneath": "العربية مع الإنجليزية تحتها",
    "Farsi + English underneath": "الفارسية مع الإنجليزية تحتها",
    "Language": "اللغة",
    "Time allowed": "الوقت المسموح",
    "Total marks": "مجموع الدرجات",
    "Calculator": "الآلة الحاسبة",
    "Name": "الاسم",
    "Class": "الفصل",
    "Date": "التاريخ",
    "Instructions": "التعليمات",
    "Attempt all questions.": "حاول حل جميع الأسئلة.",
    "Show all relevant working in the spaces provided.": "اكتب خطوات الحل المناسبة في المساحات المخصصة.",
    "Show appropriate working.": "اكتب خطوات الحل المناسبة.",
    "Write clearly using black or blue pen.": "اكتب بوضوح باستخدام قلم أسود أو أزرق.",
    "Diagrams are not necessarily drawn to scale.": "ليست الرسومات بالضرورة مرسومة بمقياس دقيق.",
    "Write using black or blue pen.": "اكتب بقلم أسود أو أزرق.",
    "Section I": "القسم الأول",
    "Section I - Multiple choice": "القسم الأول - اختيار من متعدد",
    "Section II - Extended response": "القسم الثاني - أسئلة ذات إجابات ممتدة",
    "Answer all questions. Show working where appropriate.": "أجب عن جميع الأسئلة. اكتب خطوات الحل عند الحاجة.",
    "Select the alternative A, B, C or D that best answers each question.": "اختر البديل A أو B أو C أو D الذي يجيب عن كل سؤال بأفضل صورة.",
    "Fill in the response oval completely.": "ظلّل دائرة الإجابة بالكامل.",
    "If you think you have made a mistake, put a cross through the incorrect answer and fill in the new answer.": "إذا اعتقدت أنك أخطأت، ضع علامة × على الإجابة غير الصحيحة وظلّل الإجابة الجديدة.",
    "If you change your mind and have crossed out what you consider to be the correct answer, then indicate this by writing the word correct and drawing an arrow.": "إذا غيّرت رأيك وشطبت الإجابة التي تراها صحيحة، فاكتب كلمة correct وارسم سهمًا للإشارة إليها.",
    "Multiple Choice answer sheet": "ورقة إجابة الاختيار من متعدد",
    "Student Number:": "رقم الطالب:",
    "Completely fill the response oval representing the most correct answer.": "ظلّل الدائرة التي تمثل الإجابة الأكثر صحة بالكامل.",
    "For questions": "للأسئلة",
    "to": "إلى",
    "answer in the spaces provided.": "أجب في المساحات المخصصة."
  },
  fa: {
    "English only": "فقط انگلیسی",
    "Arabic + English underneath": "عربی همراه با انگلیسی در زیر",
    "Farsi + English underneath": "فارسی همراه با انگلیسی در زیر",
    "Language": "زبان",
    "Time allowed": "زمان مجاز",
    "Total marks": "نمره کل",
    "Calculator": "ماشین حساب",
    "Name": "نام",
    "Class": "کلاس",
    "Date": "تاریخ",
    "Instructions": "دستورالعمل‌ها",
    "Attempt all questions.": "به همه پرسش‌ها پاسخ دهید.",
    "Show all relevant working in the spaces provided.": "مراحل حل مربوط را در فضاهای داده‌شده نشان دهید.",
    "Show appropriate working.": "مراحل حل مناسب را نشان دهید.",
    "Write clearly using black or blue pen.": "با خودکار آبی یا مشکی واضح بنویسید.",
    "Diagrams are not necessarily drawn to scale.": "نمودارها لزوماً با مقیاس دقیق رسم نشده‌اند.",
    "Write using black or blue pen.": "با خودکار آبی یا مشکی بنویسید.",
    "Section I": "بخش اول",
    "Section I - Multiple choice": "بخش اول - چندگزینه‌ای",
    "Section II - Extended response": "بخش دوم - پاسخ تشریحی",
    "Answer all questions. Show working where appropriate.": "به همه پرسش‌ها پاسخ دهید. هرجا لازم است مراحل حل را نشان دهید.",
    "Select the alternative A, B, C or D that best answers each question.": "گزینه A، B، C یا D را که بهترین پاسخ هر پرسش است انتخاب کنید.",
    "Fill in the response oval completely.": "بیضی پاسخ را کامل پر کنید.",
    "If you think you have made a mistake, put a cross through the incorrect answer and fill in the new answer.": "اگر فکر می‌کنید اشتباه کرده‌اید، روی پاسخ نادرست ضربدر بزنید و پاسخ جدید را پر کنید.",
    "If you change your mind and have crossed out what you consider to be the correct answer, then indicate this by writing the word correct and drawing an arrow.": "اگر نظرتان عوض شد و پاسخی را که درست می‌دانید خط زدید، با نوشتن واژه correct و کشیدن پیکان آن را مشخص کنید.",
    "Multiple Choice answer sheet": "برگه پاسخ چندگزینه‌ای",
    "Student Number:": "شماره دانش‌آموز:",
    "Completely fill the response oval representing the most correct answer.": "بیضی مربوط به درست‌ترین پاسخ را کامل پر کنید.",
    "For questions": "برای پرسش‌های",
    "to": "تا",
    "answer in the spaces provided.": "در فضاهای داده‌شده پاسخ دهید."
  }
};

function normaliseLanguage(language = "en") {
  return RTL_LANGUAGES.has(language) ? language : "en";
}

function ltr(value) {
  // LRI/PDI keeps variables, powers, numbers and units readable inside RTL text.
  return `\u2066${String(value ?? "")}\u2069`;
}

function rtlLine(value, language) {
  return RTL_LANGUAGES.has(language)
    ? `\u202B${String(value ?? "")}\u202C`
    : String(value ?? "");
}

function bilingualPlainText(english, translated, language) {
  const lang = normaliseLanguage(language);

  if (lang === "en" || !translated || translated === english) {
    return english;
  }

  return `${rtlLine(translated, lang)}\n${english}`;
}

export function getLanguageLabel(language = "en") {
  const option = LANGUAGE_OPTIONS.find(item => item.id === language) || LANGUAGE_OPTIONS[0];
  return option.label;
}

export function getUiTranslation(text, language = "en") {
  const lang = normaliseLanguage(language);
  if (lang === "en") return text;
  return UI_TRANSLATIONS[lang]?.[text] || text;
}

export function renderBilingualHtml(english, language = "en", translated = null, extraClass = "") {
  const lang = normaliseLanguage(language);
  const safeEnglish = escapeHtml(english);
  const target = translated || getUiTranslation(english, lang);

  if (lang === "en" || !target || target === english) {
    return `<span class="${extraClass ? `${escapeHtml(extraClass)} ` : ""}bilingual-line is-english-only">${safeEnglish}</span>`;
  }

  return `
    <span class="${extraClass ? `${escapeHtml(extraClass)} ` : ""}bilingual-line is-bilingual" lang="${escapeHtml(lang)}">
      <span class="translated-line" dir="rtl">${escapeHtml(target)}</span>
      <span class="english-support" dir="ltr">${safeEnglish}</span>
    </span>
  `;
}

export function localizeInstruction(english, language = "en") {
  return renderBilingualHtml(english, language);
}

export function localizeQuestionForLanguage(question, language = "en") {
  const lang = normaliseLanguage(language);

  const {
    translations,
    ...cleanQuestion
  } = question || {};

  if (lang === "en") {
    return cleanQuestion;
  }

  const englishPrompt = String(question?.prompt ?? "");
  const translatedPrompt =
    translations?.[lang] ||
    translatePrompt(englishPrompt, lang, question);

  if (translatedPrompt && translatedPrompt !== englishPrompt) {
    cleanQuestion.prompt = bilingualPlainText(englishPrompt, translatedPrompt, lang);
  }

  if (Array.isArray(cleanQuestion.parts)) {
    cleanQuestion.parts = cleanQuestion.parts.map(part => {
      const englishPartPrompt = String(part?.prompt ?? "");
      const partTranslation = translatePrompt(englishPartPrompt, lang, {
        ...question,
        type: part?.type || question?.type
      });

      return partTranslation
        ? { ...part, prompt: bilingualPlainText(englishPartPrompt, partTranslation, lang) }
        : part;
    });
  }

  return cleanQuestion;
}

export function attachQuestionTranslations(question) {
  if (!question || typeof question !== "object") return question;

  const ar = translatePrompt(question.prompt, "ar", question);
  const fa = translatePrompt(question.prompt, "fa", question);

  if (!ar && !fa) return question;

  return {
    ...question,
    translations: {
      ...(ar ? { ar } : {}),
      ...(fa ? { fa } : {})
    }
  };
}

export function translatePrompt(prompt, language = "en", question = {}) {
  const lang = normaliseLanguage(language);
  if (lang === "en") return "";

  const text = String(prompt ?? "").trim();
  if (!text) return "";

  const suffixTranslation = translateCommonSuffixPrompt(text, lang, question);
  if (suffixTranslation) return suffixTranslation;

  const topic = String(question?.topic || "").toLowerCase();
  const type = String(question?.type || "").toLowerCase();

  let translated = "";

  if (topic.includes("angle")) translated = translateAnglePrompt(text, lang);
  else if (topic.includes("algebraic techniques")) translated = translateAlgebraPrompt(text, lang);
  else if (topic.includes("equation")) translated = translateEquationPrompt(text, lang);
  else if (topic.includes("indices")) translated = translateIndicesPrompt(text, lang);
  else if (topic.includes("integers")) translated = translateIntegerPrompt(text, lang);
  else if (topic.includes("fraction") || topic.includes("decimal") || topic.includes("percentage")) translated = translateFdpPrompt(text, lang);
  else if (topic.includes("ratio") || topic.includes("rate")) translated = translateRatiosRatesPrompt(text, lang);
  else if (topic.includes("non-linear") || type.includes("nonlinear")) translated = translateNonLinearPrompt(text, lang);
  else if (topic.includes("linear") || topic.includes("cartesian")) translated = translateLinearPrompt(text, lang);
  else if (topic.includes("length")) translated = translateLengthPrompt(text, lang);
  else if (topic.includes("area") || topic.includes("surface")) translated = translateAreaPrompt(text, lang);
  else if (topic.includes("volume")) translated = translateVolumePrompt(text, lang);
  else if (topic.includes("pythagoras")) translated = translatePythagorasPrompt(text, lang);
  else if (topic.includes("trigonometry")) translated = translateTrigonometryPrompt(text, lang);
  else if (topic.includes("financial")) translated = translateFinancialPrompt(text, lang);

  return translated || translateGeneralPrompt(text, lang, question) || translateFallbackPrompt(text, lang);
}

function translateCommonSuffixPrompt(text, lang, question = {}) {
  const suffixes = [
    {
      pattern: /^(.+?)\s+Round your answer to (?:the )?nearest whole number\.?$/i,
      ar: "قرّب إجابتك إلى أقرب عدد صحيح.",
      fa: "پاسخ خود را به نزدیک‌ترین عدد کامل گرد کنید."
    },
    {
      pattern: /^(.+?)\s+Round your answer to 1 decimal place\.?$/i,
      ar: "قرّب إجابتك إلى منزلة عشرية واحدة.",
      fa: "پاسخ خود را تا یک رقم اعشار گرد کنید."
    },
    {
      pattern: /^(.+?)\s+Round your answer to (\d+) decimal places\.?$/i,
      ar: match => `قرّب إجابتك إلى ${ltr(match[2])} منازل عشرية.`,
      fa: match => `پاسخ خود را تا ${ltr(match[2])} رقم اعشار گرد کنید.`
    },
    {
      pattern: /^(.+?)\s+Give your answer in terms of π\.$/,
      ar: "اعط إجابتك بدلالة π.",
      fa: "پاسخ خود را بر حسب π بدهید."
    },
    {
      pattern: /^(.+?)\s+Give your answer correct to 1 decimal place\.$/,
      ar: "اعط إجابتك صحيحة لأقرب منزلة عشرية واحدة.",
      fa: "پاسخ خود را تا یک رقم اعشار بنویسید."
    },
    {
      pattern: /^(.+?)\s+Give your answer correct to (\d+) decimal places\.$/,
      ar: match => `اعط إجابتك صحيحة لأقرب ${ltr(match[2])} منازل عشرية.`,
      fa: match => `پاسخ خود را تا ${ltr(match[2])} رقم اعشار بنویسید.`
    },
    {
      pattern: /^(.+?)\s+Give a reason for your answer\.$/,
      ar: "اكتب سبب إجابتك.",
      fa: "دلیل پاسخ خود را بنویسید."
    },
    {
      pattern: /^(.+?)\s+Show your working\.$/,
      ar: "مراحل حل خود را نشان دهید.",
      fa: "مراحل حل خود را نشان دهید."
    }
  ];

  for (const item of suffixes) {
    const match = text.match(item.pattern);
    if (!match) continue;

    const stem = match[1].trim().replace(/[.]$/, "");
    const stemAsSentence = /[.!?]$/.test(stem) ? stem : `${stem}.`;
    const translatedStem = translatePrompt(stemAsSentence, lang, question) || translateFallbackPrompt(stem, lang);
    const suffix = typeof item[lang] === "function" ? item[lang](match) : item[lang];
    return `${translatedStem} ${suffix}`;
  }

  return "";
}

function translateIntegerPrompt(text, lang) {
  let match = text.match(/^Place (.+) on the number line\.$/);
  if (match) {
    return lang === "ar"
      ? `ضع ${ltr(match[1])} على خط الأعداد.`
      : `${ltr(match[1])} را روی خط اعداد قرار دهید.`;
  }

  match = text.match(/^Place these integers in (ascending|descending) order: (.+)$/);
  if (match) {
    const direction = match[1];
    const list = match[2];

    if (lang === "ar") {
      return direction === "ascending"
        ? `رتّب هذه الأعداد الصحيحة ترتيبًا تصاعديًا: ${ltr(list)}`
        : `رتّب هذه الأعداد الصحيحة ترتيبًا تنازليًا: ${ltr(list)}`;
    }

    return direction === "ascending"
      ? `این عددهای صحیح را به ترتیب صعودی قرار دهید: ${ltr(list)}`
      : `این عددهای صحیح را به ترتیب نزولی قرار دهید: ${ltr(list)}`;
  }

  match = text.match(/^Insert <, > or = to make the statement true: (.+)$/);
  if (match) {
    return lang === "ar"
      ? `أدخل الرمز ${ltr("<")} أو ${ltr(">")} أو ${ltr("=")} لجعل العبارة صحيحة: ${ltr(match[1])}`
      : `علامت ${ltr("<")} یا ${ltr(">")} یا ${ltr("=")} را وارد کنید تا عبارت درست شود: ${ltr(match[1])}`;
  }

  match = text.match(/^Use order of operations to calculate: (.+)$/);
  if (match) {
    return lang === "ar"
      ? `باستخدام ترتيب العمليات، احسب: ${ltr(match[1])}`
      : `با رعایت ترتیب عملیات، محاسبه کنید: ${ltr(match[1])}`;
  }

  match = text.match(/^Calculate:?\s*(.+)$/);
  if (match) {
    return lang === "ar"
      ? `احسب ${ltr(match[1])}`
      : `${ltr(match[1])} را محاسبه کنید`;
  }

  return translateGeneralPrompt(text, lang);
}

function translateAnglePrompt(text, lang) {
  let match = text.match(/^Find the value of (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `أوجد قيمة ${ltr(match[1])}.`
      : `مقدار ${ltr(match[1])} را پیدا کنید.`;
  }

  if (text === "Find the value of x. Give a reason for your answer.") {
    return lang === "ar"
      ? "أوجد قيمة x. اكتب سبب إجابتك."
      : "مقدار x را پیدا کنید. دلیل پاسخ خود را بنویسید.";
  }

  if (text === "Read the size of the angle shown on the protractor.") {
    return lang === "ar"
      ? "اقرأ قياس الزاوية الموضحة على المنقلة."
      : "اندازه زاویه نشان‌داده‌شده روی نقاله را بخوانید.";
  }

  return translateGeneralPrompt(text, lang);
}

function translateAlgebraPrompt(text, lang) {
  let match = text.match(/^Write an algebraic expression for: "(.+)"\.$/);
  if (match) {
    const phrase = translateAlgebraPhrase(match[1], lang);
    return lang === "ar"
      ? `اكتب تعبيرًا جبريًا لما يلي: «${phrase}».`
      : `یک عبارت جبری برای عبارت زیر بنویسید: «${phrase}».`;
  }

  match = text.match(/^Factorise: (.+)$/);
  if (match) {
    return lang === "ar"
      ? `حلّل إلى عوامل: ${ltr(match[1])}`
      : `عامل‌گیری کنید: ${ltr(match[1])}`;
  }

  match = text.match(/^Evaluate (.+) when (.+)\.$/);
  if (match) {
    return lang === "ar"
      ? `أوجد قيمة ${ltr(match[1])} عندما ${ltr(match[2])}.`
      : `مقدار ${ltr(match[1])} را وقتی ${ltr(match[2])} محاسبه کنید.`;
  }

  match = text.match(/^Simplify: (.+)$/);
  if (match) {
    return lang === "ar"
      ? `بسّط: ${ltr(match[1])}`
      : `ساده کنید: ${ltr(match[1])}`;
  }

  match = text.match(/^Expand and simplify: (.+)$/);
  if (match) {
    return lang === "ar"
      ? `افتح الأقواس ثم بسّط: ${ltr(match[1])}`
      : `پرانتزها را باز کنید و ساده کنید: ${ltr(match[1])}`;
  }

  match = text.match(/^Expand: (.+)$/);
  if (match) {
    return lang === "ar"
      ? `افتح الأقواس: ${ltr(match[1])}`
      : `پرانتزها را باز کنید: ${ltr(match[1])}`;
  }

  match = text.match(/^Complete the table of values for (.+), where (.+)\.$/);
  if (match) {
    return lang === "ar"
      ? `أكمل جدول القيم لـ ${ltr(match[1])}، حيث ${ltr(match[2])}.`
      : `جدول مقادیر را برای ${ltr(match[1])} کامل کنید، که در آن ${ltr(match[2])}.`;
  }

  return translateGeneralPrompt(text, lang);
}

function translateAlgebraPhrase(phrase, lang) {
  const translated = {
    ar: [
      [/three more than twice (.+)/, "ثلاثة أكثر من ضعف $1"],
      [/five less than three times (.+)/, "خمسة أقل من ثلاثة أمثال $1"],
      [/the sum of (.+) and 7, multiplied by 2/, "مجموع $1 و 7 مضروبًا في 2"],
      [/half of \((.+) \+ 6\)/, "نصف ($1 + 6)"],
      [/the difference between 10 and (.+)/, "الفرق بين 10 و $1"]
    ],
    fa: [
      [/three more than twice (.+)/, "سه تا بیشتر از دو برابر $1"],
      [/five less than three times (.+)/, "پنج تا کمتر از سه برابر $1"],
      [/the sum of (.+) and 7, multiplied by 2/, "مجموع $1 و ۷، ضربدر ۲"],
      [/half of \((.+) \+ 6\)/, "نصف ($1 + 6)"],
      [/the difference between 10 and (.+)/, "اختلاف بین ۱۰ و $1"]
    ]
  };

  for (const [pattern, replacement] of translated[lang] || []) {
    if (pattern.test(phrase)) {
      return phrase.replace(pattern, replacement);
    }
  }

  return phrase;
}

function translateEquationPrompt(text, lang) {
  let match = text.match(/^(.+?) thinks of a number\. They multiply it by (.+?) and then add (.+?)\. The result is (.+?)\. Write and solve an equation\.$/i);
  if (match) {
    const name = ltr(match[1]);
    return lang === "ar"
      ? `${name} يفكر في عدد. يضربه في ${ltr(match[2])} ثم يضيف ${ltr(match[3])}. الناتج هو ${ltr(match[4])}. اكتب معادلة وحلّها.`
      : `${name} عددی را در نظر می‌گیرد. آن را در ${ltr(match[2])} ضرب می‌کند و سپس ${ltr(match[3])} اضافه می‌کند. نتیجه ${ltr(match[4])} است. یک معادله بنویسید و حل کنید.`;
  }

  match = text.match(/^Solve:?\s*(.+)$/);
  if (match) {
    return lang === "ar"
      ? `حل المعادلة: ${ltr(match[1])}`
      : `معادله را حل کنید: ${ltr(match[1])}`;
  }

  match = text.match(/^Is (.+) a solution to (.+)\?$/);
  if (match) {
    return lang === "ar"
      ? `هل ${ltr(match[1])} حل للمعادلة ${ltr(match[2])}؟`
      : `آیا ${ltr(match[1])} یک جواب برای ${ltr(match[2])} است؟`;
  }

  match = text.match(/^(.+) Write and solve an equation\.$/);
  if (match) {
    return lang === "ar"
      ? `${ltr(match[1])} اكتب معادلة وحلّها.`
      : `${ltr(match[1])} یک معادله بنویسید و حل کنید.`;
  }

  return translateGeneralPrompt(text, lang);
}

function translateIndicesPrompt(text, lang) {
  let match = text.match(/^Write (.+) in index notation\.$/);
  if (match) {
    return lang === "ar"
      ? `اكتب ${ltr(match[1])} بالصيغة الأسية.`
      : `${ltr(match[1])} را به صورت توان‌دار بنویسید.`;
  }

  match = text.match(/^Write (.+) in expanded form and evaluate it\.$/);
  if (match) {
    return lang === "ar"
      ? `اكتب ${ltr(match[1])} في الصورة الممتدة ثم احسب قيمته.`
      : `${ltr(match[1])} را به صورت گسترده بنویسید و مقدار آن را حساب کنید.`;
  }

  match = text.match(/^Evaluate (.+)\.$/);
  if (match) {
    return lang === "ar"
      ? `احسب ${ltr(match[1])}.`
      : `${ltr(match[1])} را محاسبه کنید.`;
  }

  match = text.match(/^Write (.+) as a power of 10\.$/);
  if (match) {
    return lang === "ar"
      ? `اكتب ${ltr(match[1])} كقوة للعدد 10.`
      : `${ltr(match[1])} را به صورت توانی از ۱۰ بنویسید.`;
  }

  match = text.match(/^Write (.+) as a whole number\.$/);
  if (match) {
    return lang === "ar"
      ? `اكتب ${ltr(match[1])} كعدد صحيح.`
      : `${ltr(match[1])} را به صورت یک عدد کامل بنویسید.`;
  }

  match = text.match(/^Is (.+) divisible by (.+)\? Give a reason\.$/);
  if (match) {
    return lang === "ar"
      ? `هل ${ltr(match[1])} يقبل القسمة على ${ltr(match[2])}؟ اكتب سببًا.`
      : `آیا ${ltr(match[1])} بر ${ltr(match[2])} بخش‌پذیر است؟ دلیل خود را بنویسید.`;
  }

  match = text.match(/^Write (.+) as a product of prime factors\.$/);
  if (match) {
    return lang === "ar"
      ? `اكتب ${ltr(match[1])} كحاصل ضرب عوامل أولية.`
      : `${ltr(match[1])} را به صورت حاصل‌ضرب عامل‌های اول بنویسید.`;
  }

  match = text.match(/^Write (.+) as a product of prime factors using index notation\.$/);
  if (match) {
    return lang === "ar"
      ? `اكتب ${ltr(match[1])} كحاصل ضرب عوامل أولية باستخدام الصيغة الأسية.`
      : `${ltr(match[1])} را به صورت حاصل‌ضرب عامل‌های اول با نماد توان‌دار بنویسید.`;
  }

  match = text.match(/^Complete the factor tree for (.+), then write (.+) as a product of prime factors using index notation\.$/);
  if (match) {
    return lang === "ar"
      ? `أكمل شجرة العوامل للعدد ${ltr(match[1])}، ثم اكتب ${ltr(match[2])} كحاصل ضرب عوامل أولية باستخدام الصيغة الأسية.`
      : `درخت عوامل عدد ${ltr(match[1])} را کامل کنید، سپس ${ltr(match[2])} را به صورت حاصل‌ضرب عامل‌های اول با نماد توان‌دار بنویسید.`;
  }

  match = text.match(/^Estimate (.+) by identifying the two whole numbers it lies between\.$/);
  if (match) {
    return lang === "ar"
      ? `قدّر ${ltr(match[1])} بتحديد العددين الصحيحين اللذين يقع بينهما.`
      : `${ltr(match[1])} را با مشخص کردن دو عدد کامل که بین آن‌ها قرار دارد تخمین بزنید.`;
  }

  match = text.match(/^Simplify (.+)\.$/);
  if (match) {
    return lang === "ar"
      ? `بسّط ${ltr(match[1])}.`
      : `${ltr(match[1])} را ساده کنید.`;
  }

  return translateGeneralPrompt(text, lang);
}

function translateFdpPrompt(text, lang) {
  let match = text.match(/^Shade (.+) on the bar below\.$/);
  if (match) {
    return lang === "ar"
      ? `ظلّل ${ltr(match[1])} على الشريط أدناه.`
      : `${ltr(match[1])} را روی نوار زیر سایه بزنید.`;
  }

  if (/^What fraction (?:of the bar )?is shaded below\? Simplify your answer\.$/i.test(text)) {
    return lang === "ar"
      ? "ما الكسر الذي يمثل الجزء المظلّل أدناه؟ بسّط إجابتك."
      : "چه کسری در شکل زیر سایه زده شده است؟ پاسخ خود را ساده کنید.";
  }

  if (/^What fraction of the bar is shaded\?$/i.test(text)) {
    return lang === "ar"
      ? "ما الكسر الذي يمثل الجزء المظلّل من الشريط؟"
      : "چه کسری از نوار سایه زده شده است؟";
  }

  match = text.match(/^Simplify:\s*(.+)$/i);
  if (match) {
    return lang === "ar"
      ? `بسّط: ${ltr(match[1])}`
      : `ساده کنید: ${ltr(match[1])}`;
  }

  match = text.match(/^Write (.+) as an equivalent fraction with denominator (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `اكتب ${ltr(match[1])} ككسر مكافئ مقامه ${ltr(match[2])}.`
      : `${ltr(match[1])} را به صورت یک کسر معادل با مخرج ${ltr(match[2])} بنویسید.`;
  }

  match = text.match(/^Insert < or > to make this true: (.+)$/i);
  if (match) {
    return lang === "ar"
      ? `ضع الرمز ${ltr("<")} أو ${ltr(">")} لجعل العبارة صحيحة: ${ltr(match[1])}`
      : `علامت ${ltr("<")} یا ${ltr(">")} را وارد کنید تا عبارت درست شود: ${ltr(match[1])}`;
  }

  match = text.match(/^Convert (.+) to an improper fraction\.$/i);
  if (match) {
    return lang === "ar"
      ? `حوّل ${ltr(match[1])} إلى كسر غير فعلي.`
      : `${ltr(match[1])} را به کسر ناسره تبدیل کنید.`;
  }

  match = text.match(/^Convert (.+) to a mixed number\.$/i);
  if (match) {
    return lang === "ar"
      ? `حوّل ${ltr(match[1])} إلى عدد كسري.`
      : `${ltr(match[1])} را به عدد مخلوط تبدیل کنید.`;
  }

  match = text.match(/^Convert (.+) to (a fraction|a decimal|a percentage|a percent)\.$/i);
  if (match) {
    const target = translateMathTerm(match[2], lang);
    return lang === "ar"
      ? `حوّل ${ltr(match[1])} إلى ${target}.`
      : `${ltr(match[1])} را به ${target} تبدیل کنید.`;
  }

  match = text.match(/^Convert (.+) to a fraction in simplest form\.$/i);
  if (match) {
    return lang === "ar"
      ? `حوّل ${ltr(match[1])} إلى كسر في أبسط صورة.`
      : `${ltr(match[1])} را به کسری در ساده‌ترین شکل تبدیل کنید.`;
  }

  match = text.match(/^Order these decimals from smallest to largest: (.+)$/i);
  if (match) {
    return lang === "ar"
      ? `رتّب هذه الأعداد العشرية من الأصغر إلى الأكبر: ${ltr(match[1])}`
      : `این عددهای اعشاری را از کوچک‌ترین به بزرگ‌ترین مرتب کنید: ${ltr(match[1])}`;
  }

  match = text.match(/^Round (.+) to (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `قرّب ${ltr(match[1])} إلى ${ltr(match[2])}.`
      : `${ltr(match[1])} را به ${ltr(match[2])} گرد کنید.`;
  }

  match = text.match(/^Find (.+)% of (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `أوجد ${ltr(match[1])}% من ${ltr(match[2])}.`
      : `${ltr(match[1])}% از ${ltr(match[2])} را پیدا کنید.`;
  }

  match = text.match(/^(Increase|Decrease) (.+) by (.+)%\.$/i);
  if (match) {
    const verb = match[1].toLowerCase();
    if (lang === "ar") {
      return verb === "increase"
        ? `زِد ${ltr(match[2])} بنسبة ${ltr(match[3])}%.`
        : `أنقص ${ltr(match[2])} بنسبة ${ltr(match[3])}%.`;
    }
    return verb === "increase"
      ? `${ltr(match[2])} را به میزان ${ltr(match[3])}% افزایش دهید.`
      : `${ltr(match[2])} را به میزان ${ltr(match[3])}% کاهش دهید.`;
  }

  match = text.match(/^A jacket costs (.+)\. It is discounted by (.+)%\. Find the sale price\.$/i);
  if (match) {
    return lang === "ar"
      ? `ثمن السترة ${ltr(match[1])}. عليها خصم بنسبة ${ltr(match[2])}%. أوجد سعر البيع.`
      : `قیمت ژاکت ${ltr(match[1])} است. ${ltr(match[2])}% تخفیف دارد. قیمت فروش را پیدا کنید.`;
  }

  return translateGeneralPrompt(text, lang);
}

function translateRatiosRatesPrompt(text, lang) {
  const cleanText = String(text || "").replace(/\u00A0/g, " ").replace(/\n\s+/g, "\n").trim();
  let match = cleanText.match(/^Simplify the ratio (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `بسّط النسبة ${ltr(match[1])}.`
      : `نسبت ${ltr(match[1])} را ساده کنید.`;
  }

  match = cleanText.match(/^The ratio of (.+) to (.+) is (.+)\. What fraction of the total is (.+)\?$/i);
  if (match) {
    return lang === "ar"
      ? `النسبة بين ${translateRatioTerm(match[1], lang)} و${translateRatioTerm(match[2], lang)} هي ${ltr(match[3])}. ما الكسر من المجموع الذي يمثّل ${translateRatioTerm(match[4], lang)}؟`
      : `نسبت ${translateRatioTerm(match[1], lang)} به ${translateRatioTerm(match[2], lang)} برابر ${ltr(match[3])} است. چه کسری از کل مربوط به ${translateRatioTerm(match[4], lang)} است؟`;
  }

  match = cleanText.match(/^Complete the equivalent ratio: (.+)$/i);
  if (match) {
    return lang === "ar"
      ? `أكمل النسبة المكافئة: ${ltr(match[1])}`
      : `نسبت معادل را کامل کنید: ${ltr(match[1])}`;
  }

  match = cleanText.match(/^A drink is mixed in the ratio cordial:water = (.+)\.(?:\n)?If (.+) cups of water are used, how many cups of cordial are needed\?$/i);
  if (match) {
    return lang === "ar"
      ? `يُخلط الشراب بنسبة مركز الشراب إلى الماء = ${ltr(match[1])}.\nإذا استُخدم ${ltr(match[2])} كوبًا من الماء، فكم كوبًا من مركز الشراب مطلوب؟`
      : `یک نوشیدنی با نسبت شربت به آب = ${ltr(match[1])} مخلوط می‌شود.\nاگر ${ltr(match[2])} پیمانه آب استفاده شود، چند پیمانه شربت لازم است؟`;
  }

  match = cleanText.match(/^A recipe uses flour:sugar in the ratio (.+)\.(?:\n)?If (.+) cups of flour are used, how many cups of sugar are needed\?$/i);
  if (match) {
    return lang === "ar"
      ? `تستخدم الوصفة نسبة الدقيق إلى السكر ${ltr(match[1])}.\nإذا استُخدم ${ltr(match[2])} كوبًا من الدقيق، فكم كوبًا من السكر مطلوب؟`
      : `در یک دستور غذا، نسبت آرد به شکر ${ltr(match[1])} است.\nاگر ${ltr(match[2])} پیمانه آرد استفاده شود، چند پیمانه شکر لازم است؟`;
  }

  match = cleanText.match(/^A map uses a scale of (.+)\.(?:\n)?A distance on the map is (.+) cm\. Find the real distance in kilometres\.$/i);
  if (match) {
    return lang === "ar"
      ? `تستخدم الخريطة مقياس رسم ${ltr(match[1])}.\nالمسافة على الخريطة ${ltr(match[2])} سم. أوجد المسافة الحقيقية بالكيلومترات.`
      : `یک نقشه از مقیاس ${ltr(match[1])} استفاده می‌کند.\nفاصله روی نقشه ${ltr(match[2])} سانتی‌متر است. فاصله واقعی را بر حسب کیلومتر پیدا کنید.`;
  }

  match = cleanText.match(/^Divide (.+) students into groups in the ratio (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `قسّم ${ltr(match[1])} طالبًا إلى مجموعات بالنسبة ${ltr(match[2])}.`
      : `${ltr(match[1])} دانش‌آموز را به نسبت ${ltr(match[2])} به گروه‌ها تقسیم کنید.`;
  }

  match = cleanText.match(/^Share (.+) in the ratio (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `قسّم ${ltr(match[1])} بالنسبة ${ltr(match[2])}.`
      : `${ltr(match[1])} را به نسبت ${ltr(match[2])} تقسیم کنید.`;
  }

  match = cleanText.match(/^A printer prints (.+) pages in (.+) minutes\. Write this as a simplified rate\.$/i);
  if (match) {
    return lang === "ar"
      ? `تطبع الطابعة ${ltr(match[1])} صفحة في ${ltr(match[2])} دقيقة. اكتب ذلك كمعدل مبسّط.`
      : `یک چاپگر ${ltr(match[1])} صفحه را در ${ltr(match[2])} دقیقه چاپ می‌کند. آن را به صورت یک نرخ ساده‌شده بنویسید.`;
  }

  match = cleanText.match(/^A car travels (.+) km in (.+) hours\. Write this as a simplified rate\.$/i);
  if (match) {
    return lang === "ar"
      ? `تقطع سيارة ${ltr(match[1])} كم في ${ltr(match[2])} ساعات. اكتب ذلك كمعدل مبسّط.`
      : `یک خودرو ${ltr(match[1])} کیلومتر را در ${ltr(match[2])} ساعت طی می‌کند. آن را به صورت یک نرخ ساده‌شده بنویسید.`;
  }

  match = cleanText.match(/^Convert (.+) to (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `حوّل ${ltr(match[1])} إلى ${ltr(match[2])}.`
      : `${ltr(match[1])} را به ${ltr(match[2])} تبدیل کنید.`;
  }

  match = cleanText.match(/^A tap fills (.+) L in (.+) minutes\. How many litres will it fill in (.+) minutes\?$/i);
  if (match) {
    return lang === "ar"
      ? `يملأ صنبور ${ltr(match[1])} لترًا في ${ltr(match[2])} دقائق. كم لترًا سيملأ في ${ltr(match[3])} دقائق؟`
      : `یک شیر آب ${ltr(match[1])} لیتر را در ${ltr(match[2])} دقیقه پر می‌کند. در ${ltr(match[3])} دقیقه چند لیتر پر می‌کند؟`;
  }

  match = cleanText.match(/^A worker earns (.+) for (.+) hours\. How much would they earn for (.+) hours\?$/i);
  if (match) {
    return lang === "ar"
      ? `يكسب عامل ${ltr(match[1])} مقابل ${ltr(match[2])} ساعات. كم سيكسب مقابل ${ltr(match[3])} ساعات؟`
      : `یک کارگر برای ${ltr(match[2])} ساعت کار ${ltr(match[1])} درآمد دارد. برای ${ltr(match[3])} ساعت چقدر درآمد خواهد داشت؟`;
  }

  match = cleanText.match(/^A cyclist travels (.+) km in (.+) hours\.(?:\n)?Find the average speed\.$/i);
  if (match) {
    return lang === "ar"
      ? `يقطع راكب دراجة ${ltr(match[1])} كم في ${ltr(match[2])} ساعات.\nأوجد السرعة المتوسطة.`
      : `یک دوچرخه‌سوار ${ltr(match[1])} کیلومتر را در ${ltr(match[2])} ساعت طی می‌کند.\nسرعت متوسط را پیدا کنید.`;
  }

  match = cleanText.match(/^A car travels at (.+) km\/h for (.+) hours\.(?:\n)?How far does it travel\?$/i);
  if (match) {
    return lang === "ar"
      ? `تسير سيارة بسرعة ${ltr(match[1])} كم/س لمدة ${ltr(match[2])} ساعات.\nما المسافة التي تقطعها؟`
      : `یک خودرو با سرعت ${ltr(match[1])} کیلومتر بر ساعت به مدت ${ltr(match[2])} ساعت حرکت می‌کند.\nچه مسافتی طی می‌کند؟`;
  }

  match = cleanText.match(/^A bus travels (.+) km at (.+) km\/h\.(?:\n)?How long does it take\?$/i);
  if (match) {
    return lang === "ar"
      ? `تقطع حافلة ${ltr(match[1])} كم بسرعة ${ltr(match[2])} كم/س.\nكم من الوقت يستغرق ذلك؟`
      : `یک اتوبوس ${ltr(match[1])} کیلومتر را با سرعت ${ltr(match[2])} کیلومتر بر ساعت طی می‌کند.\nچقدر زمان می‌برد؟`;
  }

  match = cleanText.match(/^Use the distance-time graph below to answer the question below\.(?:\n)?(.+)$/i);
  if (match) {
    const q = translateEverydayQuestion(match[1], lang) || translateGeneralPrompt(match[1], lang) || (lang === "ar" ? "أجب عن السؤال." : "به پرسش پاسخ دهید.");
    return lang === "ar"
      ? `استخدم مخطط المسافة والزمن أدناه للإجابة عن السؤال.\n${q}`
      : `از نمودار مسافت-زمان زیر برای پاسخ به پرسش استفاده کنید.\n${q}`;
  }

  match = cleanText.match(/^Construct a distance-time graph for this journey\.(?:\n)?(.+)\.?$/i);
  if (match) {
    return lang === "ar"
      ? `أنشئ مخططًا للمسافة والزمن لهذه الرحلة.\nاستخدم الوصف الإنجليزي أدناه.`
      : `برای این سفر یک نمودار مسافت-زمان بسازید.\nاز توضیح انگلیسی زیر استفاده کنید.`;
  }

  return translateGeneralPrompt(text, lang);
}

function translateLinearPrompt(text, lang) {
  let match = text.match(/^Find the rule for the graphed linear relationship\.$/i);
  if (match) {
    return lang === "ar"
      ? "أوجد قاعدة العلاقة الخطية المرسومة."
      : "قاعده رابطه خطی رسم‌شده را پیدا کنید.";
  }

  match = text.match(/^Write the coordinates of point ([A-Z])\.$/i);
  if (match) {
    return lang === "ar"
      ? `اكتب إحداثيات النقطة ${ltr(match[1])}.`
      : `مختصات نقطه ${ltr(match[1])} را بنویسید.`;
  }

  match = text.match(/^Plot and label the point ([A-Z])(.+) on the Cartesian plane\.$/i);
  if (match) {
    return lang === "ar"
      ? `ارسم النقطة ${ltr(match[1] + match[2])} وسمِّها على المستوى الديكارتي.`
      : `نقطه ${ltr(match[1] + match[2])} را روی صفحه مختصات رسم و نام‌گذاری کنید.`;
  }

  match = text.match(/^Use the rule (.+) to find y when x = (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `استخدم القاعدة ${ltr(match[1])} لإيجاد ${ltr("y")} عندما ${ltr("x = " + match[2])}.`
      : `از قاعده ${ltr(match[1])} استفاده کنید تا ${ltr("y")} را وقتی ${ltr("x = " + match[2])} پیدا کنید.`;
  }

  match = text.match(/^A taxi fare costs \$(.+) plus \$(.+) per kilometre\.\nWrite a rule for the cost C after k kilometres\.$/i);
  if (match) {
    return lang === "ar"
      ? `تبلغ أجرة سيارة الأجرة ${ltr("$" + match[1])} بالإضافة إلى ${ltr("$" + match[2])} لكل كيلومتر.\nاكتب قاعدة للتكلفة ${ltr("C")} بعد ${ltr("k")} كيلومترات.`
      : `هزینه تاکسی ${ltr("$" + match[1])} به اضافه ${ltr("$" + match[2])} برای هر کیلومتر است.\nیک قاعده برای هزینه ${ltr("C")} پس از ${ltr("k")} کیلومتر بنویسید.`;
  }

  match = text.match(/^Solve (.+) and (.+) by graphing\.$/i);
  if (match) {
    return lang === "ar"
      ? `حل ${ltr(match[1])} و ${ltr(match[2])} باستخدام الرسم البياني.`
      : `${ltr(match[1])} و ${ltr(match[2])} را با رسم نمودار حل کنید.`;
  }

  match = text.match(/^Verify algebraically that (.+) lies on both lines\.$/i);
  if (match) {
    return lang === "ar"
      ? `باستخدام الجبر، تحقق أن ${ltr(match[1])} تقع على كلا الخطين.`
      : `با روش جبری بررسی کنید که ${ltr(match[1])} روی هر دو خط قرار دارد.`;
  }

  match = text.match(/^Complete the table of values for (.+), then graph the line\.$/i);
  if (match) {
    return lang === "ar"
      ? `أكمل جدول القيم لـ ${ltr(match[1])}، ثم ارسم الخط.`
      : `جدول مقادیر را برای ${ltr(match[1])} کامل کنید، سپس خط را رسم کنید.`;
  }

  match = text.match(/^Write the equation for the linear relationship shown in the table\.$/i);
  if (match) {
    return lang === "ar"
      ? "اكتب معادلة العلاقة الخطية الموضحة في الجدول."
      : "معادله رابطه خطی نشان‌داده‌شده در جدول را بنویسید.";
  }

  match = text.match(/^Which line has a greater gradient, (.+) or (.+)\?$/i);
  if (match) {
    return lang === "ar"
      ? `أي خط له ميل أكبر، ${ltr(match[1])} أم ${ltr(match[2])}؟`
      : `کدام خط شیب بیشتری دارد، ${ltr(match[1])} یا ${ltr(match[2])}؟`;
  }

  match = text.match(/^The tile pattern continues in the same way\. Write a rule for the number of tiles in Figure n, then find the number of tiles in Figure (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `يستمر نمط البلاطات بالطريقة نفسها. اكتب قاعدة لعدد البلاطات في الشكل n، ثم أوجد عدد البلاطات في الشكل ${ltr(match[1])}.`
      : `الگوی کاشی‌ها به همین روش ادامه پیدا می‌کند. یک قاعده برای تعداد کاشی‌ها در شکل n بنویسید، سپس تعداد کاشی‌ها در شکل ${ltr(match[1])} را پیدا کنید.`;
  }

  match = text.match(/^Graph the linear relationship (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `ارسم العلاقة الخطية ${ltr(match[1])}.`
      : `رابطه خطی ${ltr(match[1])} را رسم کنید.`;
  }

  match = text.match(/^Complete the table of values for (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `أكمل جدول القيم لـ ${ltr(match[1])}.`
      : `جدول مقادیر را برای ${ltr(match[1])} کامل کنید.`;
  }

  match = text.match(/^Plot and label (.+) on the Cartesian plane\.$/i);
  if (match) {
    return lang === "ar"
      ? `ارسم وسمِّ ${ltr(match[1])} على المستوى الديكارتي.`
      : `${ltr(match[1])} را روی صفحه مختصات رسم و نام‌گذاری کنید.`;
  }

  match = text.match(/^Plot (.+) on the Cartesian plane\.$/i);
  if (match) {
    return lang === "ar"
      ? `ارسم ${ltr(match[1])} على المستوى الديكارتي.`
      : `${ltr(match[1])} را روی صفحه مختصات رسم کنید.`;
  }

  match = text.match(/^Complete the table (.+)$/i) || text.match(/^Complete the table of values (.+)$/i);
  if (match) {
    return lang === "ar"
      ? `أكمل الجدول ${ltr(match[1])}`
      : `جدول را کامل کنید ${ltr(match[1])}`;
  }

  match = text.match(/^Graph (.+)$/i);
  if (match) {
    return lang === "ar"
      ? `ارسم بيانياً ${ltr(match[1])}`
      : `${ltr(match[1])} را رسم کنید`;
  }

  match = text.match(/^Verify algebraically that (.+)$/i);
  if (match) {
    return lang === "ar"
      ? `باستخدام الجبر، تحقق أن ${ltr(match[1])}`
      : `با روش جبری بررسی کنید که ${ltr(match[1])}`;
  }

  return translateGeneralPrompt(text, lang);
}

function translateLengthPrompt(text, lang) {
  let match = text.match(/^Find the missing side length, then find the perimeter of the composite figure\.$/i);
  if (match) {
    return lang === "ar"
      ? "أوجد طول الضلع المفقود، ثم أوجد محيط الشكل المركب."
      : "طول ضلع گم‌شده را پیدا کنید، سپس محیط شکل ترکیبی را پیدا کنید.";
  }

  if (/^Find the perimeter of the quadrilateral\.$/i.test(text)) {
    return lang === "ar"
      ? "أوجد محيط الشكل الرباعي."
      : "محیط چهارضلعی را پیدا کنید.";
  }

  match = text.match(/^Find the perimeter of (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `أوجد محيط ${translateObject(match[1], lang)}.`
      : `محیط ${translateObject(match[1], lang)} را پیدا کنید.`;
  }

  match = text.match(/^Find the circumference of (.+)$/i);
  if (match) {
    return lang === "ar"
      ? `أوجد محيط الدائرة ${ltr(match[1])}`
      : `محیط دایره را پیدا کنید ${ltr(match[1])}`;
  }

  match = text.match(/^Find the arc length (.+)$/i);
  if (match) {
    return lang === "ar"
      ? `أوجد طول القوس ${ltr(match[1])}`
      : `طول کمان را پیدا کنید ${ltr(match[1])}`;
  }

  match = text.match(/^Identify (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `حدّد ${translateObject(match[1], lang)}.`
      : `${translateObject(match[1], lang)} را مشخص کنید.`;
  }

  return translateGeneralPrompt(text, lang);
}

function translateAreaPrompt(text, lang) {
  let match = text.match(/^Find the area of (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `أوجد مساحة ${translateObject(match[1], lang)}.`
      : `مساحت ${translateObject(match[1], lang)} را پیدا کنید.`;
  }

  match = text.match(/^Calculate the area of (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `احسب مساحة ${translateObject(match[1], lang)}.`
      : `مساحت ${translateObject(match[1], lang)} را محاسبه کنید.`;
  }

  match = text.match(/^Calculate the shaded area\.$/i);
  if (match) {
    return lang === "ar"
      ? "احسب المساحة المظلّلة."
      : "مساحت سایه‌زده را محاسبه کنید.";
  }

  match = text.match(/^Calculate the surface area of (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `احسب مساحة سطح ${translateObject(match[1], lang)}.`
      : `مساحت سطح ${translateObject(match[1], lang)} را محاسبه کنید.`;
  }

  return translateGeneralPrompt(text, lang);
}


function translateVolumePrompt(text, lang) {
  let match = text.match(/^Find the volume of (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `أوجد حجم ${translateObject(match[1], lang)}.`
      : `حجم ${translateObject(match[1], lang)} را پیدا کنید.`;
  }

  match = text.match(/^Find the volume of (.+?)\. Give your answer in terms of π\.$/i);
  if (match) {
    return lang === "ar"
      ? `أوجد حجم ${translateObject(match[1], lang)}. اعط إجابتك بدلالة π.`
      : `حجم ${translateObject(match[1], lang)} را پیدا کنید. پاسخ خود را بر حسب π بدهید.`;
  }

  match = text.match(/^Find the volume of (.+?)\. Give your answer correct to 1 decimal place\.$/i);
  if (match) {
    return lang === "ar"
      ? `أوجد حجم ${translateObject(match[1], lang)}. اعط إجابتك صحيحة لأقرب منزلة عشرية واحدة.`
      : `حجم ${translateObject(match[1], lang)} را پیدا کنید. پاسخ خود را تا یک رقم اعشار بنویسید.`;
  }

  if (/^Find the volume of the composite solid\./i.test(text)) {
    return lang === "ar"
      ? "أوجد حجم الجسم المركب."
      : "حجم جسم مرکب را پیدا کنید.";
  }

  if (/^Find the volume of the prism\./i.test(text)) {
    return lang === "ar"
      ? "أوجد حجم المنشور."
      : "حجم منشور را پیدا کنید.";
  }

  match = text.match(/^The front cross-section of this right prism has area (.+?)\. The prism is (.+?) long\. Find its volume\.$/i);
  if (match) {
    return lang === "ar"
      ? `مساحة المقطع العرضي الأمامي لهذا المنشور القائم هي ${ltr(match[1])}. طول المنشور ${ltr(match[2])}. أوجد حجمه.`
      : `مساحت مقطع جلویی این منشور قائم ${ltr(match[1])} است. طول منشور ${ltr(match[2])} است. حجم آن را پیدا کنید.`;
  }

  match = text.match(/^A rectangular fish tank is (.+?) long, (.+?) wide and (.+?) high\. How many litres of water can it hold\?$/i);
  if (match) {
    return lang === "ar"
      ? `حوض أسماك مستطيل طوله ${ltr(match[1])} وعرضه ${ltr(match[2])} وارتفاعه ${ltr(match[3])}. كم لترًا من الماء يمكن أن يحتوي؟`
      : `یک مخزن ماهی مستطیلی ${ltr(match[1])} طول، ${ltr(match[2])} عرض و ${ltr(match[3])} ارتفاع دارد. چند لیتر آب در آن جا می‌شود؟`;
  }

  match = text.match(/^A cylindrical rainwater tank has radius (.+?) and height (.+?)\. Find its capacity in litres, correct to the nearest litre\.$/i);
  if (match) {
    return lang === "ar"
      ? `خزان ماء مطر أسطواني نصف قطره ${ltr(match[1])} وارتفاعه ${ltr(match[2])}. أوجد سعته باللترات لأقرب لتر.`
      : `یک مخزن آب باران استوانه‌ای شعاع ${ltr(match[1])} و ارتفاع ${ltr(match[2])} دارد. گنجایش آن را بر حسب لیتر، به نزدیک‌ترین لیتر، پیدا کنید.`;
  }

  match = text.match(/^A concrete slab is (.+?) long, (.+?) wide and (.+?) deep\. Find the volume of concrete needed in cubic metres\.$/i);
  if (match) {
    return lang === "ar"
      ? `لوح خرساني طوله ${ltr(match[1])} وعرضه ${ltr(match[2])} وعمقه ${ltr(match[3])}. أوجد حجم الخرسانة المطلوبة بالمتر المكعب.`
      : `یک دال بتنی ${ltr(match[1])} طول، ${ltr(match[2])} عرض و ${ltr(match[3])} عمق دارد. حجم بتن لازم را بر حسب متر مکعب پیدا کنید.`;
  }

  match = text.match(/^A rectangular container is (.+?) long, (.+?) wide and (.+?) deep\. Find its capacity in litres\.$/i);
  if (match) {
    return lang === "ar"
      ? `حاوية مستطيلة طولها ${ltr(match[1])} وعرضها ${ltr(match[2])} وعمقها ${ltr(match[3])}. أوجد سعتها باللترات.`
      : `یک ظرف مستطیلی ${ltr(match[1])} طول، ${ltr(match[2])} عرض و ${ltr(match[3])} عمق دارد. گنجایش آن را بر حسب لیتر پیدا کنید.`;
  }

  return translateGeneralPrompt(text, lang);
}

function translatePythagorasPrompt(text, lang) {
  if (/^Which set of side lengths forms a right-angled triangle\?$/i.test(text)) {
    return lang === "ar"
      ? "أي مجموعة من أطوال الأضلاع تكوّن مثلثًا قائم الزاوية؟"
      : "کدام مجموعه از طول ضلع‌ها یک مثلث قائم‌الزاویه تشکیل می‌دهد؟";
  }

  let match = text.match(/^Find the value of (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `أوجد قيمة ${ltr(match[1])}.`
      : `مقدار ${ltr(match[1])} را پیدا کنید.`;
  }

  match = text.match(/^A path forms two right triangles\. The first has shorter sides (.+?) and (.+?)\. The second uses this diagonal and another side of (.+?)\. Find the final diagonal length\.$/i);
  if (match) {
    return lang === "ar"
      ? `يتكوّن المسار من مثلثين قائمي الزاوية. للمثلث الأول ضلعان قصيران طولهما ${ltr(match[1])} و ${ltr(match[2])}. يستخدم المثلث الثاني هذا القطر وضلعًا آخر طوله ${ltr(match[3])}. أوجد طول القطر النهائي.`
      : `یک مسیر دو مثلث قائم‌الزاویه تشکیل می‌دهد. مثلث اول دو ضلع کوتاه به طول ${ltr(match[1])} و ${ltr(match[2])} دارد. مثلث دوم از این قطر و ضلع دیگری به طول ${ltr(match[3])} استفاده می‌کند. طول قطر نهایی را پیدا کنید.`;
  }

  match = text.match(/^A student walks (.+?) east and (.+?) north\. How far are they from the starting point\?$/i);
  if (match) {
    return lang === "ar"
      ? `يمشي طالب ${ltr(match[1])} شرقًا و ${ltr(match[2])} شمالًا. كم يبعد عن نقطة البداية؟`
      : `یک دانش‌آموز ${ltr(match[1])} به سمت شرق و ${ltr(match[2])} به سمت شمال راه می‌رود. از نقطه شروع چقدر فاصله دارد؟`;
  }

  match = text.match(/^Find the length of (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `أوجد طول ${ltr(match[1])}.`
      : `طول ${ltr(match[1])} را پیدا کنید.`;
  }

  match = text.match(/^Use Pythagoras' theorem to (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `استخدم نظرية فيثاغورس لكي ${ltr(match[1])}.`
      : `از قضیه فیثاغورس استفاده کنید تا ${ltr(match[1])}.`;
  }

  return translateGeneralPrompt(text, lang);
}

function translateTrigonometryPrompt(text, lang) {
  let match = text.match(/^Find the unknown (side|angle)(.+)$/i);
  if (match) {
    const term = match[1].toLowerCase() === "side"
      ? (lang === "ar" ? "الضلع المجهول" : "ضلع مجهول")
      : (lang === "ar" ? "الزاوية المجهولة" : "زاویه مجهول");
    return lang === "ar"
      ? `أوجد ${term}${ltr(match[2])}`
      : `${term} را پیدا کنید${ltr(match[2])}`;
  }

  match = text.match(/^Write a trigonometric equation (.+)$/i);
  if (match) {
    return lang === "ar"
      ? `اكتب معادلة مثلثية ${ltr(match[1])}`
      : `یک معادله مثلثاتی بنویسید ${ltr(match[1])}`;
  }

  match = text.match(/^Use the (sine|cosine|area) rule (.+)$/i);
  if (match) {
    const rule = translateMathTerm(`${match[1]} rule`, lang);
    return lang === "ar"
      ? `استخدم ${rule} ${ltr(match[2])}`
      : `از ${rule} استفاده کنید ${ltr(match[2])}`;
  }

  return translateGeneralPrompt(text, lang);
}

function translateFinancialPrompt(text, lang) {
  let match = text.match(/^Calculate (.+)$/i);
  if (match) {
    return lang === "ar"
      ? `احسب ${translateObject(match[1], lang)}`
      : `${translateObject(match[1], lang)} را محاسبه کنید`;
  }

  match = text.match(/^Compare (.+)$/i);
  if (match) {
    return lang === "ar"
      ? `قارن ${ltr(match[1])}`
      : `${ltr(match[1])} را مقایسه کنید`;
  }

  return translateGeneralPrompt(text, lang);
}

function translateNonLinearPrompt(text, lang) {
  let match = text.match(/^For (.+?), state (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `بالنسبة إلى ${ltr(match[1])}، اذكر ${translateObject(match[2], lang)}.`
      : `برای ${ltr(match[1])}، ${translateObject(match[2], lang)} را بیان کنید.`;
  }

  match = text.match(/^Complete the table of values for (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `أكمل جدول القيم لـ ${ltr(match[1])}.`
      : `جدول مقادیر را برای ${ltr(match[1])} کامل کنید.`;
  }

  return translateGeneralPrompt(text, lang);
}

function translateGeneralPrompt(text, lang, question = {}) {
  let match = text.match(/^Calculate:?\s*(.+)$/i);
  if (match) {
    return lang === "ar"
      ? `احسب ${translateObject(match[1], lang)}`
      : `${translateObject(match[1], lang)} را محاسبه کنید`;
  }

  match = text.match(/^Evaluate (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `احسب قيمة ${ltr(match[1])}.`
      : `مقدار ${ltr(match[1])} را محاسبه کنید.`;
  }

  match = text.match(/^Simplify:?\s*(.+)$/i);
  if (match) {
    return lang === "ar"
      ? `بسّط: ${ltr(match[1])}`
      : `ساده کنید: ${ltr(match[1])}`;
  }

  match = text.match(/^Solve:?\s*(.+)$/i);
  if (match) {
    return lang === "ar"
      ? `حل: ${ltr(match[1])}`
      : `حل کنید: ${ltr(match[1])}`;
  }

  match = text.match(/^Find (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `أوجد ${translateObject(match[1], lang)}.`
      : `${translateObject(match[1], lang)} را پیدا کنید.`;
  }

  match = text.match(/^Write (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `اكتب ${translateObject(match[1], lang)}.`
      : `${translateObject(match[1], lang)} را بنویسید.`;
  }

  match = text.match(/^Complete (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `أكمل ${translateObject(match[1], lang)}.`
      : `${translateObject(match[1], lang)} را کامل کنید.`;
  }

  match = text.match(/^Convert (.+)$/i);
  if (match) {
    return lang === "ar"
      ? `حوّل ${ltr(match[1])}`
      : `${ltr(match[1])} را تبدیل کنید`;
  }

  match = text.match(/^Graph (.+)$/i);
  if (match) {
    return lang === "ar"
      ? `ارسم بيانياً ${ltr(match[1])}`
      : `${ltr(match[1])} را رسم کنید`;
  }

  match = text.match(/^Plot (.+)$/i);
  if (match) {
    return lang === "ar"
      ? `ارسم ${ltr(match[1])}`
      : `${ltr(match[1])} را رسم کنید`;
  }

  match = text.match(/^Identify (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `حدّد ${translateObject(match[1], lang)}.`
      : `${translateObject(match[1], lang)} را مشخص کنید.`;
  }

  match = text.match(/^State (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `اذكر ${translateObject(match[1], lang)}.`
      : `${translateObject(match[1], lang)} را بیان کنید.`;
  }

  match = text.match(/^Determine (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `حدّد ${translateObject(match[1], lang)}.`
      : `${translateObject(match[1], lang)} را تعیین کنید.`;
  }

  match = text.match(/^Which (.+)\?$/i);
  if (match) {
    return lang === "ar"
      ? `أي ${translateObject(match[1], lang)}؟`
      : `کدام ${translateObject(match[1], lang)}؟`;
  }

  return "";
}

function translateObject(value, lang) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  let out = raw;
  const replacements = lang === "ar" ? [
    [/\bthe\b/gi, ""],
    [/\bbelow\b/gi, "أدناه"],
    [/\bshown\b/gi, "الموضح"],
    [/\band\b/gi, "و"],
    [/\bparabola\b/gi, "القطع المكافئ"],
    [/\bthe area\b/gi, "المساحة"],
    [/\barea\b/gi, "المساحة"],
    [/\bperimeter\b/gi, "المحيط"],
    [/\bcircumference\b/gi, "محيط الدائرة"],
    [/\bradius\b/gi, "نصف القطر"],
    [/\bdiameter\b/gi, "القطر"],
    [/\barc length\b/gi, "طول القوس"],
    [/\bsurface area\b/gi, "مساحة السطح"],
    [/\bvolume\b/gi, "الحجم"],
    [/\btriangle\b/gi, "المثلث"],
    [/\brectangle\b/gi, "المستطيل"],
    [/\bsquare\b/gi, "المربع"],
    [/\bparallelogram\b/gi, "متوازي الأضلاع"],
    [/\btrapezium\b/gi, "شبه المنحرف"],
    [/\brhombus\b/gi, "المعين"],
    [/\bkite\b/gi, "الطائرة الورقية"],
    [/\bcircle\b/gi, "الدائرة"],
    [/\bsector\b/gi, "القطاع"],
    [/\bsemicircle\b/gi, "نصف الدائرة"],
    [/\bquadrant\b/gi, "ربع الدائرة"],
    [/\bcomposite figure\b/gi, "الشكل المركب"],
    [/\bcomposite shape\b/gi, "الشكل المركب"],
    [/\bshaded area\b/gi, "المساحة المظللة"],
    [/\btable of values\b/gi, "جدول القيم"],
    [/\bpoint of intersection\b/gi, "نقطة التقاطع"],
    [/\bgradient\b/gi, "الميل"],
    [/\by-intercept\b/gi, "المقطع الصادي"],
    [/\bvertex\b/gi, "الرأس"],
    [/\baxis of symmetry\b/gi, "محور التماثل"],
    [/\bconcavity\b/gi, "اتجاه الفتحة"],
    [/\btax payable\b/gi, "الضريبة المستحقة"],
    [/\bsimple interest\b/gi, "الفائدة البسيطة"],
    [/\bcompound interest\b/gi, "الفائدة المركبة"],
    [/\bdepreciation\b/gi, "الإهلاك"]
  ] : [
    [/\bthe\b/gi, ""],
    [/\bbelow\b/gi, "زیر"],
    [/\bshown\b/gi, "نشان‌داده‌شده"],
    [/\band\b/gi, "و"],
    [/\bparabola\b/gi, "سهمی"],
    [/\bthe area\b/gi, "مساحت"],
    [/\barea\b/gi, "مساحت"],
    [/\bperimeter\b/gi, "محیط"],
    [/\bcircumference\b/gi, "محیط دایره"],
    [/\bradius\b/gi, "شعاع"],
    [/\bdiameter\b/gi, "قطر"],
    [/\barc length\b/gi, "طول کمان"],
    [/\bsurface area\b/gi, "مساحت سطح"],
    [/\bvolume\b/gi, "حجم"],
    [/\btriangle\b/gi, "مثلث"],
    [/\brectangle\b/gi, "مستطیل"],
    [/\bsquare\b/gi, "مربع"],
    [/\bparallelogram\b/gi, "متوازی‌الأضلاع"],
    [/\btrapezium\b/gi, "ذوزنقه"],
    [/\brhombus\b/gi, "لوزی"],
    [/\bkite\b/gi, "بادبادک"],
    [/\bcircle\b/gi, "دایره"],
    [/\bsector\b/gi, "قطاع"],
    [/\bsemicircle\b/gi, "نیم‌دایره"],
    [/\bquadrant\b/gi, "ربع دایره"],
    [/\bcomposite figure\b/gi, "شکل ترکیبی"],
    [/\bcomposite shape\b/gi, "شکل ترکیبی"],
    [/\bshaded area\b/gi, "مساحت سایه‌زده"],
    [/\btable of values\b/gi, "جدول مقادیر"],
    [/\bpoint of intersection\b/gi, "نقطه تقاطع"],
    [/\bgradient\b/gi, "شیب"],
    [/\by-intercept\b/gi, "عرض از مبدأ"],
    [/\bvertex\b/gi, "رأس"],
    [/\baxis of symmetry\b/gi, "محور تقارن"],
    [/\bconcavity\b/gi, "جهت بازشدگی"],
    [/\btax payable\b/gi, "مالیات قابل پرداخت"],
    [/\bsimple interest\b/gi, "بهره ساده"],
    [/\bcompound interest\b/gi, "بهره مرکب"],
    [/\bdepreciation\b/gi, "استهلاک"]
  ];

  replacements.forEach(([pattern, replacement]) => {
    out = out.replace(pattern, replacement);
  });

  // If the phrase remains mostly English or contains maths notation, isolate it
  // so it reads left-to-right inside Arabic/Farsi lines.
  if (out === raw) {
    return ltr(raw);
  }

  out = out.replace(/\s{2,}/g, " ").trim();

  return out;
}

function translateMathTerm(term, lang) {
  const key = String(term ?? "").toLowerCase().trim();
  const terms = {
    ar: {
      "a fraction": "كسر",
      "a decimal": "عدد عشري",
      "a percentage": "نسبة مئوية",
      "a percent": "نسبة مئوية",
      "sine rule": "قاعدة الجيب",
      "cosine rule": "قاعدة جيب التمام",
      "area rule": "قاعدة المساحة"
    },
    fa: {
      "a fraction": "کسر",
      "a decimal": "عدد اعشاری",
      "a percentage": "درصد",
      "a percent": "درصد",
      "sine rule": "قانون سینوس",
      "cosine rule": "قانون کسینوس",
      "area rule": "قانون مساحت"
    }
  };

  return terms[lang]?.[key] || ltr(term);
}

function translateRatioTerm(value, lang) {
  const raw = String(value ?? "").trim();
  const key = raw.toLowerCase();
  const terms = {
    ar: {
      "wins": "الفوز",
      "losses": "الخسائر",
      "red counters": "العدادات الحمراء",
      "blue counters": "العدادات الزرقاء",
      "boys": "الأولاد",
      "girls": "البنات",
      "cats": "القطط",
      "dogs": "الكلاب",
      "green marbles": "الكرات الخضراء",
      "yellow marbles": "الكرات الصفراء",
      "cordial": "مركز الشراب",
      "water": "الماء",
      "flour": "الدقيق",
      "sugar": "السكر"
    },
    fa: {
      "wins": "بردها",
      "losses": "باخت‌ها",
      "red counters": "مهره‌های قرمز",
      "blue counters": "مهره‌های آبی",
      "boys": "پسرها",
      "girls": "دخترها",
      "cats": "گربه‌ها",
      "dogs": "سگ‌ها",
      "green marbles": "تیله‌های سبز",
      "yellow marbles": "تیله‌های زرد",
      "cordial": "شربت",
      "water": "آب",
      "flour": "آرد",
      "sugar": "شکر"
    }
  };

  return terms[lang]?.[key] || ltr(raw);
}

function translateEverydayQuestion(text, lang) {
  const item = String(text ?? "").trim();
  if (!item) return "";

  let match = item.match(/^How much does (.+) earn for working (.+)\?$/i);
  if (match) {
    return lang === "ar"
      ? `كم يكسب ${ltr(match[1])} مقابل العمل ${ltr(match[2])}؟`
      : `${ltr(match[1])} برای کار کردن ${ltr(match[2])} چقدر درآمد دارد؟`;
  }

  match = item.match(/^How many (.+) are needed\?$/i);
  if (match) {
    return lang === "ar"
      ? `كم عدد ${ltr(match[1])} المطلوب؟`
      : `چند ${ltr(match[1])} لازم است؟`;
  }

  match = item.match(/^How many litres will it fill in (.+)\?$/i);
  if (match) {
    return lang === "ar"
      ? `كم لترًا سيملأ في ${ltr(match[1])}؟`
      : `در ${ltr(match[1])} چند لیتر پر می‌کند؟`;
  }

  match = item.match(/^How long does it take\?$/i);
  if (match) {
    return lang === "ar"
      ? "كم من الوقت يستغرق؟"
      : "چقدر زمان می‌برد؟";
  }

  match = item.match(/^How far from home was the person after (.+)\?$/i);
  if (match) {
    return lang === "ar"
      ? `فاصله الشخص عن المنزل بعد ${ltr(match[1])} چقدر بود؟`
      : `فرد پس از ${ltr(match[1])} چه فاصله‌ای از خانه داشت؟`;
  }

  match = item.match(/^Which is better value\?$/i);
  if (match) {
    return lang === "ar"
      ? "أي خيار يعطي قيمة أفضل؟"
      : "کدام گزینه ارزش خرید بهتری دارد؟";
  }

  match = item.match(/^During which time intervals was the person stopped\?$/i);
  if (match) {
    return lang === "ar"
      ? "در کدام بازه‌های زمانی شخص توقف کرده بود؟"
      : "در کدام بازه‌های زمانی فرد توقف کرده بود؟";
  }

  match = item.match(/^Find the average speed between (.+) and (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `أوجد السرعة المتوسطة بين ${ltr(match[1])} و ${ltr(match[2])}.`
      : `سرعت متوسط بین ${ltr(match[1])} و ${ltr(match[2])} را پیدا کنید.`;
  }

  match = item.match(/^Use the (.+) to calculate (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `استخدم ${translateObject(match[1], lang)} لحساب ${translateObject(match[2], lang)}.`
      : `از ${translateObject(match[1], lang)} برای محاسبه ${translateObject(match[2], lang)} استفاده کنید.`;
  }

  match = item.match(/^Use the (.+) to answer the question below\.$/i);
  if (match) {
    return lang === "ar"
      ? `استخدم ${translateObject(match[1], lang)} للإجابة عن السؤال أدناه.`
      : `از ${translateObject(match[1], lang)} برای پاسخ به پرسش زیر استفاده کنید.`;
  }

  match = item.match(/^Use the graph to solve the simultaneous equations (.+)\.$/i);
  if (match) {
    return lang === "ar"
      ? `استخدم الرسم البياني لحل المعادلات المتزامنة ${ltr(match[1])}.`
      : `از نمودار برای حل معادلات همزمان ${ltr(match[1])} استفاده کنید.`;
  }

  match = item.match(/^Match each graph (.+) to the most appropriate equation by drawing lines between the columns\.$/i);
  if (match) {
    return lang === "ar"
      ? `طابق كل رسم بياني ${ltr(match[1])} مع المعادلة الأنسب برسم خطوط بين الأعمدة.`
      : `هر نمودار ${ltr(match[1])} را با مناسب‌ترین معادله با کشیدن خط بین ستون‌ها وصل کنید.`;
  }

  match = item.match(/^Classify the relationship in the table as linear, quadratic or exponential\. Explain how you know\.$/i);
  if (match) {
    return lang === "ar"
      ? "صنّف العلاقة في الجدول إلى خطية أو تربيعية أو أسية. اشرح كيف عرفت."
      : "رابطه در جدول را به خطی، درجه دوم یا نمایی طبقه‌بندی کنید. توضیح دهید چگونه متوجه شدید.";
  }

  match = item.match(/^Compare (.+)$/i);
  if (match) {
    return lang === "ar"
      ? `قارن ${ltr(match[1])}`
      : `${ltr(match[1])} را مقایسه کنید`;
  }

  return "";
}

function translateFallbackPrompt(text, lang) {
  const raw = String(text ?? "").trim();
  if (!raw) return "";

  const lines = raw.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

  if (lines.length > 1) {
    const translatedLines = lines.map(line =>
      translateGeneralPrompt(line, lang) || translateEverydayQuestion(line, lang)
    );

    // Only join line-by-line translations when every line has a genuine
    // translation. Do not wrap untranslated English lines in Arabic/Farsi; the
    // English support line is already printed underneath.
    if (translatedLines.every(Boolean)) {
      return translatedLines.join("\n");
    }

    return lang === "ar"
      ? "استخدم المعلومات الإنجليزية أدناه للإجابة عن السؤال."
      : "از اطلاعات انگلیسی زیر برای پاسخ به پرسش استفاده کنید.";
  }

  const everyday = translateEverydayQuestion(raw, lang);
  if (everyday) return everyday;

  // Safe fallback: provide task scaffolding only. The original English prompt
  // is displayed underneath by bilingualPlainText(), so repeating it inside the
  // translated line creates the messy duplication seen in mixed RTL/LTR prompts.
  return lang === "ar"
    ? "أجب عن السؤال أدناه."
    : "به پرسش زیر پاسخ دهید.";
}



function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
