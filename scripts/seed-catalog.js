// Single source of truth for the product catalog.
//
// Each row is [slug, name, price, description, rating, reviews, inStock, quantity].
// `slug` must match a file in assets/products/<slug>.png — this script emits both
// db.json and the PRODUCT_IMAGES map so the two can never drift apart.
//
// Run: node scripts/seed-catalog.js

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const CATALOG = {
  Furniture: [
    ['sofa', 'Modern Sofa 3-Seater', 499.99, 'Comfortable 3-seater sofa with premium fabric upholstery and solid wood legs. Easy assembly included.', 4.6, 210, true, 12],
    ['chair', 'Ergonomic Study Chair', 199.99, 'Height-adjustable office chair with lumbar support and a breathable mesh back. 360° swivel and smooth-rolling casters.', 4.7, 156, true, 15],
    ['lamp', 'Scandinavian Bedside Lamp', 59.99, 'Minimalist table lamp with a solid marble base, brass stem and warm linen shade.', 4.4, 88, true, 40],
    ['bookshelf', '5-Tier Bookshelf', 149.99, 'Industrial-style open shelving with a powder-coated steel frame and warm oak shelves.', 4.5, 132, true, 20],
    ['coffee-table', 'Oak Coffee Table', 229.99, 'Solid oak coffee table with a lower storage shelf and rounded tapered legs.', 4.5, 97, true, 18],
    ['armchair', 'Velvet Accent Armchair', 279.99, 'Deep emerald velvet armchair with a button-tufted back and gold-tipped legs.', 4.6, 143, true, 10],
    ['bed-frame', 'Queen Bed Frame', 549.99, 'Upholstered queen bed frame with a padded headboard and a sturdy slatted base. No box spring needed.', 4.7, 188, true, 8],
    ['dining-table', 'Extendable Dining Table', 429.99, 'Seats six, extends to eight with a concealed centre leaf. Scratch-resistant matte finish.', 4.4, 76, true, 9],
    ['dresser', 'Chest of Drawers', 319.99, 'Six-drawer dresser with soft-close runners and recessed metal handles.', 4.5, 112, true, 14],
    ['wall-mirror', 'Wall Mirror with Wood Frame', 89.99, 'Full-length arched mirror in a solid walnut frame. Hangs portrait or landscape.', 4.6, 164, true, 30],
    ['recliner', 'Recliner Lounge Chair', 469.99, 'Mid-century lounge chair with a matching ottoman and a smooth manual recline.', 4.8, 205, true, 7],
    ['side-tables', 'Nesting Side Tables', 119.99, 'Set of two nesting tables with marble tops and slim black metal frames.', 4.3, 64, true, 25],
    ['tv-console', 'TV Media Console', 259.99, 'Low-profile media unit with cable management, two drawers and open component shelving.', 4.5, 121, true, 16],
    ['bar-stools', 'Bar Stool Set', 179.99, 'Pair of counter-height stools with footrests, gas-lift height adjustment and swivel seats.', 4.2, 58, false, 0],
    ['shoe-cabinet', 'Shoe Storage Cabinet', 139.99, 'Slim tilt-out shoe cabinet holding up to 18 pairs. Only 24 cm deep.', 4.4, 93, true, 22],
    ['writing-desk', 'Writing Desk with Drawers', 209.99, 'Compact desk with two drawers, a cable port and a wide solid-wood work surface.', 4.6, 137, true, 19],
  ],

  'Hand Bag': [
    ['tote', 'Leather Tote Bag', 129.99, 'Roomy full-grain leather tote with twin handles, a zip closure and a detachable shoulder strap.', 4.7, 189, true, 25],
    ['crossbody', 'Designer Crossbody Bag', 99.99, 'Compact saddle-shape crossbody with gold-tone hardware and a fully adjustable strap.', 4.5, 142, true, 30],
    ['backpack', 'Mini Backpack Purse', 79.99, 'Soft vegan-leather mini backpack with dual zip compartments and adjustable straps.', 4.4, 118, true, 35],
    ['quilted', 'Quilted Shoulder Bag', 149.99, 'Diamond-quilted leather flap bag with a woven gold chain strap and magnetic snap clasp.', 4.8, 231, true, 18],
    ['clutch', 'Satin Evening Clutch', 59.99, 'Structured satin clutch with a crystal-set clasp and a tuck-away chain strap.', 4.3, 71, true, 40],
    ['beach-bag', 'Straw Beach Bag', 44.99, 'Hand-woven natural straw tote with a cotton lining and an interior zip pocket.', 4.2, 86, true, 50],
    ['satchel', 'Structured Top-Handle Satchel', 169.99, 'Rigid top-handle satchel in saffiano leather with a three-compartment interior.', 4.6, 154, true, 15],
    ['bucket-bag', 'Canvas Bucket Bag', 74.99, 'Drawstring bucket bag in heavyweight cotton canvas with leather trim.', 4.1, 63, true, 32],
    ['hobo-bag', 'Fringed Suede Hobo Bag', 119.99, 'Slouchy suede hobo with long fringe detailing and a single wide shoulder strap.', 4.4, 97, true, 21],
    ['belt-bag', 'Leather Belt Bag', 64.99, 'Sleek leather belt bag that wears at the waist or across the chest.', 4.5, 176, true, 45],
    ['box-bag', 'Patent Leather Box Bag', 139.99, 'Rigid patent box bag with a rolled top handle and a polished turn-lock closure.', 4.3, 68, true, 12],
    ['raffia-tote', 'Woven Raffia Tote', 89.99, 'Open-top raffia tote with leather handles and a detachable inner pouch.', 4.4, 104, true, 28],
    ['laptop-handbag', 'Convertible Laptop Handbag', 159.99, 'Padded 15-inch laptop compartment in a handbag silhouette. Converts to a backpack.', 4.7, 212, true, 17],
    ['wristlet', 'Velvet Wristlet Pouch', 39.99, 'Small velvet pouch with a detachable wrist strap and six card slots.', 4.2, 55, true, 60],
    ['croc-shoulder', 'Croc-Embossed Shoulder Bag', 124.99, 'Croc-embossed leather shoulder bag with a short strap and gold-tone feet.', 4.5, 128, false, 0],
    ['nylon-shopper', 'Nylon Everyday Shopper', 54.99, 'Lightweight water-resistant nylon shopper that folds flat into its own pocket.', 4.3, 149, true, 55],
  ],

  Books: [
    ['book-alchemist', 'The Alchemist', 14.99, 'Paulo Coelho\u2019s modern classic about a shepherd boy who journeys in search of treasure and finds his own destiny.', 4.7, 1520, true, 100],
    ['book-habits', 'Atomic Habits', 18.99, 'James Clear\u2019s practical framework for building good habits and breaking bad ones, one small change at a time.', 4.9, 2840, true, 120],
    ['book-sapiens', 'Sapiens', 22.99, 'Yuval Noah Harari\u2019s sweeping history of humankind, from foraging bands to global civilisation.', 4.8, 1975, true, 85],
    ['book-deepwork', 'Deep Work', 17.99, 'Cal Newport on cultivating focused, distraction-free concentration in an increasingly noisy world.', 4.6, 1230, true, 90],
    ['book-thinking', 'Thinking, Fast and Slow', 21.99, 'Daniel Kahneman maps the two systems that drive how we think, judge and decide.', 4.6, 1688, true, 70],
    ['book-midnight', 'The Midnight Library', 16.99, 'Matt Haig\u2019s novel about a library between life and death holding every life you could have lived.', 4.5, 2104, true, 95],
    ['book-educated', 'Educated', 18.49, 'Tara Westover\u2019s memoir of growing up off-grid and eventually earning a PhD at Cambridge.', 4.7, 1842, true, 78],
    ['book-dune', 'Dune', 19.99, 'Frank Herbert\u2019s landmark science-fiction epic of politics, prophecy and desert survival on Arrakis.', 4.8, 2560, true, 110],
    ['book-silent-patient', 'The Silent Patient', 15.99, 'Alex Michaelides\u2019 psychological thriller about a woman who shoots her husband and never speaks again.', 4.4, 1967, true, 88],
    ['book-meditations', 'Meditations', 12.99, 'Marcus Aurelius\u2019 private Stoic notebooks on duty, mortality and keeping a steady mind.', 4.8, 1445, true, 130],
    ['book-crawdads', 'Where the Crawdads Sing', 16.49, 'Delia Owens\u2019 story of a girl raised alone in the marshes of North Carolina, and a death that upends the town.', 4.6, 2310, true, 92],
    ['book-ikigai', 'Ikigai', 13.99, 'A look at the Japanese concept of a reason for being, and the habits of the world\u2019s longest-lived people.', 4.4, 1187, true, 105],
    ['book-money', 'The Psychology of Money', 17.49, 'Morgan Housel on the strange ways people think about wealth, greed and long-term investing.', 4.8, 2078, true, 115],
    ['book-hail-mary', 'Project Hail Mary', 20.99, 'Andy Weir\u2019s science thriller about a lone astronaut who wakes with amnesia and a planet to save.', 4.9, 2695, true, 98],
    ['book-meaning', 'Man\u2019s Search for Meaning', 14.49, 'Viktor Frankl on surviving the camps and the conviction that purpose can outlast suffering.', 4.8, 1756, true, 125],
    ['book-klara', 'Klara and the Sun', 18.99, 'Kazuo Ishiguro\u2019s quietly devastating novel narrated by an artificial friend watching from a shop window.', 4.3, 942, false, 0],
  ],

  Tech: [
    ['headphones', 'Wireless Noise-Cancelling Headphones', 179.99, 'Over-ear headphones with adaptive noise cancellation, 30-hour battery and plush memory-foam cushions.', 4.7, 486, true, 40],
    ['watch', 'Smart Watch Pro', 249.99, 'Always-on display, ECG and SpO2 sensors, built-in GPS and 5 ATM water resistance.', 4.6, 372, true, 35],
    ['speaker', 'Portable Bluetooth Speaker', 89.99, 'IPX7-rated portable speaker with 360° sound, 20-hour playtime and stereo pairing.', 4.5, 618, true, 60],
    ['keyboard', 'Mechanical Keyboard', 129.99, 'Hot-swappable 65% mechanical keyboard with tactile switches and per-key RGB backlighting.', 4.8, 294, true, 28],
    ['earbuds', 'True Wireless Earbuds', 119.99, 'Compact ANC earbuds with transparency mode, wireless charging case and 8-hour buds.', 4.5, 741, true, 75],
    ['action-camera', '4K Action Camera', 279.99, 'Waterproof 4K60 action camera with in-body stabilisation and a front-facing preview screen.', 4.4, 208, true, 22],
    ['monitor', 'Ultrawide Curved Monitor', 549.99, '34-inch 1440p ultrawide at 144 Hz with USB-C power delivery and a height-adjustable stand.', 4.7, 163, true, 12],
    ['charging-pad', 'Wireless Charging Pad', 39.99, 'Fast 15 W Qi2 charging pad with magnetic alignment and a non-slip base.', 4.2, 529, true, 90],
    ['drone', 'Drone with Gimbal Camera', 699.99, 'Folding drone with a 3-axis gimbal, 4K video, obstacle sensing and 34-minute flight time.', 4.6, 147, true, 9],
    ['e-reader', 'E-Reader Tablet', 159.99, 'Glare-free 7-inch e-ink display with adjustable warm light and weeks of battery life.', 4.7, 412, true, 44],
    ['dock', 'USB-C Docking Station', 149.99, '11-in-1 dock with dual 4K output, gigabit ethernet, card readers and 100 W pass-through charging.', 4.4, 186, true, 33],
    ['mouse', 'Gaming Mouse', 69.99, 'Lightweight wireless mouse with a 26K optical sensor, 8 programmable buttons and 70-hour battery.', 4.6, 355, true, 52],
    ['power-bank', 'Power Bank 20000mAh', 54.99, '20000 mAh power bank with 65 W USB-C output, capable of charging a laptop and phone together.', 4.5, 673, true, 80],
    ['smart-hub', 'Smart Home Speaker Hub', 129.99, 'Voice-controlled hub with a 7-inch touchscreen, room-filling audio and Matter device control.', 4.3, 241, true, 26],
    ['webcam', 'Webcam with Ring Light', 79.99, '1080p60 webcam with autofocus, a dual-mic array and an adjustable built-in ring light.', 4.2, 198, true, 47],
    ['studio-monitors', 'Noise-Isolating Studio Monitors', 329.99, 'Pair of active near-field studio monitors with 5-inch woven drivers and rear bass ports.', 4.7, 112, false, 0],
  ],

  Sneakers: [
    ['sneaker-classic', 'Air Force 1 Classic', 109.99, 'The all-white leather low-top that never dates. Cushioned insole and a durable rubber cupsole.', 4.8, 892, true, 50],
    ['sneaker-running', 'Running Shoes Ultra', 139.99, 'Breathable engineered knit upper over a responsive foam midsole built for daily mileage.', 4.6, 534, true, 42],
    ['sneaker-hightop', 'High-Top Canvas Sneakers', 74.99, 'Classic cotton-canvas high-top with a vulcanised rubber sole and metal-eyelet lacing.', 4.5, 726, true, 65],
    ['sneaker-platform', 'Chunky Platform Sneakers', 119.99, 'Exaggerated layered platform sole with tonal leather panelling and thick rope laces.', 4.4, 318, true, 30],
    ['sneaker-suede', 'Retro Suede Trainers', 89.99, 'Soft suede upper with contrast stripes and a gum rubber outsole. A seventies terrace staple.', 4.6, 402, true, 48],
    ['sneaker-slipon', 'Slip-On Canvas Shoes', 59.99, 'Laceless canvas slip-ons with elastic side gores and a padded collar.', 4.3, 587, true, 70],
    ['sneaker-trail', 'Trail Running Sneakers', 149.99, 'Aggressive lugged outsole, rock plate underfoot and a quick-lace system for technical trails.', 4.7, 264, true, 27],
    ['sneaker-knit', 'Knit Sock Sneakers', 99.99, 'Sock-fit knit upper that pulls on in one motion, over a lightweight foam sole.', 4.2, 371, true, 55],
    ['sneaker-court', 'Leather Court Sneakers', 94.99, 'Clean leather tennis silhouette with perforated toe detailing and a low-profile sole.', 4.6, 445, true, 46],
    ['sneaker-basketball', 'Basketball High-Tops', 159.99, 'High-cut basketball shoe with ankle support, encapsulated air cushioning and a herringbone grip.', 4.5, 289, true, 24],
    ['sneaker-skate', 'Skate Shoes', 84.99, 'Reinforced suede ollie patch, padded tongue and a grippy waffle outsole built to take abuse.', 4.4, 356, true, 52],
    ['sneaker-minimal', 'Minimalist White Leather Sneakers', 129.99, 'Stitch-free Italian leather upper on a slim sole. Nothing on it but the shoe.', 4.7, 512, true, 38],
    ['sneaker-neon', 'Neon Mesh Trainers', 79.99, 'High-visibility neon mesh trainers with reflective heel tabs for low-light running.', 4.1, 198, true, 60],
    ['sneaker-hiking', 'Waterproof Hiking Sneakers', 134.99, 'Low-cut hiker with a waterproof breathable membrane and a grippy multi-directional outsole.', 4.6, 307, true, 31],
    ['sneaker-retro-run', 'Retro Running Sneakers', 99.99, 'Nylon-and-suede seventies runner with a wedge midsole and a shell toe.', 4.5, 428, false, 0],
    ['sneaker-work', 'Slip-Resistant Work Sneakers', 89.99, 'Oil- and slip-resistant outsole, reinforced toe and cushioned all-day support.', 4.4, 233, true, 44],
  ],

  Travel: [
    ['suitcase', 'Hard Shell Carry-On', 189.99, 'Cabin-sized polycarbonate spinner with a TSA lock, compression straps and silent double wheels.', 4.6, 421, true, 30],
    ['duffel', 'Travel Duffel Bag', 119.99, 'Water-resistant canvas duffel with leather trim, a shoe compartment and a padded shoulder strap.', 4.5, 288, true, 38],
    ['packing-cubes', 'Packing Cubes Set', 34.99, 'Set of four ripstop nylon cubes in graduated sizes with mesh tops and grab handles.', 4.7, 916, true, 100],
    ['neck-pillow', 'Neck Pillow & Eye Mask Set', 29.99, 'Memory-foam neck pillow with a washable velour cover, paired with a contoured blackout eye mask.', 4.4, 654, true, 75],
    ['large-suitcase', 'Large Check-In Spinner Suitcase', 259.99, '75 cm expandable check-in case with a built-in TSA lock and a fully lined split interior.', 4.5, 236, true, 20],
    ['travel-backpack', 'Anti-Theft Travel Backpack', 99.99, 'Lockable zips, slash-resistant panels, an RFID pocket and a padded 16-inch laptop sleeve.', 4.6, 483, true, 42],
    ['toiletry-bag', 'Toiletry Hanging Organizer', 39.99, 'Hanging wash bag with four zip compartments, a swivel hook and a wipe-clean lining.', 4.5, 372, true, 68],
    ['travel-adapter', 'Universal Travel Adapter', 27.99, 'All-in-one adapter covering 150+ countries, with dual USB-C PD and two USB-A ports.', 4.6, 1104, true, 120],
    ['water-bottle', 'Collapsible Water Bottle', 19.99, 'Food-grade silicone bottle that rolls down to a third of its height when empty.', 4.2, 528, true, 140],
    ['passport-wallet', 'Passport Holder & Card Wallet', 32.99, 'Slim RFID-blocking leather wallet holding a passport, boarding pass and six cards.', 4.5, 447, true, 95],
    ['laundry-bag', 'Compression Laundry Bag', 21.99, 'Zip-compression bag that separates worn clothes and squeezes out the trapped air.', 4.3, 261, true, 110],
    ['travel-tripod', 'Travel Tripod', 89.99, 'Aluminium tripod folding to 40 cm, with a ball head and a detachable phone mount.', 4.4, 176, true, 34],
    ['travel-mug', 'Insulated Travel Mug', 34.99, 'Vacuum-insulated stainless mug keeping drinks hot 8 hours, with a leak-proof flip lid.', 4.7, 693, true, 88],
    ['luggage-scale', 'Luggage Scale', 17.99, 'Digital hanging scale accurate to 10 g, with a tare function and an auto-hold display.', 4.4, 385, true, 130],
    ['weekender', 'Foldable Weekender Bag', 49.99, 'Packs into its own pouch, then opens to a 35 L weekender with a trolley pass-through sleeve.', 4.3, 314, true, 72],
    ['first-aid-kit', 'Travel First Aid Kit', 24.99, 'Compact 92-piece kit in a water-resistant zip case with a clearly labelled interior.', 4.6, 208, false, 0],
  ],
};

