# ShopApp — myShoppy

A mobile-first e-commerce application built with **React Native (Expo SDK 57)** and **JSON Server** as a mock backend.

---

## Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device (Android / iOS)

---

## Setup & Installation

```bash
# 1. Clone / navigate to the project folder
cd ShopApp

# 2. Install dependencies
npm install

# 3. Start both JSON Server (port 3000) and Expo dev server together
npm run dev
```

Or run them in **separate terminals**:

**Terminal 1 — JSON Server (mock API):**
```bash
npm run server
# Starts at http://localhost:3000
```

**Terminal 2 — Expo:**
```bash
npm start
# Scan the QR code with Expo Go
```

> **Note:** When running on a physical device, replace `localhost` in `src/services/api.js` with your machine's local IP address (e.g., `http://192.168.1.5:3000`).

---

## Application Flow

```
Home Screen  (hero banner)
  ↓
Categories Screen  (visual grid: Furniture, Hand Bag, Books, Tech, Sneakers, Travel)
  ↓ Tap a category
Product List Screen  (search bar + filter chips: All / In Stock / Top Rated /
                      Price: Low to High / Price: High to Low / 💲 Price Range slider)
  ↓ Tap a product
Product Detail Screen  (image, description, rating, stock count, qty selector capped at stock)
  ↓ Add to Cart
Cart Screen  (manage quantities, remove with confirmation, clear all, view order summary)
  ↓ Proceed to Checkout
Delivery Details Screen  (Step 1 of 2 — name, phone, address, city, PIN, notes)
  ↓ Continue to Review
Order Review Screen  (Step 2 of 2 — select items, review totals, Place Order)
  ↓ Place Order
Order Confirmation Screen  (animated spring success, transaction ID, amount paid)
  ↓ View My Orders
Order History Screen  (all past orders, cancel order, tap item → Product Detail)
```

---

## Key Features

| Feature | Details |
|---|---|
| Product Catalog | 96 products across 6 categories (16 per category) |
| Category Browsing | Visual grid cards with color-coded categories |
| Search & Filter | Real-time search + sort chips (In Stock, Top Rated, Price Low/High) + price range slider |
| Product Details | Image, description, rating, stock count, qty selector with stock cap |
| Cart Management | Add, increment (capped at stock), decrement, remove with confirmation, clear all |
| Cart Persistence | Cart survives app restarts via AsyncStorage |
| Checkout | 2-step flow: Delivery Details → Order Review with item selection |
| Order Confirmation | Animated success screen (spring + fade) with transaction ID |
| Order History | View all past orders, cancel orders, tap items to view product detail |
| Error Handling | Loading states, empty states, network errors, out-of-stock |

---

## Categories & Products

96 products total — 16 per category.

