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
  // Opcional: Bloquear el scroll del body al abrir
  // document.body.style.overflow = 'hidden';
}

// Cierra el modal
function closeModal() {
  modal.style.display = "none";
  // Opcional: Restaurar el scroll del body al cerrar
  // document.body.style.overflow = 'auto';
}

// Cierra con la tecla ESC
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});
