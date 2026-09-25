/**
 * Seeds the database with the same categories & products already live on
 * https://arbajkhan23.github.io/lumesite/ (from assets/js/products.js), plus
 * one initial super admin account, so the API matches the storefront on day one.
 *
 * Usage:
 *   npm run seed            — populate
 *   npm run seed:destroy    — wipe all seeded collections
 *
 * Image URLs point to the same picsum.photos placeholders the frontend already
 * uses. Replace with real Cloudinary uploads via the admin panel once ready —
 * uploading a new image for a product automatically appends to product.images.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');
const Category = require('../models/Category');
const Product = require('../models/Product');

const CATEGORIES = [
  { name: 'Lighting', description: 'Table lamps, floor lamps, pendants and wall lights.' },
  { name: 'Home Decor', description: 'Vases, wall hangings, sculptural objects.' },
  { name: 'Fragrance', description: 'Candles and reed diffusers.' },
  { name: 'Accessories', description: 'Throws, trays, baskets and small objects.' },
  { name: 'Tableware', description: 'Bowls, coasters and glassware.' },
  { name: 'Furniture', description: 'Accent chairs and small furniture pieces.' },
];

// [name, categoryName, price, oldPrice, rating, reviews, imgSeed, tag, stock, desc, features]
const PRODUCTS = [
  ['Aalto Table Lamp', 'Lighting', 128, 160, 4.5, 212, 'lume-p1', 'sale', 24,
    'A soft, sculptural table lamp with a hand-finished ceramic base and a linen shade that diffuses light into a warm, even glow.',
    ['Hand-finished ceramic base', 'Natural linen shade', 'Warm 2700K dimmable bulb included', 'Height: 46cm']],
  ['Terra Ceramic Vase', 'Home Decor', 64, null, 5, 98, 'lume-p2', null, 40,
    'Thrown in small batches, the Terra vase has a matte, sand-textured glaze that catches light differently through the day.',
    ['Stoneware, matte glaze', 'Watertight interior', 'Diameter: 18cm, Height: 24cm', 'Hand wash only']],
  ['Linen Weave Throw', 'Accessories', 52, 68, 4, 64, 'lume-p3', 'sale', 18,
    'A mid-weight linen-cotton throw, woven with a subtle textured stripe.',
    ['55% linen / 45% cotton', '130 x 180cm', 'Machine washable, cold', 'Pre-shrunk']],
  ['Amber Glass Candle', 'Fragrance', 38, null, 4.5, 150, 'lume-p4', 'new', 60,
    'Amber, cedarwood and a trace of black pepper — poured into a reusable smoked-glass vessel with a 45-hour burn time.',
    ['Soy-coconut wax blend', '45-hour burn time', 'Reusable glass vessel', 'Hand-poured in small batches']],
  ['Oslo Floor Lamp', 'Lighting', 214, 260, 5, 76, 'lume-p5', 'sale', 12,
    'An arched floor lamp in brushed brass with a hand-stitched shade.',
    ['Brushed brass finish', 'Adjustable arc arm', 'Foot pedal switch', 'Height: 168cm']],
  ['Stoneware Bowl Set', 'Tableware', 46, null, 4.5, 41, 'lume-p6', null, 30,
    'A set of four stoneware bowls in a soft speckled glaze.',
    ['Set of 4', 'Dishwasher & microwave safe', 'Diameter: 15cm each', 'Chip-resistant stoneware']],
  ['Woven Wall Hanging', 'Home Decor', 72, null, 4, 33, 'lume-p7', 'new', 15,
    'Hand-woven on a floor loom using undyed cotton and jute.',
    ['100% cotton & jute', 'Hand-woven', 'Width: 60cm, Drop: 90cm', 'Includes wooden dowel']],
  ['Brass Bookend Pair', 'Accessories', 58, 74, 4.5, 88, 'lume-p8', 'sale', 22,
    'Solid brass bookends with a raw, unlacquered finish that will slowly patina with handling.',
    ['Solid brass, unlacquered', 'Weighted felt base', 'Sold as a pair', 'Will patina naturally over time']],
  ['Nordic Pendant Light', 'Lighting', 184, null, 5, 12, 'lume-n1', 'new', 10,
    'A single-bulb pendant in spun aluminum with a matte cream finish.',
    ['Spun aluminum shade', 'Adjustable cord: up to 150cm', 'E27 fitting', 'Matte cream finish']],
  ['Sage Ceramic Planter', 'Home Decor', 34, null, 4.5, 9, 'lume-n2', 'new', 28,
    'A textured ceramic planter with a built-in drainage saucer.',
    ['Includes drainage saucer', 'Diameter: 20cm', 'Frost-resistant stoneware', 'Indoor or covered outdoor use']],
  ['Cedar & Moss Candle', 'Fragrance', 42, null, 4.5, 6, 'lume-n3', 'new', 45,
    'A grounding, forest-floor scent — cedar, moss and a whisper of vetiver.',
    ['Soy wax blend', '40-hour burn time', 'Reusable stoneware vessel', 'Phthalate-free fragrance oils']],
  ['Woven Storage Basket', 'Accessories', 56, null, 4, 14, 'lume-n4', 'new', 20,
    'A generously sized seagrass basket with sturdy handles.',
    ['Natural seagrass', 'Reinforced handles', '40 x 30 x 28cm', 'Spot clean only']],
  ['Marble Coaster Set', 'Tableware', 29, null, 5, 5, 'lume-n5', 'new', 35,
    'Honed marble coasters with a soft cork backing, set of four.',
    ['Set of 4, honed marble', 'Cork backing', '10cm diameter', 'Wipe clean']],
  ['Rattan Accent Chair', 'Furniture', 312, null, 4.5, 8, 'lume-n6', 'new', 6,
    'A low-slung accent chair with a hand-woven rattan back and a removable linen seat cushion.',
    ['Solid oak frame', 'Hand-woven natural rattan', 'Removable linen cushion', 'Weight limit: 120kg']],
  ['Halo Arc Floor Lamp', 'Lighting', 198, 245, 5, 120, 'lume-t1', 'sale', 9,
    'A statement arc floor lamp with a marble base and opal glass shade.',
    ['Marble base', 'Opal glass shade', 'Dimmable', 'Height: 175cm']],
  ['Clay Fruit Bowl', 'Home Decor', 44, null, 4.5, 56, 'lume-t2', null, 25,
    'An oversized fruit bowl thrown in raw stoneware clay.',
    ['Raw stoneware, glazed interior', 'Diameter: 32cm', 'Hand wash recommended', 'Made in small batches']],
  ['Sandalwood Diffuser', 'Fragrance', 36, null, 4.5, 83, 'lume-t3', 'new', 50,
    'Sandalwood and warm amber in an alcohol-free base, with natural rattan reeds.',
    ['200ml, alcohol-free base', 'Natural rattan reeds', 'Lasts 8–10 weeks', 'Reusable glass bottle']],
  ['Leather Catch-All Tray', 'Accessories', 48, 60, 4, 39, 'lume-t4', 'sale', 17,
    'Full-grain leather tray for keys, coins and everyday carry.',
    ['Full-grain leather', 'Molded, structured base', '22 x 16cm', 'Ages and patinas over time']],
  ['Mini Dome Table Lamp', 'Lighting', 96, null, 4.5, 71, 'lume-t5', null, 0,
    'A compact dome lamp in brushed steel, sized for a nightstand or console.',
    ['Brushed steel finish', 'Touch dimmer switch', 'Height: 24cm', 'E14 fitting, bulb included']],
  ['Textured Linen Cushion', 'Home Decor', 32, 40, 4, 47, 'lume-t6', 'sale', 33,
    'A heavyweight linen cushion cover with a subtle basket-weave texture.',
    ['100% heavyweight linen', 'Concealed zip', '45 x 45cm, insert not included', 'Machine washable']],
  ['Rose & Oud Candle', 'Fragrance', 40, null, 5, 64, 'lume-t7', null, 38,
    'A warm, resinous oud grounded with dried rose petals.',
    ['Soy-coconut wax blend', '42-hour burn time', 'Hand-thrown ceramic vessel', 'Reusable once emptied']],
  ['Woven Key Tray', 'Accessories', 26, null, 4, 22, 'lume-t8', 'new', 42,
    'A small woven-rattan tray for keys and everyday drop-zone items.',
    ['Natural rattan weave', '18 x 12cm', 'Lightweight, easy to relocate', 'Spot clean only']],
  ['Oat Bouclé Armchair', 'Furniture', 428, 499, 4.5, 19, 'lume-t9', 'sale', 4,
    'A rounded, low-arm accent chair upholstered in oat-toned bouclé over a solid beech frame.',
    ['Solid beech frame', 'Bouclé upholstery', 'Seat height: 42cm', 'Removable seat cushion']],
  ['Fluted Glass Tumblers', 'Tableware', 34, null, 4.5, 27, 'lume-t10', null, 29,
    'Set of six fluted glass tumblers with a slightly irregular, hand-finished rim.',
    ['Set of 6', 'Hand-finished rims', '300ml capacity each', 'Dishwasher safe']],
];

const seed = async () => {
  await connectDB();

  if (process.argv.includes('--destroy')) {
    await Promise.all([Category.deleteMany(), Product.deleteMany()]);
    console.log('[Seed] All categories & products removed.');
    process.exit(0);
  }

  // Categories
  const categoryMap = {};
  for (const c of CATEGORIES) {
    const existing = await Category.findOne({ name: c.name });
    const doc = existing || (await Category.create(c));
    categoryMap[c.name] = doc._id;
  }
  console.log(`[Seed] ${CATEGORIES.length} categories ready.`);

  // Products
  let created = 0;
  for (const [name, catName, price, oldPrice, rating, reviews, imgSeed, tag, stock, description, features] of PRODUCTS) {
    const exists = await Product.findOne({ name });
    if (exists) continue;
    await Product.create({
      name,
      category: categoryMap[catName],
      price,
      oldPrice,
      rating,
      numReviews: reviews,
      tag,
      stock,
      description,
      features,
      images: [{ url: `https://picsum.photos/seed/${imgSeed}/700/860`, publicId: `seed-${imgSeed}` }],
      isFeatured: created < 8,
      isTrending: created >= 14 && created < 22,
    });
    created += 1;
  }
  console.log(`[Seed] ${created} products created.`);

  // Super admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@lume-studio.com';
  const adminExists = await Admin.findOne({ email: adminEmail });
  if (!adminExists) {
    await Admin.create({
      name: process.env.SEED_ADMIN_NAME || 'Admin',
      email: adminEmail,
      password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'superadmin',
    });
    console.log(`[Seed] Super admin created — email: ${adminEmail}`);
  } else {
    console.log('[Seed] Super admin already exists, skipped.');
  }

  console.log('[Seed] Done.');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
