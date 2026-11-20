
const $ = id => document.getElementById(id);
const API = "/api";

const state = {
    category: "All",
    query: "",
    page: 1,
    perPage: 20,
    sort: "featured",
    cart: [],
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

const money = n => "₹" + Number(n || 0).toLocaleString("en-IN");

function toast(message) {
    const element = $("toast");
    if (!element) return;
    element.textContent = message;
    element.classList.add("show");
    setTimeout(() => element.classList.remove("show"), 2500);
}

function getToken() {
    return localStorage.getItem("storeToken");
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem("storeUser") || "null");
    } catch {
        return null;
    }
}

async function api(endpoint, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (getToken()) {
        headers.Authorization = "Bearer " + getToken();
    }

    const response = await fetch(API + endpoint, {
        ...options,
        headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
}

function imageMarkup(product, className = "product-image") {
    return `<img class="${className}"
        src="${product.image || ""}"
        alt="${product.name || "Product"}"
        loading="lazy"
        onerror="this.onerror=null;this.src='https://placehold.co/500x400/f5f5f5/333?text=Product'">`;
}

/* LOAD PRODUCTS FROM SQLITE
   products.js already declares const products = [].
   We fill that existing array instead of declaring another one.
*/

async function loadProducts() {
    const grid = $("productGrid");
    grid.innerHTML = "<p>Loading products...</p>";

    try {
        const data = await api("/products");

        if (!Array.isArray(data)) {
            throw new Error("Invalid product data received");
        }

        const normalizedProducts = data.map(product => ({
            ...product,
            id: Number(product.id),
            price: Number(product.price || 0),
            oldPrice: Number(product.oldPrice || product.price || 0),
            rating: Number(product.rating || 0),
            reviews: Number(product.reviews || 0),
            stock: Number(product.stock || 0)
        }));

        products.splice(0, products.length, ...normalizedProducts);

        console.log("Products loaded from SQLite:", products.length);
        render();

    } catch (error) {
        console.error("Product loading error:", error);
        grid.innerHTML = `<p>Unable to load products: ${error.message}</p>`;
        toast("Could not load products from database");
    }
}

/* INITIALIZE */

function init() {
    if (typeof categories === "undefined") {
        console.error("Categories not found. Check products.js.");
        toast("Product categories could not be loaded");
        return;
    }

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.name;
        option.textContent = category.name;
        $("searchCategory").append(option);
    });

    $("categoryStrip").innerHTML = categories.map(category =>
        `<button class="category-tile" data-category="${category.name}">
            ${category.emoji || ""} ${category.name}
            <span>Explore products</span>
        </button>`
    ).join("");

    updateAccountButton();
    loadProducts();
}

/* FILTER AND DISPLAY PRODUCTS */

function filtered() {
    let result = products.filter(product =>
        (state.category === "All" || product.category === state.category) &&
        (`${product.name} ${product.category}`.toLowerCase()
            .includes(state.query.toLowerCase()))
    );

    if (state.sort === "low") {
        result.sort((a, b) => a.price - b.price);
    }

    if (state.sort === "high") {
        result.sort((a, b) => b.price - a.price);
    }

    if (state.sort === "rating") {
        result.sort((a, b) => b.rating - a.rating);
    }

    return result;
}

function render() {
    const result = filtered();
    const pages = Math.max(1, Math.ceil(result.length / state.perPage));

    state.page = Math.min(Math.max(1, state.page), pages);

    const shown = result.slice(
        (state.page - 1) * state.perPage,
        state.page * state.perPage
    );

    const cards = shown.map(product => `
        <article class="product-card" data-open="${product.id}">
            ${imageMarkup(product)}

            <div class="product-name">${product.name || "Product"}</div>

            <div class="rating">
                ★★★★☆
                <span style="color:#007185">
                    ${product.rating.toFixed(1)}
                    (${product.reviews.toLocaleString("en-IN")})
                </span>
            </div>

            <div class="price">
                <small>₹</small>${product.price.toLocaleString("en-IN")}
            </div>

            <div class="old-price">
                M.R.P.: ${money(product.oldPrice)}
            </div>

            <div class="stock">
                In stock (${product.stock} available)
            </div>

            <div class="card-actions">
                <button data-add="${product.id}">Add to Cart</button>
                <button data-buy="${product.id}">Buy Now</button>
            </div>
        </article>
    `);

    $("productGrid").innerHTML =
        cards.join("") || "<p>No products found. Try another search.</p>";

    $("sectionTitle").textContent =
        state.category === "All" ? "Today's deals" : state.category;

    $("resultInfo").textContent = `${result.length} products found`;
    $("pageInfo").textContent = `Page ${state.page} of ${pages}`;

    $("prevPage").disabled = state.page === 1;
    $("nextPage").disabled = state.page === pages;

    updateCartCount();
}

