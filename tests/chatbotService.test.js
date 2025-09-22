const { getResponse, normalizeInput } = require('../src/services/chatbotService');

describe('chatbotService', () => {
  test('returns planting schedule details for a known crop', () => {
    const result = getResponse('أريد معرفة مواعيد زراعة القمح في الدلتا');

    expect(result.intent).toBe('planting_schedule');
    expect(result.reply).toEqual(expect.stringContaining('القمح'));
    expect(result.reply).toEqual(expect.stringContaining('نصيحة إضافية'));
    expect(result.confidence).toBeGreaterThan(0.9);
    expect(result.suggestions).toHaveLength(3);
  });

  test('suggests trusted resources when user asks for references', () => {
    const result = getResponse('هل لديك مصادر أو روابط pdf عن الزراعة؟');

    expect(result.intent).toBe('resources');
    expect(result.reply).toEqual(expect.stringContaining('https://'));
    expect(result.reply.split('\n')).toHaveLength(4);
  });

  test('keeps irrigation questions away from the fallback intent', () => {
    const normalized = normalizeInput('  كَيۡفَ أَسقِي النَّبَاتات؟  ');
    expect(normalized).toBe('كيف اسقي النباتات');

    const result = getResponse('كيف أسقي النباتات؟');
    expect(result.intent).toBe('irrigation_best_practices');
    expect(result.reply).toEqual(expect.stringContaining('ري النباتات'));
  });

  test('falls back gracefully for unrelated questions', () => {
    const result = getResponse('كيف يكون الطقس في المدينة غدًا؟');

    expect(result.intent).toBe('fallback');
    expect(result.reply).toEqual(expect.stringContaining('لم أفهم سؤالك تمامًا'));
    expect(result.confidence).toBeLessThan(0.5);
  });
});
