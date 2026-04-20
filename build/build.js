#!/usr/bin/env node
/**
 * Palm Crest Roofing — Static Site Builder
 *
 * Generates:
 *   - services/<slug>.html  from build/services/<slug>.json
 *   - areas/<slug>/index.html from build/areas/<slug>.json
 *   - areas/index.html (directory page)
 *   - sitemap.xml
 *
 * Run: `node build/build.js` from the palmcrest/ folder (or with cwd=palmcrest).
 */

const fs = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..');
const OUT_SVC = path.join(ROOT, 'services');
const OUT_ARE = path.join(ROOT, 'areas');
const SVC_DIR = path.join(__dirname, 'services');
const ARE_DIR = path.join(__dirname, 'areas');

// ---------- shared partials ----------
const HEADER = (prefix = '') => `    <header class="header">
        <div class="header-top"><div class="container">
            <div class="header-promo">⚡ Free Roof Inspections — LA County-Wide</div>
            <div class="header-trust"><span>🛡️ CA Lic. #1109337</span><span>⭐ 5-Star Rated</span></div>
            <a href="tel:8182529422" class="phone-link">📞 818.252.9422</a>
        </div></div>
        <nav class="navbar"><div class="container">
            <a href="${prefix}index.html" class="logo-link"><img src="${prefix}images/logo.svg" alt="Palm Crest Roofing" width="220" height="42"></a>
            <button class="nav-toggle" aria-label="Toggle menu"><span></span><span></span><span></span></button>
            <ul class="nav-menu">
                <li><a href="${prefix}index.html">Home</a></li>
                <li><a href="${prefix}about.html">About</a></li>
                <li><a href="${prefix}index.html#services">Services</a></li>
                <li><a href="${prefix}areas/">Service Areas</a></li>
                <li><a href="${prefix}gallery.html">Gallery</a></li>
                <li><a href="${prefix}reviews.html">Reviews</a></li>
                <li><a href="${prefix}faqs.html">FAQs</a></li>
                <li><a href="${prefix}contact.html" class="btn btn-primary">Get Quote</a></li>
            </ul>
        </div></nav>
    </header>`;

const FOOTER = (prefix = '') => `    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand"><img src="${prefix}images/logo-white.svg" alt="Palm Crest Roofing"><p>Licensed Los Angeles County roofing contractor. CA Lic. #1109337.</p></div>
                <div class="footer-links"><h4>Services</h4><ul>
                    <li><a href="${prefix}services/residential-roofing.html">Residential Roofing</a></li>
                    <li><a href="${prefix}services/commercial-roofing.html">Commercial Roofing</a></li>
                    <li><a href="${prefix}services/roof-repair.html">Roof Repair</a></li>
                    <li><a href="${prefix}services/tile-roof.html">Tile Roofing</a></li>
                    <li><a href="${prefix}services/metal-roof.html">Metal Roofing</a></li>
                    <li><a href="${prefix}services/flat-roof.html">Flat Roofing</a></li>
                </ul></div>
                <div class="footer-links"><h4>Company</h4><ul>
                    <li><a href="${prefix}about.html">About</a></li>
                    <li><a href="${prefix}areas/">Service Areas</a></li>
                    <li><a href="${prefix}gallery.html">Gallery</a></li>
                    <li><a href="${prefix}reviews.html">Reviews</a></li>
                    <li><a href="${prefix}faqs.html">FAQs</a></li>
                    <li><a href="${prefix}contact.html">Contact</a></li>
                </ul></div>
                <div class="footer-contact"><h4>Contact</h4>
                    <p>📞 <a href="tel:8182529422">818.252.9422</a></p>
                    <p>📧 <a href="mailto:info@palmcrestroofing.com">info@palmcrestroofing.com</a></p>
                    <p>Serving all of Los Angeles County</p>
                    <p>CA Lic. #1109337</p>
                </div>
            </div>
            <div class="footer-bottom"><p>&copy; 2024 Palm Crest Roofing. All rights reserved.</p></div>
        </div>
    </footer>
    <script src="${prefix}js/main.js"></script>`;

const HEAD = ({ title, description, canonical, prefix = '' }) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="website">
    <link rel="icon" type="image/svg+xml" href="${prefix}images/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${prefix}css/styles.css">
