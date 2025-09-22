const intentCounters = new Map();

function recordIntent(intent) {
  if (!intent) {
    return;
  }

  const current = intentCounters.get(intent) || 0;
  intentCounters.set(intent, current + 1);
}

function getStats() {
  const result = {};
  for (const [intent, count] of intentCounters.entries()) {
    result[intent] = count;
  }
  return result;
}

function resetStats() {
  intentCounters.clear();
}

module.exports = {
  recordIntent,
  getStats,
  resetStats
};
