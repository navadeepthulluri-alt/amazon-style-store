
// AMAZON-STYLE STORE - SQLITE CONNECTED FRONTEND

const $ = id => document.getElementById(id);
const API = '/api';
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');

let state = {
  category: 'All',
  query: '',
  page: 1,
  perPage: 20,
  sort: 'featured',
  cart: [],
  authMode: 'signin',
  checkoutStep: 1,
  checkout: {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pin: '',
    payment: 'UPI'
  },
  buyNowId: null
};

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2800);
}

async function api(path, options = {}) {
  const token = localStorage.getItem('storeToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(API + path, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

function currentUser() {
  try {
    return JSON.parse(localStorage.getItem('storeUser') || 'null');
  } catch {
    return null;
  }
}

function setSignedIn(user, token) {
  localStorage.setItem('storeToken', token);
  localStorage.setItem('storeUser', JSON.stringify(user));

  $('accountButton').innerHTML =
    `Hello, ${user.name || 'User'}<br><b>Account & Lists</b>`;
}

function updateAccountLabel() {
  const user = currentUser();

  if (user) {
    $('accountButton').innerHTML =
      `Hello, ${user.name || 'User'}<br><b>Account & Lists</b>`;
  }
}

function imageMarkup(p, cls = 'product-image') {
  const src = p.image ||
    `https://placehold.co/500x400/f5f5f5/333?text=${encodeURIComponent(p.category || 'Product')}`;

  return `<img class="${cls}" src="${src}" alt="${p.name}" loading="lazy"
    onerror="this.src='https://placehold.co/500x400/f5f5f5/333?text=Product'">`;
}

function openOverlay(id) {
  $('overlay').classList.remove('hidden');
  $(id).classList.remove('hidden');
}

function closeAll() {
  $('overlay').classList.add('hidden');

  document.querySelectorAll('.drawer,.modal').forEach(el => {
    el.classList.add('hidden');
  });
}

function showInfo(title, html) {
  $('infoTitle').textContent = title;
  $('infoBody').innerHTML = html;
  openOverlay('infoModal');
}

function init() {
  categories.forEach(c => {
    const option = document.createElement('option');
    option.value = c.name;
    option.textContent = c.name;
    $('searchCategory').appendChild(option);
  });

  $('categoryStrip').innerHTML = categories.map(c =>
    `<button class="category-tile" data-category="${c.name}">
      ${c.emoji || ''} ${c.name}
      <span>Explore products</span>
    </button>`
  ).join('');

  updateAccountLabel();
  render();
}

function filteredProducts() {
  let list = products.filter(p =>
    (state.category === 'All' || p.category === state.category) &&
    `${p.name} ${p.category}`.toLowerCase().includes(state.query.toLowerCase())
  );

  if (state.sort === 'low') {
    list.sort((a, b) => a.price - b.price);
  }

  if (state.sort === 'high') {
    list.sort((a, b) => b.price - a.price);
  }

  if (state.sort === 'rating') {
    list.sort((a, b) => Number(b.rating) - Number(a.rating));
  }

  return list;
}

function render() {
  const list = filteredProducts();
  const pages = Math.max(1, Math.ceil(list.length / state.perPage));

  state.page = Math.min(Math.max(1, state.page), pages);

  const visible = list.slice(
    (state.page - 1) * state.perPage,
    state.page * state.perPage
  );

  $('productGrid').innerHTML = visible.map(p => `
    <article class="product-card" data-open="${p.id}">
      ${imageMarkup(p)}
      <div class="product-name">${p.name}</div>
      <div class="rating">
        ★★★★☆ <span style="color:#007185">
        ${p.rating || '4.0'} (${Number(p.reviews || 0).toLocaleString('en-IN')})
        </span>
      </div>
      <div class="price">
        <small>₹</small>${Number(p.price).toLocaleString('en-IN')}
      </div>
      <div class="old-price">M.R.P.: ${money(p.oldPrice || p.price)}</div>
      <div class="stock">In stock (${p.stock || 10} available)</div>
      <div class="card-actions">
        <button data-add="${p.id}">Add to Cart</button>
        <button data-buy="${p.id}">Buy Now</button>
      </div>
    </article>
  `).join('') || '<p>No products found. Try another search.</p>';

  $('sectionTitle').textContent = state.query
    ? `Results for "${state.query}"`
    : (state.category === 'All' ? "Today's deals" : state.category);

  $('resultInfo').textContent = `${list.length} products found`;
  $('pageInfo').textContent = `Page ${state.page} of ${pages}`;
  $('prevPage').disabled = state.page === 1;
  $('nextPage').disabled = state.page === pages;

  updateCartCount();
}

function updateCartCount() {
  $('cartCount').textContent =
    state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function addCart(id) {
  const product = products.find(p => Number(p.id) === Number(id));

  if (!product) return toast('Product not found');

  const item = state.cart.find(x => Number(x.id) === Number(id));

  if (item) {
    item.qty++;
  } else {
    state.cart.push({ id: Number(id), qty: 1 });
  }

  updateCartCount();
  toast(`${product.name} added to cart`);
}

function openCart() {
  $('cartItems').innerHTML = state.cart.length
    ? state.cart.map(item => {
        const p = products.find(x => Number(x.id) === Number(item.id));

        if (!p) return '';

        return `
          <div class="cart-row">
            ${imageMarkup(p, '')}
            <div>
              <b>${p.name}</b>
              <p>${money(p.price)} × ${item.qty}</p>
              <button data-remove="${p.id}">Remove</button>
            </div>
            <b>${money(p.price * item.qty)}</b>
          </div>
        `;
      }).join('')
    : '<p>Your cart is empty.</p>';

  $('cartTotal').textContent = money(
    state.cart.reduce((sum, item) => {
      const p = products.find(x => Number(x.id) === Number(item.id));
      return sum + (p ? p.price * item.qty : 0);
    }, 0)
  );

  openOverlay('cartDrawer');
}

function openAuth() {
  state.authMode = 'signin';

  $('authTitle').textContent = 'Sign in';
  $('authName').parentElement.classList.add('hidden');
  $('authName').required = false;
  $('authPassword').minLength = 8;
  $('authSubmit').textContent = 'Sign in';

  $('authSwitch').innerHTML =
    'New here? <button type="button" class="text-button" id="switchAuth">Create an account</button>';

  openOverlay('authModal');
}

function switchAuth() {
  state.authMode =
    state.authMode === 'signin' ? 'signup' : 'signin';

  const signup = state.authMode === 'signup';

  $('authTitle').textContent =
    signup ? 'Create account' : 'Sign in';

  $('authName').parentElement.classList.toggle('hidden', !signup);
  $('authName').required = signup;
  $('authSubmit').textContent =
    signup ? 'Create account' : 'Sign in';

  $('authSwitch').innerHTML = signup
    ? 'Already registered? <button type="button" class="text-button" id="switchAuth">Sign in</button>'
    : 'New here? <button type="button" class="text-button" id="switchAuth">Create an account</button>';
}

// CUSTOMER ORDERS

async function showOrders() {
  if (!localStorage.getItem('storeToken')) {
    toast('Please sign in to view your orders');
    openAuth();
    return;
  }

  try {
    const orders = await api('/orders');

    const html = orders.length
      ? orders.map(order => `
          <div class="order-entry"
            style="border:1px solid #ddd;padding:12px;margin:10px 0;border-radius:6px">

            <b>Order ${order.orderNumber || order._id}</b>

            <p>
              ${order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : ''}
            </p>

            <p>
              ${(order.items || []).map(item =>
                `${item.name} × ${item.qty}`
              ).join(', ')}
            </p>

            <b>${money(order.total)}</b>

            <p>Status: ${order.status}</p>

            ${order.status === 'Placed'
              ? `<button data-return="${order._id}">Request return</button>`
              : ''}
          </div>
        `).join('')
      : '<p>You have no orders yet.</p>';

    showInfo('Your Returns & Orders', html);

  } catch (error) {
    toast(error.message);

    if (/sign in|session/i.test(error.message)) {
      openAuth();
    }
  }
}

// CHECKOUT

function checkoutItems() {
  return state.buyNowId !== null
    ? [{ id: state.buyNowId, qty: 1 }]
    : state.cart;
}

function startCheckout(id = null) {
  state.buyNowId = id;
  state.checkoutStep = currentUser() ? 2 : 1;

  const user = currentUser();

  if (user) {
    state.checkout.name = user.name || '';
    state.checkout.email = user.email || '';
  }

  renderCheckout();
  openOverlay('checkoutModal');
}

function renderCheckout() {
  document.querySelectorAll('[data-step-label]').forEach(el => {
    el.classList.toggle(
      'active',
      Number(el.dataset.stepLabel) === state.checkoutStep
    );
  });

  const c = state.checkout;
  let html = '';

  if (state.checkoutStep === 1) {
    html = `
      <h3>Sign in to continue</h3>
      <p>Enter your store account details.</p>

      <label>Email
        <input id="coEmail" type="email" value="${c.email}" required>
      </label>

      <label>Password
        <input id="coPassword" type="password" required>
      </label>

      <p class="tiny">
        New customer? Use Account & Lists to create an account first.
      </p>
    `;

  } else if (state.checkoutStep === 2) {
    html = `
      <h3>Delivery address</h3>

      <label>Full name
        <input id="coName" value="${c.name}" required>
      </label>

      <label>Email
        <input id="coEmail" type="email" value="${c.email}" required>
      </label>

      <label>Mobile number
        <input id="coPhone" value="${c.phone}"
          inputmode="numeric" maxlength="10" required>
      </label>

      <label>Address
        <textarea id="coAddress" rows="2" required>${c.address}</textarea>
      </label>

      <label>City
        <input id="coCity" value="${c.city}" required>
      </label>

      <label>PIN code
        <input id="coPin" value="${c.pin}"
          inputmode="numeric" maxlength="6" required>
      </label>
    `;

  } else if (state.checkoutStep === 3) {
    html = `
      <h3>Choose a payment method</h3>

      <label>
        <input type="radio" name="payment" value="UPI"
          ${c.payment === 'UPI' ? 'checked' : ''}>
        UPI
      </label>

      <label>
        <input type="radio" name="payment" value="Card"
          ${c.payment === 'Card' ? 'checked' : ''}>
        Credit / Debit Card (demo)
      </label>

      <label>
        <input type="radio" name="payment" value="COD"
          ${c.payment === 'COD' ? 'checked' : ''}>
        Cash on Delivery
      </label>

      <p class="tiny">
        This student demo does not collect real payments.
      </p>
    `;

  } else {
    const items = checkoutItems();

    html = `
      <h3>Review your order</h3>

      <p>
        <b>Deliver to:</b>
        ${c.name}, ${c.address}, ${c.city} - ${c.pin}
        <br>Phone: ${c.phone}
      </p>

      <p><b>Payment:</b> ${c.payment}</p>
    `;

    html += items.map(item => {
      const p = products.find(
        x => Number(x.id) === Number(item.id)
      );

      return p
        ? `<p>${p.name} × ${item.qty}
            <b>${money(p.price * item.qty)}</b></p>`
        : '';
    }).join('');

    const total = items.reduce((sum, item) => {
      const p = products.find(
        x => Number(x.id) === Number(item.id)
      );

      return sum + (p ? p.price * item.qty : 0);
    }, 0);

    html += `<hr><h3>Order total: ${money(total)}</h3>`;
  }

  $('checkoutContent').innerHTML = html + `
    <div class="checkout-actions">
      <button id="coBack" ${state.checkoutStep === 1 ? 'disabled' : ''}>
        Back
      </button>

      <button id="coNext">
        ${state.checkoutStep === 4 ? 'Place order' : 'Continue'}
      </button>
    </div>
  `;
}

function collectCheckout() {
  const val = id => $(id)?.value?.trim() || '';

  if (state.checkoutStep === 1) {
    state.checkout.email = val('coEmail').toLowerCase();
    state.checkout.loginPassword = val('coPassword');

    if (!state.checkout.email || !state.checkout.loginPassword) {
      toast('Enter your email and password');
      return false;
    }

  } else if (state.checkoutStep === 2) {
    Object.assign(state.checkout, {
      name: val('coName'),
      email: val('coEmail'),
      phone: val('coPhone'),
      address: val('coAddress'),
      city: val('coCity'),
      pin: val('coPin')
    });

    if (
      !state.checkout.name ||
      !state.checkout.email ||
      !state.checkout.address ||
      !state.checkout.city
    ) {
      toast('Complete all delivery fields');
      return false;
    }

    if (!/^\d{10}$/.test(state.checkout.phone)) {
      toast('Enter a valid 10-digit mobile number');
      return false;
    }

    if (!/^\d{6}$/.test(state.checkout.pin)) {
      toast('Enter a valid 6-digit PIN code');
      return false;
    }

  } else if (state.checkoutStep === 3) {
    state.checkout.payment =
      document.querySelector('input[name="payment"]:checked')?.value || 'UPI';
  }

  return true;
}

async function nextCheckout() {
  if (!collectCheckout()) return;

  try {
    if (state.checkoutStep === 1) {
      const result = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: state.checkout.email,
          password: state.checkout.loginPassword
        })
      });

      setSignedIn(result.user, result.token);
      state.checkout.name = result.user.name || '';
      state.checkoutStep = 2;
      renderCheckout();
      return;
    }

    if (state.checkoutStep < 4) {
      state.checkoutStep++;
      renderCheckout();
      return;
    }

    const items = checkoutItems().map(item => ({
      productId: Number(item.id),
      qty: Number(item.qty)
    }));

    const delivery = {
      name: state.checkout.name,
      email: state.checkout.email,
      phone: state.checkout.phone,
      address: state.checkout.address,
      city: state.checkout.city,
      pin: state.checkout.pin
    };

    const order = await api('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items,
        delivery,
        paymentMethod: state.checkout.payment
      })
    });

    state.cart = [];
    state.buyNowId = null;
    updateCartCount();

    $('checkoutContent').innerHTML = `
      <h2>Order placed successfully!</h2>
      <p>Your order number is
        <b>${order.orderNumber || order._id}</b>.
      </p>
      <p>Your order has been saved in the SQLite database.</p>
      <button class="primary" id="finishOrder">
        Continue shopping
      </button>
    `;

    document.querySelectorAll('[data-step-label]').forEach(el => {
      el.classList.remove('active');
    });

    toast('Order placed successfully');

  } catch (error) {
    toast(error.message);

    if (/sign in|session|incorrect/i.test(error.message)) {
      localStorage.removeItem('storeToken');
      localStorage.removeItem('storeUser');
    }
  }
}

