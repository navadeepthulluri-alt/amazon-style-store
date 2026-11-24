const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'amazon.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

const INITIAL_PRODUCTS = [
  // Electronics (5)
  { id: '1', title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', category: 'Electronics', price: 398.00, originalPrice: 449.99, rating: 4.8, reviewCount: 14250, isPrime: 1, stock: 18, brand: 'Sony', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', badge: '#1 Best Seller', description: 'Industry-leading noise cancellation with two processors and 8 microphones for unprecedented sound quality.', specs: ['Up to 30-hour battery life', 'Ultra-comfortable light design', 'Multipoint connection'] },
  { id: '2', title: 'Samsung 65-Inch Class OLED 4K Smart TV S90C', category: 'Electronics', price: 1597.99, originalPrice: 2099.99, rating: 4.7, reviewCount: 3820, isPrime: 1, stock: 7, brand: 'Samsung', image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&q=80', badge: "Amazon's Choice", description: 'Mind-blowing OLED picture quality with Neural Quantum Processor and Dolby Atmos Built-In sound.', specs: ['Quantum HDR OLED', '140Hz Refresh Rate', 'Motion Xcelerator Turbo Pro'] },
  { id: '3', title: 'JBL Flip 6 Waterproof Portable Bluetooth Speaker', category: 'Electronics', price: 99.95, originalPrice: 129.95, rating: 4.6, reviewCount: 28910, isPrime: 1, stock: 45, brand: 'JBL', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80', badge: 'Limited time deal', description: 'Louder, more powerful sound with 2-way speaker system designed to deliver crisp, clear audio.', specs: ['IP67 Waterproof and Dustproof', '12 Hours of Playtime', 'PartyBoost compatible'] },
  { id: '4', title: 'Canon EOS R6 Mark II Full-Frame Mirrorless Camera', category: 'Electronics', price: 2299.00, originalPrice: 2499.00, rating: 4.9, reviewCount: 1120, isPrime: 1, stock: 5, brand: 'Canon', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80', badge: 'Pro Choice', description: 'High-performance mirrorless camera featuring 24.2 MP CMOS sensor, 4K60p video, and Dual Pixel CMOS AF II.', specs: ['40 fps Electronic Shutter', 'In-Body Image Stabilization', 'Dual SD Card Slots'] },
  { id: '5', title: 'Bose Smart Soundbar 900 with Dolby Atmos', category: 'Electronics', price: 749.00, originalPrice: 899.00, rating: 4.5, reviewCount: 4530, isPrime: 1, stock: 12, brand: 'Bose', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80', badge: 'Save ₹12,000', description: 'The most immersive Bose soundbar for all your content with custom dipole transducers and Voice4Video technology.', specs: ['Dolby Atmos & Bose TrueSpace', 'Wi-Fi, Bluetooth, AirPlay 2', 'Built-in Alexa & Google Assistant'] },

  // Computers & Accessories (5)
  { id: '6', title: 'Apple MacBook Air 15-inch M3 Chip (16GB RAM, 512GB SSD)', category: 'Computers & Accessories', price: 1399.00, originalPrice: 1499.00, rating: 4.9, reviewCount: 5410, isPrime: 1, stock: 22, brand: 'Apple', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80', badge: '#1 Best Seller', description: 'Strikingly thin and fast laptop with up to 18 hours of battery life and a liquid Retina display.', specs: ['M3 8-core CPU, 10-core GPU', '15.3-inch Liquid Retina Display', 'MagSafe 3 charging port'] },
  { id: '7', title: 'LG UltraGear 34-Inch Curved Gaming Monitor WQHD 160Hz', category: 'Computers & Accessories', price: 349.99, originalPrice: 499.99, rating: 4.7, reviewCount: 8920, isPrime: 1, stock: 14, brand: 'LG', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80', badge: '30% OFF', description: 'Immersive curved display with 1ms MBR response time, AMD FreeSync Premium, and HDR10 support.', specs: ['3440 x 1440 WQHD', '160Hz Refresh Rate', '3-Side Virtually Borderless'] },
  { id: '8', title: 'Keychron K2 Wireless Mechanical Keyboard (RGB Backlit)', category: 'Computers & Accessories', price: 89.99, originalPrice: 99.99, rating: 4.6, reviewCount: 6720, isPrime: 1, stock: 30, brand: 'Keychron', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80', badge: 'Popular', description: 'Compact 75% layout mechanical keyboard with Gateron switches and Mac/Windows cross-compatibility.', specs: ['Bluetooth 5.1 & Wired', '4000 mAh Battery', 'Connects up to 3 devices'] },
  { id: '9', title: 'Logitech MX Master 3S Wireless Performance Mouse', category: 'Computers & Accessories', price: 99.99, originalPrice: 109.99, rating: 4.8, reviewCount: 19400, isPrime: 1, stock: 50, brand: 'Logitech', image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80', badge: "Amazon's Choice", description: 'Quiet Click mouse with 8K DPI track-on-glass sensor and MagSpeed electromagnetic scrolling wheel.', specs: ['8,000 DPI Optical Sensor', 'Quiet Clicks Technology', 'Multi-device cross-computer flow'] },
  { id: '10', title: 'Samsung T7 Shield 2TB Portable External Solid State Drive', category: 'Computers & Accessories', price: 169.99, originalPrice: 219.99, rating: 4.8, reviewCount: 15300, isPrime: 1, stock: 40, brand: 'Samsung', image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80', badge: 'Top Rated', description: 'Rugged, durable external SSD delivering up to 1,050 MB/s transfer speeds with IP65 water and dust resistance.', specs: ['Read speeds up to 1050 MB/s', 'Drop resistant up to 9.8 ft', 'USB 3.2 Gen 2 compatible'] },

  // Home & Kitchen (5)
  { id: '11', title: 'Ninja AF101 Air Fryer 4-Quart Capacity (Grey)', category: 'Home & Kitchen', price: 89.99, originalPrice: 129.99, rating: 4.8, reviewCount: 78500, isPrime: 1, stock: 60, brand: 'Ninja', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80', badge: '#1 Best Seller', description: 'Air fry with up to 75% less fat than traditional frying methods; multi-function for roast, reheat & dehydrate.', specs: ['4-Quart Ceramic Coated Basket', 'Temperature range 105°F to 400°F', 'Dishwasher safe parts'] },
  { id: '12', title: 'Breville Barista Touch Espresso Machine (Stainless Steel)', category: 'Home & Kitchen', price: 999.95, originalPrice: 1199.95, rating: 4.7, reviewCount: 4210, isPrime: 1, stock: 8, brand: 'Breville', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&q=80', badge: 'Premium Pick', description: 'Automated touchscreen coffee machine with integrated grinder and microfoam milk texturing.', specs: ['Barista-quality 3 second heat-up', 'Built-in precision conical grinder', 'Pre-programmed coffee menus'] },
  { id: '13', title: 'iRobot Roomba Combo j7+ Robot Vacuum & Mop', category: 'Home & Kitchen', price: 799.00, originalPrice: 1099.00, rating: 4.4, reviewCount: 3120, isPrime: 1, stock: 15, brand: 'iRobot', image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=600&q=80', badge: 'Save ₹25,000', description: 'Hands-free robot vacuum and mop that detects and avoids pet waste, cords, and automatically empties itself.', specs: ['Auto-Retracting Mopping System', 'Clean Base Automatic Dirt Disposal', 'PrecisionVision Navigation'] },
  { id: '14', title: 'Vitamix A3500 Ascent Series Smart Blender (Graphite)', category: 'Home & Kitchen', price: 649.95, originalPrice: 699.95, rating: 4.8, reviewCount: 3890, isPrime: 1, stock: 11, brand: 'Vitamix', image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80', badge: 'Chef Favorite', description: 'Five program settings for smoothies, hot soups, frozen desserts, dips & spreads, and self-cleaning.', specs: ['Programmable Timer', 'Touch Screen Controls', '10-Year Full Warranty'] },
  { id: '15', title: 'Ember Temperature Control Smart Mug 2 (14 oz, Black)', category: 'Home & Kitchen', price: 149.95, originalPrice: 179.95, rating: 4.5, reviewCount: 11400, isPrime: 1, stock: 25, brand: 'Ember', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80', badge: 'Gift Idea', description: 'Maintain your chosen drinking temperature for hot beverages with app control and long battery life.', specs: ['80 min battery / All day on coaster', 'Temperature range 120°F - 145°F', 'Auto sleep smart sensor'] },

  // Fashion (5)
  { id: '16', title: "Legendary Whitetails Men's Journeyman Rugged Shirt Jacket", category: 'Fashion', price: 79.99, originalPrice: 99.99, rating: 4.7, reviewCount: 22100, isPrime: 1, stock: 35, brand: 'Legendary Whitetails', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80', badge: '#1 Best Seller', description: 'Rugged flannel fleece lining with durable antique brass hardware for outdoors and everyday style.', specs: ['100% Heavy Flannel Cotton', 'Hand warmer side pockets', 'Relaxed comfortable fit'] },
  { id: '17', title: "adidas Women's Cloudfoam Pure 2.0 Running Shoes", category: 'Fashion', price: 54.99, originalPrice: 75.00, rating: 4.6, reviewCount: 41200, isPrime: 1, stock: 70, brand: 'adidas', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', badge: 'Top Seller', description: 'Ultra-soft memory foam sockliner paired with Cloudfoam cushioning for all-day walkability.', specs: ['100% Textile Synthetics', 'Rubber outsole', 'Primegreen recycled material'] },
  { id: '18', title: "Fossil Men's Derrick Leather RFID Blocking Bifold Wallet", category: 'Fashion', price: 38.50, originalPrice: 55.00, rating: 4.7, reviewCount: 18400, isPrime: 1, stock: 40, brand: 'Fossil', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80', badge: "Amazon's Choice", description: 'Genuine leather bifold wallet with built-in RFID lining to protect credit cards from scanning.', specs: ['100% Genuine Cowhide Leather', '8 credit card slots', '2 flip ID windows'] },
  { id: '19', title: 'Ray-Ban RB3025 Classic Aviator Sunglasses (Gold/G-15 Green)', category: 'Fashion', price: 171.00, originalPrice: 213.00, rating: 4.7, reviewCount: 19800, isPrime: 1, stock: 20, brand: 'Ray-Ban', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80', badge: 'Iconic Style', description: 'Timeless aviator frame with 100% UV protection glass lenses and lightweight metal frame.', specs: ['100% UV400 Protection', 'Metal frame with teardrop lens', 'Includes leather case'] },
  { id: '20', title: 'Carhartt Unisex Legacy Deluxe Work Laptop Backpack', category: 'Fashion', price: 89.99, originalPrice: 109.99, rating: 4.8, reviewCount: 9500, isPrime: 1, stock: 28, brand: 'Carhartt', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', badge: 'Heavy Duty', description: 'Heavy-duty water-repellent backpack built to carry tools, laptops, and gear through tough workdays.', specs: ['1200D Poly with Rain Defender', 'Dedicated 17-inch laptop sleeve', 'Tricot-lined eyebrow pocket'] },

  // Books (5)
  { id: '21', title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits', category: 'Books', price: 13.79, originalPrice: 27.00, rating: 4.9, reviewCount: 132000, isPrime: 1, stock: 120, brand: 'Avery Publishing', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80', badge: '#1 Overall Best Seller', description: 'Tiny Changes, Remarkable Results. The definitive guide to breaking bad behaviors and mastering good habits.', specs: ['Hardcover Edition', '320 Pages', 'Over 15 Million copies sold'] },
  { id: '22', title: 'The Psychology of Money: Timeless lessons on wealth & greed', category: 'Books', price: 14.49, originalPrice: 19.99, rating: 4.8, reviewCount: 56400, isPrime: 1, stock: 90, brand: 'Harriman House', image: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&q=80', badge: 'Must Read', description: 'Morgan Housel shares 19 short stories exploring the strange ways people think about money.', specs: ['Paperback Edition', '256 Pages', 'International Bestseller'] },
  { id: '23', title: 'Dune (Deluxe Hardcover Edition) by Frank Herbert', category: 'Books', price: 24.99, originalPrice: 50.00, rating: 4.8, reviewCount: 44100, isPrime: 1, stock: 45, brand: 'Ace Books', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80', badge: '50% OFF', description: 'Collector hardcover edition with stained edges and foil-stamped cover of the sci-fi masterpiece.', specs: ['Deluxe Hardcover', '688 Pages', 'Award-winning Sci-Fi Classic'] },
  { id: '24', title: 'Clean Code: A Handbook of Agile Software Craftsmanship', category: 'Books', price: 39.99, originalPrice: 54.99, rating: 4.7, reviewCount: 11200, isPrime: 1, stock: 32, brand: 'Pearson', image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80', badge: 'Developer Essential', description: 'Robert C. Martin presents revolutionary paradigms for writing readable, maintainable, clean code.', specs: ['464 Pages', 'Essential Engineering Guide', 'Practical Code Case Studies'] },
  { id: '25', title: 'The Creative Act: A Way of Being by Rick Rubin', category: 'Books', price: 18.50, originalPrice: 32.00, rating: 4.8, reviewCount: 16800, isPrime: 1, stock: 60, brand: 'Penguin Press', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80', badge: 'NYT Bestseller', description: 'Legendary music producer Rick Rubin distills what he has learned about creativity over decades.', specs: ['Clothbound Hardcover', '432 Pages', '78 Areas of Thought'] },

  // Gaming (5)
  { id: '26', title: 'PlayStation 5 Console (Slim) – Disc Edition', category: 'Gaming', price: 499.00, originalPrice: 499.99, rating: 4.9, reviewCount: 38200, isPrime: 1, stock: 16, brand: 'PlayStation', image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80', badge: '#1 Best Seller', description: 'Experience lightning-fast loading with an ultra-high speed SSD, haptic feedback, and 3D Audio.', specs: ['1TB Custom SSD Storage', '4K-TV Gaming up to 120fps', 'Includes DualSense Controller'] },
  { id: '27', title: 'Nintendo Switch – OLED Model w/ White Joy-Con', category: 'Gaming', price: 349.00, originalPrice: 349.99, rating: 4.9, reviewCount: 64100, isPrime: 1, stock: 29, brand: 'Nintendo', image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&q=80', badge: "Amazon's Choice", description: '7-inch vibrant OLED screen, wide adjustable stand, dock with wired LAN port, and 64 GB storage.', specs: ['7-inch OLED Screen', 'Enhanced Audio', 'TV, Tabletop, and Handheld Modes'] },
  { id: '28', title: 'Xbox Wireless Controller – Carbon Black', category: 'Gaming', price: 49.00, originalPrice: 59.99, rating: 4.8, reviewCount: 89200, isPrime: 1, stock: 85, brand: 'Microsoft', image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600&q=80', badge: 'Save 18%', description: 'Modernized design featuring sculpted surfaces and refined geometry for enhanced comfort.', specs: ['Hybrid D-pad & Textured Grip', 'Dedicated Share Button', 'Xbox Wireless & Bluetooth'] },
  { id: '29', title: 'Razer BlackShark V2 Pro Wireless Gaming Headset', category: 'Gaming', price: 179.99, originalPrice: 199.99, rating: 4.6, reviewCount: 12400, isPrime: 1, stock: 24, brand: 'Razer', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80', badge: 'Esports Pro', description: 'HyperSpeed Wireless technology, TriForce Titanium 50mm Drivers, and HyperClear Super Wideband Mic.', specs: ['70 Hours Battery Life', 'THX Spatial Audio', 'Noise-isolating memory foam'] },
  { id: '30', title: 'Meta Quest 3 128GB — Breakthrough Mixed Reality Headset', category: 'Gaming', price: 499.99, originalPrice: 499.99, rating: 4.7, reviewCount: 8450, isPrime: 1, stock: 19, brand: 'Meta', image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&q=80', badge: 'Hot Release', description: 'Transform your home into an exciting new playground with full-color passthrough mixed reality.', specs: ['4K+ Infinite Display', 'Snapdragon XR2 Gen 2', 'Touch Plus Controllers'] },

  // Watches & Wearables (5)
  { id: '31', title: 'Apple Watch Ultra 2 [GPS + Cellular 49mm] Titanium Case', category: 'Watches & Wearables', price: 779.00, originalPrice: 799.00, rating: 4.9, reviewCount: 4120, isPrime: 1, stock: 14, brand: 'Apple', image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&q=80', badge: 'Adventure Ready', description: 'The most rugged and capable Apple Watch ever with 3,000-nit display and precision dual-frequency GPS.', specs: ['36-hour battery life', '100m water resistance', 'Customizable Action button'] },
  { id: '32', title: 'Garmin fenix 7X Pro Sapphire Solar Multisport GPS Watch', category: 'Watches & Wearables', price: 899.99, originalPrice: 999.99, rating: 4.8, reviewCount: 2890, isPrime: 1, stock: 9, brand: 'Garmin', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', badge: 'Endurance King', description: 'Ultimate multisport GPS smartwatch with Power Sapphire solar charging lens and built-in LED flashlight.', specs: ['Up to 37 days battery with solar', 'Preloaded TopoActive maps', '24/7 Health & Training metrics'] },
  { id: '33', title: 'Samsung Galaxy Watch 6 Classic 47mm Bluetooth Smartwatch', category: 'Watches & Wearables', price: 329.99, originalPrice: 429.99, rating: 4.6, reviewCount: 5130, isPrime: 1, stock: 27, brand: 'Samsung', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80', badge: 'Save ₹8,000', description: 'Iconic rotating bezel, personalized heart rate zones, and advanced sleep coaching.', specs: ['Stainless Steel Case', 'Sapphire Crystal Glass', 'BIA Body Composition Sensor'] },
  { id: '34', title: "Seiko 5 Sports Automatic Men's Stainless Steel Watch", category: 'Watches & Wearables', price: 245.00, originalPrice: 325.00, rating: 4.8, reviewCount: 7420, isPrime: 1, stock: 21, brand: 'Seiko', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80', badge: 'Classic Automatic', description: '24-jewel automatic movement with unidirectional rotating bezel and luminous hands.', specs: ['Caliber 4R36 Automatic', '41-hour power reserve', '100m Water Resistant'] },
  { id: '35', title: 'WHOOP 4.0 Health and Fitness Wearable with 12-Month Sub', category: 'Watches & Wearables', price: 239.00, originalPrice: 239.00, rating: 4.5, reviewCount: 6200, isPrime: 1, stock: 33, brand: 'WHOOP', image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80', badge: 'Pro Athlete Choice', description: '24/7 continuous physiological monitoring for sleep, recovery, strain, and daily performance.', specs: ['Waterproof Battery Pack', 'Screen-free distraction-free design', 'Includes 12-month membership'] },

  // Sports & Fitness (5)
  { id: '36', title: 'Bowflex SelectTech 552 Adjustable Dumbbells (Pair)', category: 'Sports & Fitness', price: 429.00, originalPrice: 549.00, rating: 4.8, reviewCount: 24900, isPrime: 1, stock: 12, brand: 'Bowflex', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80', badge: '#1 Best Seller', description: 'Replaces 15 sets of weights; adjusts from 5 to 52.5 lbs with the turn of a dial.', specs: ['5 to 52.5 lbs per dumbbell', '2.5 lb increments up to 25 lbs', 'Space-saving compact trays'] },
  { id: '37', title: 'YETI Rambler 36 oz Vacuum Insulated Stainless Steel Bottle', category: 'Sports & Fitness', price: 50.00, originalPrice: 55.00, rating: 4.9, reviewCount: 51200, isPrime: 1, stock: 95, brand: 'YETI', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80', badge: "Amazon's Choice", description: '18/8 kitchen-grade stainless steel with double-wall vacuum insulation and leakproof Chug Cap.', specs: ['Dishwasher Safe', 'No Sweat Design', 'DuraCoat Color Finish'] },
  { id: '38', title: 'Manduka PRO Yoga Mat 6mm Thick High Density Exercise Mat', category: 'Sports & Fitness', price: 118.00, originalPrice: 138.00, rating: 4.7, reviewCount: 8910, isPrime: 1, stock: 34, brand: 'Manduka', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80', badge: 'Studio Grade', description: 'Ultra-dense cushioning provides superior joint support and unmatched stability on any surface.', specs: ['6mm High-Density Cushion', 'Closed-Cell Hygienic Surface', 'Lifetime Guarantee'] },
  { id: '39', title: 'Theragun Prime Percussive Therapy Deep Tissue Massage Gun', category: 'Sports & Fitness', price: 249.00, originalPrice: 299.00, rating: 4.7, reviewCount: 11300, isPrime: 1, stock: 19, brand: 'Therabody', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80', badge: 'Recovery Essential', description: 'Smart percussive therapy device engineered to relieve muscle soreness and accelerate recovery.', specs: ['16mm Deep Muscle Amplitude', '5 Built-in Speeds', '120-Minute Battery Life'] },
  { id: '40', title: 'Coleman Sundome Camping Tent (4-Person, Green)', category: 'Sports & Fitness', price: 84.99, originalPrice: 119.99, rating: 4.7, reviewCount: 47600, isPrime: 1, stock: 42, brand: 'Coleman', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80', badge: 'Outdoor Favorite', description: 'WeatherTec system with patented welded floors and inverted seams keeps water out in storms.', specs: ['Sets up in 10 minutes', 'Fits 1 Queen Airbed', '9 x 7 ft footprint'] }
];

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      originalPrice REAL NOT NULL,
      rating REAL NOT NULL,
      reviewCount INTEGER NOT NULL,
      isPrime INTEGER NOT NULL,
      stock INTEGER NOT NULL,
      brand TEXT NOT NULL,
      image TEXT NOT NULL,
      badge TEXT,
      description TEXT,
      specs TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT NOT NULL,
      isPrime INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT NOT NULL,
      brand TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      userName TEXT NOT NULL,
      rating INTEGER NOT NULL,
      title TEXT NOT NULL,
      comment TEXT NOT NULL,
      date TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      items TEXT NOT NULL,
      total TEXT NOT NULL,
      shippingAddress TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `);

  db.get('SELECT COUNT(*) AS count FROM products', (err, row) => {
    if (err) {
      console.error('Error counting products:', err.message);
      return;
    }
    if (row.count === 0) {
      const insertStmt = db.prepare(`
        INSERT INTO products (
          id, title, category, price, originalPrice, rating, reviewCount,
          isPrime, stock, brand, image, badge, description, specs
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      INITIAL_PRODUCTS.forEach((p) => {
        insertStmt.run(
          p.id,
          p.title,
          p.category,
          p.price,
          p.originalPrice,
          p.rating,
          p.reviewCount,
          p.isPrime,
          p.stock,
          p.brand,
          p.image,
          p.badge,
          p.description,
          JSON.stringify(p.specs)
        );
      });

      insertStmt.finalize(() => {
        console.log('Seeded 40 products into SQLite database.');
      });
    }
  });
});

module.exports = db;