/* CART */

function updateCartCount() {
    $("cartCount").textContent =
        state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function addCart(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;

    if (product.stock <= 0) {
        toast("Product is out of stock");
        return;
    }

    const existing = state.cart.find(item => item.id === id);

    if (existing) {
        if (existing.qty >= product.stock) {
            toast("Maximum available stock reached");
            return;
        }
        existing.qty++;
    } else {
        state.cart.push({ id, qty: 1 });
    }

    updateCartCount();
    toast(`${product.name} added to cart`);
}

function openCart() {
    $("cartItems").innerHTML = state.cart.length
        ? state.cart.map(item => {
            const product = products.find(p => p.id === item.id);
            if (!product) return "";

            return `
                <div class="cart-row">
                    ${imageMarkup(product, "")}
                    <div>
                        <b>${product.name}</b>
                        <p>${money(product.price)} × ${item.qty}</p>
                        <button data-remove="${product.id}">Remove</button>
                    </div>
                    <b>${money(product.price * item.qty)}</b>
                </div>
            `;
        }).join("")
        : "<p>Your cart is empty.</p>";

    const total = state.cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + (product ? product.price * item.qty : 0);
    }, 0);

    $("cartTotal").textContent = money(total);
    openOverlay("cartDrawer");
}

/* MODALS */

function openOverlay(id) {
    $("overlay").classList.remove("hidden");
    $(id).classList.remove("hidden");
}

function closeAll() {
    $("overlay").classList.add("hidden");

    document.querySelectorAll(".drawer,.modal").forEach(element => {
        element.classList.add("hidden");
    });
}

function showInfo(title, body) {
    $("infoTitle").textContent = title;
    $("infoBody").innerHTML = body;
    openOverlay("infoModal");
}

/* ACCOUNT */

function updateAccountButton() {
    const user = getUser();

    $("accountButton").innerHTML = user
        ? `Hello, ${user.name || "User"}<br><b>Account & Lists</b>`
        : "Hello, sign in<br><b>Account & Lists</b>";
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

    $("authTitle").textContent =
        signup ? "Create account" : "Sign in";

    $("authName").parentElement.classList.toggle("hidden", !signup);
    $("authName").required = signup;

    $("authSubmit").textContent =
        signup ? "Create account" : "Sign in";

    $("authSwitch").innerHTML = signup
        ? 'Already registered? <button type="button" class="text-button" id="switchAuth">Sign in</button>'
        : 'New here? <button type="button" class="text-button" id="switchAuth">Create an account</button>';
}

$("authForm").addEventListener("submit", async event => {
    event.preventDefault();

    const signup = state.authMode === "signup";

    const payload = {
        email: $("authEmail").value.trim().toLowerCase(),
        password: $("authPassword").value
    };

    if (signup) {
        payload.name = $("authName").value.trim();
    }

    try {
        const result = await api(
            signup ? "/auth/register" : "/auth/login",
            {
                method: "POST",
                body: JSON.stringify(payload)
            }
        );

        localStorage.setItem("storeToken", result.token);
        localStorage.setItem("storeUser", JSON.stringify(result.user));

        updateAccountButton();
        closeAll();
        $("authForm").reset();

        toast(signup
            ? "Account created successfully"
            : "Signed in successfully");

    } catch (error) {
        toast(error.message);
    }
});

/* PRODUCT DETAILS */

function openProduct(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;

    $("productDetails").innerHTML = `
        <div class="product-detail">
            ${imageMarkup(product, "")}

            <div>
                <p>${product.category}</p>
                <h2>${product.name}</h2>

                <div class="rating">
                    ★★★★☆ ${product.rating} (${product.reviews} reviews)
                </div>

                <h2>${money(product.price)}</h2>

                <p class="old-price">M.R.P. ${money(product.oldPrice)}</p>
                <p class="stock">In stock (${product.stock} available)</p>
                <p>${product.description || ""}</p>

                <button class="primary" data-add="${product.id}">
                    Add to Cart
                </button>

                <button class="primary" data-buy="${product.id}">
                    Buy Now
                </button>
            </div>
        </div>
    `;

    openOverlay("productModal");
}

/* ORDERS */

async function showOrders() {
    if (!getToken()) {
        toast("Please sign in to view your orders");
        openAuth();
        return;
    }

    try {
        const orders = await api("/orders");

        const body = orders.length
            ? orders.map(order => `
                <div class="order-entry">
                    <b>Order ${order.orderNumber || order._id}</b>
                    <p>${order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : ""}</p>

                    <p>${(order.items || []).map(item =>
                        `${item.name} × ${item.qty}`
                    ).join(", ")}</p>

                    <b>${money(order.total)}</b>
                    <p>Status: ${order.status}</p>

                    ${order.status === "Placed" ? `
                        <button data-return="${order._id}">Request return</button>
                        <button data-cancel="${order._id}">Cancel order</button>
                    ` : ""}
                </div>
            `).join("")
            : "<p>You have no orders yet.</p>";

        showInfo("Your Orders & Returns", body);

    } catch (error) {
        toast(error.message);
    }
}

