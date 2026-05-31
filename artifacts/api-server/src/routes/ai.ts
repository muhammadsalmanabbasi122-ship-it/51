import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function generateHtml(prompt: string): { html: string; title: string } {
  const p = prompt.toLowerCase();

  let title = "Custom Web Page";
  let primaryColor = "#6D28D9";
  let accentColor = "#0EA5E9";
  let bgColor = "#F5F3FF";
  let heroText = "Welcome to Our Website";
  let subText = "We provide amazing services for you.";
  let buttonText = "Get Started";
  let sections: string[] = [];
  let navItems = ["Home", "About", "Services", "Contact"];

  if (p.includes("bakery") || p.includes("bread") || p.includes("cake")) {
    title = "The Artisan Bakery";
    primaryColor = "#B45309";
    accentColor = "#F59E0B";
    bgColor = "#FFFBEB";
    heroText = "Fresh Baked with Love Every Day";
    subText = "Handcrafted breads, pastries, and cakes made from the finest ingredients.";
    buttonText = "Order Now";
    navItems = ["Menu", "About", "Gallery", "Contact"];
    sections = [
      `<section style="padding:60px 20px;background:#FEF3C7;text-align:center">
        <h2 style="font-size:2rem;color:#92400E;margin-bottom:16px">Our Specialties</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;max-width:900px;margin:0 auto">
          ${["Sourdough Bread","Croissants","Birthday Cakes","Macarons"].map(item => `
          <div style="background:white;border-radius:16px;padding:24px;box-shadow:0 4px 12px rgba(0,0,0,0.08)">
            <div style="font-size:3rem;margin-bottom:12px">🥐</div>
            <h3 style="color:#92400E;font-size:1.1rem">${item}</h3>
          </div>`).join("")}
        </div>
      </section>`,
    ];
  } else if (p.includes("restaurant") || p.includes("food") || p.includes("cafe")) {
    title = "Gourmet Kitchen";
    primaryColor = "#DC2626";
    accentColor = "#F97316";
    bgColor = "#FFF7ED";
    heroText = "Taste the Art of Fine Dining";
    subText = "Experience exceptional cuisine crafted from locally sourced ingredients.";
    buttonText = "Reserve a Table";
    navItems = ["Menu", "Reservations", "About", "Contact"];
    sections = [
      `<section style="padding:60px 20px;text-align:center;background:#FEF2F2">
        <h2 style="font-size:2rem;color:#991B1B;margin-bottom:30px">Today's Specials</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;max-width:900px;margin:0 auto">
          ${["Grilled Salmon $28","Truffle Pasta $22","Beef Wellington $45","Chocolate Lava $12"].map(item => `
          <div style="background:white;border-radius:16px;padding:24px;box-shadow:0 4px 12px rgba(0,0,0,0.1)">
            <p style="font-size:1.1rem;color:#DC2626;font-weight:600">${item}</p>
          </div>`).join("")}
        </div>
      </section>`,
    ];
  } else if (p.includes("portfolio") || p.includes("developer") || p.includes("designer") || p.includes("freelance")) {
    title = "My Portfolio";
    primaryColor = "#7C3AED";
    accentColor = "#06B6D4";
    bgColor = "#0F0F1A";
    heroText = "I Build Beautiful Digital Experiences";
    subText = "Full-stack developer & UI/UX designer based in the digital world.";
    buttonText = "View My Work";
    navItems = ["Projects", "Skills", "About", "Contact"];
    sections = [
      `<section style="padding:60px 20px;background:#1A1A2E;text-align:center">
        <h2 style="font-size:2rem;color:#A78BFA;margin-bottom:30px">Featured Projects</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;max-width:1000px;margin:0 auto">
          ${["E-Commerce App","SaaS Dashboard","Mobile App","Brand Identity"].map(item => `
          <div style="background:#16213E;border-radius:16px;padding:24px;border:1px solid #7C3AED30">
            <div style="height:120px;background:linear-gradient(135deg,#7C3AED,#06B6D4);border-radius:8px;margin-bottom:16px"></div>
            <h3 style="color:white;font-size:1rem">${item}</h3>
          </div>`).join("")}
        </div>
      </section>`,
    ];
  } else if (p.includes("gym") || p.includes("fitness") || p.includes("workout") || p.includes("health")) {
    title = "FitLife Studio";
    primaryColor = "#16A34A";
    accentColor = "#F97316";
    bgColor = "#F0FDF4";
    heroText = "Transform Your Body, Change Your Life";
    subText = "Join thousands of members achieving their fitness goals with our expert trainers.";
    buttonText = "Start Free Trial";
    navItems = ["Classes", "Trainers", "Pricing", "Contact"];
    sections = [
      `<section style="padding:60px 20px;text-align:center;background:#DCFCE7">
        <h2 style="font-size:2rem;color:#15803D;margin-bottom:30px">Our Classes</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;max-width:900px;margin:0 auto">
          ${["HIIT Training","Yoga Flow","CrossFit","Spin Cycling","Boxing","Pilates"].map(item => `
          <div style="background:white;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
            <p style="color:#16A34A;font-weight:700;font-size:1rem">${item}</p>
          </div>`).join("")}
        </div>
      </section>`,
    ];
  } else if (p.includes("shop") || p.includes("store") || p.includes("ecommerce") || p.includes("product")) {
    title = "ShopNow";
    primaryColor = "#2563EB";
    accentColor = "#F59E0B";
    bgColor = "#EFF6FF";
    heroText = "Discover Products You'll Love";
    subText = "Shop the latest trends with fast shipping and easy returns.";
    buttonText = "Shop Now";
    navItems = ["Products", "Sale", "About", "Cart"];
    sections = [
      `<section style="padding:60px 20px;text-align:center">
        <h2 style="font-size:2rem;color:#1D4ED8;margin-bottom:30px">Featured Products</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;max-width:1000px;margin:0 auto">
          ${["Premium Watch $199","Leather Bag $149","Sunglasses $89","Smart Watch $299"].map(item => `
          <div style="background:white;border-radius:16px;padding:20px;box-shadow:0 4px 16px rgba(0,0,0,0.1)">
            <div style="height:140px;background:#DBEAFE;border-radius:8px;margin-bottom:12px"></div>
            <p style="color:#1D4ED8;font-weight:600">${item}</p>
            <button style="margin-top:12px;background:#2563EB;color:white;border:none;padding:8px 20px;border-radius:8px;cursor:pointer">Add to Cart</button>
          </div>`).join("")}
        </div>
      </section>`,
    ];
  } else if (p.includes("hotel") || p.includes("travel") || p.includes("resort") || p.includes("booking")) {
    title = "Luxury Stays";
    primaryColor = "#0F766E";
    accentColor = "#F59E0B";
    bgColor = "#F0FDFA";
    heroText = "Your Perfect Getaway Awaits";
    subText = "Discover handpicked hotels and resorts for unforgettable experiences.";
    buttonText = "Book Now";
    navItems = ["Rooms", "Amenities", "Gallery", "Contact"];
  } else {
    title = prompt.length > 40 ? prompt.substring(0, 40) + "..." : (prompt || "My Website");
    sections = [
      `<section style="padding:60px 20px;text-align:center;background:#F3F4F6">
        <h2 style="font-size:2rem;color:#111827;margin-bottom:16px">About Us</h2>
        <p style="color:#6B7280;max-width:600px;margin:0 auto;line-height:1.7">We are dedicated to providing the best experience for our customers. Our team works hard to deliver quality and excellence in everything we do.</p>
      </section>`,
    ];
  }

  const isDark = primaryColor.startsWith("#0") || primaryColor.startsWith("#1") || primaryColor === "#7C3AED";
  const textOnPrimary = "white";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${bgColor}; color: #111827; }
    nav { background: ${primaryColor}; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 12px rgba(0,0,0,0.15); }
    .logo { color: ${textOnPrimary}; font-size: 1.4rem; font-weight: 700; letter-spacing: -0.5px; }
    .nav-links { display: flex; gap: 24px; list-style: none; }
    .nav-links a { color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.95rem; font-weight: 500; transition: color 0.2s; }
    .nav-links a:hover { color: white; }
    .hero { background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%); padding: 80px 24px; text-align: center; color: white; }
    .hero h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; margin-bottom: 20px; line-height: 1.1; letter-spacing: -1px; }
    .hero p { font-size: 1.15rem; opacity: 0.9; max-width: 600px; margin: 0 auto 32px; line-height: 1.6; }
    .btn { display: inline-block; background: white; color: ${primaryColor}; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 1rem; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
    .features { padding: 60px 24px; text-align: center; max-width: 1100px; margin: 0 auto; }
    .features h2 { font-size: 2rem; margin-bottom: 40px; color: #111827; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; }
    .feature-card { background: white; border-radius: 16px; padding: 32px 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); transition: transform 0.2s; }
    .feature-card:hover { transform: translateY(-4px); }
    .feature-icon { font-size: 2.5rem; margin-bottom: 16px; }
    .feature-card h3 { font-size: 1.1rem; margin-bottom: 10px; color: #111827; }
    .feature-card p { color: #6B7280; line-height: 1.6; font-size: 0.95rem; }
    footer { background: #111827; color: #9CA3AF; text-align: center; padding: 32px 24px; }
    footer span { color: ${accentColor}; }
    @media (max-width: 600px) { .nav-links { display: none; } .hero { padding: 60px 16px; } }
  </style>
</head>
<body>
  <nav>
    <div class="logo">${title}</div>
    <ul class="nav-links">
      ${navItems.map((item) => `<li><a href="#">${item}</a></li>`).join("")}
    </ul>
  </nav>

  <section class="hero">
    <h1>${heroText}</h1>
    <p>${subText}</p>
    <a href="#" class="btn">${buttonText}</a>
  </section>

  ${sections.join("\n")}

  <section class="features">
    <h2>Why Choose Us</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <h3>Fast & Reliable</h3>
        <p>Blazing fast performance with 99.9% uptime guarantee for all our services.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🛡️</div>
        <h3>Secure & Safe</h3>
        <p>Enterprise-grade security to protect your data at every step.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">💬</div>
        <h3>24/7 Support</h3>
        <p>Our dedicated team is always here to help you succeed.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🚀</div>
        <h3>Easy to Use</h3>
        <p>Simple, intuitive interface designed for everyone, no technical skills needed.</p>
      </div>
    </div>
  </section>

  <footer>
    <p>© 2025 <span>${title}</span>. All rights reserved. Built with HTML Creator.</p>
  </footer>
</body>
</html>`;

  return { html, title };
}

router.post("/ai/generate", (req: Request, res: Response) => {
  const { prompt } = req.body as { prompt?: string; username?: string };
  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }
  const result = generateHtml(prompt);
  res.json(result);
});

export default router;