| Category | Products |
|---|---|
| Furniture | Modern Sofa 3-Seater, Ergonomic Study Chair, Scandinavian Bedside Lamp, 5-Tier Bookshelf, Oak Coffee Table, Velvet Accent Armchair, Queen Bed Frame, Extendable Dining Table, Chest of Drawers, Wall Mirror with Wood Frame, Recliner Lounge Chair, Nesting Side Tables, TV Media Console, Bar Stool Set, Shoe Storage Cabinet, Writing Desk with Drawers |
| Hand Bag | Leather Tote Bag, Designer Crossbody Bag, Mini Backpack Purse, Quilted Shoulder Bag, Satin Evening Clutch, Straw Beach Bag, Structured Top-Handle Satchel, Canvas Bucket Bag, Fringed Suede Hobo Bag, Leather Belt Bag, Patent Leather Box Bag, Woven Raffia Tote, Convertible Laptop Handbag, Velvet Wristlet Pouch, Croc-Embossed Shoulder Bag, Nylon Everyday Shopper |
| Books | The Alchemist, Atomic Habits, Sapiens, Deep Work, Thinking Fast and Slow, The Midnight Library, Educated, Dune, The Silent Patient, Meditations, Where the Crawdads Sing, Ikigai, The Psychology of Money, Project Hail Mary, Man's Search for Meaning, Klara and the Sun |
| Tech | Wireless Noise-Cancelling Headphones, Smart Watch Pro, Portable Bluetooth Speaker, Mechanical Keyboard, True Wireless Earbuds, 4K Action Camera, Ultrawide Curved Monitor, Wireless Charging Pad, Drone with Gimbal Camera, E-Reader Tablet, USB-C Docking Station, Gaming Mouse, Power Bank 20000mAh, Smart Home Speaker Hub, Webcam with Ring Light, Noise-Isolating Studio Monitors |
| Sneakers | Air Force 1 Classic, Running Shoes Ultra, High-Top Canvas Sneakers, Chunky Platform Sneakers, Retro Suede Trainers, Slip-On Canvas Shoes, Trail Running Sneakers, Knit Sock Sneakers, Leather Court Sneakers, Basketball High-Tops, Skate Shoes, Minimalist White Leather Sneakers, Neon Mesh Trainers, Waterproof Hiking Sneakers, Retro Running Sneakers, Slip-Resistant Work Sneakers |
| Travel | Hard Shell Carry-On, Travel Duffel Bag, Packing Cubes Set, Neck Pillow & Eye Mask Set, Large Check-In Spinner Suitcase, Anti-Theft Travel Backpack, Toiletry Hanging Organizer, Universal Travel Adapter, Collapsible Water Bottle, Passport Holder & Card Wallet, Compression Laundry Bag, Travel Tripod, Insulated Travel Mug, Luggage Scale, Foldable Weekender Bag, Travel First Aid Kit |

---

## Project Structure

```
ShopApp/
├── App.js                          # Entry point (GestureHandlerRootView)
├── app.json                        # Expo config (SDK 57)
├── db.json                         # JSON Server mock database (96 products + orders)
├── package.json
├── babel.config.js
└── src/
    ├── constants/
    │   └── images.js               # Local product image map + getProductImage()
    ├── context/
    │   └── CartContext.js          # Global cart state (useReducer + AsyncStorage)
    ├── navigation/
    │   └── AppNavigator.js         # Bottom tabs + stack navigators + cart badge
    ├── screens/
    │   ├── HomeScreen.js           # Hero banner
    │   ├── CategoriesScreen.js     # Category grid
    │   ├── ProductListScreen.js    # Search + filter chips + price range slider
    │   ├── ProductDetailScreen.js  # Product info, stock count, qty selector
    │   ├── CartScreen.js           # Cart management with confirmation dialogs
    │   ├── DeliveryScreen.js       # Step 1 of 2 — delivery details form
    │   ├── CheckoutScreen.js       # Step 2 of 2 — order review & item selection
    │   ├── OrderConfirmationScreen.js  # Animated success screen
    │   └── OrderHistoryScreen.js   # Past orders with cancel functionality
    ├── components/
    │   ├── ProductCard.js          # Product grid card with stock badge
    │   ├── CategoryCard.js         # Category image card
    │   └── StarRating.js           # Star rating display
    └── services/
        └── api.js                  # Axios API service (dynamic host for device/web)
```

---

## API Endpoints (JSON Server)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | All products |
| GET | `/products/:id` | Single product |
| GET | `/products?category=Furniture` | Filter by category |
| GET | `/products?name_like=sofa` | Search by name |
| GET | `/categories` | All categories |
| POST | `/orders` | Place an order |
| GET | `/orders?_sort=-createdAt` | All orders (newest first) |
| PATCH | `/orders/:id` | Update order (e.g. cancel) |

---

## Assumptions

- JSON Server runs on `http://localhost:3000` for emulator/simulator. The app auto-resolves the host IP for physical devices via Expo's `hostUri`.
- Product images are stored as local assets under `assets/products/`.
- No real payment gateway is integrated; checkout is a mock flow with a generated transaction ID.
- Orders are stored in `db.json` under the `orders` array and persist across sessions.
- Cart state is persisted via `AsyncStorage` and survives app restarts.