</head>
<body>`;

// ---------- service page ----------
function buildServicePage(data) {
    const prefix = '../';
    const canonical = `https://palmcrestroofing.com/services/${data.slug}.html`;
    const benefits = (data.benefits || []).map(b => `                    <li>${b}</li>`).join('\n');
    const process  = (data.process  || []).map((p, i) => `                <h4 style="color:var(--secondary-color);margin-top:25px;">Step ${i+1}: ${p.title}</h4>\n                <p>${p.desc}</p>`).join('\n');
    const faqs     = (data.faqs || []).map(f => `                <div class="faq-item"><div class="faq-question">${f.q}</div><div class="faq-answer"><p>${f.a}</p></div></div>`).join('\n');

    return `${HEAD({
        title: `${data.h1} | Palm Crest Roofing | LA County`,
        description: data.metaDescription,
        canonical,
        prefix
    })}
${HEADER(prefix)}

    <section class="page-header">
        <div class="container">
            <h1>${data.h1}</h1>
            <p>${data.tagline}</p>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="service-content">
                <h2>${data.intro_h2}</h2>
                <p>${data.intro}</p>

                <h3>Key Benefits</h3>
                <ul class="service-list">
${benefits}
                </ul>

                <h3>Our Process</h3>
${process}

                ${data.body_extra ? `<h3>${data.body_extra.heading}</h3>\n                <p>${data.body_extra.text}</p>` : ''}

                <div class="service-cta">
                    <h3>Get a Free ${data.h1} Quote</h3>
                    <p>Call now or request an inspection online. Free estimates across LA County.</p>
                    <a href="tel:8182529422" class="btn btn-outline btn-lg">📞 818.252.9422</a>
                    <a href="${prefix}free-inspection.html" class="btn btn-primary btn-lg">Free Inspection</a>
                </div>
            </div>
        </div>
    </section>

    ${faqs ? `<section class="section section-gray">
        <div class="container">
            <h2 class="section-title">${data.h1} FAQs</h2>
            <div class="faq-list">
${faqs}
            </div>
        </div>
    </section>` : ''}

${FOOTER(prefix)}
</body>
</html>`;
}

// ---------- area / city page ----------
function buildAreaPage(data) {
    const prefix = '../../';
    const canonical = `https://palmcrestroofing.com/areas/${data.slug}/`;
    const neighborhoods = data.neighborhoods && data.neighborhoods.length
        ? `<div class="city-neighborhoods"><h3>Neighborhoods We Serve in ${data.city}</h3><p>${data.neighborhoods.join(' • ')}</p></div>`
        : '';
    const localNote = data.local_note
        ? `<p>${data.local_note}</p>`
        : `<div class="city-placeholder-note">Detailed neighborhood content for ${data.city} is being added. Call <a href="tel:8182529422" style="color:var(--primary-color);font-weight:700;">818.252.9422</a> for same-day information about roofing in your specific area.</p></div>`;

    const faqs = (data.faqs || []).map(f =>
        `                <div class="faq-item"><div class="faq-question">${f.q}</div><div class="faq-answer"><p>${f.a}</p></div></div>`
    ).join('\n');

    return `${HEAD({
        title: `${data.city} Roofing Contractor | Palm Crest Roofing | CA Lic. #1109337`,
        description: `Licensed roofing contractor serving ${data.city}, CA. Residential & commercial roof repair, replacement, tile, metal, flat/TPO. Free inspections. Call 818.252.9422.`,
        canonical,
        prefix
    })}
${HEADER(prefix)}

    <section class="city-hero">
        <div class="container">
            <h1>${data.city} Roofing Contractor</h1>
            <p class="city-subtitle">Licensed Roofing in ${data.city}, CA &nbsp;·&nbsp; CA Lic. #1109337</p>
            <div class="hero-buttons">
                <a href="tel:8182529422" class="btn btn-primary btn-lg">📞 818.252.9422</a>
                <a href="${prefix}free-inspection.html" class="btn btn-outline btn-lg">Free Inspection</a>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="city-intro">
                <p><strong>Palm Crest Roofing serves ${data.city} and the surrounding communities</strong> with licensed residential and commercial roofing — repairs, replacements, tile, metal, flat/TPO, SPF foam, skylights, and seamless gutters. Every project is installed by our own crews and backed by a workmanship warranty.</p>
                ${localNote}
            </div>

            ${neighborhoods}

            <h2 style="text-align:center;margin:60px 0 30px;color:var(--primary-color);">Roofing Services in ${data.city}</h2>
            <div class="services-grid">
                <a href="${prefix}services/residential-roofing.html" class="service-card"><div class="service-icon">🏠</div><h3>Residential Roofing</h3><p>Full re-roofs and new installs for ${data.city} homes.</p></a>
                <a href="${prefix}services/commercial-roofing.html" class="service-card"><div class="service-icon">🏢</div><h3>Commercial Roofing</h3><p>Offices, retail, and industrial buildings in ${data.city}.</p></a>
                <a href="${prefix}services/roof-repair.html" class="service-card"><div class="service-icon">🔧</div><h3>Roof Repair</h3><p>Leaks, storm damage, worn sections — fast response in ${data.city}.</p></a>
                <a href="${prefix}services/tile-roof.html" class="service-card"><div class="service-icon">🏛️</div><h3>Tile Roofing</h3><p>Clay and concrete tile installation and restoration.</p></a>
                <a href="${prefix}services/metal-roof.html" class="service-card"><div class="service-icon">⚙️</div><h3>Metal Roofing</h3><p>Standing-seam and panel systems.</p></a>
                <a href="${prefix}services/flat-roof.html" class="service-card"><div class="service-icon">📐</div><h3>Flat Roofing</h3><p>TPO, modified bitumen, built-up.</p></a>
                <a href="${prefix}services/skylights.html" class="service-card"><div class="service-icon">☀️</div><h3>Skylights</h3><p>Install and replacement.</p></a>
                <a href="${prefix}services/gutter-replacement.html" class="service-card"><div class="service-icon">💧</div><h3>Gutters</h3><p>Seamless aluminum.</p></a>
            </div>
        </div>
    </section>

    ${faqs ? `<section class="section section-gray">
        <div class="container">
            <h2 class="section-title">${data.city} Roofing FAQs</h2>
            <div class="faq-list">
${faqs}
            </div>
        </div>
    </section>` : ''}

    <section class="cta">
        <div class="container">
            <h2>Free Roof Inspection in ${data.city}</h2>
            <p>No pressure, no obligation — just an honest assessment.</p>
            <a href="tel:8182529422" class="btn btn-outline btn-lg">📞 818.252.9422</a>
            <a href="${prefix}free-inspection.html" class="btn btn-primary btn-lg">Request Online</a>
        </div>
    </section>

