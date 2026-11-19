
const $ = id => document.getElementById(id);

let state = {
  category: "All",
  query: "",
  page: 1,
  perPage: 20,
  sort: "featured",
  cart: JSON.parse(localStorage.getItem("storeCart") || "[]"),
  authMode: "signin",
  checkoutStep: 1,
  checkout: {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pin: "",
    payment: "UPI"
  },
  buyNowId: null
};

const money = n => "₹" + Number(n).toLocaleString("en-IN");

function toast(message) {
  const el = $("toast");
  if (!el) {
    alert(message);
    return;
  }
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2100);
}

function currentUser() {
  return JSON.parse(localStorage.getItem("storeUser") || "null");
}

function authToken() {
  return localStorage.getItem("storeToken") || "";
}

function saveCart() {
  localStorage.setItem("storeCart", JSON.stringify(state.cart));
}

function updateCartCount() {
  const count = $("cartCount");
  if (count) {
    count.textContent = state.cart.reduce((s, x) => s + x.qty, 0);
  }
}

function imageMarkup(p, cls = "product-image") {
  return `<img class="${cls}" src="${p.image}" alt="${p.name}" loading="lazy"
  onerror="this.src='https://placehold.co/500x400?text=Product'">`;
}

function init() {
  if (typeof categories !== "undefined") {
    categories.forEach(c => {
      const option = document.createElement("option");
      option.value = c.name;
      option.textContent = c.name;
      $("searchCategory").append(option);
    });

    $("categoryStrip").innerHTML = categories.map(c =>
      `<button class="category-tile" data-category="${c.name}">
      ${c.emoji} ${c.name}<span>Explore products</span></button>`
    ).join("");
  }

  render();

  const user = currentUser();
  if (user && $("accountButton")) {
    $("accountButton").innerHTML =
      `Hello, ${user.name}<br><b>Account & Lists</b>`;
  }
}

function filtered() {
  let arr = products.filter(p =>
    (state.category === "All" || p.category === state.category) &&
    (`${p.name} ${p.category}`).toLowerCase()
      .includes(state.query.toLowerCase())
  );

  if (state.sort === "low") arr.sort((a, b) => a.price - b.price);
  if (state.sort === "high") arr.sort((a, b) => b.price - a.price);
  if (state.sort === "rating") arr.sort((a, b) => b.rating - a.rating);

  return arr;
}

function render() {
  const arr = filtered();
  const pages = Math.max(1, Math.ceil(arr.length / state.perPage));

  state.page = Math.min(state.page, pages);

  const shown = arr.slice(
    (state.page - 1) * state.perPage,
    state.page * state.perPage
  );

  $("productGrid").innerHTML = shown.map(p => `
    <article class="product-card" data-open="${p.id}">
      ${imageMarkup(p)}
      <div class="product-name">${p.name}</div>
      <div class="rating">★★★★☆ ${p.rating}</div>
      <div class="price">${money(p.price)}</div>
      <div class="old-price">M.R.P.: ${money(p.oldPrice)}</div>
      <div class="stock">In stock (${p.stock})</div>
      <div class="card-actions">
        <button data-add="${p.id}">Add to Cart</button>
        <button data-buy="${p.id}">Buy Now</button>
      </div>
    </article>
  `).join("") || "<p>No products found.</p>";

  $("sectionTitle").textContent =
    state.category === "All" ? "Today's Deals" : state.category;

  $("resultInfo").textContent = `${arr.length} products found`;
  $("pageInfo").textContent = `Page ${state.page} of ${pages}`;

  $("prevPage").disabled = state.page === 1;
  $("nextPage").disabled = state.page === pages;

  updateCartCount();
}

function addCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  const item = state.cart.find(x => x.id === id);

  if (item) item.qty++;
  else state.cart.push({ id, qty: 1 });

  saveCart();
  updateCartCount();
  toast("Product added to cart");
}

function openOverlay(id) {
  $("overlay").classList.remove("hidden");
  $(id).classList.remove("hidden");
}

function closeAll() {
  $("overlay").classList.add("hidden");
  document.querySelectorAll(".drawer,.modal")
    .forEach(el => el.classList.add("hidden"));
}

function showInfo(title, body) {
  let modal = $("infoModal");

  if (!modal) {
    modal = document.createElement("section");
    modal.id = "infoModal";
    modal.className = "modal hidden";
    modal.innerHTML = `
      <button class="close modal-close" data-close>×</button>
      <h2 id="infoTitle"></h2>
      <div id="infoBody"></div>
    `;
    document.body.appendChild(modal);
  }

  $("infoTitle").textContent = title;
  $("infoBody").innerHTML = body;
  openOverlay("infoModal");
}

function openAuth() {
  state.authMode = "signin";

  $("authTitle").textContent = "Sign in";
  $("authName").parentElement.classList.add("hidden");
  $("authName").required = false;
  $("authSubmit").textContent = "Sign in";

  $("authSwitch").innerHTML =
    'New here? <button type="button" class="text-button" id="switchAuth">Create an account</button>';

  openOverlay("authModal");
}

