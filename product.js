(() => {
  const store = window.GlammStore;
  if (!store) return;
  const params = new URLSearchParams(location.search);
  const product = store.byId(params.get("id"));
  const money = store.money;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const main = document.querySelector("[data-product-detail]");
  if (!product || !main) {
    if (main) main.innerHTML = `<div class="empty-state"><span>♡</span><h3>No encontramos esa prenda</h3><p>Volvé a la colección para elegir otro look.</p><a class="button button-dark" href="index.html#catalogo">Ver colección</a></div>`;
    document.title = "Producto no encontrado — Tienda Glamm";
    return;
  }
  document.title = `${product.name} — Tienda Glamm`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", `${product.name} en Tienda Glamm. Consultá colores, talles, disponibilidad y envíos a todo el país.`);
  const name = document.querySelector("[data-product-name]");
  const category = document.querySelector("[data-product-category]");
  const crumb = document.querySelector("[data-product-breadcrumb]");
  const image = document.querySelector("[data-product-image]");
  const label = document.querySelector("[data-product-label]");
  const price = document.querySelector("[data-product-price]");
  const transfer = document.querySelector("[data-product-transfer]");
  const compare = document.querySelector("[data-product-compare]");
  const description = document.querySelector("[data-product-description]");
  name.textContent = product.name;
  category.textContent = (product.categories || ["COLECCIÓN GLAMM"])[0];
  crumb.textContent = product.name;
  image.src = product.image;
  image.alt = product.name;
  price.textContent = money(product.price);
  transfer.textContent = money(product.transferPrice || product.price * .7);
  if (description) {
    const categoryName = (product.categories || ["esta colección"])[0].toLocaleLowerCase("es");
    description.textContent = product.description || `${product.name}, parte de la selección ${categoryName} de Tienda Glamm. Consultanos por WhatsApp para confirmar disponibilidad, talles, colores, medidas y detalles antes de comprar.`;
  }
  if (Number(product.compareAtPrice) > Number(product.price)) {
    compare.hidden = false;
    compare.textContent = money(product.compareAtPrice);
    label.textContent = `${Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF`;
  } else {
    compare.hidden = true;
    label.textContent = "GLAMM EDIT";
  }
  const optionsHolder = document.querySelector("[data-product-options]");
  const selected = {};
  const optionGroups = Object.entries(product.options || {}).filter(([, values]) => Array.isArray(values) && values.length);
  optionsHolder.innerHTML = optionGroups.map(([optionName, values]) => {
    const key = optionName.toLowerCase();
    selected[optionName] = values[0];
    return `<div class="option-group"><label>${esc(optionName)}</label><div class="option-values" data-option="${esc(optionName)}">${values.map((value, index) => `<button type="button" class="${index === 0 ? "selected" : ""}" data-option-value="${esc(value)}">${esc(value)}</button>`).join("")}</div></div>`;
  }).join("");
  optionsHolder.addEventListener("click", event => {
    const button = event.target.closest("[data-option-value]");
    if (!button) return;
    const group = button.closest("[data-option]");
    group.querySelectorAll("button").forEach(item => item.classList.toggle("selected", item === button));
    selected[group.dataset.option] = button.dataset.optionValue;
  });
  const thumbs = document.querySelector("[data-product-thumbs]");
  const gallery = Array.isArray(product.images) && product.images.length ? product.images : [product.image];
  if (gallery.length > 1) {
    thumbs.innerHTML = gallery.map((src, index) => `<button type="button" class="${index === 0 ? "active" : ""}" aria-label="Ver imagen ${index + 1}" data-gallery-src="${esc(src)}"><img src="${esc(src)}" alt="${esc(product.name)} vista ${index + 1}" loading="lazy"></button>`).join("");
    thumbs.addEventListener("click", event => {
      const button = event.target.closest("[data-gallery-src]");
      if (!button) return;
      image.src = button.dataset.gallerySrc;
      thumbs.querySelectorAll("button").forEach(item => item.classList.toggle("active", item === button));
    });
  } else thumbs.hidden = true;
  let quantity = 1;
  const qtyOutput = document.querySelector("[data-qty]");
  const stockNote = document.querySelector("[data-stock-note]");
  stockNote.textContent = product.stock === null || product.stock === undefined ? "" : product.stock === 0 ? "Consultar disponibilidad" : `Disponibles: ${product.stock}`;
  document.querySelector("[data-qty-minus]").addEventListener("click", () => { quantity = Math.max(1, quantity - 1); qtyOutput.value = quantity; qtyOutput.textContent = quantity; });
  document.querySelector("[data-qty-plus]").addEventListener("click", () => {
    const stock = Number(product.stock);
    const hasStockValue = product.stock !== null && product.stock !== undefined && Number.isFinite(stock);
    if (hasStockValue && quantity >= stock) { store.toast("Llegaste al stock disponible."); return; }
    quantity += 1; qtyOutput.value = quantity; qtyOutput.textContent = quantity;
  });
  document.querySelector("[data-add-product]").addEventListener("click", () => {
    if (store.addItem(product, quantity, { ...selected })) store.openCart();
  });
  document.querySelector("[data-buy-product]").addEventListener("click", () => {
    if (product.stock === 0) { store.toast("Consultanos por disponibilidad antes de comprar."); return; }
    const variants = Object.entries(selected).map(([key, value]) => `${key}: ${value}`).join(" · ");
    const msg = `Hola Tienda Glamm, quiero consultar por ${product.name}${variants ? ` (${variants})` : ""}, cantidad ${quantity}. ¿Me confirman disponibilidad, envío y medios de pago?`;
    window.open(`https://wa.me/${store.config.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  });
  const related = store.products
    .filter(item => item.id !== product.id && (item.categories || []).some(cat => (product.categories || []).includes(cat)))
    .slice(0, 4);
  const relatedGrid = document.querySelector("[data-related-grid]");
  if (relatedGrid) relatedGrid.innerHTML = related.map(item => {
    const hasSale = Number(item.compareAtPrice) > Number(item.price);
    return `<article class="product-card"><a class="product-card-link" href="producto.html?id=${encodeURIComponent(item.id)}"><div class="product-image-wrap"><img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy"><span class="product-badge">${hasSale ? `${Math.round((1-item.price/item.compareAtPrice)*100)}% OFF` : "GLAMM EDIT"}</span><span class="product-quick">Ver producto ↗</span></div><div class="product-card-info"><p class="product-card-category">${esc((item.categories||["GLAMM"])[0])}</p><h3 class="product-card-name">${esc(item.name)}</h3><div class="product-card-price"><strong>${money(item.price)}</strong>${hasSale?`<del>${money(item.compareAtPrice)}</del>`:""}</div><p class="transfer-price">Con transferencia <b>${money(item.transferPrice||item.price*.7)}</b></p></div></a></article>`;
  }).join("");
})();