const CATEGORY_ORDER = ['Furniture', 'Hand Bag', 'Books', 'Tech', 'Sneakers', 'Travel'];

const hasArtwork = (slug) =>
  fs.existsSync(path.join(ROOT, 'assets', 'products', `${slug}.png`));

const products = [];
const imageRows = [];
const missing = [];
let id = 0;

for (const category of CATEGORY_ORDER) {
  for (const [slug, name, price, description, rating, reviews, inStock, quantity] of CATALOG[category]) {
    id += 1;
    products.push({
      id,
      name,
      category,
      price,
      description,
      rating,
      reviews,
      inStock,
      image: `https://picsum.photos/seed/${slug}/400/400`,
      quantity,
    });

    // A require() of a file Metro can't find is a hard bundle failure, so slugs
    // without artwork are simply left out — those products fall back to the URL.
    if (hasArtwork(slug)) {
      imageRows.push(`  ${id}: require('../../assets/products/${slug}.png'),`);
    } else {
      missing.push(`${category}: ${slug}.png`);
    }
  }
  imageRows.push('');
}

const dbPath = path.join(ROOT, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
db.products = products;
fs.writeFileSync(dbPath, `${JSON.stringify(db, null, 2)}\n`);

const imagesPath = path.join(ROOT, 'src', 'constants', 'images.js');
const imagesFile = `// Metro requires static literal paths, so every asset is listed explicitly here.
// Category keys must match the \`name\` field in db.json.
//
// The PRODUCT_IMAGES block below is generated by scripts/seed-catalog.js.
// Edit the catalog there and re-run it rather than hand-editing this file.

export const HERO_IMAGE = require('../../assets/hero.png');

export const CATEGORY_IMAGES = {
  Furniture: require('../../assets/categories/furniture.png'),
  'Hand Bag': require('../../assets/categories/hand-bag.png'),
  Books: require('../../assets/categories/books.png'),
  Tech: require('../../assets/categories/tech.png'),
  Sneakers: require('../../assets/categories/sneakers.png'),
  Travel: require('../../assets/categories/travel.png'),
};

export const getCategoryImage = (name) => CATEGORY_IMAGES[name];

// Product keys are the \`id\` field in db.json.
export const PRODUCT_IMAGES = {
${imageRows.join('\n').trimEnd()}
};

export const getProductImage = (id) => PRODUCT_IMAGES[id];
`;
fs.writeFileSync(imagesPath, imagesFile);

console.log(`wrote ${products.length} products across ${CATEGORY_ORDER.length} categories`);
console.log(`missing artwork: ${missing.length}`);
missing.forEach((m) => console.log(`  ${m}`));
