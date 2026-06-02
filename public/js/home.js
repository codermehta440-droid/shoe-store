// ===============================
// PRODUCT SLIDER
// ===============================
const leftArr = document.querySelector(".arrow .left");
const rightArr = document.querySelector(".arrow .right");
const slideProduct = document.querySelector(".t-category .frame .products");

// ===============================
// OTHER ELEMENTS
// ===============================
const section = document.querySelector(".shoe-details");
const heroSection = document.querySelector(".ui");
const nav = document.querySelector("nav");
const slides = document.querySelectorAll(".advertise .sliders");
const leftBtn = document.querySelector(".advertise .left");
const rightBtn = document.querySelector(".advertise .right");
const footer = document.querySelector("footer");

// ===============================
// CATEGORY MENU
// ===============================
const categoryBtn = document.querySelector(
  "nav .category-menu .category-btn"
);

const categoryMenu = document.querySelector("nav .category-menu");
const menu = document.querySelector("nav .category-menu .menu");

// ===============================
// MOBILE MENU
// ===============================
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

// ===============================
// CATEGORY TOGGLE
// ===============================
if (categoryBtn && categoryMenu) {
  categoryBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    categoryMenu.classList.toggle("active");
  });

  // OUTSIDE CLICK HIDE CATEGORY
  document.addEventListener("click", (e) => {
    if (
      !categoryMenu.contains(e.target) &&
      !categoryBtn.contains(e.target)
    ) {
      categoryMenu.classList.remove("active");
    }
  });
}

// ===============================
// NAVBAR SCROLL EFFECT
// ===============================
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});

// ===============================
// HERO SECTION ANIMATION
// ===============================
window.addEventListener("load", () => {
  heroSection.classList.add("show");
});

// ===============================
// SHOE DETAILS ANIMATION
// ===============================
window.addEventListener("scroll", () => {
  const sectionTop = section.getBoundingClientRect().top;
  const triggerPoint = window.innerHeight - 150;

  if (sectionTop < triggerPoint) {
    section.classList.add("show");
  }
});

// ===============================
// PRODUCT SLIDER
// ===============================
let sliderNum = 0;

rightArr.addEventListener("click", () => {
  const maxSlide =
    slideProduct.children.length -
    Math.floor(document.querySelector(".frame").offsetWidth / 330);

  if (sliderNum < maxSlide) {
    sliderNum++;
    slideProduct.style.transform = `translateX(-${sliderNum * 330}px)`;
  }
});

leftArr.addEventListener("click", () => {
  if (sliderNum > 0) {
    sliderNum--;
    slideProduct.style.transform = `translateX(-${sliderNum * 330}px)`;
  }
});

// ===============================
// ADVERTISE SLIDER
// ===============================
let index = 0;

function showSlide(i) {
  slides.forEach((slide) => {
    slide.classList.remove("active");
  });

  slides[i].classList.add("active");
}

// RIGHT BUTTON
rightBtn.addEventListener("click", () => {
  index++;

  if (index >= slides.length) {
    index = 0;
  }

  showSlide(index);
});

// LEFT BUTTON
leftBtn.addEventListener("click", () => {
  index--;

  if (index < 0) {
    index = slides.length - 1;
  }

  showSlide(index);
});

// AUTO SLIDER
setInterval(() => {
  index++;

  if (index >= slides.length) {
    index = 0;
  }

  showSlide(index);
}, 4000);

// ===============================
// FOOTER SCROLL ANIMATION
// ===============================
window.addEventListener("scroll", () => {
  const footerTop = footer.getBoundingClientRect().top;
  const screenHeight = window.innerHeight;

  if (footerTop < screenHeight - 100) {
    footer.classList.add("show");
  }
});

// ===============================
// MOBILE MENU TOGGLE
// ===============================
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle("active");
  });

  // OUTSIDE CLICK CLOSE MOBILE MENU
  document.addEventListener("click", (e) => {
    if (
      !mobileMenu.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      mobileMenu.classList.remove("active");
    }
  });
}

// ===============================
// WINDOW RESIZE RESET
// ===============================
window.addEventListener("resize", () => {
  slideProduct.style.transform = `translateX(0px)`;
  sliderNum = 0;
});