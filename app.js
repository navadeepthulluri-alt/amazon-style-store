const { useState, useEffect, useMemo } = React;

const CATEGORIES = ['All', 'Electronics', 'Computers & Accessories', 'Home & Kitchen', 'Fashion', 'Books', 'Gaming', 'Watches & Wearables', 'Sports & Fitness'];

const HERO_SLIDES = [
  { id: 1, title: 'Great Indian Tech & Audio Sale', subtitle: 'Up to 40% off Sony headphones, Samsung OLED TVs, and smart gadgets.', bg: 'from-slate-900 via-blue-950 to-indigo-900', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&q=80', cta: 'Shop Electronics', category: 'Electronics' },
  { id: 2, title: 'Kitchen & Home Appliances Fest', subtitle: 'Air fryers, espresso machines, and blenders with Prime 1-Day Delivery.', bg: 'from-amber-950 via-stone-900 to-neutral-900', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1600&q=80', cta: 'Explore Home & Kitchen', category: 'Home & Kitchen' },
  { id: 3, title: 'Next-Gen Gaming Zone', subtitle: 'PS5 consoles, wireless headsets, and 160Hz gaming monitors in stock.', bg: 'from-purple-950 via-indigo-950 to-slate-900', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80', cta: 'Shop Gaming', category: 'Gaming' }
];

const StarRating = ({ rating, count, size = 'text-sm' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4;
  return (
    <div className='flex items-center space-x-1'>
      <div className={'flex text-[#FFA41C] ' + size}>
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) return <i key={i} className='fas fa-star'></i>;
          if (i === fullStars && hasHalfStar) return <i key={i} className='fas fa-star-half-alt'></i>;
          return <i key={i} className='far fa-star'></i>;
        })}
      </div>
      {count !== undefined && (
        <span className='text-xs text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer'>
          {Number(count).toLocaleString('en-IN')}
        </span>
      )}
    </div>
  );
};

const PrimeBadge = () => (
  <div className='inline-flex items-center select-none my-0.5'>
    <span className='text-[#FFA41C] font-black italic text-xs mr-0.5'>✓</span>
    <span className='text-[#00A8E1] font-extrabold tracking-tight text-xs'>prime</span>
    <span className='text-[11px] text-gray-500 ml-1.5'>FREE Delivery</span>
  </div>
);

const toINR = (val) => Math.round(Number(val) * 84);
const formatINR = (val) => '₹' + toINR(val).toLocaleString('en-IN');

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
const handleImgError = (e) => { if (e.target.src !== FALLBACK_IMG) e.target.src = FALLBACK_IMG; };