${FOOTER(prefix)}
</body>
</html>`;
}

// ---------- areas index ----------
function buildAreasIndex(areas) {
    const prefix = '../';
    const canonical = 'https://palmcrestroofing.com/areas/';

    const clusters = {
        'San Fernando Valley': [],
        'Santa Clarita Valley & North County': [],
        'San Gabriel Valley': [],
        'Westside & Beaches': [],
        'South Bay & Long Beach': [],
        'Southeast LA County': [],
    };
    for (const a of areas) {
        const c = a.cluster || 'Other';
        if (!clusters[c]) clusters[c] = [];
        clusters[c].push(a);
    }

    const sections = Object.keys(clusters)
        .filter(c => clusters[c].length > 0)
        .map(c => {
            const cards = clusters[c].map(a =>
                `                <a href="${a.slug}/" class="area-card"><h3>${a.city}</h3><p>${a.short_blurb || 'Licensed roofing services — free inspections.'}</p></a>`
            ).join('\n');
            return `            <h2 class="area-cluster-title">${c}</h2>
            <div class="areas-grid">
${cards}
            </div>`;
        }).join('\n\n');

    return `${HEAD({
        title: 'Service Areas | Palm Crest Roofing | Los Angeles County',
        description: 'Palm Crest Roofing service areas across Los Angeles County — licensed roofing contractor serving 20+ cities. CA Lic. #1109337.',
        canonical,
        prefix
    })}
${HEADER(prefix)}

    <section class="areas-hero">
        <div class="container">
            <h1>Service Areas</h1>
            <p>Licensed roofing across Los Angeles County — pick your city for local info and recent projects.</p>
        </div>
    </section>

    <section class="section">
        <div class="container">
${sections}
        </div>
    </section>

    <section class="cta">
        <div class="container">
            <h2>Don't See Your City?</h2>
            <p>We serve all of LA County — give us a call.</p>
            <a href="tel:8182529422" class="btn btn-outline btn-lg">📞 818.252.9422</a>
            <a href="${prefix}contact.html" class="btn btn-primary btn-lg">Contact Us</a>
        </div>
    </section>

${FOOTER(prefix)}
</body>
</html>`;
}

// ---------- sitemap ----------
function buildSitemap(serviceSlugs, areaSlugs) {
    const today = new Date().toISOString().slice(0, 10);
    const base = 'https://palmcrestroofing.com/';
    const urls = [
        '', 'about.html', 'contact.html', 'faqs.html', 'reviews.html',
        'gallery.html', 'free-inspection.html', 'areas/',
        ...serviceSlugs.map(s => `services/${s}.html`),
        ...areaSlugs.map(s => `areas/${s}/`),
    ];
    const entries = urls.map(u => `  <url><loc>${base}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

// ---------- utility ----------
function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeFile(p, content) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content, 'utf8');
    console.log('  ✓', path.relative(ROOT, p));
}

// ---------- main ----------
function main() {
    console.log('Building Palm Crest Roofing site...\n');

    // Services
    console.log('Services:');
    const serviceFiles = fs.readdirSync(SVC_DIR).filter(f => f.endsWith('.json')).sort();
    const serviceSlugs = [];
    for (const f of serviceFiles) {
        const data = readJson(path.join(SVC_DIR, f));
        serviceSlugs.push(data.slug);
        writeFile(path.join(OUT_SVC, `${data.slug}.html`), buildServicePage(data));
    }

    // Areas
    console.log('\nAreas:');
    const areaFiles = fs.readdirSync(ARE_DIR).filter(f => f.endsWith('.json')).sort();
    const areas = areaFiles.map(f => readJson(path.join(ARE_DIR, f)));
    const areaSlugs = [];
    for (const a of areas) {
        areaSlugs.push(a.slug);
        writeFile(path.join(OUT_ARE, a.slug, 'index.html'), buildAreaPage(a));
    }
    writeFile(path.join(OUT_ARE, 'index.html'), buildAreasIndex(areas));

    // Sitemap
    console.log('\nSitemap:');
    writeFile(path.join(ROOT, 'sitemap.xml'), buildSitemap(serviceSlugs, areaSlugs));

    console.log(`\nDone. ${serviceSlugs.length} services, ${areaSlugs.length} areas.`);
}

main();
