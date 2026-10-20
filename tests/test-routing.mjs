// tests/test-routing.mjs
import assert from "node:assert";

// Mock implementation of ReviewRoutingService logic for testing
function evaluateRouting(input, settings, currentMonthly34Count) {
  if (!settings.googleReviewsEnabled) {
    return { shouldOffer: false, reason: "disabled", requiresQuotaIncrement: false, createCaseRequired: input.rating <= 2 };
  }
  if (input.rating === 5) {
    if (settings.autoOffer5Stars) {
      return { shouldOffer: true, reason: "rating_5_always", requiresQuotaIncrement: false, createCaseRequired: false };
    }
    return { shouldOffer: false, reason: "disabled", requiresQuotaIncrement: false, createCaseRequired: false };
  }
  if (input.rating <= 2) {
    return { shouldOffer: false, reason: "negative_withheld", requiresQuotaIncrement: false, createCaseRequired: true };
  }
  const is3Star = input.rating === 3;
  const is4Star = input.rating === 4;
  const allowed = (is4Star && settings.considerPositive4Stars) || (is3Star && settings.considerPositive3Stars);
  if (!allowed) {
    return { shouldOffer: false, reason: "disabled", requiresQuotaIncrement: false, createCaseRequired: false };
  }
  const satisfiesSentiment = input.sentiment === settings.minSentimentRequired;
  const satisfiesScore = input.positiveScore >= settings.minPositiveScore;
  if (!satisfiesSentiment || !satisfiesScore) {
    return { shouldOffer: false, reason: "low_positive_score", requiresQuotaIncrement: false, createCaseRequired: false };
  }
  const maxQuota = settings.maxGoogleRouted34PerMonth ?? 2;
  if (currentMonthly34Count < maxQuota) {
    return { shouldOffer: true, reason: "positive_3_4_routed", requiresQuotaIncrement: true, createCaseRequired: false };
  }
  return { shouldOffer: false, reason: "quota_exceeded", requiresQuotaIncrement: false, createCaseRequired: false };
}

const defaultSettings = {
  googleReviewsEnabled: true,
  autoOffer5Stars: true,
  considerPositive4Stars: true,
  considerPositive3Stars: true,
  maxGoogleRouted34PerMonth: 2,
  minSentimentRequired: "POSITIVE",
  minPositiveScore: 75,
};

console.log("=== INICIANDO SUITE DE PRUEBAS DE REVIEWTROUTINGSERVICE ===");

// Test 1: 5 Estrellas
{
  const res = evaluateRouting({ rating: 5, sentiment: "POSITIVE", positiveScore: 95 }, defaultSettings, 0);
  assert.strictEqual(res.shouldOffer, true, "5★ debe ofrecer siempre Google Review");
  assert.strictEqual(res.reason, "rating_5_always");
  assert.strictEqual(res.requiresQuotaIncrement, false, "5★ no debe incrementar la cuota mensual de 3-4★");
  assert.strictEqual(res.createCaseRequired, false);
  console.log("✓ Test 1 superado: 5 Estrellas siempre ofrece Google y no consume cuota");
}

// Test 2: 4 Estrellas Positivas con cuota disponible (0/2)
{
  const res = evaluateRouting({ rating: 4, sentiment: "POSITIVE", positiveScore: 85 }, defaultSettings, 0);
  assert.strictEqual(res.shouldOffer, true, "4★ positiva debe ofrecer Google si hay cuota");
  assert.strictEqual(res.reason, "positive_3_4_routed");
  assert.strictEqual(res.requiresQuotaIncrement, true, "4★ positiva debe incrementar cuota");
  console.log("✓ Test 2 superado: 4 Estrellas positiva calificada y ofrecida bajo cuota");
}

// Test 3: 4 Estrellas Positivas pero cuota mensual agotada (2/2)
{
  const res = evaluateRouting({ rating: 4, sentiment: "POSITIVE", positiveScore: 88 }, defaultSettings, 2);
  assert.strictEqual(res.shouldOffer, false, "4★ positiva no debe ofrecer Google si la cuota mensual llegó a 2");
  assert.strictEqual(res.reason, "quota_exceeded");
  assert.strictEqual(res.requiresQuotaIncrement, false);
  console.log("✓ Test 3 superado: Cuota mensual compartida de 2/2 previene desbordamiento en 4★");
}

// Test 4: 3 Estrellas Positivas con cuota disponible (1/2)
{
  const res = evaluateRouting({ rating: 3, sentiment: "POSITIVE", positiveScore: 78 }, defaultSettings, 1);
  assert.strictEqual(res.shouldOffer, true, "3★ positiva con score >= 75 debe ofrecerse si cuota < 2");
  assert.strictEqual(res.reason, "positive_3_4_routed");
  assert.strictEqual(res.requiresQuotaIncrement, true);
  console.log("✓ Test 4 superado: 3 Estrellas positiva con score alto califica bajo cuota compartida");
}

// Test 5: 4 Estrellas con sentimiento NEUTRAL o bajo score
{
  const res = evaluateRouting({ rating: 4, sentiment: "NEUTRAL", positiveScore: 60 }, defaultSettings, 0);
  assert.strictEqual(res.shouldOffer, false, "4★ con sentimiento no POSITIVE debe ser rechazada");
  assert.strictEqual(res.reason, "low_positive_score");
  console.log("✓ Test 5 superado: Sentimiento NEUTRAL o score bajo es retenido internamente");
}

// Test 6: 1 y 2 Estrellas (Experiencias Negativas)
{
  const res1 = evaluateRouting({ rating: 1, sentiment: "NEGATIVE", positiveScore: 10 }, defaultSettings, 0);
  assert.strictEqual(res1.shouldOffer, false, "1★ nunca se envía a Google");
  assert.strictEqual(res1.reason, "negative_withheld");
  assert.strictEqual(res1.createCaseRequired, true, "1★ debe crear CASE automático");

  const res2 = evaluateRouting({ rating: 2, sentiment: "NEGATIVE", positiveScore: 20 }, defaultSettings, 0);
  assert.strictEqual(res2.shouldOffer, false, "2★ nunca se envía a Google");
  assert.strictEqual(res2.reason, "negative_withheld");
  assert.strictEqual(res2.createCaseRequired, true, "2★ debe crear CASE automático");
  console.log("✓ Test 6 superado: 1★ y 2★ son retenidas internamente y activan creación de CASE urgente");
}

console.log("=== TODAS LAS PRUEBAS UNITARIAS DE ENRUTAMIENTO PASARON CON ÉXITO ===");
