const { GERESH, ARABIC_TO_HEBREW, HEBREW_FINAL_TO_BASE, HEBREW_TO_ARABIC } = require('./mapping');

// Apostrophe variants to normalize to geresh before processing
const APOSTROPHE_VARIANTS = ['\u2019', '\u2018', '\u0027', '\u0060'];

const isArabic = (char) => {
  const code = char.codePointAt(0);
  return code >= 0x0600 && code <= 0x06FF;
};

const isHebrew = (char) => {
  const code = char.codePointAt(0);
  return code >= 0x05D0 && code <= 0x05F4;
};

const isAnyLetter = (char) => /\p{L}/u.test(char);

// Normalize all apostrophe-like characters to the Hebrew geresh (U+05F3)
function normalizeGeresh(text) {
  let result = text;
  for (const apos of APOSTROPHE_VARIANTS) {
    result = result.split(apos).join(GERESH);
  }
  return result;
}

// Split text into tokens: letter+geresh pairs count as one token
function tokenize(text) {
  const normalized = normalizeGeresh(text);
  const tokens = [];
  let i = 0;
  while (i < normalized.length) {
    const char = normalized[i];
    const next = normalized[i + 1];
    if (next === GERESH) {
      tokens.push(char + GERESH);
      i += 2;
    } else {
      tokens.push(char);
      i += 1;
    }
  }
  return tokens;
}

function transcribe(text) {
  // Empty input
  if (!text || text.trim() === '') {
    return { result: '' };
  }

  const tokens = tokenize(text);
  let detectedLang = null;
  let result = '';

  for (const token of tokens) {
    const firstChar = token[0];
    const arabic = isArabic(firstChar);
    const hebrew = isHebrew(firstChar);

    // Non-script character: reject other-script letters, pass through everything else
    if (!arabic && !hebrew) {
      if (isAnyLetter(firstChar)) {
        return { error: 'Invalid expression - contains a non-Hebrew/Arabic letter.' };
      }
      result += token;
      continue;
    }

    // Set language on first script character encountered
    if (!detectedLang) {
      detectedLang = arabic ? 'arabic' : 'hebrew';
    }

    // Mixed-script check
    if (arabic && detectedLang === 'hebrew') {
      return { error: 'Mixed scripts: Arabic character found in Hebrew text.' };
    }
    if (hebrew && detectedLang === 'arabic') {
      return { error: 'Mixed scripts: Hebrew character found in Arabic text.' };
    }

    if (detectedLang === 'arabic') {
      const mapped = ARABIC_TO_HEBREW[token];
      if (!mapped) {
        return { error: `No mapping found for Arabic character: "${token}".` };
      }
      result += mapped;

    } else {
      // Hebrew: normalize final form to base form first
      let lookupToken = token;
      if (HEBREW_FINAL_TO_BASE[firstChar]) {
        const base = HEBREW_FINAL_TO_BASE[firstChar];
        // Preserve geresh if present (e.g. ץ׳ → צ׳)
        lookupToken = base + (token.length > 1 ? token.slice(1) : '');
      }
      const mapped = HEBREW_TO_ARABIC[lookupToken];
      if (!mapped) {
        return { error: `No mapping found for Hebrew character: "${token}".` };
      }
      result += mapped;
    }
  }

  if (!detectedLang) {
    return { result };
  }

  return { result };
}

module.exports = { transcribe };
