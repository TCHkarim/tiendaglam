(() => {
  const products = Array.isArray(window.PRODUCTOS) ? window.PRODUCTOS : [];
  const config = window.TIENDA_CONFIG || { freeShippingThreshold: 150000, whatsapp: "543513233826" };
  const money = value => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byId = id => products.find(product => product.id === id);
  const cartKey = item => `${item.id}|${JSON.stringify(item.variant || {})}`;
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("glamm-cart-v1") || "[]"); if (!Array.isArray(cart)) cart = []; } catch { cart = []; }
  let toastTimer;

  function toast(message) {
    const el = document.querySelector("[data-toast]");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }
  function updateCount() {
    const count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    document.querySelectorAll("[data-cart-count]").forEach(el => el.textContent = count);
    document.querySelectorAll("[data-drawer-count]").forEach(el => el.textContent = `(${count})`);
  }
  function openCart() {
    document.body.classList.add("drawer-open");
    document.querySelector("[data-cart-drawer]")?.setAttribute("aria-hidden", "false");
  }
  function closeCart() {
    document.body.classList.remove("drawer-open");
    document.querySelector("[data-cart-drawer]")?.setAttribute("aria-hidden", "true");
  }
  function persistCart() {
    localStorage.setItem("glamm-cart-v1", JSON.stringify(cart));
    renderCart();
  }
  function addItem(product, quantity = 1, variant = {}) {
    if (!product || product.stock === 0) { toast("Este producto figura sin stock. Consultanos por WhatsApp."); return false; }
    const incoming = { id: product.id, quantity: Math.max(1, Number(quantity) || 1), variant };
    const key = cartKey(incoming);
    const existing = cart.find(item => cartKey(item) === key);
    const hasStockValue = product.stock !== null && product.stock !== undefined && Number.isFinite(Number(product.stock));
    if (hasStockValue) {
      const alreadyInCart = existing ? Number(existing.quantity || 0) : 0;
      const allowed = Math.max(0, Number(product.stock) - alreadyInCart);
      if (!allowed) { toast("Ya agregaste todas las unidades disponibles de esta variante."); return false; }
      if (incoming.quantity > allowed) {
        incoming.quantity = allowed;
        toast(`Solo quedan ${allowed} unidad(es) disponibles para agregar.`);
      }
    }
    if (existing) existing.quantity += incoming.quantity;
    else cart.push(incoming);
    persistCart();
    toast(`${product.name} se agregó a tu bolsa`);
    return true;
  }
  function renderCart() {
    const holder = document.querySelector("[data-cart-lines]");
    const empty = document.querySelector("[data-cart-empty]");
    const footer = document.querySelector("[data-cart-footer]");
    const subtotal = cart.reduce((sum, item) => sum + (Number(byId(item.id)?.price || 0) * Number(item.quantity || 0)), 0);
    if (holder) {
      holder.innerHTML = cart.map(item => {
        const product = byId(item.id);
        if (!product) return "";
        const variantText = Object.entries(item.variant || {}).map(([key, value]) => `${escapeHtml(key)}: ${escapeHtml(value)}`).join(" · ");
        return `<article class="cart-line" data-cart-line="${escapeHtml(cartKey(item))}"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}"><div><h3>${escapeHtml(product.name)}</h3><p>${variantText || "Edición Glamm"}</p><strong class="cart-line-price">${money(product.price * item.quantity)}</strong><div class="cart-line-controls"><button type="button" data-line-action="minus" aria-label="Restar unidad">−</button><span>${item.quantity}</span><button type="button" data-line-action="plus" aria-label="Sumar unidad">+</button><button type="button" class="remove-line" data-line-action="remove">Quitar</button></div></div></article>`;
      }).join("");
    }
    if (empty) empty.classList.toggle("visible", cart.length === 0);
    if (footer) footer.style.display = cart.length ? "block" : "none";
    const totalEl = document.querySelector("[data-cart-total]");
    if (totalEl) totalEl.textContent = money(subtotal);
    const progress = document.querySelector("[data-shipping-progress]");
    if (progress) {
      const ratio = Math.min(100, subtotal / Number(config.freeShippingThreshold || 150000) * 100);
      const remaining = Math.max(0, Number(config.freeShippingThreshold || 150000) - subtotal);
      progress.innerHTML = subtotal >= config.freeShippingThreshold
        ? `<strong>¡Tu pedido alcanza el envío gratis!</strong><div class="progress-track"><span style="width:100%"></span></div>`
        : `<span>Te faltan <strong>${money(remaining)}</strong> para el envío gratis.</span><div class="progress-track"><span style="width:${ratio}%"></span></div>`;
    }
    updateCount();
  }
  function checkout() {
    if (!cart.length) { toast("Tu bolsa está vacía"); return; }
    const lines = cart.map(item => {
      const product = byId(item.id);
      const variant = Object.entries(item.variant || {}).map(([key, value]) => `${key}: ${value}`).join(", ");
      return `• ${product?.name || "Producto"}${variant ? ` (${variant})` : ""} x${item.quantity} — ${money((product?.price || 0) * item.quantity)}`;
    });
    const subtotal = cart.reduce((sum, item) => sum + (Number(byId(item.id)?.price || 0) * item.quantity), 0);
    const message = `Hola Tienda Glamm, quiero consultar por este pedido:\n${lines.join("\n")}\nSubtotal: ${money(subtotal)}\n¿Me confirman stock, envío y medios de pago?`;
    window.open(`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }
  function cardMarkup(product) {
    const sale = Number(product.compareAtPrice) > Number(product.price);
    const out = Number(product.stock) === 0;
    return `<article class="product-card"><a class="product-card-link" href="producto.html?id=${encodeURIComponent(product.id)}"><div class="product-image-wrap"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy"><span class="product-badge ${out ? "soldout" : ""}">${out ? "Sin stock" : sale ? `${Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF` : "NUEVO LOOK"}</span><span class="product-quick">Ver producto ↗</span></div><div class="product-card-info"><p class="product-card-category">${escapeHtml((product.categories || ["GLAMM"])[0])}</p><h3 class="product-card-name">${escapeHtml(product.name)}</h3><div class="product-card-price"><strong>${money(product.price)}</strong>${sale ? `<del>${money(product.compareAtPrice)}</del>` : ""}</div><p class="transfer-price">Con transferencia <b>${money(product.transferPrice || product.price * .7)}</b></p></div></a></article>`;
  }
  function renderCategories() {
    const categories = [...new Set(products.flatMap(product => product.categories || []))].sort((a, b) => a.localeCompare(b, "es"));
    document.querySelectorAll("[data-category-nav]").forEach(nav => {
      nav.innerHTML = `<button type="button" data-nav-category="">INICIO</button>${categories.map(category => `<button type="button" data-nav-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}`;
      nav.addEventListener("click", event => {
        const button = event.target.closest("[data-nav-category]");
        if (!button) return;
        if (document.querySelector("[data-product-detail]")) {
          window.location.href = `index.html?categoria=${encodeURIComponent(button.dataset.navCategory)}#catalogo`;
          return;
        }
        selectCategory(button.dataset.navCategory);
        document.querySelector("#catalogo")?.scrollIntoView({ behavior: "smooth" });
      });
    });
    const row = document.querySelector("[data-filter-row]");
    if (row) {
      row.innerHTML = `<button type="button" class="filter-chip active" data-filter="">Todo</button>${categories.map(category => `<button type="button" class="filter-chip" data-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}`;
      row.addEventListener("click", event => {
        const button = event.target.closest("[data-filter]");
        if (button) selectCategory(button.dataset.filter);
      });
    }
  }
  let activeCategory = "";
  let searchTerm = "";
  function selectCategory(category) {
    activeCategory = category || "";
    document.querySelectorAll("[data-filter]").forEach(button => button.classList.toggle("active", button.dataset.filter === activeCategory));
    document.querySelectorAll("[data-nav-category]").forEach(button => button.classList.toggle("active", button.dataset.navCategory === activeCategory));
    renderProducts();
  }
  function renderProducts() {
    const grid = document.querySelector("[data-product-grid]");
    if (!grid) return;
    let visible = products.filter(product => {
      const matchesCategory = !activeCategory || (product.categories || []).includes(activeCategory);
      const haystack = `${product.name} ${(product.categories || []).join(" ")}`.toLocaleLowerCase("es");
      return matchesCategory && (!searchTerm || haystack.includes(searchTerm));
    });
    const sort = document.querySelector("[data-sort]")?.value;
    if (sort === "price-low") visible.sort((a, b) => a.price - b.price);
    if (sort === "price-high") visible.sort((a, b) => b.price - a.price);
    if (sort === "name") visible.sort((a, b) => a.name.localeCompare(b.name, "es"));
    grid.innerHTML = visible.map(cardMarkup).join("");
    const note = document.querySelector("[data-results-note]");
    if (note) note.textContent = `${visible.length} ${visible.length === 1 ? "producto" : "productos"}${activeCategory ? ` en ${activeCategory.toLocaleLowerCase("es")}` : " en la colección"}`;
    const empty = document.querySelector("[data-empty]");
    if (empty) empty.hidden = visible.length > 0;
  }
  function attachSearch() {
    document.querySelectorAll("[data-search]").forEach(input => {
      input.addEventListener("input", () => {
        searchTerm = input.value.trim().toLocaleLowerCase("es");
        document.querySelectorAll("[data-search]").forEach(other => { if (other !== input) other.value = input.value; });
        if (document.querySelector("[data-product-detail]")) return;
        renderProducts();
      });
    });
    document.querySelectorAll("[data-search-form]").forEach(form => form.addEventListener("submit", event => {
      event.preventDefault();
      const text = form.querySelector("[data-search]")?.value.trim() || "";
      if (document.querySelector("[data-product-detail]")) window.location.href = `index.html?buscar=${encodeURIComponent(text)}#catalogo`;
      else document.querySelector("#catalogo")?.scrollIntoView({ behavior: "smooth" });
    }));
  }
  document.addEventListener("click", event => {
    if (event.target.closest("[data-cart-open]")) openCart();
    if (event.target.closest("[data-cart-close]") || event.target.matches("[data-drawer-backdrop]")) closeCart();
    if (event.target.closest("[data-checkout]")) checkout();
    const line = event.target.closest("[data-cart-line]");
    const action = event.target.closest("[data-line-action]");
    if (line && action) {
      const key = line.dataset.cartLine;
      const item = cart.find(entry => cartKey(entry) === key);
      if (!item) return;
      if (action.dataset.lineAction === "remove") cart = cart.filter(entry => cartKey(entry) !== key);
      if (action.dataset.lineAction === "minus") item.quantity = Math.max(1, item.quantity - 1);
      if (action.dataset.lineAction === "plus") {
        const product = byId(item.id);
        const hasStockValue = product && product.stock !== null && product.stock !== undefined && Number.isFinite(Number(product.stock));
        if (hasStockValue && item.quantity >= Number(product.stock)) toast("Llegaste al stock disponible.");
        else item.quantity += 1;
      }
      persistCart();
    }
    if (event.target.closest("[data-clear-filters]")) {
      searchTerm = "";
      document.querySelectorAll("[data-search]").forEach(input => input.value = "");
      document.querySelector("[data-sort]")?.value && (document.querySelector("[data-sort]").value = "featured");
      selectCategory("");
    }
    const footerCategory = event.target.closest("[data-footer-category]");
    if (footerCategory) {
      event.preventDefault();
      selectCategory(footerCategory.dataset.footerCategory);
      document.querySelector("#catalogo")?.scrollIntoView({ behavior: "smooth" });
    }
    if (event.target.closest("[data-menu-toggle]")) document.querySelector("[data-category-nav]")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });
  const sort = document.querySelector("[data-sort]");
  sort?.addEventListener("change", renderProducts);
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
  renderCategories();
  attachSearch();
  renderProducts();
  renderCart();
  const params = new URLSearchParams(location.search);
  if (params.has("buscar")) {
    const query = params.get("buscar") || "";
    document.querySelectorAll("[data-search]").forEach(input => input.value = query);
    searchTerm = query.toLocaleLowerCase("es");
    renderProducts();
  }
  if (params.has("categoria")) selectCategory(params.get("categoria"));
  window.GlammStore = { products, byId, money, addItem, openCart, closeCart, toast, renderCart, cart: () => cart, config };
})();