// PRODUCT DETAILS

function openProduct(id) {
  const p = products.find(x => Number(x.id) === Number(id));
  if (!p) return;

  $('productDetails').innerHTML = `
    <div class="product-detail">
      ${imageMarkup(p, '')}

      <div>
        <p>${p.category}</p>
        <h2>${p.name}</h2>

        <div class="rating">
          ★★★★☆ ${p.rating || '4.0'} (${p.reviews || 0} reviews)
        </div>

        <h2>${money(p.price)}</h2>

        <p class="old-price">
          M.R.P. ${money(p.oldPrice || p.price)}
        </p>

        <p class="stock">
          In stock (${p.stock || 10} available)
        </p>

        <p>${p.description || ''}</p>

        <button class="primary" data-add="${p.id}">
          Add to Cart
        </button>

        <button class="primary" data-buy="${p.id}">
          Buy Now
        </button>
      </div>
    </div>
  `;

  openOverlay('productModal');
}

// ALL BUTTONS

document.addEventListener('click', async event => {
  const card = event.target.closest('[data-open]');

  if (card && !event.target.closest('button')) {
    openProduct(Number(card.dataset.open));
    return;
  }

  const button = event.target.closest('button,a');
  if (!button) return;

  if (button.dataset.category) {
    state.category = button.dataset.category;
    state.query = '';
    $('searchInput').value = '';
    $('searchCategory').value = state.category;
    state.page = 1;
    render();

    document.querySelector('.toolbar').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  if (button.dataset.add) {
    addCart(Number(button.dataset.add));
  }

  if (button.dataset.buy) {
    closeAll();
    startCheckout(Number(button.dataset.buy));
  }

  if (button.dataset.remove) {
    state.cart = state.cart.filter(
      x => Number(x.id) !== Number(button.dataset.remove)
    );

    openCart();
    updateCartCount();
  }

  if (button.dataset.return) {
    try {
      await api(
        `/orders/${encodeURIComponent(button.dataset.return)}/return`,
        { method: 'PATCH' }
      );

      toast('Return request submitted');
      await showOrders();

    } catch (error) {
      toast(error.message);
    }
  }

  if (button.id === 'switchAuth') switchAuth();
  if (button.id === 'accountButton') openAuth();
  if (button.id === 'cartButton') openCart();
  if (button.id === 'ordersButton') showOrders();

  // SELL
  if (button.id === 'sellNav') {
    showInfo(
      'Sell on this demo store',
      `<h3>Welcome to the seller information page</h3>
       <p>In a real marketplace, sellers can register their business,
       add products, manage stock and fulfil customer orders.</p>
       <p>This student project currently demonstrates the customer
       shopping experience. Seller registration and product listing
       are not enabled.</p>`
    );
  }

  // CUSTOMER SERVICE
  if (button.id === 'supportNav') {
    showInfo(
      'Customer Service',
      `<h3>How can we help?</h3>
       <ul>
         <li><b>Orders:</b> Use Returns & Orders to see your purchases.</li>
         <li><b>Returns:</b> Select Request return beside an eligible order.</li>
         <li><b>Payments:</b> Payments are simulated for this student project.</li>
         <li><b>Account:</b> Use Account & Lists to sign in or create an account.</li>
       </ul>
       <p>Demo support: support@example.test</p>`
    );
  }

  if (button.id === 'bestNav') {
    state.category = 'All';
    state.sort = 'rating';
    $('sortSelect').value = 'rating';
    state.query = '';
    state.page = 1;
    render();

    document.querySelector('.toolbar').scrollIntoView({
      behavior: 'smooth'
    });
  }

  if (button.id === 'dealsNav') {
    state.category = 'All';
    state.sort = 'low';
    $('sortSelect').value = 'low';
    state.query = '';
    state.page = 1;
    render();

    document.querySelector('.toolbar').scrollIntoView({
      behavior: 'smooth'
    });
  }

  if (button.id === 'checkoutButton') {
    if (!state.cart.length) {
      return toast('Your cart is empty');
    }

    closeAll();
    startCheckout();
  }

  if (button.id === 'coNext') nextCheckout();

  if (button.id === 'coBack') {
    if (collectCheckout()) {
      state.checkoutStep = Math.max(1, state.checkoutStep - 1);
      renderCheckout();
    }
  }

  if (button.id === 'finishOrder') closeAll();
  if (button.hasAttribute('data-close')) closeAll();

  if (button.id === 'prevPage') {
    state.page--;
    render();
  }

  if (button.id === 'nextPage') {
    state.page++;
    render();
  }

  if (button.id === 'allCategories') {
    state.category = 'All';
    state.query = '';
    $('searchInput').value = '';
    $('searchCategory').value = 'All';
    state.page = 1;
    state.sort = 'featured';
    $('sortSelect').value = 'featured';
    render();

    document.querySelector('.category-strip').scrollIntoView({
      behavior: 'smooth'
    });
  }

  if (button.id === 'shopNow') {
    window.scrollTo({ top: 450, behavior: 'smooth' });
  }

  if (button.id === 'heroNext' || button.id === 'heroPrev') {
    toast('Explore the products below.');
  }

  if (button.id === 'backTop') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (button.classList.contains('brand')) {
    state.category = 'All';
    state.query = '';
    state.page = 1;
    render();
  }
});

// SIGN IN AND REGISTRATION

$('authForm').addEventListener('submit', async event => {
  event.preventDefault();

  const signup = state.authMode === 'signup';

  const payload = {
    email: $('authEmail').value.trim().toLowerCase(),
    password: $('authPassword').value
  };

  if (signup) {
    payload.name = $('authName').value.trim();
  }

  try {
    const result = await api(
      signup ? '/auth/register' : '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );

    setSignedIn(result.user, result.token);

    toast(
      signup
        ? 'Account created successfully'
        : 'Signed in successfully'
    );

    closeAll();

  } catch (error) {
    toast(error.message);
  }
});

// SEARCH

$('searchForm').addEventListener('submit', event => {
  event.preventDefault();

  state.query = $('searchInput').value.trim();
  state.category = $('searchCategory').value;
  state.page = 1;

  render();
});

$('searchCategory').addEventListener('change', () => {
  state.category = $('searchCategory').value;
  state.page = 1;
  render();
});

$('sortSelect').addEventListener('change', event => {
  state.sort = event.target.value;
  render();
});

$('overlay').addEventListener('click', closeAll);

// START WEBSITE

init();