function switchAuth() {
  state.authMode =
    state.authMode === "signin" ? "signup" : "signin";

  const signup = state.authMode === "signup";

  $("authTitle").textContent = signup
    ? "Create account" : "Sign in";

  $("authName").parentElement.classList.toggle("hidden", !signup);
  $("authName").required = signup;

  $("authSubmit").textContent = signup
    ? "Create account" : "Sign in";

  $("authSwitch").innerHTML = signup
    ? 'Already registered? <button type="button" class="text-button" id="switchAuth">Sign in</button>'
    : 'New here? <button type="button" class="text-button" id="switchAuth">Create an account</button>';
}

async function openOrders() {
  if (!authToken()) {
    openAuth();
    toast("Please sign in first");
    return;
  }

  showInfo("Returns & Orders", "<p>Loading your orders...</p>");

  try {
    const response = await fetch("/api/orders", {
      headers: { Authorization: `Bearer ${authToken()}` }
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    if (!data.length) {
      $("infoBody").innerHTML = "<p>No orders found.</p>";
      return;
    }

    $("infoBody").innerHTML = data.map(order => `
      <article class="order-card">
        <b>Order ${order.orderNumber || order._id}</b>
        <p>Status: ${order.status}</p>
        <p>Total: ${money(order.total)}</p>
        ${(order.items || []).map(item =>
          `<p>${item.name} × ${item.qty}</p>`
        ).join("")}
        ${order.status !== "Return requested"
          ? `<button class="primary" data-return="${order._id}">Request return</button>`
          : "<p>Return requested</p>"}
      </article>
    `).join("");

  } catch (error) {
    $("infoBody").textContent = error.message;
  }
}

async function requestReturn(id) {
  try {
    const response = await fetch(`/api/orders/${encodeURIComponent(id)}/return`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${authToken()}` }
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    toast("Return requested successfully");
    openOrders();
  } catch (error) {
    toast(error.message);
  }
}

function openCart() {
  $("cartItems").innerHTML = state.cart.length
    ? state.cart.map(item => {
        const p = products.find(x => x.id === item.id);
        if (!p) return "";

        return `
          <div class="cart-row">
            ${imageMarkup(p, "")}
            <div>
              <b>${p.name}</b>
              <p>${money(p.price)} × ${item.qty}</p>
              <button data-remove="${p.id}">Remove</button>
            </div>
          </div>
        `;
      }).join("")
    : "<p>Your cart is empty.</p>";

  const total = state.cart.reduce((sum, item) => {
    const p = products.find(x => x.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  $("cartTotal").textContent = money(total);
  openOverlay("cartDrawer");
}

function openProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  $("productDetails").innerHTML = `
    <div class="product-detail">
      ${imageMarkup(p, "")}
      <div>
        <h2>${p.name}</h2>
        <p>${p.category}</p>
        <h2>${money(p.price)}</h2>
        <p>${p.description || ""}</p>
        <button class="primary" data-add="${p.id}">Add to Cart</button>
        <button class="primary" data-buy="${p.id}">Buy Now</button>
      </div>
    </div>
  `;

  openOverlay("productModal");
}

function startCheckout(id = null) {
  if (!authToken()) {
    openAuth();
    toast("Please sign in before checkout");
    return;
  }

  state.buyNowId = id;
  state.checkoutStep = 1;

  const user = currentUser();

  if (user) {
    state.checkout.name = user.name || "";
    state.checkout.email = user.email || "";
    state.checkoutStep = 2;
  }

  renderCheckout();
  openOverlay("checkoutModal");
}

function checkoutItems() {
  return state.buyNowId
    ? [{ id: state.buyNowId, qty: 1 }]
    : state.cart;
}

function renderCheckout() {
  const c = state.checkout;
  let html = "";

  if (state.checkoutStep === 2) {
    html = `
      <h3>Delivery address</h3>
      <label>Name<input id="coName" value="${c.name}"></label>
      <label>Phone<input id="coPhone" value="${c.phone}"></label>
      <label>Address<textarea id="coAddress">${c.address}</textarea></label>
      <label>City<input id="coCity" value="${c.city}"></label>
      <label>PIN<input id="coPin" value="${c.pin}"></label>
    `;
  }

  if (state.checkoutStep === 3) {
    html = `
      <h3>Payment method</h3>
      <label><input type="radio" name="payment" value="UPI" checked> UPI</label>
      <label><input type="radio" name="payment" value="Card"> Card (demo)</label>
      <label><input type="radio" name="payment" value="COD"> Cash on Delivery</label>
    `;
  }

  if (state.checkoutStep === 4) {
    html = "<h3>Review your order</h3>";

    checkoutItems().forEach(item => {
      const p = products.find(x => x.id === item.id);
      if (p) html += `<p>${p.name} × ${item.qty} : ${money(p.price * item.qty)}</p>`;
    });
  }

  $("checkoutContent").innerHTML = html + `
    <div class="checkout-actions">
      <button id="coBack">Back</button>
      <button id="coNext">${state.checkoutStep === 4 ? "Place Order" : "Continue"}</button>
    </div>
  `;
}

async function nextCheckout() {
  if (state.checkoutStep === 2) {
    Object.assign(state.checkout, {
      name: $("coName").value,
      phone: $("coPhone").value,
      address: $("coAddress").value,
      city: $("coCity").value,
      pin: $("coPin").value
    });

    if (!/^\d{10}$/.test(state.checkout.phone)) {
      toast("Enter a valid 10-digit phone number");
      return;
    }

    if (!/^\d{6}$/.test(state.checkout.pin)) {
      toast("Enter a valid 6-digit PIN");
      return;
    }
  }

  if (state.checkoutStep === 3) {
    state.checkout.payment =
      document.querySelector('input[name="payment"]:checked')?.value || "UPI";
  }

  if (state.checkoutStep < 4) {
    state.checkoutStep++;
    renderCheckout();
    return;
  }

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken()}`
      },
      body: JSON.stringify({
        items: checkoutItems().map(x => ({
          productId: x.id,
          qty: x.qty
        })),
        delivery: {
          name: state.checkout.name,
          phone: state.checkout.phone,
          address: state.checkout.address,
          city: state.checkout.city,
          pin: state.checkout.pin
        },
        paymentMethod: state.checkout.payment
      })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    state.cart = [];
    saveCart();
    updateCartCount();

    $("checkoutContent").innerHTML = `
      <h2>Order placed successfully!</h2>
      <p>Order number: ${data.orderNumber}</p>
      <p>Demo order only. No real payment was taken.</p>
      <button id="finishOrder">Continue shopping</button>
    `;

    state.buyNowId = null;
  } catch (error) {
    toast(error.message);
  }
}

// All button click actions
document.addEventListener("click", async event => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.id === "sellNav") {
    showInfo("Sell on our store",
      "<p>Seller information and registration for this demo store.</p>");
  }

  if (button.id === "bestNav") {
    state.sort = "rating";
    state.category = "All";
    state.page = 1;
    $("sortSelect").value = "rating";
    render();
  }

  if (button.id === "dealsNav") {
    state.sort = "low";
    state.category = "All";
    state.page = 1;
    $("sortSelect").value = "low";
    render();
  }

  if (button.id === "accountButton") openAuth();
  if (button.id === "ordersButton") openOrders();
  if (button.id === "cartButton") openCart();

  if (button.id === "switchAuth") switchAuth();

  if (button.dataset.category) {
    state.category = button.dataset.category;
    state.page = 1;
    render();
  }

  if (button.dataset.add) addCart(Number(button.dataset.add));

  if (button.dataset.buy) {
    closeAll();
    startCheckout(Number(button.dataset.buy));
  }

  if (button.dataset.remove) {
    state.cart = state.cart.filter(
      x => x.id !== Number(button.dataset.remove)
    );
    saveCart();
    openCart();
    updateCartCount();
  }

  if (button.dataset.return) requestReturn(button.dataset.return);

  if (button.id === "checkoutButton") {
    if (!state.cart.length) {
      toast("Your cart is empty");
      return;
    }
    closeAll();
    startCheckout();
  }

  if (button.id === "coNext") nextCheckout();

  if (button.id === "coBack") {
    state.checkoutStep = Math.max(2, state.checkoutStep - 1);
    renderCheckout();
  }

  if (button.id === "finishOrder") closeAll();
  if (button.hasAttribute("data-close")) closeAll();

  if (button.id === "prevPage") {
    state.page--;
    render();
  }

  if (button.id === "nextPage") {
    state.page++;
    render();
  }

  if (button.id === "allCategories") {
    state.category = "All";
    state.page = 1;
    render();
  }
});

// Login and registration using SQLite backend
$("authForm").addEventListener("submit", async event => {
  event.preventDefault();

  const name = $("authName").value.trim();
  const email = $("authEmail").value.trim().toLowerCase();
  const password = $("authPassword").value;

  const endpoint = state.authMode === "signup"
    ? "/api/auth/register"
    : "/api/auth/login";

  const payload = state.authMode === "signup"
    ? { name, email, password }
    : { email, password };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    localStorage.setItem("storeToken", data.token);
    localStorage.setItem("storeUser", JSON.stringify(data.user));

    $("accountButton").innerHTML =
      `Hello, ${data.user.name}<br><b>Account & Lists</b>`;

    closeAll();
    toast("Login successful");
  } catch (error) {
    toast(error.message);
  }
});

// Search
$("searchForm").addEventListener("submit", event => {
  event.preventDefault();

  state.query = $("searchInput").value.trim();
  state.category = $("searchCategory").value;
  state.page = 1;

  render();
});

$("sortSelect").addEventListener("change", event => {
  state.sort = event.target.value;
  render();
});

$("overlay").addEventListener("click", closeAll);

init();
