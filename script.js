// ==========================================
// CONFIGURACIÓN DE GOOGLE SHEETS
// ==========================================
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTadvNz3Nn2DxuwQfyBG547bkkvZM_wYvDL_maYzexKOuljQa4ggnBLeYDxItDWegbb89Iuuq0CDL_A/pub?output=csv";

// Cargar catálogo al abrir la página
window.addEventListener("DOMContentLoaded", loadCatalog);

async function loadCatalog() {
  try {
    const response = await fetch(SHEET_URL);
    const csvText = await response.text();
    const products = parseCSV(csvText);
    renderCatalog(products);
  } catch (error) {
    console.error("Error al cargar el catálogo:", error);
    document.querySelectorAll(".dynamic-list").forEach((c) => {
      c.innerHTML =
        '<p style="text-align:center; color:red;">Error al conectar con la base de datos.</p>';
    });
  }
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    result.push({
      categoria: cols[0]?.replace(/"/g, "").trim().toLowerCase(),
      subcategoria: cols[1]?.replace(/"/g, "").trim().toLowerCase(),
      nombre: cols[2]?.replace(/"/g, "").trim(),
      precioChico: cleanPrice(cols[3]),
      precioGrande: cleanPrice(cols[4]),
      precioUnico: cleanPrice(cols[5]),
      imagen: cols[6]?.replace(/"/g, "").trim(),
    });
  }
  return result;
}

function cleanPrice(val) {
  if (!val) return "";
  return val
    .replace(/"/g, "")
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .replace(/\./g, "")
    .trim();
}

function renderCatalog(products) {
  const containers = document.querySelectorAll(".dynamic-list");
  containers.forEach((c) => (c.innerHTML = ""));

  products.forEach((p) => {
    const containerId = `cat-${p.categoria}-${p.subcategoria}`;
    const container = document.getElementById(containerId);
    if (!container) return;

    // Lógica de imagen: Si hay link muestra la foto, sino muestra el emoji
    let imagenHTML = "";
    if (p.imagen && p.imagen.startsWith("http")) {
      imagenHTML = `<img src="${p.imagen}" class="item-img" alt="${p.nombre}" onclick="openModal('${p.imagen}')">`;
    } else {
      const emoji = p.subcategoria === "panes" ? "🍞" : "🧁";
      imagenHTML = `<div class="item-img-placeholder" style="width:65px; height:65px; background:#eee; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0;">${emoji}</div>`;
    }

    let html = "";

    // AHORA LAS PEPAS ENTRAN AQUÍ TAMBIÉN (Caso Precio Único)
    if (p.precioChico && p.precioGrande) {
      // Diseño para productos con dos tamaños (Budines)
      html = `
        <div class="item-row">
          ${imagenHTML}
          <div class="item-info">
            <span class="item-label">${p.nombre}</span>
            <div class="item-actions">
              <button class="btn-add" onclick="addToCart('${p.nombre} (Pequ)', ${p.precioChico})">P <span class="price">$${Number(p.precioChico).toLocaleString("es-AR")}</span> <span class="icon-plus">+</span></button>
              <button class="btn-add" onclick="addToCart('${p.nombre} (Gde)', ${p.precioGrande})">G <span class="price">$${Number(p.precioGrande).toLocaleString("es-AR")}</span> <span class="icon-plus">+</span></button>
            </div>
          </div>
        </div>`;
    } else if (p.precioUnico) {
      // Diseño para productos de un solo precio (Panes, Magdalenas y ahora Pepas)
      // Ajustamos el nombre para las pepas para que en el carrito diga "100g Pepas..."
      const nombreItem =
        p.subcategoria === "pepas" ? `100g Pepas ${p.nombre}` : p.nombre;

      html = `
        <div class="item-row">
          ${imagenHTML}
          <div class="item-info">
            <span class="item-label">${p.nombre}</span>
            <div class="item-actions">
               <button class="btn-add" onclick="addToCart('${nombreItem}', ${p.precioUnico})"><span class="price">$${Number(p.precioUnico).toLocaleString("es-AR")}</span> <span class="icon-plus">+</span></button>
            </div>
          </div>
        </div>`;
    }

    container.innerHTML += html;
  });

  containers.forEach((c) => {
    if (c.innerHTML === "")
      c.innerHTML =
        '<p style="text-align:center; padding:10px; color:#888; font-style:italic;">Próximamente...</p>';
  });
}

// --- INTERFAZ ---
function showTab(id, btn) {
  document
    .querySelectorAll(".panel")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById("panel-" + id).classList.add("active");
  btn.classList.add("active");
  btn.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "center",
  });
}

const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("img01");
function openModal(src) {
  modal.style.display = "block";
  modalImg.src = src;
}
function closeModal() {
  modal.style.display = "none";
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

let cart = [];
function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCartUI();
  showToast();
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  updateCartUI();
}
function updateCartUI() {
  const container = document.getElementById("cart-items-container");
  const countBadge = document.getElementById("cart-count");
  const totalEl = document.getElementById("cart-total-price");
  container.innerHTML = "";
  let total = 0,
    itemsCount = 0;
  if (cart.length === 0) {
    container.innerHTML =
      '<div class="cart-empty-msg">Tu pedido está vacío.</div>';
    countBadge.style.display = "none";
  } else {
    cart.forEach((item, index) => {
      let itemTotal = item.price * item.qty;
      total += itemTotal;
      itemsCount += item.qty;
      container.innerHTML += `
        <div class="cart-item">
          <div class="cart-item-info"><span class="cart-item-name">${item.name}</span><span class="cart-item-price">$${itemTotal.toLocaleString("es-AR")}</span></div>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
            <span class="item-qty">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
          </div>
        </div>`;
    });
    countBadge.style.display = "flex";
    countBadge.innerText = itemsCount;
  }
  totalEl.innerText = `$${total.toLocaleString("es-AR")}`;
}
function toggleCart() {
  document.getElementById("cart-sidebar").classList.toggle("open");
  document.getElementById("cart-overlay").classList.toggle("open");
}
function showToast() {
  const toast = document.getElementById("toast");
  toast.className = "show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}
function sendWhatsAppOrder() {
  if (cart.length === 0) return;
  const NUMERO_WHATSAPP = "5493856865979";
  let total = 0;
  let texto =
    "¡Hola Dr. Budín! 👨‍🍳\nQuiero realizar el siguiente pedido:\n\n*MI CARRITO:*\n-----------------------------------\n";
  cart.forEach((item) => {
    let subtotal = item.price * item.qty;
    total += subtotal;
    texto += `- ${item.qty} x ${item.name} ($${subtotal.toLocaleString("es-AR")})\n`;
  });
  texto += "-----------------------------------\n";
  texto += `*TOTAL: $${total.toLocaleString("es-AR")}*\n\n`;
  const notas = document.getElementById("cart-notes-text").value.trim();
  if (notas) {
    texto += `*ACLARACIONES:*\n📝 ${notas}\n\n`;
  }
  texto += "Aguardamos tu respuesta para coordinar pago y entrega. ¡Gracias!";
  window.open(
    `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(texto)}`,
    "_blank",
  );
}
