const { normalizeInput } = require('./normalizer');
const { detectIntent, mapRasaIntent } = require('./intentDetector');
const { recordIntent } = require('./analytics');

const RASA_ENABLED = process.env.ENABLE_RASA === 'true';
const RASA_URL = process.env.RASA_URL || 'http://localhost:5005/model/parse';
const RASA_TIMEOUT_MS = Number.isFinite(Number.parseInt(process.env.RASA_TIMEOUT_MS, 10))
  ? Number.parseInt(process.env.RASA_TIMEOUT_MS, 10)
  : 1500;
const RASA_CONFIDENCE_THRESHOLD = Number.isFinite(Number.parseFloat(process.env.RASA_CONFIDENCE_THRESHOLD))
  ? Number.parseFloat(process.env.RASA_CONFIDENCE_THRESHOLD)
  : 0.6;

async function classifyWithRasa(rawMessage) {
  if (!RASA_ENABLED || typeof fetch !== 'function') {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), RASA_TIMEOUT_MS);

    try {
      const response = await fetch(RASA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawMessage }),
        signal: controller.signal
      });

      if (!response.ok) {
        return null;
      }

      const payload = await response.json();
      const intent = payload && payload.intent;

      if (!intent || !intent.name) {
        return null;
      }

      const confidence = typeof intent.confidence === 'number' ? intent.confidence : 0;

      if (confidence < RASA_CONFIDENCE_THRESHOLD) {
        return null;
      }

      return { name: intent.name, confidence };
    } finally {
      clearTimeout(timeout);
    }
  } catch (_error) {
    return null;
  }
}

async function getResponse(message) {
  const normalizedText = normalizeInput(message);
  const { handler } = detectIntent(normalizedText);
  const ruleBasedResponse = handler();

  if (ruleBasedResponse.intent !== 'fallback') {
    recordIntent(ruleBasedResponse.intent);
    return ruleBasedResponse;
  }

  const rasaResult = await classifyWithRasa(message);

  if (!rasaResult) {
    recordIntent(ruleBasedResponse.intent);
    return ruleBasedResponse;
  }

  const rasaResponse = mapRasaIntent(rasaResult.name, normalizedText);
  const finalResponse = rasaResponse || ruleBasedResponse;
  recordIntent(finalResponse.intent);
  return finalResponse;
}

module.exports = {
  getResponse,
  normalizeInput,
  detectIntent
};