function App() {
  const [userName, setUserName] = useState(() => localStorage.getItem('amazon_user_name') || 'Guest');
  const [deliveryLocation, setDeliveryLocation] = useState(() => localStorage.getItem('amazon_zip') || 'Bengaluru 560001');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdownCategory, setSearchDropdownCategory] = useState('All');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [onlyPrime, setOnlyPrime] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2500);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState({});
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [toast, setToast] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({ fullName: 'Aarav Sharma', houseNo: 'Flat 402, Greenview Residency', street: '100 Feet Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', phone: '9845012345' });
  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe / Paytm)');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '' });
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [authForm, setAuthForm] = useState({ name: '', email: '' });
  const [zipInput, setZipInput] = useState('560001');

  const triggerToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3200); };

  const refreshBackendData = async () => {
    try {
      const [prodRes, cartRes, wishRes, revRes, ordRes] = await Promise.all([fetch('/api/products'), fetch('/api/cart'), fetch('/api/wishlist'), fetch('/api/reviews'), fetch('/api/orders')]);
      const [prodData, cartData, wishData, revData, ordData] = await Promise.all([prodRes.json(), cartRes.json(), wishRes.json(), revRes.json(), ordRes.json()]);
      setProducts(Array.isArray(prodData) ? prodData : []);
      setCart(Array.isArray(cartData) ? cartData : []);
      setWishlist(Array.isArray(wishData) ? wishData : []);
      setReviews(revData && typeof revData === 'object' ? revData : {});
      setOrders(Array.isArray(ordData) ? ordData : []);
    } catch (err) { console.error(err); } finally { setLoadingProducts(false); }
  };

  useEffect(() => { refreshBackendData(); }, []);
  useEffect(() => { const t = setInterval(() => setHeroIndex((p) => (p + 1) % HERO_SLIDES.length), 6000); return () => clearInterval(t); }, []);

  const addToCart = async (product, qty = 1) => {
    await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id, title: product.title, price: product.price, image: product.image, isPrime: product.isPrime, quantity: qty }) });
    const res = await fetch('/api/cart'); setCart(await res.json());
    triggerToast('Added "' + product.title.slice(0, 30) + '..." to Cart');
  };

  const updateCartQty = async (id, delta) => {
    await fetch('/api/cart/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delta }) });
    const res = await fetch('/api/cart'); setCart(await res.json());
  };

  const removeFromCart = async (id) => {
    await fetch('/api/cart/' + id, { method: 'DELETE' });
    const res = await fetch('/api/cart'); setCart(await res.json());
    triggerToast('Item removed from Cart', 'info');
  };

  const toggleWishlist = async (product) => {
    const res = await fetch('/api/wishlist/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id, title: product.title, price: product.price, image: product.image, brand: product.brand }) });
    const data = await res.json();
    const listRes = await fetch('/api/wishlist'); setWishlist(await listRes.json());
    triggerToast(data.wishlisted ? 'Saved to Your Wish List' : 'Removed from Your Lists', data.wishlisted ? 'success' : 'info');
  };

  const cartSubtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
  const finalTotal = useMemo(() => Math.max(0, cartSubtotal - (discountApplied ? cartSubtotal * 0.1 : 0)), [cartSubtotal, discountApplied]);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'SAVE10') { setDiscountApplied(true); triggerToast('Promo code SAVE10 applied! 10% off.'); }
    else { triggerToast('Try promo code: SAVE10', 'info'); }
  };

  const handlePlaceOrder = async () => {
    const newOrder = {
      id: '408-' + Math.floor(1000000 + Math.random() * 9000000) + '-' + Math.floor(1000000 + Math.random() * 9000000),
      date: new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }),
      items: [...cart],
      total: toINR(finalTotal).toLocaleString('en-IN'),
      shippingAddress: { ...shippingAddress, paymentMethod },
      status: 'Arriving Tomorrow by 8 PM'
    };
    await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newOrder) });
    const [ordRes, cartRes] = await Promise.all([fetch('/api/orders'), fetch('/api/cart')]);
    setOrders(await ordRes.json()); setCart(await cartRes.json());
    setDiscountApplied(false); setPromoCode(''); setCheckoutStep(1); setActiveModal('orders');
    triggerToast('Order placed! Thank you for shopping on Amazon.in.');
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.title.trim() || !newReview.comment.trim() || !selectedProduct) return;
    const reviewObj = { id: Date.now().toString(), productId: selectedProduct.id, userName: userName === 'Guest' ? 'Amazon Customer' : userName, rating: Number(newReview.rating), title: newReview.title.trim(), comment: newReview.comment.trim(), date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) };
    await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reviewObj) });
    const revRes = await fetch('/api/reviews'); setReviews(await revRes.json());
    setNewReview({ rating: 5, title: '', comment: '' }); triggerToast('Thank you! Your review has been posted.');
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch && (!onlyPrime || p.isPrime) && p.rating >= minRating && p.price <= maxPrice;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
      return 0;
    });
  }, [products, selectedCategory, searchQuery, onlyPrime, minRating, maxPrice, sortBy]);

  const searchSuggestions = useMemo(() => !searchQuery.trim() ? [] : products.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6), [products, searchQuery]);

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    const chosenName = authForm.name.trim() || authForm.email.split('@')[0] || 'Valued Member';
    setUserName(chosenName); localStorage.setItem('amazon_user_name', chosenName); setActiveModal(null);
    triggerToast('Welcome back, ' + chosenName + '!');
  };

  return (
    <div className='min-h-screen flex flex-col bg-[#EAEDED]'>
      {toast && (
        <div className='fixed bottom-5 right-5 z-[100] flex items-center space-x-3 bg-[#131921] text-white px-4 py-3 rounded-lg shadow-2xl border-l-4 border-[#FF9900]'>
          <i className={'fas ' + (toast.type === 'info' ? 'fa-info-circle text-[#febd69]' : 'fa-check-circle text-emerald-400') + ' text-lg'}></i>
          <span className='text-sm font-medium'>{toast.message}</span>
        </div>
      )}
      <header className='sticky top-0 z-50 bg-[#131921] text-white select-none shadow-md'>
        <div className='max-w-[1500px] mx-auto px-2 sm:px-4 h-[60px] flex items-center justify-between gap-2'>
          <div onClick={() => { setSelectedCategory('All'); setSearchQuery(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className='flex items-center px-2 py-1.5 border border-transparent hover:border-white rounded cursor-pointer shrink-0'>
            <div className='relative flex flex-col items-start leading-none'>
              <span className='text-2xl font-extrabold tracking-tighter text-white'>amazon<span className='text-xs font-normal text-gray-300'>.in</span></span>
              <svg className='w-16 h-3 -mt-1 text-[#FF9900]' viewBox='0 0 100 24' fill='none'><path d='M8 6C30 20 68 20 88 6' stroke='currentColor' strokeWidth='4.5' strokeLinecap='round' /><path d='M82 3L91 6L86 14' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' /></svg>
            </div>
          </div>
          <div onClick={() => setActiveModal('location')} className='hidden md:flex items-center space-x-1 px-2 py-1.5 border border-transparent hover:border-white rounded cursor-pointer shrink-0'>
            <i className='fas fa-map-marker-alt text-white mt-2 text-sm'></i>
            <div className='leading-tight'><p className='text-[11px] text-gray-300'>Deliver to</p><p className='text-xs font-bold text-white'>{deliveryLocation}</p></div>
          </div>
          <div className='relative flex-1 max-w-3xl mx-1'>
            <div className='flex h-10 rounded-md overflow-hidden focus-within:ring-3 focus-within:ring-[#FF9900]'>
              <select value={searchDropdownCategory} onChange={(e) => { setSearchDropdownCategory(e.target.value); setSelectedCategory(e.target.value); }} className='hidden sm:block bg-[#E6E6E6] hover:bg-[#D4D4D4] text-gray-700 text-xs px-2.5 border-r border-gray-300 outline-none cursor-pointer max-w-[130px] truncate'>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input type='text' value={searchQuery} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} onChange={(e) => setSearchQuery(e.target.value)} placeholder='Search Amazon.in (40+ products)...' className='w-full px-3 text-sm text-gray-900 bg-white outline-none' />
              <button onClick={() => setShowSuggestions(false)} className='bg-[#FEBD69] hover:bg-[#F3A847] text-[#131921] px-4 flex items-center justify-center transition'><i className='fas fa-search text-lg'></i></button>
            </div>
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className='absolute left-0 right-0 top-11 bg-white text-gray-900 rounded-md shadow-xl border border-gray-200 z-50 overflow-hidden'>
                {searchSuggestions.map((item) => (
                  <div key={item.id} onMouseDown={() => { setSelectedProduct(item); setActiveModal('product'); setShowSuggestions(false); }} className='flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-none'>
                    <span className='text-sm font-medium truncate'>{item.title}</span>
                    <span className='text-xs font-bold text-[#B12704] ml-2 shrink-0'>{formatINR(item.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div onClick={() => setActiveModal('auth')} className='hidden sm:flex flex-col justify-center px-2 py-1.5 border border-transparent hover:border-white rounded cursor-pointer leading-tight shrink-0'>
            <span className='text-[11px] text-gray-200'>Hello, {userName}</span>
            <span className='text-xs font-bold'>Account & Lists</span>
          </div>
          <div onClick={() => setActiveModal('wishlist')} className='hidden lg:flex flex-col justify-center px-2 py-1.5 border border-transparent hover:border-white rounded cursor-pointer leading-tight shrink-0'>
            <span className='text-[11px] text-gray-200'>Saved</span>
            <span className='text-xs font-bold'>Wish List ({wishlist.length})</span>
          </div>
          <div onClick={() => setActiveModal('orders')} className='hidden sm:flex flex-col justify-center px-2 py-1.5 border border-transparent hover:border-white rounded cursor-pointer leading-tight shrink-0'>
            <span className='text-[11px] text-gray-200'>Returns</span>
            <span className='text-xs font-bold'>& Orders</span>
          </div>
          <div onClick={() => setShowCartDrawer(true)} className='flex items-end px-2 py-1.5 border border-transparent hover:border-white rounded cursor-pointer shrink-0 relative'>
            <div className='relative flex items-center'>
              <i className='fas fa-shopping-cart text-2xl sm:text-3xl text-white'></i>
              <span className='absolute -top-2 left-3.5 bg-[#131921] px-1 rounded-full text-[#FF9900] font-extrabold text-sm leading-none'>{cartItemCount}</span>
            </div>
            <span className='hidden md:inline text-xs font-bold ml-1 mb-0.5'>Cart</span>
          </div>
        </div>
        <nav className='bg-[#232F3E] text-white text-xs sm:text-sm px-2 sm:px-4 h-10 flex items-center space-x-1 overflow-x-auto no-scrollbar'>
          {CATEGORIES.map((category) => (
            <button key={category} onClick={() => setSelectedCategory(category)} className={'px-2.5 py-1.5 rounded whitespace-nowrap border transition ' + (selectedCategory === category ? 'border-white font-bold bg-[#37475A]' : 'border-transparent hover:border-white')}>
              {category === 'All' ? <span className='flex items-center font-bold'><i className='fas fa-bars mr-1.5'></i> All</span> : category}
            </button>
          ))}
        </nav>
      </header>
      {selectedCategory === 'All' && !searchQuery && (
        <section className='relative max-w-[1500px] mx-auto w-full overflow-hidden'>
          <div className='relative h-[280px] sm:h-[380px] md:h-[430px] w-full'>
            {HERO_SLIDES.map((slide, idx) => (
              <div key={slide.id} className={'absolute inset-0 transition-opacity duration-700 ' + (idx === heroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none')}>
                <img src={slide.image} alt={slide.title} onError={handleImgError} className='w-full h-full object-cover object-center brightness-75' />
                <div className={'absolute inset-0 bg-gradient-to-r ' + slide.bg + ' opacity-65'}></div>
                <div className='absolute inset-0 hero-gradient'></div>
                <div className='absolute top-8 sm:top-14 left-6 sm:left-16 max-w-xl text-white z-20'>
                  <span className='inline-block bg-[#FF9900] text-[#131921] text-xs font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider mb-2'>Great Indian Festival</span>
                  <h2 className='text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight drop-shadow'>{slide.title}</h2>
                  <p className='text-xs sm:text-base text-gray-200 mt-2 mb-4 drop-shadow'>{slide.subtitle}</p>
                  <button onClick={() => setSelectedCategory(slide.category)} className='bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md transition'>{slide.cta}</button>
                </div>
              </div>
            ))}
          </div>
          <div className='relative z-20 -mt-16 sm:-mt-28 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5'>
            <div className='bg-white p-5 rounded shadow-sm flex flex-col justify-between'>
              <h3 className='text-lg font-bold text-[#0F1111] mb-3'>Up to 60% off | Gaming</h3>
              <div className='grid grid-cols-2 gap-2.5 mb-3'>
                <div onClick={() => setSelectedCategory('Gaming')} className='cursor-pointer group'><img src='https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&q=80' alt='PS5' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>PS5 Consoles</span></div>
                <div onClick={() => setSelectedCategory('Gaming')} className='cursor-pointer group'><img src='https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=300&q=80' alt='Switch' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>Handhelds</span></div>
                <div onClick={() => setSelectedCategory('Gaming')} className='cursor-pointer group'><img src='https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&q=80' alt='Headset' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>Headsets</span></div>
                <div onClick={() => setSelectedCategory('Gaming')} className='cursor-pointer group'><img src='https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=300&q=80' alt='VR' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>VR Reality</span></div>
              </div>
              <button onClick={() => setSelectedCategory('Gaming')} className='text-xs font-semibold text-[#007185] hover:underline text-left cursor-pointer'>See all gaming offers</button>
            </div>
            <div className='bg-white p-5 rounded shadow-sm flex flex-col justify-between'>
              <h3 className='text-lg font-bold text-[#0F1111] mb-3'>Appliances for your home</h3>
              <div className='grid grid-cols-2 gap-2.5 mb-3'>
                <div onClick={() => setSelectedCategory('Home & Kitchen')} className='cursor-pointer'><img src='https://images.unsplash.com/photo-1585515320310-259814833e62?w=300&q=80' alt='Air Fryer' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>Air Fryers</span></div>
                <div onClick={() => setSelectedCategory('Home & Kitchen')} className='cursor-pointer'><img src='https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=300&q=80' alt='Espresso' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>Coffee Makers</span></div>
                <div onClick={() => setSelectedCategory('Home & Kitchen')} className='cursor-pointer'><img src='https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=300&q=80' alt='Vacuum' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>Robot Vacuums</span></div>
                <div onClick={() => setSelectedCategory('Home & Kitchen')} className='cursor-pointer'><img src='https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=300&q=80' alt='Blender' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>Smart Blenders</span></div>
              </div>
              <button onClick={() => setSelectedCategory('Home & Kitchen')} className='text-xs font-semibold text-[#007185] hover:underline text-left cursor-pointer'>Explore Home & Kitchen</button>
            </div>
            <div className='bg-white p-5 rounded shadow-sm flex flex-col justify-between'>
              <h3 className='text-lg font-bold text-[#0F1111] mb-3'>Work & Study Upgrades</h3>
              <div className='grid grid-cols-2 gap-2.5 mb-3'>
                <div onClick={() => setSelectedCategory('Computers & Accessories')} className='cursor-pointer'><img src='https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=80' alt='MacBook' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>MacBooks</span></div>
                <div onClick={() => setSelectedCategory('Computers & Accessories')} className='cursor-pointer'><img src='https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&q=80' alt='Monitors' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>4K Monitors</span></div>
                <div onClick={() => setSelectedCategory('Computers & Accessories')} className='cursor-pointer'><img src='https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80' alt='Keyboards' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>Keyboards</span></div>
                <div onClick={() => setSelectedCategory('Computers & Accessories')} className='cursor-pointer'><img src='https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&q=80' alt='SSD' onError={handleImgError} className='w-full h-24 object-cover rounded' /><span className='text-[11px] text-gray-700'>External SSDs</span></div>
              </div>
              <button onClick={() => setSelectedCategory('Computers & Accessories')} className='text-xs font-semibold text-[#007185] hover:underline text-left cursor-pointer'>Shop Computers</button>
            </div>
            <div className='flex flex-col gap-4 justify-between'>
              <div className='bg-white p-5 rounded shadow-sm'>
                <h3 className='text-base font-bold text-[#0F1111] mb-2.5'>{userName === 'Guest' ? 'Sign in for your best experience' : 'Welcome back, ' + userName}</h3>
                <button onClick={() => setActiveModal(userName === 'Guest' ? 'auth' : 'orders')} className='w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-xs py-2 rounded-full shadow-2xs cursor-pointer'>{userName === 'Guest' ? 'Sign in securely' : 'View Your Orders'}</button>
              </div>
              <div className='bg-white p-4 rounded shadow-sm flex-1 flex flex-col justify-between'>
                <h4 className='text-sm font-bold text-[#0F1111] mb-2'>Blockbuster Deal of the Day</h4>
                <img src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' alt='Deal' onError={handleImgError} onClick={() => setSelectedCategory('Electronics')} className='w-full h-28 object-contain bg-gray-50 rounded cursor-pointer' />
                <button onClick={() => setSelectedCategory('Electronics')} className='text-xs font-semibold text-[#007185] hover:underline text-left mt-2 cursor-pointer'>See all tech deals</button>
              </div>
            </div>
          </div>
          <div className='px-4 mb-6'>
            <div className='bg-white p-5 rounded shadow-sm border border-gray-200/80'>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='text-lg font-bold text-[#0F1111]'>Today's Deals in ₹</h3>
                <button onClick={() => setSortBy('price-low')} className='text-xs font-semibold text-[#007185] hover:underline cursor-pointer'>See all deals</button>
              </div>
              <div className='flex gap-4 overflow-x-auto no-scrollbar pb-2'>
                {products.filter((p) => p.originalPrice > p.price).slice(0, 12).map((deal) => {
                  const pct = Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);
                  return (
                    <div key={deal.id} onClick={() => { setSelectedProduct(deal); setActiveModal('product'); }} className='min-w-[185px] max-w-[185px] bg-[#F7F8F8] hover:bg-gray-100 rounded p-3 border border-gray-200/70 cursor-pointer shrink-0 flex flex-col justify-between transition'>
                      <div className='h-32 flex items-center justify-center mb-2'><img src={deal.image} alt={deal.title} onError={handleImgError} className='max-h-full max-w-full object-contain' /></div>
                      <div>
                        <span className='bg-[#CC0C39] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-xs'>{pct}% off</span>
                        <p className='text-xs font-bold text-[#0F1111] mt-1'>{formatINR(deal.price)}</p>
                        <p className='text-[11px] text-gray-600 truncate'>{deal.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}
      <main className='max-w-[1500px] mx-auto w-full px-4 py-4 flex-1'>
        <div className='bg-white px-4 py-3 rounded shadow-sm mb-5 flex flex-wrap items-center justify-between gap-3 border border-gray-200'>
          <div className='text-sm text-gray-700'>Showing <span className='font-bold text-[#0F1111]'>{filteredProducts.length}</span> of <span className='font-bold'>{products.length}</span> results</div>
          <div className='flex items-center space-x-3'>
            <label className='text-xs font-semibold text-gray-600'>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className='bg-[#F0F2F2] border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-800 outline-none cursor-pointer'>
              <option value='featured'>Featured</option>
              <option value='price-low'>Price: Low to High</option>
              <option value='price-high'>Price: High to Low</option>
              <option value='rating'>Avg. Customer Review</option>
              <option value='reviews'>Most Reviewed</option>
            </select>
          </div>
        </div>
        <div className='flex flex-col lg:flex-row gap-6'>
          <aside className='w-full lg:w-64 shrink-0 space-y-5 bg-white p-4 rounded shadow-sm h-fit border border-gray-200'>
            <div>
              <h4 className='font-bold text-sm mb-2'>Delivery</h4>
              <label className='flex items-center space-x-2 cursor-pointer text-sm'>
                <input type='checkbox' checked={onlyPrime} onChange={(e) => setOnlyPrime(e.target.checked)} className='rounded text-[#FF9900]' />
                <span className='text-[#00A8E1] font-extrabold italic'>✓prime</span>
                <span className='text-xs text-gray-600'>Eligible</span>
              </label>
            </div>
            <hr />
            <div>
              <h4 className='font-bold text-sm mb-2'>Department</h4>
              <ul className='space-y-1.5 text-xs'>
                {CATEGORIES.map((cat) => (<li key={cat}><button onClick={() => setSelectedCategory(cat)} className={'text-left hover:text-[#C7511F] transition ' + (selectedCategory === cat ? 'font-extrabold text-[#C7511F]' : 'text-gray-700')}>{cat}</button></li>))}
              </ul>
            </div>
            <hr />
            <div>
              <div className='flex justify-between items-center mb-1'><h4 className='font-bold text-sm'>Max Price</h4><span className='text-xs font-bold text-[#B12704]'>{formatINR(maxPrice)}</span></div>
              <input type='range' min='20' max='2500' step='10' value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className='w-full accent-[#FF9900] cursor-pointer' />
            </div>
          </aside>
          <div className='flex-1'>
            {loadingProducts ? <div className='bg-white p-12 rounded text-center text-sm text-gray-500'>Loading products...</div> : (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5'>
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlist.some((w) => w.id === product.id);
                  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                  return (
                    <div key={product.id} className='bg-white rounded border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between overflow-hidden relative group'>
                      {product.badge && <span className='absolute top-0 left-0 z-10 bg-[#C7511F] text-white text-[11px] font-bold px-2.5 py-1 amazon-badge-clip'>{product.badge}</span>}
                      <button onClick={() => toggleWishlist(product)} className='absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center transition'><i className={isWishlisted ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-500'}></i></button>
                      <div onClick={() => { setSelectedProduct(product); setActiveModal('product'); }} className='h-52 bg-gray-50 p-4 flex items-center justify-center cursor-pointer overflow-hidden'>
                        <img src={product.image} alt={product.title} onError={handleImgError} className='max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300' />
                      </div>
                      <div className='p-4 flex-1 flex flex-col justify-between'>
                        <div>
                          <span className='text-[11px] uppercase tracking-wider text-gray-400 font-semibold'>{product.brand}</span>
                          <h3 onClick={() => { setSelectedProduct(product); setActiveModal('product'); }} className='text-sm font-medium text-[#0F1111] hover:text-[#C7511F] cursor-pointer line-clamp-2 mt-0.5 mb-1.5 leading-snug'>{product.title}</h3>
                          <StarRating rating={product.rating} count={product.reviewCount} />
                          <div className='mt-2 flex items-baseline space-x-2'>
                            <span className='text-xl font-bold text-[#0F1111]'><sup className='text-xs font-normal mr-0.5'>₹</sup>{toINR(product.price).toLocaleString('en-IN')}</span>
                            {product.originalPrice > product.price && (<><span className='text-xs text-gray-500 line-through'>{formatINR(product.originalPrice)}</span><span className='text-xs font-bold text-[#CC0C39]'>({discountPercent}% off)</span></>)}
                          </div>
                          {product.isPrime && <PrimeBadge />}
                        </div>
                        <div className='mt-4 space-y-2'>
                          <button onClick={() => addToCart(product)} className='w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-xs font-semibold py-2 rounded-full shadow-xs transition cursor-pointer'>Add to Cart</button>
                          <button onClick={() => { addToCart(product); setCheckoutStep(1); setActiveModal('checkout'); }} className='w-full bg-[#FFA41C] hover:bg-[#FA8900] text-[#0F1111] text-xs font-semibold py-2 rounded-full shadow-xs transition cursor-pointer'>Buy Now</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      {showCartDrawer && (
        <div className='fixed inset-0 z-50 flex justify-end bg-black/60'>
          <div className='bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl'>
            <div className='p-4 bg-[#232F3E] text-white flex items-center justify-between'><h2 className='text-lg font-bold'>Shopping Cart ({cartItemCount})</h2><button onClick={() => setShowCartDrawer(false)} className='text-gray-300 hover:text-white text-xl'><i className='fas fa-times'></i></button></div>
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
              {cart.length === 0 ? <div className='text-center py-16'><p className='text-sm text-gray-600'>Your Amazon Cart is empty</p></div> : cart.map((item) => (
                <div key={item.id} className='flex gap-3 pb-4 border-b items-center'>
                  <img src={item.image} alt={item.title} onError={handleImgError} className='w-20 h-20 object-contain bg-gray-50 rounded p-1' />
                  <div className='flex-1'>
                    <h4 className='text-xs font-bold text-gray-900 line-clamp-2'>{item.title}</h4>
                    <p className='text-sm font-extrabold text-[#B12704] mt-1'>{formatINR(item.price * item.quantity)}</p>
                    <div className='flex items-center space-x-3 mt-2'>
                      <div className='flex items-center border rounded-full bg-[#F0F2F2]'><button onClick={() => updateCartQty(item.id, -1)} className='px-2.5 py-0.5 text-sm font-bold'>-</button><span className='px-2.5 text-xs font-bold'>{item.quantity}</span><button onClick={() => updateCartQty(item.id, 1)} className='px-2.5 py-0.5 text-sm font-bold'>+</button></div>
                      <button onClick={() => removeFromCart(item.id)} className='text-xs text-[#007185] hover:underline'>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className='p-4 bg-gray-50 border-t space-y-3'>
                <div className='flex space-x-2'><input type='text' value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder='Promo code (try SAVE10)' className='flex-1 border rounded px-3 py-1.5 text-xs' /><button onClick={handleApplyPromo} className='bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-xs font-bold'>Apply</button></div>
                <div className='flex justify-between text-base font-extrabold'><span>Order Total:</span><span className='text-[#B12704]'>{formatINR(finalTotal)}</span></div>
                <button onClick={() => { setShowCartDrawer(false); setCheckoutStep(1); setActiveModal('checkout'); }} className='w-full bg-[#FFD814] hover:bg-[#F7CA00] py-2.5 rounded-full font-bold text-sm'>Proceed to Buy</button>
              </div>
            )}
          </div>
        </div>
      )}
      {activeModal === 'product' && selectedProduct && (
        <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto'>
          <div className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative'>
            <button onClick={() => setActiveModal(null)} className='absolute top-4 right-4 text-gray-500 hover:text-black text-xl'><i className='fas fa-times'></i></button>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='bg-gray-50 rounded-lg p-6 flex items-center justify-center'><img src={selectedProduct.image} alt={selectedProduct.title} onError={handleImgError} className='max-h-80 object-contain' /></div>
              <div>
                <h2 className='text-xl font-bold'>{selectedProduct.title}</h2>
                <div className='mt-2'><StarRating rating={selectedProduct.rating} count={selectedProduct.reviewCount} /></div>
                <p className='text-2xl font-extrabold text-[#B12704] mt-3'>{formatINR(selectedProduct.price)}</p>
                <p className='text-sm text-gray-700 mt-3'>{selectedProduct.description}</p>
                <button onClick={() => { addToCart(selectedProduct); setActiveModal(null); }} className='mt-5 w-full bg-[#FFD814] hover:bg-[#F7CA00] py-2.5 rounded-full font-bold text-sm'>Add to Cart</button>
              </div>
            </div>
            <hr className='my-6' />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <form onSubmit={handleAddReview} className='space-y-3 bg-gray-50 p-4 rounded-lg border'>
                <h3 className='text-base font-bold'>Write a Customer Review</h3>
                <select value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })} className='w-full border rounded px-3 py-1.5 text-sm bg-white'><option value='5'>5 Stars</option><option value='4'>4 Stars</option><option value='3'>3 Stars</option><option value='2'>2 Stars</option><option value='1'>1 Star</option></select>
                <input type='text' required value={newReview.title} onChange={(e) => setNewReview({ ...newReview, title: e.target.value })} placeholder='Headline' className='w-full border rounded px-3 py-1.5 text-sm' />
                <textarea required rows='3' value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} placeholder='Your review...' className='w-full border rounded px-3 py-1.5 text-sm'></textarea>
                <button type='submit' className='bg-[#FFD814] hover:bg-[#F7CA00] px-5 py-2 rounded-full text-xs font-bold'>Submit Review</button>
              </form>
              <div className='space-y-3 max-h-60 overflow-y-auto'>
                {(reviews[selectedProduct.id] || []).map((rev) => (<div key={rev.id} className='border-b pb-2'><StarRating rating={rev.rating} size='text-xs' /><p className='text-xs font-bold mt-1'>{rev.title}</p><p className='text-xs text-gray-600'>{rev.comment}</p></div>))}
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === 'checkout' && (
        <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto'>
          <div className='bg-[#EAEDED] rounded-lg max-w-4xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative border border-gray-300'>
            <button onClick={() => setActiveModal(null)} className='absolute top-4 right-4 w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center shadow-xs cursor-pointer'><i className='fas fa-times'></i></button>
            <div className='flex items-center justify-between border-b border-gray-300 pb-3 mb-5 pr-8'>
              <div className='flex items-center gap-2'><span className='text-xl font-extrabold text-[#131921]'>amazon<span className='text-xs font-normal text-gray-600'>.in</span></span><span className='text-lg font-bold'>Checkout</span></div>
              <div className='flex items-center gap-2 text-xs font-bold'><span className={checkoutStep === 1 ? 'text-[#C7511F]' : 'text-emerald-700'}>1. Address</span><span>→</span><span className={checkoutStep === 2 ? 'text-[#C7511F]' : checkoutStep > 2 ? 'text-emerald-700' : 'text-gray-400'}>2. Payment</span><span>→</span><span className={checkoutStep === 3 ? 'text-[#C7511F]' : 'text-gray-400'}>3. Finish</span></div>
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
              <div className='lg:col-span-2 space-y-4'>
                <div className='bg-white p-4 rounded border border-gray-200'>
                  <div className='flex items-center justify-between mb-2.5'>
                    <h3 className='text-sm font-extrabold text-[#C7511F]'>1. Delivery Address & Pincode</h3>
                    {checkoutStep > 1 && <button onClick={() => setCheckoutStep(1)} className='text-xs font-semibold text-[#007185] hover:underline cursor-pointer'>Change</button>}
                  </div>
                  {checkoutStep === 1 ? (
                    <div className='space-y-3 text-xs'>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
                        <div><label className='block font-bold mb-1'>Full name</label><input type='text' value={shippingAddress.fullName} onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })} className='w-full border rounded px-3 py-2' /></div>
                        <div><label className='block font-bold mb-1'>Mobile number</label><input type='text' value={shippingAddress.phone} onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })} className='w-full border rounded px-3 py-2' /></div>
                        <div><label className='block font-bold mb-1'>6-digit Pincode</label><input type='text' maxLength='6' value={shippingAddress.pincode} onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })} className='w-full border rounded px-3 py-2' /></div>
                        <div><label className='block font-bold mb-1'>Flat / House No. / Building</label><input type='text' value={shippingAddress.houseNo} onChange={(e) => setShippingAddress({ ...shippingAddress, houseNo: e.target.value })} className='w-full border rounded px-3 py-2' /></div>
                        <div><label className='block font-bold mb-1'>Area / Street / Sector</label><input type='text' value={shippingAddress.street} onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })} className='w-full border rounded px-3 py-2' /></div>
                        <div className='grid grid-cols-2 gap-2'><div><label className='block font-bold mb-1'>City</label><input type='text' value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} className='w-full border rounded px-3 py-2' /></div><div><label className='block font-bold mb-1'>State</label><input type='text' value={shippingAddress.state} onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })} className='w-full border rounded px-3 py-2' /></div></div>
                      </div>
                      <button onClick={() => { if (!shippingAddress.fullName.trim() || !shippingAddress.pincode.trim()) { triggerToast('Enter name and 6-digit pincode', 'info'); return; } setCheckoutStep(2); }} className='bg-[#FFD814] hover:bg-[#F7CA00] font-bold px-5 py-2 rounded-full text-xs cursor-pointer'>Use this address</button>
                    </div>
                  ) : (
                    <div className='text-xs text-gray-700'><p className='font-bold text-[#0F1111]'>{shippingAddress.fullName} ({shippingAddress.phone})</p><p>{shippingAddress.houseNo}, {shippingAddress.street}</p><p>{shippingAddress.city}, {shippingAddress.state} - <span className='font-bold'>{shippingAddress.pincode}</span></p></div>
                  )}
                </div>
                <div className={'bg-white p-4 rounded border border-gray-200 ' + (checkoutStep < 2 ? 'opacity-60 pointer-events-none' : '')}>
                  <div className='flex items-center justify-between mb-3'><h3 className='text-sm font-extrabold text-[#C7511F]'>2. Payment method</h3>{checkoutStep === 3 && <button onClick={() => setCheckoutStep(2)} className='text-xs font-semibold text-[#007185] hover:underline cursor-pointer'>Change</button>}</div>
                  {checkoutStep === 2 && (
                    <div className='space-y-2.5'>
                      {['UPI (Google Pay / PhonePe / Paytm)', 'Credit or debit card', 'Net Banking', 'Cash on Delivery / Pay on Delivery'].map((label) => (
                        <label key={label} onClick={() => setPaymentMethod(label)} className={'flex items-center gap-3 p-3 rounded border cursor-pointer ' + (paymentMethod === label ? 'border-[#C7511F] bg-[#FFF8F2]' : 'border-gray-200')}>
                          <input type='radio' name='payMethod' checked={paymentMethod === label} onChange={() => setPaymentMethod(label)} className='accent-[#C7511F]' />
                          <span className='text-xs font-bold'>{label}</span>
                        </label>
                      ))}
                      {paymentMethod === 'UPI (Google Pay / PhonePe / Paytm)' && <input type='text' value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder='Enter UPI ID (e.g. aarav@okicici)' className='w-full border rounded px-3 py-1.5 text-xs' />}
                      {paymentMethod === 'Credit or debit card' && <div className='grid grid-cols-2 gap-2'><input type='text' value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })} placeholder='Card Number' className='border rounded px-3 py-1.5 text-xs' /><input type='text' value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} placeholder='MM/YY • CVV' className='border rounded px-3 py-1.5 text-xs' /></div>}
                      <button onClick={() => setCheckoutStep(3)} className='bg-[#FFD814] hover:bg-[#F7CA00] font-bold px-5 py-2 rounded-full text-xs cursor-pointer'>Use this payment method</button>
                    </div>
                  )}
                  {checkoutStep === 3 && <p className='text-xs font-bold text-emerald-700'>Selected: {paymentMethod}</p>}
                </div>
                <div className={'bg-white p-4 rounded border border-gray-200 ' + (checkoutStep < 3 ? 'opacity-60 pointer-events-none' : '')}>
                  <h3 className='text-sm font-extrabold text-[#C7511F] mb-2'>3. Review items and finish</h3>
                  <div className='space-y-2'>{cart.map((item) => (<div key={item.id} className='flex items-center justify-between text-xs border-b pb-1.5'><span className='truncate max-w-xs font-medium'>{item.title} (x{item.quantity})</span><span className='font-bold text-[#B12704]'>{formatINR(item.price * item.quantity)}</span></div>))}</div>
                </div>
              </div>
              <div className='bg-white p-4 rounded border border-gray-200 h-fit space-y-3'>
                {checkoutStep < 3 ? <button onClick={() => setCheckoutStep(checkoutStep + 1)} className='w-full bg-[#FFD814] hover:bg-[#F7CA00] py-2.5 rounded-full font-bold text-xs cursor-pointer'>{checkoutStep === 1 ? 'Continue to Payment' : 'Continue to Review'}</button> : <button onClick={handlePlaceOrder} disabled={cart.length === 0} className='w-full bg-[#FFD814] hover:bg-[#F7CA00] py-2.5 rounded-full font-bold text-xs cursor-pointer'>Place Your Order & Finish</button>}
                <hr />
                <div className='flex justify-between text-xs'><span>Items ({cartItemCount}):</span><span>{formatINR(cartSubtotal)}</span></div>
                <div className='flex justify-between text-xs'><span>Delivery:</span><span className='text-emerald-700 font-bold'>FREE</span></div>
                <div className='flex justify-between font-extrabold text-base text-[#B12704] border-t pt-2'><span>Order Total:</span><span>{formatINR(finalTotal)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === 'orders' && (
        <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto'>
          <div className='bg-white rounded-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative'>
            <button onClick={() => setActiveModal(null)} className='absolute top-4 right-4 text-gray-500 text-xl'><i className='fas fa-times'></i></button>
            <h2 className='text-2xl font-bold mb-4'>Your Orders</h2>
            {orders.length === 0 ? <p className='text-sm text-gray-500'>No orders placed yet.</p> : (
              <div className='space-y-4'>
                {orders.map((order) => (<div key={order.id} className='border rounded-lg p-4'><div className='flex justify-between text-xs text-gray-600 mb-2'><span>Order #{order.id}</span><span className='font-bold text-[#B12704]'>₹{order.total}</span></div><p className='text-xs font-bold text-emerald-700'>{order.status}</p>{order.shippingAddress && order.shippingAddress.pincode && <p className='text-[11px] text-gray-500 mt-1'>Delivering to {order.shippingAddress.fullName} — Pincode {order.shippingAddress.pincode}</p>}</div>))}
              </div>
            )}
          </div>
        </div>
      )}
      {activeModal === 'wishlist' && (
        <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4'>
          <div className='bg-white rounded-lg max-w-xl w-full p-6 shadow-2xl relative'>
            <button onClick={() => setActiveModal(null)} className='absolute top-4 right-4 text-gray-500 text-xl'><i className='fas fa-times'></i></button>
            <h2 className='text-xl font-bold mb-4'>Your Wish List ({wishlist.length})</h2>
            <div className='space-y-3'>{wishlist.map((item) => (<div key={item.id} className='flex items-center justify-between border-b pb-2'><span className='text-xs font-bold'>{item.title}</span><button onClick={() => addToCart(item)} className='bg-[#FFD814] px-3 py-1 rounded-full text-xs font-bold'>Add to Cart</button></div>))}</div>
          </div>
        </div>
      )}
      {activeModal === 'auth' && (
        <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4'>
          <div className='bg-white rounded-lg max-w-sm w-full p-6 shadow-2xl relative'>
            <button onClick={() => setActiveModal(null)} className='absolute top-3 right-3 text-gray-500'><i className='fas fa-times'></i></button>
            <h2 className='text-2xl font-normal mb-4'>Sign in</h2>
            <form onSubmit={handleSignInSubmit} className='space-y-3'>
              <input type='text' required value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} placeholder='Your Name' className='w-full border rounded px-3 py-1.5 text-sm' />
              <input type='email' required value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} placeholder='you@example.com' className='w-full border rounded px-3 py-1.5 text-sm' />
              <button type='submit' className='w-full bg-[#FFD814] hover:bg-[#F7CA00] py-2 rounded-lg text-sm font-bold'>Continue</button>
            </form>
          </div>
        </div>
      )}
      {activeModal === 'location' && (
        <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4'>
          <div className='bg-white rounded-lg max-w-sm w-full p-5 shadow-2xl'>
            <h3 className='font-bold text-sm mb-3'>Choose your location</h3>
            <div className='flex space-x-2'>
              <input type='text' maxLength='6' placeholder='Enter 6-digit pincode' value={zipInput} onChange={(e) => setZipInput(e.target.value)} className='flex-1 border rounded px-3 py-1.5 text-sm' />
              <button onClick={() => { const loc = 'India ' + zipInput; setDeliveryLocation(loc); localStorage.setItem('amazon_zip', loc); setActiveModal(null); triggerToast('Delivery pincode updated to ' + zipInput); }} className='bg-[#FFD814] px-4 py-1.5 rounded-full text-xs font-bold'>Apply</button>
            </div>
          </div>
        </div>
      )}
      <footer className='mt-12 bg-[#232F3E] text-white'>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className='w-full bg-[#37475A] hover:bg-[#485769] py-3.5 text-xs font-semibold text-center'>Back to top</button>
        <div className='bg-[#131921] py-6 text-center text-xs text-gray-400'><div className='text-lg font-extrabold text-white mb-1'>amazon<span className='text-xs font-normal text-gray-400'>.in</span></div><p>© 1996-2026, Amazon.com, Inc. or its affiliates. All rights reserved.</p></div>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);