/* CHECKOUT */

function checkoutItems() {
    return state.buyNowId
        ? [{ id: state.buyNowId, qty: 1 }]
        : state.cart;
}

function startCheckout(id = null) {
    if (!getToken()) {
        toast("Please sign in before checkout");
        openAuth();
        return;
    }

    state.buyNowId = id;
    state.checkoutStep = 2;

    const user = getUser();

    if (user) {
        state.checkout.name = user.name || "";
        state.checkout.email = user.email || "";
    }

    renderCheckout();
    openOverlay("checkoutModal");
}

function renderCheckout() {
    document.querySelectorAll("[data-step-label]").forEach(element => {
        element.classList.toggle(
            "active",
            Number(element.dataset.stepLabel) === state.checkoutStep
        );
    });

    const c = state.checkout;
    let html = "";

    if (state.checkoutStep === 2) {
        html = `
            <h3>Delivery address</h3>

            <label>Full name
                <input id="coName" value="${c.name}" required>
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
    }

    if (state.checkoutStep === 3) {
        html = `
            <h3>Choose a payment method</h3>

            <label>
                <input type="radio" name="payment" value="UPI"
                    ${c.payment === "UPI" ? "checked" : ""}>
                UPI
            </label>

            <label>
                <input type="radio" name="payment" value="Card">
                Credit / Debit Card (demo)
            </label>

            <label>
                <input type="radio" name="payment" value="COD">
                Cash on Delivery
            </label>

            <p class="tiny">
                No real payment will be collected in this demo.
            </p>
        `;
    }

    if (state.checkoutStep === 4) {
        const items = checkoutItems();

        const total = items.reduce((sum, item) => {
            const product = products.find(p => p.id === item.id);
            return sum + (product ? product.price * item.qty : 0);
        }, 0);

        html = `
            <h3>Review your order</h3>

            <p><b>Deliver to:</b>
                ${c.name}, ${c.address}, ${c.city} - ${c.pin}
            </p>

            <p><b>Phone:</b> ${c.phone}</p>
            <p><b>Payment:</b> ${c.payment}</p>

            ${items.map(item => {
                const product = products.find(p => p.id === item.id);

                return product
                    ? `<p>${product.name} × ${item.qty}
                       <b>${money(product.price * item.qty)}</b></p>`
                    : "";
            }).join("")}

            <hr>
            <h3>Order total: ${money(total)}</h3>
        `;
    }

    $("checkoutContent").innerHTML = html + `
        <div class="checkout-actions">
            <button id="coBack"
                ${state.checkoutStep === 2 ? "disabled" : ""}>
                Back
            </button>

            <button id="coNext">
                ${state.checkoutStep === 4 ? "Place Order" : "Continue"}
            </button>
        </div>
    `;
}

function saveCheckoutFields() {
    const get = id => $(id)?.value || "";

    if (state.checkoutStep === 2) {
        Object.assign(state.checkout, {
            name: get("coName"),
            phone: get("coPhone"),
            address: get("coAddress"),
            city: get("coCity"),
            pin: get("coPin")
        });

        if (!state.checkout.name ||
            !state.checkout.address ||
            !state.checkout.city) {
            toast("Complete all delivery fields");
            return false;
        }

        if (!/^\d{10}$/.test(state.checkout.phone)) {
            toast("Enter a valid 10-digit mobile number");
            return false;
        }

        if (!/^\d{6}$/.test(state.checkout.pin)) {
            toast("Enter a valid 6-digit PIN code");
            return false;
        }
    }

    if (state.checkoutStep === 3) {
        state.checkout.payment =
            document.querySelector('input[name="payment"]:checked')?.value || "UPI";
    }

    return true;
}

async function nextCheckout() {
    if (!saveCheckoutFields()) return;

    if (state.checkoutStep < 4) {
        state.checkoutStep++;
        renderCheckout();
        return;
    }

    try {
        const items = checkoutItems().map(item => ({
            productId: item.id,
            qty: item.qty
        }));

        const result = await api("/orders", {
            method: "POST",
            body: JSON.stringify({
                items,
                delivery: state.checkout,
                paymentMethod: state.checkout.payment
            })
        });

        state.cart = [];
        state.buyNowId = null;
        updateCartCount();

        $("checkoutContent").innerHTML = `
            <h2>Order placed successfully!</h2>
            <p>Your order number is <b>${result.orderNumber}</b>.</p>
            <button class="primary" id="finishOrder">
                Continue shopping
            </button>
        `;

        document.querySelectorAll("[data-step-label]").forEach(element => {
            element.classList.remove("active");
        });

        toast("Order placed successfully");
        await loadProducts();

    } catch (error) {
        toast(error.message);
    }
}

/* ALL BUTTONS */

document.addEventListener("click", async event => {
    const card = event.target.closest("[data-open]");

    if (card && !event.target.closest("button")) {
        openProduct(Number(card.dataset.open));
        return;
    }

    const target = event.target.closest("button,a");
    if (!target) return;

    if (target.dataset.category) {
        state.category = target.dataset.category;
        state.query = "";
        $("searchInput").value = "";
        $("searchCategory").value = state.category;
        state.page = 1;
        render();
    }

    if (target.dataset.add) {
        addCart(Number(target.dataset.add));
    }

    if (target.dataset.buy) {
        closeAll();
        startCheckout(Number(target.dataset.buy));
    }

    if (target.dataset.remove) {
        state.cart = state.cart.filter(
            item => item.id !== Number(target.dataset.remove)
        );
        openCart();
        updateCartCount();
    }

    if (target.dataset.return) {
        try {
            await api(`/orders/${target.dataset.return}/return`, {
                method: "PATCH"
            });

            toast("Return request submitted");
            showOrders();

        } catch (error) {
            toast(error.message);
        }
    }

    if (target.dataset.cancel) {
        try {
            await api(`/orders/${target.dataset.cancel}/cancel`, {
                method: "PATCH"
            });

            toast("Order cancelled");
            showOrders();

        } catch (error) {
            toast(error.message);
        }
    }

    if (target.id === "switchAuth") switchAuth();
    if (target.id === "accountButton") openAuth();
    if (target.id === "cartButton") openCart();
    if (target.id === "ordersButton") showOrders();

    if (target.id === "sellNav") {
        showInfo(
            "Sell on this demo store",
            "<p>Welcome to the seller information page.</p><p>This learning demo does not accept real seller listings.</p>"
        );
    }

    if (target.id === "supportNav") {
        showInfo(
            "Customer Service",
            "<p>How can we help?</p><ul><li>Orders: View your orders.</li><li>Returns: Request a return from your orders.</li><li>Payments: Checkout payments are simulated only.</li><li>Account: Register or sign in.</li></ul>"
        );
    }

    if (target.id === "bestNav") {
        state.category = "All";
        state.sort = "rating";
        $("sortSelect").value = "rating";
        state.query = "";
        state.page = 1;
        render();
        document.querySelector(".toolbar").scrollIntoView({ behavior: "smooth" });
    }

    if (target.id === "dealsNav") {
        state.category = "All";
        state.sort = "low";
        $("sortSelect").value = "low";
        state.query = "";
        state.page = 1;
        render();
        document.querySelector(".toolbar").scrollIntoView({ behavior: "smooth" });
    }

    if (target.id === "checkoutButton") {
        if (!state.cart.length) {
            toast("Your cart is empty");
            return;
        }

        closeAll();
        startCheckout();
    }

    if (target.id === "coNext") nextCheckout();

    if (target.id === "coBack") {
        if (saveCheckoutFields()) {
            state.checkoutStep = Math.max(2, state.checkoutStep - 1);
            renderCheckout();
        }
    }

    if (target.id === "finishOrder") closeAll();

    if (target.hasAttribute("data-close")) closeAll();

    if (target.id === "prevPage") {
        state.page--;
        render();
    }

    if (target.id === "nextPage") {
        state.page++;
        render();
    }

    if (target.id === "allCategories") {
        state.category = "All";
        state.query = "";
        state.page = 1;
        state.sort = "featured";

        $("searchInput").value = "";
        $("searchCategory").value = "All";
        $("sortSelect").value = "featured";

        render();

        document.querySelector(".category-strip").scrollIntoView({
            behavior: "smooth"
        });
    }

    if (target.id === "shopNow") {
        document.querySelector(".toolbar").scrollIntoView({
            behavior: "smooth"
        });
    }

    if (target.id === "heroNext" || target.id === "heroPrev") {
        toast("Explore the products below.");
    }

    if (target.id === "backTop") {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (target.classList.contains("brand")) {
        state.category = "All";
        state.query = "";
        state.page = 1;
        render();
    }
});

/* SEARCH */

$("searchForm").addEventListener("submit", event => {
    event.preventDefault();

    state.query = $("searchInput").value.trim();
    state.category = $("searchCategory").value;
    state.page = 1;

    render();
});

$("searchCategory").addEventListener("change", () => {
    state.category = $("searchCategory").value;
    state.page = 1;
    render();
});

/* SORT */

$("sortSelect").addEventListener("change", event => {
    state.sort = event.target.value;
    state.page = 1;
    render();
});

/* CLOSE MODALS */

$("overlay").addEventListener("click", closeAll);

/* START WEBSITE */

init();
