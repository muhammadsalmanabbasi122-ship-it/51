import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

async function generateWithKimi(prompt: string): Promise<{ html: string; title: string }> {
  const apiKey = process.env["OPENROUTER_API_KEY"];
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  const systemPrompt = `You are an expert HTML/CSS developer. When given a description, you generate a single complete, beautiful, modern HTML file.

Rules:
- Return ONLY valid HTML code — no markdown, no explanation, no code fences
- Include all CSS inline in a <style> tag inside <head>
- Use modern design: clean fonts (Google Fonts via CDN), gradients, shadows, rounded corners
- Make it fully responsive with mobile-friendly layout
- Include realistic placeholder content (names, descriptions, prices etc.)
- The page must look professional and production-ready`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 50000);

  let res: Response;
  try {
    res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://htmlcreator.app",
        "X-Title": "HTML Creator",
      },
      body: JSON.stringify({
        model: "moonshotai/kimi-k2",
        max_tokens: 8192,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a complete HTML webpage for: ${prompt}` },
        ],
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };

  const raw = data.choices[0]?.message?.content ?? "";

  const cleaned = raw
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const titleMatch = cleaned.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : prompt.slice(0, 40);

  return { html: cleaned, title };
}

function generateFallback(prompt: string): { html: string; title: string } {
  const p = prompt.toLowerCase();
  let title = prompt.length > 40 ? prompt.substring(0, 40) + "..." : prompt || "My Website";
  let primaryColor = "#6D28D9";
  let accentColor = "#0EA5E9";
  let heroText = prompt;
  let subText = "Powered by HTML Creator";

  if (p.includes("bakery") || p.includes("bread") || p.includes("cake")) {
    title = "The Artisan Bakery"; primaryColor = "#B45309"; accentColor = "#F59E0B";
    heroText = "Fresh Baked with Love Every Day";
    subText = "Handcrafted breads, pastries, and cakes from the finest ingredients.";
  } else if (p.includes("restaurant") || p.includes("food") || p.includes("cafe")) {
    title = "Gourmet Kitchen"; primaryColor = "#DC2626"; accentColor = "#F97316";
    heroText = "Taste the Art of Fine Dining";
    subText = "Exceptional cuisine crafted from locally sourced ingredients.";
  } else if (p.includes("portfolio") || p.includes("developer") || p.includes("designer")) {
    title = "My Portfolio"; primaryColor = "#7C3AED"; accentColor = "#06B6D4";
    heroText = "I Build Beautiful Digital Experiences";
    subText = "Full-stack developer & UI/UX designer.";
  } else if (p.includes("gym") || p.includes("fitness") || p.includes("workout")) {
    title = "FitLife Studio"; primaryColor = "#16A34A"; accentColor = "#F97316";
    heroText = "Transform Your Body, Change Your Life";
    subText = "Expert trainers helping you achieve your fitness goals.";
  } else if (p.includes("shop") || p.includes("store") || p.includes("ecommerce")) {
    title = "ShopNow"; primaryColor = "#2563EB"; accentColor = "#F59E0B";
    heroText = "Discover Products You'll Love";
    subText = "Shop the latest trends with fast shipping.";
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:#F9FAFB}
    nav{background:${primaryColor};padding:16px 32px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:100}
    .logo{color:white;font-size:1.4rem;font-weight:800}
    .nav-links{display:flex;gap:24px;list-style:none}
    .nav-links a{color:rgba(255,255,255,0.85);text-decoration:none;font-weight:500;transition:.2s}
    .nav-links a:hover{color:white}
    .hero{background:linear-gradient(135deg,${primaryColor},${accentColor});padding:100px 32px;text-align:center;color:white}
    .hero h1{font-size:clamp(2rem,5vw,3.5rem);font-weight:800;margin-bottom:20px;line-height:1.1}
    .hero p{font-size:1.15rem;opacity:.9;max-width:600px;margin:0 auto 36px;line-height:1.7}
    .btn{display:inline-block;background:white;color:${primaryColor};padding:14px 36px;border-radius:50px;font-weight:700;font-size:1rem;text-decoration:none;box-shadow:0 4px 20px rgba(0,0,0,.2);transition:.2s}
    .btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.25)}
    .features{padding:80px 32px;max-width:1100px;margin:0 auto;text-align:center}
    .features h2{font-size:2rem;font-weight:800;margin-bottom:48px;color:#111827}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:28px}
    .card{background:white;border-radius:20px;padding:36px 24px;box-shadow:0 4px 20px rgba(0,0,0,.07);transition:.2s}
    .card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.12)}
    .icon{font-size:2.5rem;margin-bottom:16px}
    .card h3{font-size:1.1rem;font-weight:700;margin-bottom:10px;color:#111827}
    .card p{color:#6B7280;line-height:1.6;font-size:.95rem}
    footer{background:#111827;color:#9CA3AF;text-align:center;padding:40px 32px}
    footer span{color:${accentColor};font-weight:600}
    @media(max-width:600px){.nav-links{display:none}.hero{padding:70px 16px}}
  </style>
</head>
<body>
  <nav>
    <div class="logo">${title}</div>
    <ul class="nav-links"><li><a href="#">Home</a></li><li><a href="#">About</a></li><li><a href="#">Services</a></li><li><a href="#">Contact</a></li></ul>
  </nav>
  <section class="hero">
    <h1>${heroText}</h1>
    <p>${subText}</p>
    <a href="#" class="btn">Get Started</a>
  </section>
  <section class="features">
    <h2>Why Choose Us</h2>
    <div class="grid">
      <div class="card"><div class="icon">⚡</div><h3>Fast & Reliable</h3><p>Blazing fast performance with 99.9% uptime guarantee.</p></div>
      <div class="card"><div class="icon">🛡️</div><h3>Secure & Safe</h3><p>Enterprise-grade security protecting your data at every step.</p></div>
      <div class="card"><div class="icon">💬</div><h3>24/7 Support</h3><p>Our dedicated team is always here to help you succeed.</p></div>
      <div class="card"><div class="icon">🚀</div><h3>Easy to Use</h3><p>Simple interface designed for everyone, no technical skills needed.</p></div>
    </div>
  </section>
  <footer><p>© 2025 <span>${title}</span>. Built with HTML Creator.</p></footer>
</body>
</html>`;

  return { html, title };
}

router.post("/ai/generate", async (req: Request, res: Response) => {
  const { prompt } = req.body as { prompt?: string; username?: string };
  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  try {
    const result = await generateWithKimi(prompt);
    res.json(result);
  } catch (err) {
    req.log.warn({ err }, "Kimi failed, falling back to template generator");
    const result = generateFallback(prompt);
    res.json(result);
  }
});

export default router;
