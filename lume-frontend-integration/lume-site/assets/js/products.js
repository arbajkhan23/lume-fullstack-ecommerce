/* ==========================================================================
   LUMÉ — Shared product & category data
   Single source of truth used by index, shop, product-details, cart, wishlist.
   ========================================================================== */

let CATEGORIES = [
  {
    slug: "lighting",
    name: "Lighting",
    count: "0 items",
    img: "",
    image: "",
  },
];

function catLabel(slug) {
  const c = CATEGORIES.find((c) => String(c.slug) === String(slug));

  return c ? c.name : slug;
}

/* =========================================
   LOAD CATEGORIES FROM BACKEND
========================================= */

async function loadRemoteCategories() {
  try {
    const response = await fetch("https://lume-backend-oz8t.onrender.com/api/categories");

    if (!response.ok) {
      throw new Error(`Categories request failed: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error("Invalid categories response");
    }

    CATEGORIES = result.data.map((category) => ({
      slug: category.slug,
      name: category.name,

      count: `${category.productCount || 0} items`,

      img: category.image?.url || "",

      image: category.image?.url || "",

      productCount: category.productCount || 0,

      isActive: category.isActive !== false,

      sortOrder: Number(category.sortOrder) || 0,
    }));

    console.log("[LUMÉ] Categories loaded:", CATEGORIES);

    /*
     * Tell index.html that remote categories
     * are ready.
     */
    document.dispatchEvent(new CustomEvent("lume:categoriesReady"));
  } catch (error) {
    console.error("[LUMÉ] Category loading failed:", error);
  }
}

/*
 * Load backend categories.
 */
loadRemoteCategories();
function catLabel(slug) {
  const c = CATEGORIES.find((c) => c.slug === slug);
  return c ? c.name : slug;
}

/* Each product: id, name, cat (slug), price, old (or null), rating, reviews,
   img (seed for picsum), tag ('new' | 'sale' | null), stock (bool), desc, features[] */
const PRODUCTS = [
  {
    id: 1,
    name: "Aalto Table Lamp",
    cat: "lighting",
    price: 128,
    old: 160,
    rating: 4.5,
    reviews: 212,
    img: "lume-p1",
    tag: "sale",
    stock: true,
    desc: "A soft, sculptural table lamp with a hand-finished ceramic base and a linen shade that diffuses light into a warm, even glow — built to anchor a reading corner or bedside table.",
    features: [
      "Hand-finished ceramic base",
      "Natural linen shade",
      "Warm 2700K dimmable bulb included",
      "Height: 46cm",
    ],
  },
  {
    id: 2,
    name: "Terra Ceramic Vase",
    cat: "decor",
    price: 64,
    old: null,
    rating: 5,
    reviews: 98,
    img: "lume-p2",
    tag: null,
    stock: true,
    desc: "Thrown in small batches, the Terra vase has a matte, sand-textured glaze that catches light differently through the day. Equally striking empty or filled.",
    features: [
      "Stoneware, matte glaze",
      "Watertight interior",
      "Diameter: 18cm, Height: 24cm",
      "Hand wash only",
    ],
  },
  {
    id: 3,
    name: "Linen Weave Throw",
    cat: "accessories",
    price: 52,
    old: 68,
    rating: 4,
    reviews: 64,
    img: "lume-p3",
    tag: "sale",
    stock: true,
    desc: "A mid-weight linen-cotton throw, woven with a subtle textured stripe. Softens with every wash and layers well over a sofa arm or bed end.",
    features: [
      "55% linen / 45% cotton",
      "130 x 180cm",
      "Machine washable, cold",
      "Pre-shrunk",
    ],
  },
  {
    id: 4,
    name: "Amber Glass Candle",
    cat: "fragrance",
    price: 38,
    old: null,
    rating: 4.5,
    reviews: 150,
    img: "lume-p4",
    tag: "new",
    stock: true,
    desc: "Amber, cedarwood and a trace of black pepper — poured into a reusable smoked-glass vessel with an 45-hour burn time.",
    features: [
      "Soy-coconut wax blend",
      "45-hour burn time",
      "Reusable glass vessel",
      "Hand-poured in small batches",
    ],
  },
  {
    id: 5,
    name: "Oslo Floor Lamp",
    cat: "lighting",
    price: 214,
    old: 260,
    rating: 5,
    reviews: 76,
    img: "lume-p5",
    tag: "sale",
    stock: true,
    desc: "An arched floor lamp in brushed brass with a hand-stitched shade — engineered to lean gently over a sofa or reading chair without a side table in the way.",
    features: [
      "Brushed brass finish",
      "Adjustable arc arm",
      "Foot pedal switch",
      "Height: 168cm",
    ],
  },
  {
    id: 6,
    name: "Stoneware Bowl Set",
    cat: "tableware",
    price: 46,
    old: null,
    rating: 4.5,
    reviews: 41,
    img: "lume-p6",
    tag: null,
    stock: true,
    desc: "A set of four stoneware bowls in a soft speckled glaze — stackable, dishwasher-safe, and equally at home for cereal or a dinner starter.",
    features: [
      "Set of 4",
      "Dishwasher & microwave safe",
      "Diameter: 15cm each",
      "Chip-resistant stoneware",
    ],
  },
  {
    id: 7,
    name: "Woven Wall Hanging",
    cat: "decor",
    price: 72,
    old: null,
    rating: 4,
    reviews: 33,
    img: "lume-p7",
    tag: "new",
    stock: true,
    desc: "Hand-woven on a floor loom using undyed cotton and jute, this wall hanging adds texture to a blank wall without competing with the rest of a room.",
    features: [
      "100% cotton & jute",
      "Hand-woven",
      "Width: 60cm, Drop: 90cm",
      "Includes wooden dowel",
    ],
  },
  {
    id: 8,
    name: "Brass Bookend Pair",
    cat: "accessories",
    price: 58,
    old: 74,
    rating: 4.5,
    reviews: 88,
    img: "lume-p8",
    tag: "sale",
    stock: true,
    desc: "Solid brass bookends with a raw, unlacquered finish that will slowly patina with handling — a quiet, functional object for a desk or shelf.",
    features: [
      "Solid brass, unlacquered",
      "Weighted felt base",
      "Sold as a pair",
      "Will patina naturally over time",
    ],
  },
  {
    id: 9,
    name: "Nordic Pendant Light",
    cat: "lighting",
    price: 184,
    old: null,
    rating: 5,
    reviews: 12,
    img: "lume-n1",
    tag: "new",
    stock: true,
    desc: "A single-bulb pendant in spun aluminum with a matte cream finish — simple enough for a kitchen island, considered enough for a dining table.",
    features: [
      "Spun aluminum shade",
      "Adjustable cord: up to 150cm",
      "E27 fitting",
      "Matte cream finish",
    ],
  },
  {
    id: 10,
    name: "Sage Ceramic Planter",
    cat: "decor",
    price: 34,
    old: null,
    rating: 4.5,
    reviews: 9,
    img: "lume-n2",
    tag: "new",
    stock: true,
    desc: "A textured ceramic planter with a built-in drainage saucer, sized for a mid-size fiddle leaf or snake plant.",
    features: [
      "Includes drainage saucer",
      "Diameter: 20cm",
      "Frost-resistant stoneware",
      "Indoor or covered outdoor use",
    ],
  },
  {
    id: 11,
    name: "Cedar & Moss Candle",
    cat: "fragrance",
    price: 42,
    old: null,
    rating: 4.5,
    reviews: 6,
    img: "lume-n3",
    tag: "new",
    stock: true,
    desc: "A grounding, forest-floor scent — cedar, moss and a whisper of vetiver in a matte stoneware vessel that doubles as a planter once emptied.",
    features: [
      "Soy wax blend",
      "40-hour burn time",
      "Reusable stoneware vessel",
      "Phthalate-free fragrance oils",
    ],
  },
  {
    id: 12,
    name: "Woven Storage Basket",
    cat: "accessories",
    price: 56,
    old: null,
    rating: 4,
    reviews: 14,
    img: "lume-n4",
    tag: "new",
    stock: true,
    desc: "A generously sized seagrass basket with sturdy handles — for throws, toys, or the everyday clutter that needs a home.",
    features: [
      "Natural seagrass",
      "Reinforced handles",
      "40 x 30 x 28cm",
      "Spot clean only",
    ],
  },
  {
    id: 13,
    name: "Marble Coaster Set",
    cat: "tableware",
    price: 29,
    old: null,
    rating: 5,
    reviews: 5,
    img: "lume-n5",
    tag: "new",
    stock: true,
    desc: "Honed marble coasters with a soft cork backing, set of four — each one naturally unique in veining.",
    features: [
      "Set of 4, honed marble",
      "Cork backing",
      "10cm diameter",
      "Wipe clean",
    ],
  },
  {
    id: 14,
    name: "Rattan Accent Chair",
    cat: "furniture",
    price: 312,
    old: null,
    rating: 4.5,
    reviews: 8,
    img: "lume-n6",
    tag: "new",
    stock: true,
    desc: "A low-slung accent chair with a hand-woven rattan back and a removable linen seat cushion — light enough to move room to room.",
    features: [
      "Solid oak frame",
      "Hand-woven natural rattan",
      "Removable linen cushion",
      "Weight limit: 120kg",
    ],
  },
  {
    id: 15,
    name: "Halo Arc Floor Lamp",
    cat: "lighting",
    price: 198,
    old: 245,
    rating: 5,
    reviews: 120,
    img: "lume-t1",
    tag: "sale",
    stock: true,
    desc: "A statement arc floor lamp with a marble base and opal glass shade — soft, directional light for a living room corner.",
    features: ["Marble base", "Opal glass shade", "Dimmable", "Height: 175cm"],
  },
  {
    id: 16,
    name: "Clay Fruit Bowl",
    cat: "decor",
    price: 44,
    old: null,
    rating: 4.5,
    reviews: 56,
    img: "lume-t2",
    tag: null,
    stock: true,
    desc: "An oversized fruit bowl thrown in raw stoneware clay, left unglazed on the exterior for a warm, tactile finish.",
    features: [
      "Raw stoneware, glazed interior",
      "Diameter: 32cm",
      "Hand wash recommended",
      "Made in small batches",
    ],
  },
  {
    id: 17,
    name: "Sandalwood Diffuser",
    cat: "fragrance",
    price: 36,
    old: null,
    rating: 4.5,
    reviews: 83,
    img: "lume-t3",
    tag: "new",
    stock: true,
    desc: "Sandalwood and warm amber in an alcohol-free base, with natural rattan reeds for slow, consistent diffusion.",
    features: [
      "200ml, alcohol-free base",
      "Natural rattan reeds",
      "Lasts 8–10 weeks",
      "Reusable glass bottle",
    ],
  },
  {
    id: 18,
    name: "Leather Catch-All Tray",
    cat: "accessories",
    price: 48,
    old: 60,
    rating: 4,
    reviews: 39,
    img: "lume-t4",
    tag: "sale",
    stock: true,
    desc: "Full-grain leather tray for keys, coins and everyday carry — develops a rich patina with use.",
    features: [
      "Full-grain leather",
      "Molded, structured base",
      "22 x 16cm",
      "Ages and patinas over time",
    ],
  },
  {
    id: 19,
    name: "Mini Dome Table Lamp",
    cat: "lighting",
    price: 96,
    old: null,
    rating: 4.5,
    reviews: 71,
    img: "lume-t5",
    tag: null,
    stock: false,
    desc: "A compact dome lamp in brushed steel, sized for a nightstand or console where a full lamp would feel too heavy.",
    features: [
      "Brushed steel finish",
      "Touch dimmer switch",
      "Height: 24cm",
      "E14 fitting, bulb included",
    ],
  },
  {
    id: 20,
    name: "Textured Linen Cushion",
    cat: "decor",
    price: 32,
    old: 40,
    rating: 4,
    reviews: 47,
    img: "lume-t6",
    tag: "sale",
    stock: true,
    desc: "A heavyweight linen cushion cover with a subtle basket-weave texture and a concealed zip closure.",
    features: [
      "100% heavyweight linen",
      "Concealed zip",
      "45 x 45cm, insert not included",
      "Machine washable",
    ],
  },
  {
    id: 21,
    name: "Rose & Oud Candle",
    cat: "fragrance",
    price: 40,
    old: null,
    rating: 5,
    reviews: 64,
    img: "lume-t7",
    tag: null,
    stock: true,
    desc: "A warm, resinous oud grounded with dried rose petals — poured into a hand-thrown ceramic vessel.",
    features: [
      "Soy-coconut wax blend",
      "42-hour burn time",
      "Hand-thrown ceramic vessel",
      "Reusable once emptied",
    ],
  },
  {
    id: 22,
    name: "Woven Key Tray",
    cat: "accessories",
    price: 26,
    old: null,
    rating: 4,
    reviews: 22,
    img: "lume-t8",
    tag: "new",
    stock: true,
    desc: "A small woven-rattan tray for keys and everyday drop-zone items, sized to sit neatly on an entryway console.",
    features: [
      "Natural rattan weave",
      "18 x 12cm",
      "Lightweight, easy to relocate",
      "Spot clean only",
    ],
  },
  {
    id: 23,
    name: "Oat Bouclé Armchair",
    cat: "furniture",
    price: 428,
    old: 499,
    rating: 4.5,
    reviews: 19,
    img: "lume-t9",
    tag: "sale",
    stock: true,
    desc: "A rounded, low-arm accent chair upholstered in oat-toned bouclé over a solid beech frame — built for a reading nook.",
    features: [
      "Solid beech frame",
      "Bouclé upholstery",
      "Seat height: 42cm",
      "Removable seat cushion",
    ],
  },
  {
    id: 24,
    name: "Fluted Glass Tumblers",
    cat: "tableware",
    price: 34,
    old: null,
    rating: 4.5,
    reviews: 27,
    img: "lume-t10",
    tag: null,
    stock: true,
    desc: "Set of six fluted glass tumblers with a slightly irregular, hand-finished rim — for water, wine, or anything in between.",
    features: [
      "Set of 6",
      "Hand-finished rims",
      "300ml capacity each",
      "Dishwasher safe",
    ],
  },
];

const LOCAL_PRODUCTS = PRODUCTS.slice();

function getProductById(id) {
  return (
    PRODUCTS.find((p) => String(p.id) === String(id)) ||
    LOCAL_PRODUCTS.find((p) => String(p.id) === String(id))
  );
}

function getRelatedProducts(product, count = 4) {
  return PRODUCTS.filter(
    (p) => p.cat === product.cat && p.id !== product.id,
  ).slice(0, count);
}

function applyRemoteProducts(products) {
  if (!Array.isArray(products) || !products.length) return;
  try {
    localStorage.setItem("lume_remote_products", JSON.stringify(products));
  } catch (error) {}
  PRODUCTS.splice(
    0,
    PRODUCTS.length,
    ...products.map((product) => ({
      id: String(product._id),
      name: product.name,
      cat: product.category?.slug || product.category?.name || "",
      price: Number(product.price) || 0,
      old: product.oldPrice == null ? null : Number(product.oldPrice),
      rating: Number(product.rating) || 0,
      reviews: Number(product.numReviews) || 0,
      img: product.images?.[0]?.url || "",
      image: product.images?.[0]?.url || "",
      tag: product.tag || null,
      stock: Number(product.stock) > 0,
      desc: product.description || "",
      features: product.features || [],
    })),
  );
}

try {
  const cachedProducts = JSON.parse(
    localStorage.getItem("lume_remote_products") || "[]",
  );
  applyRemoteProducts(cachedProducts);
} catch (error) {}

