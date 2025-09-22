const { getResponse, normalizeInput } = require('../src/services/chatbotService');

describe('chatbotService', () => {
  test('يوفر مواعيد زراعة دقيقة عند ذكر محصول معروف', () => {
    const result = getResponse('ما هي مواعيد زراعة القمح؟');

    expect(result.intent).toBe('planting_schedule');
    expect(result.reply).toMatch(/القمح/);
    expect(result.reply).toMatch(/نصيحة إضافية/);
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  test('يزود المستخدم بروابط عربية موثوقة عند طلب مصادر', () => {
    const result = getResponse('هل توجد مصادر أو روابط عن الري بالتنقيط؟');

    expect(result.intent).toBe('resources');
    expect(result.reply).toMatch(/https:\/\//);
    expect(result.reply.split('\n')).toHaveLength(4); // السطر الافتتاحي + 3 روابط
  });

  test('يعيد استجابة افتراضية عند الأسئلة غير المعروفة', () => {
    const result = getResponse('أريد معلومات عن السفر إلى المريخ.');

    expect(result.intent).toBe('fallback');
    expect(result.reply).toMatch(/لم أفهم سؤالك/);
    expect(result.confidence).toBeLessThan(0.5);
  });

  test('يطبع النص العربي للتعامل مع التشكيل والرموز', () => {
    const normalized = normalizeInput('مَا هِيَ أَفْضَلُ طُرُقِ الرَّيِّ بِالتَّنْقِيطِ؟');
    expect(normalized).toBe('ما هي افضل طرق الري بالتنقيط');

    const result = getResponse('مَا هِيَ أَفْضَلُ طُرُقِ الرَّيِّ بِالتَّنْقِيطِ؟');
    expect(result.intent).toBe('irrigation_best_practices');
    expect(result.reply).toMatch(/الصيانة الدورية/);
  });
});
