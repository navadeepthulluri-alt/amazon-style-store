const fs = require('fs');
const path = require('path');

/**
 * Generates the complete Amazon.in full-stack project:
 * - package.json, .gitignore, README.md
 * - database.js (SQLite3 with 40 seeded products across 8 categories)
 * - server.js (Express REST API + static frontend serving)
 * - public/index.html, public/css/style.css, public/js/app.js
 */
const files = {
  'package.json': `{
  "name": "amazon-india-clone",
  "version": "1.0.0",
  "description": "Full-stack Amazon.in e-commerce clone with Node.js, Express, and SQLite database",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "sqlite3": "^5.1.7"
  }
}
`,
  '.gitignore': `node_modules/
*.log
.DS_Store
amazon.db
`,
  'README.md': `# Amazon.in Full-Stack Clone

1. Run \`npm install\`
2. Run \`npm start\`
3. Open http://localhost:3000
`,
  'database.js': `const sqlite3 = require('sqlite3').verbose();
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
  db.run(\`
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
  \`);

  db.run(\`
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT NOT NULL,
      isPrime INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1
    )
  \`);

  db.run(\`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT NOT NULL,
      brand TEXT NOT NULL
    )
  \`);

  db.run(\`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      userName TEXT NOT NULL,
      rating INTEGER NOT NULL,
      title TEXT NOT NULL,
      comment TEXT NOT NULL,
      date TEXT NOT NULL
    )
  \`);

  db.run(\`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      items TEXT NOT NULL,
      total TEXT NOT NULL,
      shippingAddress TEXT NOT NULL,
      status TEXT NOT NULL
    )
  \`);

  db.get('SELECT COUNT(*) AS count FROM products', (err, row) => {
    if (err) {
      console.error('Error counting products:', err.message);
      return;
    }
    if (row.count === 0) {
      const insertStmt = db.prepare(\`
        INSERT INTO products (
          id, title, category, price, originalPrice, rating, reviewCount,
          isPrime, stock, brand, image, badge, description, specs
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      \`);

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
`,
  'server.js': `const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const formatted = rows.map((row) => ({
      ...row,
      isPrime: Boolean(row.isPrime),
      specs: JSON.parse(row.specs || '[]')
    }));
    res.json(formatted);
  });
});

app.get('/api/cart', (req, res) => {
  db.all('SELECT * FROM cart_items', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map((r) => ({ ...r, isPrime: Boolean(r.isPrime) })));
  });
});

app.post('/api/cart', (req, res) => {
  const { id, title, price, image, isPrime, quantity = 1 } = req.body;
  db.get('SELECT * FROM cart_items WHERE id = ?', [id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing) {
      const nextQty = existing.quantity + quantity;
      db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [nextQty, id], (updateErr) => {
        if (updateErr) return res.status(500).json({ error: updateErr.message });
        res.json({ id, quantity: nextQty });
      });
    } else {
      db.run(
        'INSERT INTO cart_items (id, title, price, image, isPrime, quantity) VALUES (?, ?, ?, ?, ?, ?)',
        [id, title, price, image, isPrime ? 1 : 0, quantity],
        (insertErr) => {
          if (insertErr) return res.status(500).json({ error: insertErr.message });
          res.status(201).json({ id, quantity });
        }
      );
    }
  });
});

app.patch('/api/cart/:id', (req, res) => {
  const { delta } = req.body;
  const { id } = req.params;
  db.get('SELECT * FROM cart_items WHERE id = ?', [id], (err, item) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const nextQty = item.quantity + delta;
    if (nextQty <= 0) {
      db.run('DELETE FROM cart_items WHERE id = ?', [id], (delErr) => {
        if (delErr) return res.status(500).json({ error: delErr.message });
        res.json({ deleted: true, id });
      });
    } else {
      db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [nextQty, id], (updErr) => {
        if (updErr) return res.status(500).json({ error: updErr.message });
        res.json({ id, quantity: nextQty });
      });
    }
  });
});

app.delete('/api/cart/:id', (req, res) => {
  db.run('DELETE FROM cart_items WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: true });
  });
});

app.get('/api/wishlist', (req, res) => {
  db.all('SELECT * FROM wishlist_items', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/wishlist/toggle', (req, res) => {
  const { id, title, price, image, brand } = req.body;
  db.get('SELECT * FROM wishlist_items WHERE id = ?', [id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing) {
      db.run('DELETE FROM wishlist_items WHERE id = ?', [id], (delErr) => {
        if (delErr) return res.status(500).json({ error: delErr.message });
        res.json({ wishlisted: false, id });
      });
    } else {
      db.run(
        'INSERT INTO wishlist_items (id, title, price, image, brand) VALUES (?, ?, ?, ?, ?)',
        [id, title, price, image, brand],
        (insErr) => {
          if (insErr) return res.status(500).json({ error: insErr.message });
          res.json({ wishlisted: true, id });
        }
      );
    }
  });
});

app.get('/api/reviews', (req, res) => {
  db.all('SELECT * FROM reviews ORDER BY date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const grouped = {};
    rows.forEach((r) => {
      if (!grouped[r.productId]) grouped[r.productId] = [];
      grouped[r.productId].push(r);
    });
    res.json(grouped);
  });
});

app.post('/api/reviews', (req, res) => {
  const { id, productId, userName, rating, title, comment, date } = req.body;
  db.run(
    'INSERT INTO reviews (id, productId, userName, rating, title, comment, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, productId, userName, rating, title, comment, date],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json(req.body);
    }
  );
});

app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const parsed = rows.map((o) => ({
      ...o,
      items: JSON.parse(o.items || '[]'),
      shippingAddress: JSON.parse(o.shippingAddress || '{}')
    }));
    res.json(parsed.reverse());
  });
});

app.post('/api/orders', (req, res) => {
  const { id, date, items, total, shippingAddress, status } = req.body;
  db.run(
    'INSERT INTO orders (id, date, items, total, shippingAddress, status) VALUES (?, ?, ?, ?, ?, ?)',
    [id, date, JSON.stringify(items), total, JSON.stringify(shippingAddress), status],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.run('DELETE FROM cart_items', [], (clearErr) => {
        if (clearErr) return res.status(500).json({ error: clearErr.message });
        res.status(201).json(req.body);
      });
    }
  );
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Amazon.in server running at http://localhost:' + PORT);
});
`,
  'public/index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amazon.in | Online Shopping site in India</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="css/style.css">
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" src="js/app.js"></script>
</body>
</html>
`,
  'public/css/style.css': `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

body {
  font-family: "Amazon Ember", "Inter", Arial, sans-serif;
  background-color: #EAEDED;
  color: #0F1111;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

.hero-gradient {
  background: linear-gradient(to bottom, rgba(234, 237, 237, 0) 60%, rgba(234, 237, 237, 1) 100%);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.amazon-badge-clip {
  clip-path: polygon(0 0, 100% 0, 85% 100%, 0% 100%);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
`
};

for (const [relativePath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Created:', relativePath);
}

const appJsLines = [
  "const { useState, useEffect, useMemo } = React;",
  "",
  "const CATEGORIES = ['All', 'Electronics', 'Computers & Accessories', 'Home & Kitchen', 'Fashion', 'Books', 'Gaming', 'Watches & Wearables', 'Sports & Fitness'];",
  "",
  "const HERO_SLIDES = [",
  "  { id: 1, title: 'Great Indian Tech & Audio Sale', subtitle: 'Up to 40% off Sony headphones, Samsung OLED TVs, and smart gadgets.', bg: 'from-slate-900 via-blue-950 to-indigo-900', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&q=80', cta: 'Shop Electronics', category: 'Electronics' },",
  "  { id: 2, title: 'Kitchen & Home Appliances Fest', subtitle: 'Air fryers, espresso machines, and blenders with Prime 1-Day Delivery.', bg: 'from-amber-950 via-stone-900 to-neutral-900', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1600&q=80', cta: 'Explore Home & Kitchen', category: 'Home & Kitchen' },",
  "  { id: 3, title: 'Next-Gen Gaming Zone', subtitle: 'PS5 consoles, wireless headsets, and 160Hz gaming monitors in stock.', bg: 'from-purple-950 via-indigo-950 to-slate-900', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80', cta: 'Shop Gaming', category: 'Gaming' }",
  "];",
  "",
  "const StarRating = ({ rating, count, size = 'text-sm' }) => {",
  "  const fullStars = Math.floor(rating);",
  "  const hasHalfStar = rating % 1 >= 0.4;",
  "  return (",
  "    <div className='flex items-center space-x-1'>",
  "      <div className={'flex text-[#FFA41C] ' + size}>",
  "        {[...Array(5)].map((_, i) => {",
  "          if (i < fullStars) return <i key={i} className='fas fa-star'></i>;",
  "          if (i === fullStars && hasHalfStar) return <i key={i} className='fas fa-star-half-alt'></i>;",
  "          return <i key={i} className='far fa-star'></i>;",
  "        })}",
  "      </div>",
  "      {count !== undefined && (",
  "        <span className='text-xs text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer'>",
  "          {Number(count).toLocaleString('en-IN')}",
  "        </span>",
  "      )}",
  "    </div>",
  "  );",
  "};",
  "",
  "const PrimeBadge = () => (",
  "  <div className='inline-flex items-center select-none my-0.5'>",
  "    <span className='text-[#FFA41C] font-black italic text-xs mr-0.5'>✓</span>",
  "    <span className='text-[#00A8E1] font-extrabold tracking-tight text-xs'>prime</span>",
  "    <span className='text-[11px] text-gray-500 ml-1.5'>FREE Delivery</span>",
  "  </div>",
  ");",
  "",
  "const toINR = (val) => Math.round(Number(val) * 84);",
  "const formatINR = (val) => '₹' + toINR(val).toLocaleString('en-IN');",
  "",
  "const FALLBACK_IMG = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';",
  "const handleImgError = (e) => { if (e.target.src !== FALLBACK_IMG) e.target.src = FALLBACK_IMG; };",
  "",
  "function App() {",
  "  const [userName, setUserName] = useState(() => localStorage.getItem('amazon_user_name') || 'Guest');",
  "  const [deliveryLocation, setDeliveryLocation] = useState(() => localStorage.getItem('amazon_zip') || 'Bengaluru 560001');",
  "  const [products, setProducts] = useState([]);",
  "  const [loadingProducts, setLoadingProducts] = useState(true);",
  "  const [selectedCategory, setSelectedCategory] = useState('All');",
  "  const [searchQuery, setSearchQuery] = useState('');",
  "  const [searchDropdownCategory, setSearchDropdownCategory] = useState('All');",
  "  const [showSuggestions, setShowSuggestions] = useState(false);",
  "  const [sortBy, setSortBy] = useState('featured');",
  "  const [onlyPrime, setOnlyPrime] = useState(false);",
  "  const [minRating, setMinRating] = useState(0);",
  "  const [maxPrice, setMaxPrice] = useState(2500);",
  "  const [cart, setCart] = useState([]);",
  "  const [wishlist, setWishlist] = useState([]);",
  "  const [orders, setOrders] = useState([]);",
  "  const [reviews, setReviews] = useState({});",
  "  const [heroIndex, setHeroIndex] = useState(0);",
  "  const [activeModal, setActiveModal] = useState(null);",
  "  const [selectedProduct, setSelectedProduct] = useState(null);",
  "  const [showCartDrawer, setShowCartDrawer] = useState(false);",
  "  const [toast, setToast] = useState(null);",
  "  const [promoCode, setPromoCode] = useState('');",
  "  const [discountApplied, setDiscountApplied] = useState(false);",
  "  const [checkoutStep, setCheckoutStep] = useState(1);",
  "  const [shippingAddress, setShippingAddress] = useState({ fullName: 'Aarav Sharma', houseNo: 'Flat 402, Greenview Residency', street: '100 Feet Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', phone: '9845012345' });",
  "  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe / Paytm)');",
  "  const [upiId, setUpiId] = useState('');",
  "  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '' });",
  "  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });",
  "  const [authForm, setAuthForm] = useState({ name: '', email: '' });",
  "  const [zipInput, setZipInput] = useState('560001');",
  "",
  "  const triggerToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3200); };",
  "",
  "  const refreshBackendData = async () => {",
  "    try {",
  "      const [prodRes, cartRes, wishRes, revRes, ordRes] = await Promise.all([fetch('/api/products'), fetch('/api/cart'), fetch('/api/wishlist'), fetch('/api/reviews'), fetch('/api/orders')]);",
  "      const [prodData, cartData, wishData, revData, ordData] = await Promise.all([prodRes.json(), cartRes.json(), wishRes.json(), revRes.json(), ordRes.json()]);",
  "      setProducts(Array.isArray(prodData) ? prodData : []);",
  "      setCart(Array.isArray(cartData) ? cartData : []);",
  "      setWishlist(Array.isArray(wishData) ? wishData : []);",
  "      setReviews(revData && typeof revData === 'object' ? revData : {});",
  "      setOrders(Array.isArray(ordData) ? ordData : []);",
  "    } catch (err) { console.error(err); } finally { setLoadingProducts(false); }",
  "  };",
  "",
  "  useEffect(() => { refreshBackendData(); }, []);",
  "  useEffect(() => { const t = setInterval(() => setHeroIndex((p) => (p + 1) % HERO_SLIDES.length), 6000); return () => clearInterval(t); }, []);",
  "",
  "  const addToCart = async (product, qty = 1) => {",
  "    await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id, title: product.title, price: product.price, image: product.image, isPrime: product.isPrime, quantity: qty }) });",
  "    const res = await fetch('/api/cart'); setCart(await res.json());",
  "    triggerToast('Added \"' + product.title.slice(0, 30) + '...\" to Cart');",
  "  };",
  "",
  "  const updateCartQty = async (id, delta) => {",
  "    await fetch('/api/cart/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delta }) });",
  "    const res = await fetch('/api/cart'); setCart(await res.json());",
  "  };",
  "",
  "  const removeFromCart = async (id) => {",
  "    await fetch('/api/cart/' + id, { method: 'DELETE' });",
  "    const res = await fetch('/api/cart'); setCart(await res.json());",
  "    triggerToast('Item removed from Cart', 'info');",
  "  };",
  "",
  "  const toggleWishlist = async (product) => {",
  "    const res = await fetch('/api/wishlist/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id, title: product.title, price: product.price, image: product.image, brand: product.brand }) });",
  "    const data = await res.json();",
  "    const listRes = await fetch('/api/wishlist'); setWishlist(await listRes.json());",
  "    triggerToast(data.wishlisted ? 'Saved to Your Wish List' : 'Removed from Your Lists', data.wishlisted ? 'success' : 'info');",
  "  };",
  "",
  "  const cartSubtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);",
  "  const cartItemCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);",
  "  const finalTotal = useMemo(() => Math.max(0, cartSubtotal - (discountApplied ? cartSubtotal * 0.1 : 0)), [cartSubtotal, discountApplied]);",
  "",
  "  const handleApplyPromo = () => {",
  "    if (promoCode.trim().toUpperCase() === 'SAVE10') { setDiscountApplied(true); triggerToast('Promo code SAVE10 applied! 10% off.'); }",
  "    else { triggerToast('Try promo code: SAVE10', 'info'); }",
  "  };",
  "",
  "  const handlePlaceOrder = async () => {",
  "    const newOrder = {",
  "      id: '408-' + Math.floor(1000000 + Math.random() * 9000000) + '-' + Math.floor(1000000 + Math.random() * 9000000),",
  "      date: new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }),",
  "      items: [...cart],",
  "      total: toINR(finalTotal).toLocaleString('en-IN'),",
  "      shippingAddress: { ...shippingAddress, paymentMethod },",
  "      status: 'Arriving Tomorrow by 8 PM'",
  "    };",
  "    await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newOrder) });",
  "    const [ordRes, cartRes] = await Promise.all([fetch('/api/orders'), fetch('/api/cart')]);",
  "    setOrders(await ordRes.json()); setCart(await cartRes.json());",
  "    setDiscountApplied(false); setPromoCode(''); setCheckoutStep(1); setActiveModal('orders');",
  "    triggerToast('Order placed! Thank you for shopping on Amazon.in.');",
  "  };",
  "",
  "  const handleAddReview = async (e) => {",
  "    e.preventDefault();",
  "    if (!newReview.title.trim() || !newReview.comment.trim() || !selectedProduct) return;",
  "    const reviewObj = { id: Date.now().toString(), productId: selectedProduct.id, userName: userName === 'Guest' ? 'Amazon Customer' : userName, rating: Number(newReview.rating), title: newReview.title.trim(), comment: newReview.comment.trim(), date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) };",
  "    await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reviewObj) });",
  "    const revRes = await fetch('/api/reviews'); setReviews(await revRes.json());",
  "    setNewReview({ rating: 5, title: '', comment: '' }); triggerToast('Thank you! Your review has been posted.');",
  "  };",
  "",
  "  const filteredProducts = useMemo(() => {",
  "    return products.filter((p) => {",
  "      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;",
  "      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());",
  "      return matchesCat && matchesSearch && (!onlyPrime || p.isPrime) && p.rating >= minRating && p.price <= maxPrice;",
  "    }).sort((a, b) => {",
  "      if (sortBy === 'price-low') return a.price - b.price;",
  "      if (sortBy === 'price-high') return b.price - a.price;",
  "      if (sortBy === 'rating') return b.rating - a.rating;",
  "      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;",
  "      return 0;",
  "    });",
  "  }, [products, selectedCategory, searchQuery, onlyPrime, minRating, maxPrice, sortBy]);",
  "",
  "  const searchSuggestions = useMemo(() => !searchQuery.trim() ? [] : products.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6), [products, searchQuery]);",
  "",
  "  const handleSignInSubmit = (e) => {",
  "    e.preventDefault();",
  "    const chosenName = authForm.name.trim() || authForm.email.split('@')[0] || 'Valued Member';",
  "    setUserName(chosenName); localStorage.setItem('amazon_user_name', chosenName); setActiveModal(null);",
  "    triggerToast('Welcome back, ' + chosenName + '!');",
  "  };",
  "",
  "  return (",
  "    <div className='min-h-screen flex flex-col bg-[#EAEDED]'>",
  "      {toast && (",
  "        <div className='fixed bottom-5 right-5 z-[100] flex items-center space-x-3 bg-[#131921] text-white px-4 py-3 rounded-lg shadow-2xl border-l-4 border-[#FF9900]'>",
  "          <i className={'fas ' + (toast.type === 'info' ? 'fa-info-circle text-[#febd69]' : 'fa-check-circle text-emerald-400') + ' text-lg'}></i>",
  "          <span className='text-sm font-medium'>{toast.message}</span>",
  "        </div>",
  "      )}",
  "      <header className='sticky top-0 z-50 bg-[#131921] text-white select-none shadow-md'>",
  "        <div className='max-w-[1500px] mx-auto px-2 sm:px-4 h-[60px] flex items-center justify-between gap-2'>",
  "          <div onClick={() => { setSelectedCategory('All'); setSearchQuery(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className='flex items-center px-2 py-1.5 border border-transparent hover:border-white rounded cursor-pointer shrink-0'>",
  "            <div className='relative flex flex-col items-start leading-none'>",
  "              <span className='text-2xl font-extrabold tracking-tighter text-white'>amazon<span className='text-xs font-normal text-gray-300'>.in</span></span>",
  "              <svg className='w-16 h-3 -mt-1 text-[#FF9900]' viewBox='0 0 100 24' fill='none'><path d='M8 6C30 20 68 20 88 6' stroke='currentColor' strokeWidth='4.5' strokeLinecap='round' /><path d='M82 3L91 6L86 14' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' /></svg>",
  "            </div>",
  "          </div>",
  "          <div onClick={() => setActiveModal('location')} className='hidden md:flex items-center space-x-1 px-2 py-1.5 border border-transparent hover:border-white rounded cursor-pointer shrink-0'>",
  "            <i className='fas fa-map-marker-alt text-white mt-2 text-sm'></i>",
  "            <div className='leading-tight'><p className='text-[11px] text-gray-300'>Deliver to</p><p className='text-xs font-bold text-white'>{deliveryLocation}</p></div>",
  "          </div>",
  "          <div className='relative flex-1 max-w-3xl mx-1'>",
  "            <div className='flex h-10 rounded-md overflow-hidden focus-within:ring-3 focus-within:ring-[#FF9900]'>",
  "              <select value={searchDropdownCategory} onChange={(e) => { setSearchDropdownCategory(e.target.value); setSelectedCategory(e.target.value); }} className='hidden sm:block bg-[#E6E6E6] hover:bg-[#D4D4D4] text-gray-700 text-xs px-2.5 border-r border-gray-300 outline-none cursor-pointer max-w-[130px] truncate'>",
  "                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}",
  "              </select>",
  "              <input type='text' value={searchQuery} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} onChange={(e) => setSearchQuery(e.target.value)} placeholder='Search Amazon.in (40+ products)...' className='w-full px-3 text-sm text-gray-900 bg-white outline-none' />",
  "              <button onClick={() => setShowSuggestions(false)} className='bg-[#FEBD69] hover:bg-[#F3A847] text-[#131921] px-4 flex items-center justify-center transition'><i className='fas fa-search text-lg'></i></button>",
  "            </div>",
  "            {showSuggestions && searchSuggestions.length > 0 && (",
  "              <div className='absolute left-0 right-0 top-11 bg-white text-gray-900 rounded-md shadow-xl border border-gray-200 z-50 overflow-hidden'>",
  "                {searchSuggestions.map((item) => (",
  "                  <div key={item.id} onMouseDown={() => { setSelectedProduct(item); setActiveModal('product'); setShowSuggestions(false); }} className='flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-none'>",
  "                    <span className='text-sm font-medium truncate'>{item.title}</span>",
  "                    <span className='text-xs font-bold text-[#B12704] ml-2 shrink-0'>{formatINR(item.price)}</span>",
  "                  </div>",
  "                ))}",
  "              </div>",
  "            )}",
  "          </div>",
  "          <div onClick={() => setActiveModal('auth')} className='hidden sm:flex flex-col justify-center px-2 py-1.5 border border-transparent hover:border-white rounded cursor-pointer leading-tight shrink-0'>",
  "            <span className='text-[11px] text-gray-200'>Hello, {userName}</span>",
  "            <span className='text-xs font-bold'>Account & Lists</span>",
  "          </div>",
  "          <div onClick={() => setActiveModal('wishlist')} className='hidden lg:flex flex-col justify-center px-2 py-1.5 border border-transparent hover:border-white rounded cursor-pointer leading-tight shrink-0'>",
  "            <span className='text-[11px] text-gray-200'>Saved</span>",
  "            <span className='text-xs font-bold'>Wish List ({wishlist.length})</span>",
  "          </div>",
  "          <div onClick={() => setActiveModal('orders')} className='hidden sm:flex flex-col justify-center px-2 py-1.5 border border-transparent hover:border-white rounded cursor-pointer leading-tight shrink-0'>",
  "            <span className='text-[11px] text-gray-200'>Returns</span>",
  "            <span className='text-xs font-bold'>& Orders</span>",
  "          </div>",
  "          <div onClick={() => setShowCartDrawer(true)} className='flex items-end px-2 py-1.5 border border-transparent hover:border-white rounded cursor-pointer shrink-0 relative'>",
  "            <div className='relative flex items-center'>",
  "              <i className='fas fa-shopping-cart text-2xl sm:text-3xl text-white'></i>",
  "              <span className='absolute -top-2 left-3.5 bg-[#131921] px-1 rounded-full text-[#FF9900] font-extrabold text-sm leading-none'>{cartItemCount}</span>",
  "            </div>",
  "            <span className='hidden md:inline text-xs font-bold ml-1 mb-0.5'>Cart</span>",
  "          </div>",
  "        </div>",
  "        <nav className='bg-[#232F3E] text-white text-xs sm:text-sm px-2 sm:px-4 h-10 flex items-center space-x-1 overflow-x-auto no-scrollbar'>",
  "          {CATEGORIES.map((category) => (",
  "            <button key={category} onClick={() => setSelectedCategory(category)} className={'px-2.5 py-1.5 rounded whitespace-nowrap border transition ' + (selectedCategory === category ? 'border-white font-bold bg-[#37475A]' : 'border-transparent hover:border-white')}>",
  "              {category === 'All' ? <span className='flex items-center font-bold'><i className='fas fa-bars mr-1.5'></i> All</span> : category}",
  "            </button>",
  "          ))}",
  "        </nav>",
  "      </header>",
  "      {selectedCategory === 'All' && !searchQuery && (",
  "        <section className='relative max-w-[1500px] mx-auto w-full overflow-hidden'>",
  "          <div className='relative h-[280px] sm:h-[380px] md:h-[430px] w-full'>",
  "            {HERO_SLIDES.map((slide, idx) => (",
  "              <div key={slide.id} className={'absolute inset-0 transition-opacity duration-700 ' + (idx === heroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none')}>",
  "                <img src={slide.image} alt={slide.title} onError={handleImgError} className='w-full h-full object-cover object-center brightness-75' />",
  "                <div className={'absolute inset-0 bg-gradient-to-r ' + slide.bg + ' opacity-65'}></div>",
  "                <div className='absolute inset-0 hero-gradient'></div>",
  "                <div className='absolute top-8 sm:top-14 left-6 sm:left-16 max-w-xl text-white z-20'>",
  "                  <span className='inline-block bg-[#FF9900] text-[#131921] text-xs font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider mb-2'>Great Indian Festival</span>",
  "                  <h2 className='text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight drop-shadow'>{slide.title}</h2>",
  "                  <p className='text-xs sm:text-base text-gray-200 mt-2 mb-4 drop-shadow'>{slide.subtitle}</p>",
  "                  <button onClick={() => setSelectedCategory(slide.category)} className='bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md transition'>{slide.cta}</button>",
  "                </div>",
  "              </div>",
  "            ))}",
  "          </div>",
  "          <div className='relative z-20 -mt-16 sm:-mt-28 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5'>",
  "            <div className='bg-white p-5 rounded shadow-sm flex flex-col justify-between'>",
  "              <h3 className='text-lg font-bold text-[#0F1111] mb-3'>Up to 60% off | Gaming</h3>",
  "              <div className='grid grid-cols-2 gap-2.5 mb-3'>",
  "                <div onClick={() => setSelectedCategory('Gaming')} className='cursor-pointer group'><img src='https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&q=80' alt='PS5' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>PS5 Consoles</span></div>",
  "                <div onClick={() => setSelectedCategory('Gaming')} className='cursor-pointer group'><img src='https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=300&q=80' alt='Switch' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>Handhelds</span></div>",
  "                <div onClick={() => setSelectedCategory('Gaming')} className='cursor-pointer group'><img src='https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&q=80' alt='Headset' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>Headsets</span></div>",
  "                <div onClick={() => setSelectedCategory('Gaming')} className='cursor-pointer group'><img src='https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=300&q=80' alt='VR' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>VR Reality</span></div>",
  "              </div>",
  "              <button onClick={() => setSelectedCategory('Gaming')} className='text-xs font-semibold text-[#007185] hover:underline text-left cursor-pointer'>See all gaming offers</button>",
  "            </div>",
  "            <div className='bg-white p-5 rounded shadow-sm flex flex-col justify-between'>",
  "              <h3 className='text-lg font-bold text-[#0F1111] mb-3'>Appliances for your home</h3>",
  "              <div className='grid grid-cols-2 gap-2.5 mb-3'>",
  "                <div onClick={() => setSelectedCategory('Home & Kitchen')} className='cursor-pointer'><img src='https://images.unsplash.com/photo-1585515320310-259814833e62?w=300&q=80' alt='Air Fryer' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>Air Fryers</span></div>",
  "                <div onClick={() => setSelectedCategory('Home & Kitchen')} className='cursor-pointer'><img src='https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=300&q=80' alt='Espresso' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>Coffee Makers</span></div>",
  "                <div onClick={() => setSelectedCategory('Home & Kitchen')} className='cursor-pointer'><img src='https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=300&q=80' alt='Vacuum' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>Robot Vacuums</span></div>",
  "                <div onClick={() => setSelectedCategory('Home & Kitchen')} className='cursor-pointer'><img src='https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=300&q=80' alt='Blender' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>Smart Blenders</span></div>",
  "              </div>",
  "              <button onClick={() => setSelectedCategory('Home & Kitchen')} className='text-xs font-semibold text-[#007185] hover:underline text-left cursor-pointer'>Explore Home & Kitchen</button>",
  "            </div>",
  "            <div className='bg-white p-5 rounded shadow-sm flex flex-col justify-between'>",
  "              <h3 className='text-lg font-bold text-[#0F1111] mb-3'>Work & Study Upgrades</h3>",
  "              <div className='grid grid-cols-2 gap-2.5 mb-3'>",
  "                <div onClick={() => setSelectedCategory('Computers & Accessories')} className='cursor-pointer'><img src='https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=80' alt='MacBook' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>MacBooks</span></div>",
  "                <div onClick={() => setSelectedCategory('Computers & Accessories')} className='cursor-pointer'><img src='https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&q=80' alt='Monitors' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>4K Monitors</span></div>",
  "                <div onClick={() => setSelectedCategory('Computers & Accessories')} className='cursor-pointer'><img src='https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80' alt='Keyboards' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>Keyboards</span></div>",
  "                <div onClick={() => setSelectedCategory('Computers & Accessories')} className='cursor-pointer'><img src='https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&q=80' alt='SSD' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>External SSDs</span></div>",
  "              </div>",
  "              <button onClick={() => setSelectedCategory('Computers & Accessories')} className='text-xs font-semibold text-[#007185] hover:underline text-left cursor-pointer'>Shop Computers</button>",
  "            </div>",
  "            <div className='flex flex-col gap-4 justify-between'>",
  "              <div className='bg-white p-5 rounded shadow-sm'>",
  "                <h3 className='text-base font-bold text-[#0F1111] mb-2.5'>{userName === 'Guest' ? 'Sign in for your best experience' : 'Welcome back, ' + userName}</h3>",
  "                <button onClick={() => setActiveModal(userName === 'Guest' ? 'auth' : 'orders')} className='w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-xs py-2 rounded-full shadow-2xs cursor-pointer'>{userName === 'Guest' ? 'Sign in securely' : 'View Your Orders'}</button>",
  "              </div>",
  "              <div className='bg-white p-4 rounded shadow-sm flex-1 flex flex-col justify-between'>",
  "                <h4 className='text-sm font-bold text-[#0F1111] mb-2'>Blockbuster Deal of the Day</h4>",
  "                <img src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' alt='Deal' onError={handleImgError} onClick={() => setSelectedCategory('Electronics')} className='w-full h-28 object-contain bg-gray-50 rounded cursor-pointer' />",
  "                <button onClick={() => setSelectedCategory('Electronics')} className='text-xs font-semibold text-[#007185] hover:underline text-left mt-2 cursor-pointer'>See all tech deals</button>",
  "              </div>",
  "            </div>",
  "          </div>",
  "          <div className='px-4 mb-6'>",
  "            <div className='bg-white p-5 rounded shadow-sm border border-gray-200/80'>",
  "              <div className='flex items-center justify-between mb-3'>",
  "                <h3 className='text-lg font-bold text-[#0F1111]'>Today's Deals in ₹</h3>",
  "                <button onClick={() => setSortBy('price-low')} className='text-xs font-semibold text-[#007185] hover:underline cursor-pointer'>See all deals</button>",
  "              </div>",
  "              <div className='flex gap-4 overflow-x-auto no-scrollbar pb-2'>",
  "                {products.filter((p) => p.originalPrice > p.price).slice(0, 12).map((deal) => {",
  "                  const pct = Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);",
  "                  return (",
  "                    <div key={deal.id} onClick={() => { setSelectedProduct(deal); setActiveModal('product'); }} className='min-w-[185px] max-w-[185px] bg-[#F7F8F8] hover:bg-gray-100 rounded p-3 border border-gray-200/70 cursor-pointer shrink-0 flex flex-col justify-between transition'>",
  "                      <div className='h-32 flex items-center justify-center mb-2'><img src={deal.image} alt={deal.title} onError={handleImgError} className='max-h-full max-w-full object-contain' /></div>",
  "                      <div>",
  "                        <span className='bg-[#CC0C39] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-xs'>{pct}% off</span>",
  "                        <p className='text-xs font-bold text-[#0F1111] mt-1'>{formatINR(deal.price)}</p>",
  "                        <p className='text-[11px] text-gray-600 truncate'>{deal.title}</p>",
  "                      </div>",
  "                    </div>",
  "                  );",
  "                })}",
  "              </div>",
  "            </div>",
  "          </div>",
  "        </section>",
  "      )}",
  "      <main className='max-w-[1500px] mx-auto w-full px-4 py-4 flex-1'>",
  "        <div className='bg-white px-4 py-3 rounded shadow-sm mb-5 flex flex-wrap items-center justify-between gap-3 border border-gray-200'>",
  "          <div className='text-sm text-gray-700'>Showing <span className='font-bold text-[#0F1111]'>{filteredProducts.length}</span> of <span className='font-bold'>{products.length}</span> results</div>",
  "          <div className='flex items-center space-x-3'>",
  "            <label className='text-xs font-semibold text-gray-600'>Sort by:</label>",
  "            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className='bg-[#F0F2F2] border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-800 outline-none cursor-pointer'>",
  "              <option value='featured'>Featured</option>",
  "              <option value='price-low'>Price: Low to High</option>",
  "              <option value='price-high'>Price: High to Low</option>",
  "              <option value='rating'>Avg. Customer Review</option>",
  "              <option value='reviews'>Most Reviewed</option>",
  "            </select>",
  "          </div>",
  "        </div>",
  "        <div className='flex flex-col lg:flex-row gap-6'>",
  "          <aside className='w-full lg:w-64 shrink-0 space-y-5 bg-white p-4 rounded shadow-sm h-fit border border-gray-200'>",
  "            <div>",
  "              <h4 className='font-bold text-sm mb-2'>Delivery</h4>",
  "              <label className='flex items-center space-x-2 cursor-pointer text-sm'>",
  "                <input type='checkbox' checked={onlyPrime} onChange={(e) => setOnlyPrime(e.target.checked)} className='rounded text-[#FF9900]' />",
  "                <span className='text-[#00A8E1] font-extrabold italic'>✓prime</span>",
  "                <span className='text-xs text-gray-600'>Eligible</span>",
  "              </label>",
  "            </div>",
  "            <hr />",
  "            <div>",
  "              <h4 className='font-bold text-sm mb-2'>Department</h4>",
  "              <ul className='space-y-1.5 text-xs'>",
  "                {CATEGORIES.map((cat) => (<li key={cat}><button onClick={() => setSelectedCategory(cat)} className={'text-left hover:text-[#C7511F] transition ' + (selectedCategory === cat ? 'font-extrabold text-[#C7511F]' : 'text-gray-700')}>{cat}</button></li>))}",
  "              </ul>",
  "            </div>",
  "            <hr />",
  "            <div>",
  "              <div className='flex justify-between items-center mb-1'><h4 className='font-bold text-sm'>Max Price</h4><span className='text-xs font-bold text-[#B12704]'>{formatINR(maxPrice)}</span></div>",
  "              <input type='range' min='20' max='2500' step='10' value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className='w-full accent-[#FF9900] cursor-pointer' />",
  "            </div>",
  "          </aside>",
  "          <div className='flex-1'>",
  "            {loadingProducts ? <div className='bg-white p-12 rounded text-center text-sm text-gray-500'>Loading products...</div> : (",
  "              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5'>",
  "                {filteredProducts.map((product) => {",
  "                  const isWishlisted = wishlist.some((w) => w.id === product.id);",
  "                  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);",
  "                  return (",
  "                    <div key={product.id} className='bg-white rounded border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between overflow-hidden relative group'>",
  "                      {product.badge && <span className='absolute top-0 left-0 z-10 bg-[#C7511F] text-white text-[11px] font-bold px-2.5 py-1 amazon-badge-clip'>{product.badge}</span>}",
  "                      <button onClick={() => toggleWishlist(product)} className='absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center transition'><i className={isWishlisted ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-500'}></i></button>",
  "                      <div onClick={() => { setSelectedProduct(product); setActiveModal('product'); }} className='h-52 bg-gray-50 p-4 flex items-center justify-center cursor-pointer overflow-hidden'>",
  "                        <img src={product.image} alt={product.title} onError={handleImgError} className='max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300' />",
  "                      </div>",
  "                      <div className='p-4 flex-1 flex flex-col justify-between'>",
  "                        <div>",
  "                          <span className='text-[11px] uppercase tracking-wider text-gray-400 font-semibold'>{product.brand}</span>",
  "                          <h3 onClick={() => { setSelectedProduct(product); setActiveModal('product'); }} className='text-sm font-medium text-[#0F1111] hover:text-[#C7511F] cursor-pointer line-clamp-2 mt-0.5 mb-1.5 leading-snug'>{product.title}</h3>",
  "                          <StarRating rating={product.rating} count={product.reviewCount} />",
  "                          <div className='mt-2 flex items-baseline space-x-2'>",
  "                            <span className='text-xl font-bold text-[#0F1111]'><sup className='text-xs font-normal mr-0.5'>₹</sup>{toINR(product.price).toLocaleString('en-IN')}</span>",
  "                            {product.originalPrice > product.price && (<><span className='text-xs text-gray-500 line-through'>{formatINR(product.originalPrice)}</span><span className='text-xs font-bold text-[#CC0C39]'>({discountPercent}% off)</span></>)}",
  "                          </div>",
  "                          {product.isPrime && <PrimeBadge />}",
  "                        </div>",
  "                        <div className='mt-4 space-y-2'>",
  "                          <button onClick={() => addToCart(product)} className='w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-xs font-semibold py-2 rounded-full shadow-xs transition cursor-pointer'>Add to Cart</button>",
  "                          <button onClick={() => { addToCart(product); setCheckoutStep(1); setActiveModal('checkout'); }} className='w-full bg-[#FFA41C] hover:bg-[#FA8900] text-[#0F1111] text-xs font-semibold py-2 rounded-full shadow-xs transition cursor-pointer'>Buy Now</button>",
  "                        </div>",
  "                      </div>",
  "                    </div>",
  "                  );",
  "                })}",
  "              </div>",
  "            )}",
  "          </div>",
  "        </div>",
  "      </main>",
  "      {showCartDrawer && (",
  "        <div className='fixed inset-0 z-50 flex justify-end bg-black/60'>",
  "          <div className='bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl'>",
  "            <div className='p-4 bg-[#232F3E] text-white flex items-center justify-between'><h2 className='text-lg font-bold'>Shopping Cart ({cartItemCount})</h2><button onClick={() => setShowCartDrawer(false)} className='text-gray-300 hover:text-white text-xl'><i className='fas fa-times'></i></button></div>",
  "            <div className='flex-1 overflow-y-auto p-4 space-y-4'>",
  "              {cart.length === 0 ? <div className='text-center py-16'><p className='text-sm text-gray-600'>Your Amazon Cart is empty</p></div> : cart.map((item) => (",
  "                <div key={item.id} className='flex gap-3 pb-4 border-b items-center'>",
  "                  <img src={item.image} alt={item.title} onError={handleImgError} className='w-20 h-20 object-contain bg-gray-50 rounded p-1' />",
  "                  <div className='flex-1'>",
  "                    <h4 className='text-xs font-bold text-gray-900 line-clamp-2'>{item.title}</h4>",
  "                    <p className='text-sm font-extrabold text-[#B12704] mt-1'>{formatINR(item.price * item.quantity)}</p>",
  "                    <div className='flex items-center space-x-3 mt-2'>",
  "                      <div className='flex items-center border rounded-full bg-[#F0F2F2]'><button onClick={() => updateCartQty(item.id, -1)} className='px-2.5 py-0.5 text-sm font-bold'>-</button><span className='px-2.5 text-xs font-bold'>{item.quantity}</span><button onClick={() => updateCartQty(item.id, 1)} className='px-2.5 py-0.5 text-sm font-bold'>+</button></div>",
  "                      <button onClick={() => removeFromCart(item.id)} className='text-xs text-[#007185] hover:underline'>Delete</button>",
  "                    </div>",
  "                  </div>",
  "                </div>",
  "              ))}",
  "            </div>",
  "            {cart.length > 0 && (",
  "              <div className='p-4 bg-gray-50 border-t space-y-3'>",
  "                <div className='flex space-x-2'><input type='text' value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder='Promo code (try SAVE10)' className='flex-1 border rounded px-3 py-1.5 text-xs' /><button onClick={handleApplyPromo} className='bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-xs font-bold'>Apply</button></div>",
  "                <div className='flex justify-between text-base font-extrabold'><span>Order Total:</span><span className='text-[#B12704]'>{formatINR(finalTotal)}</span></div>",
  "                <button onClick={() => { setShowCartDrawer(false); setCheckoutStep(1); setActiveModal('checkout'); }} className='w-full bg-[#FFD814] hover:bg-[#F7CA00] py-2.5 rounded-full font-bold text-sm'>Proceed to Buy</button>",
  "              </div>",
  "            )}",
  "          </div>",
  "        </div>",
  "      )}",
  "      {activeModal === 'product' && selectedProduct && (",
  "        <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto'>",
  "          <div className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative'>",
  "            <button onClick={() => setActiveModal(null)} className='absolute top-4 right-4 text-gray-500 hover:text-black text-xl'><i className='fas fa-times'></i></button>",
  "            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>",
  "              <div className='bg-gray-50 rounded-lg p-6 flex items-center justify-center'><img src={selectedProduct.image} alt={selectedProduct.title} onError={handleImgError} className='max-h-80 object-contain' /></div>",
  "              <div>",
  "                <h2 className='text-xl font-bold'>{selectedProduct.title}</h2>",
  "                <div className='mt-2'><StarRating rating={selectedProduct.rating} count={selectedProduct.reviewCount} /></div>",
  "                <p className='text-2xl font-extrabold text-[#B12704] mt-3'>{formatINR(selectedProduct.price)}</p>",
  "                <p className='text-sm text-gray-700 mt-3'>{selectedProduct.description}</p>",
  "                <button onClick={() => { addToCart(selectedProduct); setActiveModal(null); }} className='mt-5 w-full bg-[#FFD814] hover:bg-[#F7CA00] py-2.5 rounded-full font-bold text-sm'>Add to Cart</button>",
  "              </div>",
  "            </div>",
  "            <hr className='my-6' />",
  "            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>",
  "              <form onSubmit={handleAddReview} className='space-y-3 bg-gray-50 p-4 rounded-lg border'>",
  "                <h3 className='text-base font-bold'>Write a Customer Review</h3>",
  "                <select value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })} className='w-full border rounded px-3 py-1.5 text-sm bg-white'><option value='5'>5 Stars</option><option value='4'>4 Stars</option><option value='3'>3 Stars</option><option value='2'>2 Stars</option><option value='1'>1 Star</option></select>",
  "                <input type='text' required value={newReview.title} onChange={(e) => setNewReview({ ...newReview, title: e.target.value })} placeholder='Headline' className='w-full border rounded px-3 py-1.5 text-sm' />",
  "                <textarea required rows='3' value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} placeholder='Your review...' className='w-full border rounded px-3 py-1.5 text-sm'></textarea>",
  "                <button type='submit' className='bg-[#FFD814] hover:bg-[#F7CA00] px-5 py-2 rounded-full text-xs font-bold'>Submit Review</button>",
  "              </form>",
  "              <div className='space-y-3 max-h-60 overflow-y-auto'>",
  "                {(reviews[selectedProduct.id] || []).map((rev) => (<div key={rev.id} className='border-b pb-2'><StarRating rating={rev.rating} size='text-xs' /><p className='text-xs font-bold mt-1'>{rev.title}</p><p className='text-xs text-gray-600'>{rev.comment}</p></div>))}",
  "              </div>",
  "            </div>",
  "          </div>",
  "        </div>",
  "      )}",
  "      {activeModal === 'checkout' && (",
  "        <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto'>",
  "          <div className='bg-[#EAEDED] rounded-lg max-w-4xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative border border-gray-300'>",
  "            <button onClick={() => setActiveModal(null)} className='absolute top-4 right-4 w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center shadow-xs cursor-pointer'><i className='fas fa-times'></i></button>",
  "            <div className='flex items-center justify-between border-b border-gray-300 pb-3 mb-5 pr-8'>",
  "              <div className='flex items-center gap-2'><span className='text-xl font-extrabold text-[#131921]'>amazon<span className='text-xs font-normal text-gray-600'>.in</span></span><span className='text-lg font-bold'>Checkout</span></div>",
  "              <div className='flex items-center gap-2 text-xs font-bold'><span className={checkoutStep === 1 ? 'text-[#C7511F]' : 'text-emerald-700'}>1. Address</span><span>→</span><span className={checkoutStep === 2 ? 'text-[#C7511F]' : checkoutStep > 2 ? 'text-emerald-700' : 'text-gray-400'}>2. Payment</span><span>→</span><span className={checkoutStep === 3 ? 'text-[#C7511F]' : 'text-gray-400'}>3. Finish</span></div>",
  "            </div>",
  "            <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>",
  "              <div className='lg:col-span-2 space-y-4'>",
  "                <div className='bg-white p-4 rounded border border-gray-200'>",
  "                  <div className='flex items-center justify-between mb-2.5'>",
  "                    <h3 className='text-sm font-extrabold text-[#C7511F]'>1. Delivery Address & Pincode</h3>",
  "                    {checkoutStep > 1 && <button onClick={() => setCheckoutStep(1)} className='text-xs font-semibold text-[#007185] hover:underline cursor-pointer'>Change</button>}",
  "                  </div>",
  "                  {checkoutStep === 1 ? (",
  "                    <div className='space-y-3 text-xs'>",
  "                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>",
  "                        <div><label className='block font-bold mb-1'>Full name</label><input type='text' value={shippingAddress.fullName} onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })} className='w-full border rounded px-3 py-2' /></div>",
  "                        <div><label className='block font-bold mb-1'>Mobile number</label><input type='text' value={shippingAddress.phone} onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })} className='w-full border rounded px-3 py-2' /></div>",
  "                        <div><label className='block font-bold mb-1'>6-digit Pincode</label><input type='text' maxLength='6' value={shippingAddress.pincode} onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })} className='w-full border rounded px-3 py-2' /></div>",
  "                        <div><label className='block font-bold mb-1'>Flat / House No. / Building</label><input type='text' value={shippingAddress.houseNo} onChange={(e) => setShippingAddress({ ...shippingAddress, houseNo: e.target.value })} className='w-full border rounded px-3 py-2' /></div>",
  "                        <div><label className='block font-bold mb-1'>Area / Street / Sector</label><input type='text' value={shippingAddress.street} onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })} className='w-full border rounded px-3 py-2' /></div>",
  "                        <div className='grid grid-cols-2 gap-2'><div><label className='block font-bold mb-1'>City</label><input type='text' value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} className='w-full border rounded px-3 py-2' /></div><div><label className='block font-bold mb-1'>State</label><input type='text' value={shippingAddress.state} onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })} className='w-full border rounded px-3 py-2' /></div></div>",
  "                      </div>",
  "                      <button onClick={() => { if (!shippingAddress.fullName.trim() || !shippingAddress.pincode.trim()) { triggerToast('Enter name and 6-digit pincode', 'info'); return; } setCheckoutStep(2); }} className='bg-[#FFD814] hover:bg-[#F7CA00] font-bold px-5 py-2 rounded-full text-xs cursor-pointer'>Use this address</button>",
  "                    </div>",
  "                  ) : (",
  "                    <div className='text-xs text-gray-700'><p className='font-bold text-[#0F1111]'>{shippingAddress.fullName} ({shippingAddress.phone})</p><p>{shippingAddress.houseNo}, {shippingAddress.street}</p><p>{shippingAddress.city}, {shippingAddress.state} - <span className='font-bold'>{shippingAddress.pincode}</span></p></div>",
  "                  )}",
  "                </div>",
  "                <div className={'bg-white p-4 rounded border border-gray-200 ' + (checkoutStep < 2 ? 'opacity-60 pointer-events-none' : '')}>",
  "                  <div className='flex items-center justify-between mb-3'><h3 className='text-sm font-extrabold text-[#C7511F]'>2. Payment method</h3>{checkoutStep === 3 && <button onClick={() => setCheckoutStep(2)} className='text-xs font-semibold text-[#007185] hover:underline cursor-pointer'>Change</button>}</div>",
  "                  {checkoutStep === 2 && (",
  "                    <div className='space-y-2.5'>",
  "                      {['UPI (Google Pay / PhonePe / Paytm)', 'Credit or debit card', 'Net Banking', 'Cash on Delivery / Pay on Delivery'].map((label) => (",
  "                        <label key={label} onClick={() => setPaymentMethod(label)} className={'flex items-center gap-3 p-3 rounded border cursor-pointer ' + (paymentMethod === label ? 'border-[#C7511F] bg-[#FFF8F2]' : 'border-gray-200')}>",
  "                          <input type='radio' name='payMethod' checked={paymentMethod === label} onChange={() => setPaymentMethod(label)} className='accent-[#C7511F]' />",
  "                          <span className='text-xs font-bold'>{label}</span>",
  "                        </label>",
  "                      ))}",
  "                      {paymentMethod === 'UPI (Google Pay / PhonePe / Paytm)' && <input type='text' value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder='Enter UPI ID (e.g. aarav@okicici)' className='w-full border rounded px-3 py-1.5 text-xs' />}",
  "                      {paymentMethod === 'Credit or debit card' && <div className='grid grid-cols-2 gap-2'><input type='text' value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })} placeholder='Card Number' className='border rounded px-3 py-1.5 text-xs' /><input type='text' value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} placeholder='MM/YY • CVV' className='border rounded px-3 py-1.5 text-xs' /></div>}",
  "                      <button onClick={() => setCheckoutStep(3)} className='bg-[#FFD814] hover:bg-[#F7CA00] font-bold px-5 py-2 rounded-full text-xs cursor-pointer'>Use this payment method</button>",
  "                    </div>",
  "                  )}",
  "                  {checkoutStep === 3 && <p className='text-xs font-bold text-emerald-700'>Selected: {paymentMethod}</p>}",
  "                </div>",
  "                <div className={'bg-white p-4 rounded border border-gray-200 ' + (checkoutStep < 3 ? 'opacity-60 pointer-events-none' : '')}>",
  "                  <h3 className='text-sm font-extrabold text-[#C7511F] mb-2'>3. Review items and finish</h3>",
  "                  <div className='space-y-2'>{cart.map((item) => (<div key={item.id} className='flex items-center justify-between text-xs border-b pb-1.5'><span className='truncate max-w-xs font-medium'>{item.title} (x{item.quantity})</span><span className='font-bold text-[#B12704]'>{formatINR(item.price * item.quantity)}</span></div>))}</div>",
  "                </div>",
  "              </div>",
  "              <div className='bg-white p-4 rounded border border-gray-200 h-fit space-y-3'>",
  "                {checkoutStep < 3 ? <button onClick={() => setCheckoutStep(checkoutStep + 1)} className='w-full bg-[#FFD814] hover:bg-[#F7CA00] py-2.5 rounded-full font-bold text-xs cursor-pointer'>{checkoutStep === 1 ? 'Continue to Payment' : 'Continue to Review'}</button> : <button onClick={handlePlaceOrder} disabled={cart.length === 0} className='w-full bg-[#FFD814] hover:bg-[#F7CA00] py-2.5 rounded-full font-bold text-xs cursor-pointer'>Place Your Order & Finish</button>}",
  "                <hr />",
  "                <div className='flex justify-between text-xs'><span>Items ({cartItemCount}):</span><span>{formatINR(cartSubtotal)}</span></div>",
  "                <div className='flex justify-between text-xs'><span>Delivery:</span><span className='text-emerald-700 font-bold'>FREE</span></div>",
  "                <div className='flex justify-between font-extrabold text-base text-[#B12704] border-t pt-2'><span>Order Total:</span><span>{formatINR(finalTotal)}</span></div>",
  "              </div>",
  "            </div>",
  "          </div>",
  "        </div>",
  "      )}",
  "      {activeModal === 'orders' && (",
  "        <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto'>",
  "          <div className='bg-white rounded-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative'>",
  "            <button onClick={() => setActiveModal(null)} className='absolute top-4 right-4 text-gray-500 text-xl'><i className='fas fa-times'></i></button>",
  "            <h2 className='text-2xl font-bold mb-4'>Your Orders</h2>",
  "            {orders.length === 0 ? <p className='text-sm text-gray-500'>No orders placed yet.</p> : (",
  "              <div className='space-y-4'>",
  "                {orders.map((order) => (<div key={order.id} className='border rounded-lg p-4'><div className='flex justify-between text-xs text-gray-600 mb-2'><span>Order #{order.id}</span><span className='font-bold text-[#B12704]'>₹{order.total}</span></div><p className='text-xs font-bold text-emerald-700'>{order.status}</p>{order.shippingAddress && order.shippingAddress.pincode && <p className='text-[11px] text-gray-500 mt-1'>Delivering to {order.shippingAddress.fullName} — Pincode {order.shippingAddress.pincode}</p>}</div>))}",
  "              </div>",
  "            )}",
  "          </div>",
  "        </div>",
  "      )}",
  "      {activeModal === 'wishlist' && (",
  "        <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4'>",
  "          <div className='bg-white rounded-lg max-w-xl w-full p-6 shadow-2xl relative'>",
  "            <button onClick={() => setActiveModal(null)} className='absolute top-4 right-4 text-gray-500 text-xl'><i className='fas fa-times'></i></button>",
  "            <h2 className='text-xl font-bold mb-4'>Your Wish List ({wishlist.length})</h2>",
  "            <div className='space-y-3'>{wishlist.map((item) => (<div key={item.id} className='flex items-center justify-between border-b pb-2'><span className='text-xs font-bold'>{item.title}</span><button onClick={() => addToCart(item)} className='bg-[#FFD814] px-3 py-1 rounded-full text-xs font-bold'>Add to Cart</button></div>))}</div>",
  "          </div>",
  "        </div>",
  "      )}",
  "      {activeModal === 'auth' && (",
  "        <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4'>",
  "          <div className='bg-white rounded-lg max-w-sm w-full p-6 shadow-2xl relative'>",
  "            <button onClick={() => setActiveModal(null)} className='absolute top-3 right-3 text-gray-500'><i className='fas fa-times'></i></button>",
  "            <h2 className='text-2xl font-normal mb-4'>Sign in</h2>",
  "            <form onSubmit={handleSignInSubmit} className='space-y-3'>",
  "              <input type='text' required value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} placeholder='Your Name' className='w-full border rounded px-3 py-1.5 text-sm' />",
  "              <input type='email' required value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} placeholder='you@example.com' className='w-full border rounded px-3 py-1.5 text-sm' />",
  "              <button type='submit' className='w-full bg-[#FFD814] hover:bg-[#F7CA00] py-2 rounded-lg text-sm font-bold'>Continue</button>",
  "            </form>",
  "          </div>",
  "        </div>",
  "      )}",
  "      {activeModal === 'location' && (",
  "        <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4'>",
  "          <div className='bg-white rounded-lg max-w-sm w-full p-5 shadow-2xl'>",
  "            <h3 className='font-bold text-sm mb-3'>Choose your location</h3>",
  "            <div className='flex space-x-2'>",
  "              <input type='text' maxLength='6' placeholder='Enter 6-digit pincode' value={zipInput} onChange={(e) => setZipInput(e.target.value)} className='flex-1 border rounded px-3 py-1.5 text-sm' />",
  "              <button onClick={() => { const loc = 'India ' + zipInput; setDeliveryLocation(loc); localStorage.setItem('amazon_zip', loc); setActiveModal(null); triggerToast('Delivery pincode updated to ' + zipInput); }} className='bg-[#FFD814] px-4 py-1.5 rounded-full text-xs font-bold'>Apply</button>",
  "            </div>",
  "          </div>",
  "        </div>",
  "      )}",
  "      <footer className='mt-12 bg-[#232F3E] text-white'>",
  "        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className='w-full bg-[#37475A] hover:bg-[#485769] py-3.5 text-xs font-semibold text-center'>Back to top</button>",
  "        <div className='bg-[#131921] py-6 text-center text-xs text-gray-400'><div className='text-lg font-extrabold text-white mb-1'>amazon<span className='text-xs font-normal text-gray-400'>.in</span></div><p>© 1996-2026, Amazon.com, Inc. or its affiliates. All rights reserved.</p></div>",
  "      </footer>",
  "    </div>",
  "  );",
  "}",
  "",
  "const root = ReactDOM.createRoot(document.getElementById('root'));",
  "root.render(<App />);"
];

const appJsPath = path.join(__dirname, 'public', 'js', 'app.js');
fs.mkdirSync(path.dirname(appJsPath), { recursive: true });
fs.writeFileSync(appJsPath, appJsLines.join('\n'), 'utf8');
console.log('Created: public/js/app.js');
console.log('\\nSetup complete! Run:');
console.log('  npm install');
console.log('  npm start');