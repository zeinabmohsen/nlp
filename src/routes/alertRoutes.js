const express = require('express');
const { alertAll } = require('../services/whatsappService');

const router = express.Router();

function normalizeNumbers(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((value, index, arr) => value && arr.indexOf(value) === index);
}

router.post('/whatsapp', async (req, res, next) => {
  try {
    const { numbers, message, delayMs } = req.body || {};
    const sanitizedNumbers = normalizeNumbers(numbers);
    const textMessage = typeof message === 'string' ? message.trim() : '';

    if (sanitizedNumbers.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one recipient number in an array.' });
    }

    if (!textMessage) {
      return res.status(400).json({ error: 'Please provide a non-empty message body.' });
    }

    const delayValue = Number(delayMs);
    const delayOption = Number.isFinite(delayValue) && delayValue >= 0 ? delayValue : 0;

    await alertAll(sanitizedNumbers, textMessage, { delayMs: delayOption });

    return res.status(202).json({
      recipients: sanitizedNumbers.length,
      delayMs: delayOption
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
