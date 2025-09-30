
const GRAPH_VERSION = process.env.GRAPH_VERSION || 'v20.0';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

const GRAPH_API_BASE_URL = 'https://graph.facebook.com';

function ensureWhatsAppConfiguration() {
  if (!PHONE_NUMBER_ID) {
    throw new Error('Missing PHONE_NUMBER_ID environment variable');
  }

  if (!ACCESS_TOKEN) {
    throw new Error('Missing WHATSAPP_ACCESS_TOKEN environment variable');
  }

  if (typeof fetch !== 'function') {
    throw new Error('Global fetch API is not available in this runtime');
  }
}
async function dispatchWhatsAppMessage(payload) {
  const url = GRAPH_API_BASE_URL + '/' + GRAPH_VERSION + '/' + PHONE_NUMBER_ID + '/messages';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + ACCESS_TOKEN
    },
    body: JSON.stringify(payload)
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error('WhatsApp API request failed with status ' + response.status + ': ' + responseText);
  }

  try {
    return JSON.parse(responseText);
  } catch (_error) {
    throw new Error('Failed to parse WhatsApp API response as JSON');
  }
}
async function sendTemplateMessage({ to, templateName, languageCode = 'en_US', components }) {
  ensureWhatsAppConfiguration();

  if (!to) {
    throw new Error('Recipient phone number is required');
  }

  if (!templateName) {
    throw new Error('Template name is required');
  }

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode }
    }
  };

  if (Array.isArray(components) && components.length > 0) {
    payload.template.components = components;
  }

  return dispatchWhatsAppMessage(payload);
}
async function sendTextMessage({ to, body }) {
  ensureWhatsAppConfiguration();

  if (!to) {
    throw new Error('Recipient phone number is required');
  }

  const textBody = typeof body === 'string' ? body.trim() : '';

  if (!textBody) {
    throw new Error('Message body is required to send a WhatsApp text message');
  }

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: textBody }
  };

  return dispatchWhatsAppMessage(payload);
}
module.exports = {
  sendTemplateMessage,
  sendTextMessage
};
