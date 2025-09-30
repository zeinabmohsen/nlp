const { getResponse, normalizeInput } = require('../src/services/chatbotService');
const { getStats, resetStats } = require('../src/services/analytics');

describe('chatbotService', () => {
  beforeEach(() => {
    resetStats();
  });

  test('returns planting schedule details for a known crop', async () => {
    const result = await getResponse('أريد معرفة مواعيد زراعة القمح في الدلتا');

    expect(result.intent).toBe('planting_schedule');
    expect(result.reply).toEqual(expect.stringContaining('القمح'));
    expect(result.reply).toEqual(expect.stringContaining('نصيحة لبنانية'));
    expect(result.confidence).toBeGreaterThan(0.9);
    expect(result.suggestions).toHaveLength(3);
  });

  test('suggests trusted resources when user asks for references', async () => {
    const result = await getResponse('هل لديك مصادر أو روابط pdf عن الزراعة؟');

    expect(result.intent).toBe('resources');
    expect(result.reply).toEqual(expect.stringContaining('https://'));
    expect(result.reply.split('\n').length).toBeGreaterThanOrEqual(4);
  });

  test('provides watering guidance when user asks كيف أسقي', async () => {
    const normalized = normalizeInput('  كَيۡفَ أَسقِي النَّبَاتات؟  ');
    expect(normalized).toBe('كيف اسقي النباتات');

    const result = await getResponse('كيف أسقي النباتات؟');
    expect(result.intent).toBe('watering_guidance');
    expect(result.reply).toEqual(expect.stringContaining('دليل السقاية العملي بلبنان'));
  });

  test('keeps irrigation questions away from the fallback intent', async () => {
    const result = await getResponse('ما هي أفضل حلول نظام الري بالتنقيط في البقاع؟');

    expect(result.intent).toBe('irrigation_best_practices');
    expect(result.reply).toEqual(expect.stringContaining('الإرشاد الرسمي للري في لبنان'));
  });

  test('falls back gracefully for unrelated questions', async () => {
    const result = await getResponse('كيف يكون الطقس في المدينة غدًا؟');

    expect(result.intent).toBe('fallback');
    expect(result.reply).toEqual(expect.stringContaining('بعدني ما استوعبت السؤال'));
    expect(result.confidence).toBeLessThan(0.5);
  });

  test('acknowledges gratitude in Lebanese tone', async () => {
    const result = await getResponse('شكراً كتير على الإرشاد يا خبير');

    expect(result.intent).toBe('gratitude_ack');
    expect(result.reply).toEqual(expect.stringContaining('ولا يهمك'));
  });

  test('responds to goodbyes naturally', async () => {
    const result = await getResponse('يعطيك العافية، مع السلامة');

    expect(result.intent).toBe('gratitude_goodbye');
    expect(result.reply).toEqual(expect.stringContaining('شكرا إلك وإلى اللقاء'));
  });

  test('records intents in analytics stats', async () => {
    await getResponse('مرحبا');
    await getResponse('كيف أسقي النباتات؟');
    await getResponse('شكراً كتير!');

    const stats = getStats();
    expect(stats.greeting).toBe(1);
    expect(stats.watering_guidance).toBe(1);
    expect(stats.gratitude_ack).toBe(1);
  });
});
