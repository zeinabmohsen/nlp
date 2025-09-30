const express = require('express');
const { getResponse } = require('../services/chatbotService');
const { sendTextMessage } = require('../services/whatsappService');

const router = express.Router();

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || process.env.VERIFY_TOKEN || '';

function extractMessages(body) {
  const entries = Array.isArray(body && body.entry) ? body.entry : [];

  for (const entry of entries) {
    const changes = Array.isArray(entry && entry.changes) ? entry.changes : [];

    for (const change of changes) {
      const messages = Array.isArray(change && change.value && change.value.messages) ? change.value.messages : [];

      for (const message of messages) {
        if (message && message.text && message.text.body) {
          return { from: message.from, text: message.text.body };
        }
      }
    }
  }

  return null;
}

router.get('/', (req, res) => {
  const mode = req.query ? req.query['hub.mode'] : null;
  const token = req.query ? req.query['hub.verify_token'] : null;
  const challenge = req.query ? req.query['hub.challenge'] : null;

  if (mode === 'subscribe' && token && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge || '');
  }

  return res.status(403).send('Invalid verification token');
});

router.post('/', async (req, res) => {
  try {
    const incoming = extractMessages(req.body || {});

    if (!incoming) {
      return res.sendStatus(200);
    }

    const chatbotResponse = await getResponse(incoming.text);
    console.log('WhatsApp webhook handled', {
      from: incoming.from,
      intent: chatbotResponse.intent,
      confidence: chatbotResponse.confidence
    });
    console.log('Reply preview:', chatbotResponse.reply);

    const replySegments = [];
    const primaryReply = typeof chatbotResponse.reply === 'string' ? chatbotResponse.reply.trim() : '';

    if (primaryReply) {
      replySegments.push(primaryReply);
    }

    const suggestionList = Array.isArray(chatbotResponse.suggestions)
      ? chatbotResponse.suggestions.filter((item) => typeof item === 'string' && item.trim())
      : [];

    if (suggestionList.length > 0) {
      replySegments.push('');
      replySegments.push('Suggestions:');

      for (const suggestion of suggestionList) {
        replySegments.push('- ' + suggestion);
      }
    }

    const whatsappBody = replySegments.length > 0 ? replySegments.join('\n') : 'Your request was processed successfully.';

    try {
      await sendTextMessage({ to: incoming.from, body: whatsappBody });
    } catch (sendError) {
      console.error('Failed to send WhatsApp reply message:', sendError);
    }

    return res.status(200).json({
      handled: true,
      intent: chatbotResponse.intent,
      reply: chatbotResponse.reply,
      sentReply: whatsappBody
    });
  } catch (error) {
    console.error('Failed to process WhatsApp webhook:', error);
    return res.sendStatus(500);
  }
});

module.exports = router;
