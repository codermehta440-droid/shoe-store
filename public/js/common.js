// Common navbar and mobile menu behavior used across pages.
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const categoryBtn = document.querySelector("nav .category-menu .category-btn");
const categoryMenu = document.querySelector("nav .category-menu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle("active");
  });
}

if (categoryBtn && categoryMenu) {
  categoryBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    categoryMenu.classList.toggle("active");
  });
}

// Close menus when clicking outside

document.addEventListener("click", (e) => {
  if (mobileMenu && menuToggle) {
    if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      mobileMenu.classList.remove("active");
    }
  }

  if (categoryMenu && categoryBtn) {
    if (!categoryMenu.contains(e.target) && !categoryBtn.contains(e.target)) {
      categoryMenu.classList.remove("active");
    }
  }
});
