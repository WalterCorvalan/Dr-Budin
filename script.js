// FUNCIÓN PARA MOSTRAR LAS TABS
function showTab(id, btn) {
  document
    .querySelectorAll(".panel")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById("panel-" + id).classList.add("active");
  btn.classList.add("active");

  // Al tocar un botón, la vista se acomoda y se asegura de subir un poco para mostrar bien la categoría
  btn.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "center",
  });
  document.getElementById("main").scrollTo({ top: 150, behavior: "smooth" });
}

// FUNCIONES PARA EL MODAL (LIGHTBOX) DE FOTOS
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("img01");

// Abre el modal y establece la foto en alta resolución
function openModal(srcAltaRes) {
  modal.style.display = "block";
  modalImg.src = srcAltaRes;
}

// Cierra el modal
function closeModal() {
  modal.style.display = "none";
}

// Cierra con la tecla ESC
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

// --- LÓGICA DEL CARRITO DE COMPRAS ---
let cart = [];

// Agregar un producto al array
function addToCart(name, price) {
  const existingItem = cart.find(item => item.name === name);
  
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ name: name, price: price, qty: 1 });
  }
  
  updateCartUI();
  showToast();
}

// Modificar cantidades desde el panel del carrito (+ y -)
function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
}

// Actualizar la vista visual del carrito y los totales
function updateCartUI() {
  const container = document.getElementById('cart-items-container');
  const countBadge = document.getElementById('cart-count');
  const totalEl = document.getElementById('cart-total-price');
  
  container.innerHTML = '';
  let total = 0;
  let itemsCount = 0;

  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty-msg">Tu pedido está vacío.</div>';
    countBadge.style.display = 'none';
  } else {
    cart.forEach((item, index) => {
      let itemTotal = item.price * item.qty;
      total += itemTotal;
      itemsCount += item.qty;
      
      container.innerHTML += `
        <div class="cart-item">
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">$${itemTotal.toLocaleString('es-AR')}</span>
          </div>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
            <span class="item-qty">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
          </div>
        </div>
      `;
    });
    countBadge.style.display = 'flex';
    countBadge.innerText = itemsCount;
  }
  
  totalEl.innerText = `$${total.toLocaleString('es-AR')}`;
}

// Abrir y cerrar la barra lateral del carrito
function toggleCart() {
  document.getElementById('cart-sidebar').classList.toggle('open');
  document.getElementById('cart-overlay').classList.toggle('open');
}

// Mostrar el mensajito temporal de "Añadido al carrito"
function showToast() {
  const toast = document.getElementById("toast");
  toast.className = "show";
  setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

// --- FUNCIÓN PARA ENVIAR A WHATSAPP ---
function sendWhatsAppOrder() {
  if (cart.length === 0) {
    alert("¡Agrega algunos productos deliciosos antes de pedir!");
    return;
  }

  // >>> REEMPLAZA LAS 'X' POR TU NÚMERO (Ejemplo: 549385xxxxxxx) <<<
  const NUMERO_WHATSAPP = "3856865979"; 

  let total = 0;
  
  // Mensaje súper limpio: Solo el pedido.
  let texto = "¡Hola Dr. Budín! 👨‍🍳\n";
  texto += "Te envío mi pedido:\n\n";

  cart.forEach(item => {
    let subtotal = item.price * item.qty;
    total += subtotal;
    texto += `- ${item.qty} x ${item.name} ($${subtotal.toLocaleString('es-AR')})\n`;
  });

  texto += "-----------------------------------\n";
  texto += `*TOTAL: $${total.toLocaleString('es-AR')}*\n\n`;
  texto += "Aguardamos tu respuesta para coordinar pago y entrega. ¡Gracias!";

  const mensajeCodificado = encodeURIComponent(texto);
  const link = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensajeCodificado}`;

  window.open(link, '_blank');

}