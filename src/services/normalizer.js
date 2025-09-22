const { ARABIC_DIACRITICS } = require('../config/chatbotConfig');

function normalizeInput(text = '') {
  if (typeof text !== 'string') {
    return '';
  }

  let normalized = text.trim();

  if (!normalized) {
    return '';
  }

  normalized = normalized
    .replace(ARABIC_DIACRITICS, '')
    .replace(/\u0640/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .toLowerCase()
    .replace(/[^\u0621-\u064a0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}

module.exports = { normalizeInput };
