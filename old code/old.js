const leftArr = document.querySelector('.arrow .left');
const rightArr = document.querySelector('.arrow .right');
const slideProduct = document.querySelector('.t-category .frame .products');
const section = document.querySelector(".shoe-details");
const heroSection = document.querySelector(".ui");
const nav = document.querySelector("nav");
const slides = document.querySelectorAll(".advertise .sliders");
const leftBtn = document.querySelector(".advertise .left");
const rightBtn = document.querySelector(".advertise .right");
const footer = document.querySelector("footer");
// category menu toggle
const categoryBtn = document.querySelector("nav .category-menu .category-btn");
const categoryMenu = document.querySelector("nav .category-menu");
// MOBILE MENU
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");


categoryBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    categoryMenu.classList.toggle("active");
});

// outside click hide
document.addEventListener("click", (e) => {

    if (!menu.contains(e.target) && !categoryBtn.contains(e.target)) {
        categoryMenu.classList.remove("active");
    }

});



// for nav
window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {
        nav.classList.add("scrolled");
    }

    else {
        nav.classList.remove("scrolled");
    }

});


// for UI
window.addEventListener("load", () => {
    heroSection.classList.add("show");
});

// for shoes details
window.addEventListener("scroll", () => {

    const sectionTop = section.getBoundingClientRect().top;
    const triggerPoint = window.innerHeight - 150;

    if (sectionTop < triggerPoint) {
        section.classList.add("show");
    }

});


let sliderNum = 0;
let productCount = 8;

rightArr.addEventListener('click', () => {
    if (sliderNum < 7) {
        sliderNum++;
        slideProduct.style.transform = `translateX(-${sliderNum * 330}px)`;
    }
});

leftArr.addEventListener('click', () => {
    if (sliderNum > 0) {
        sliderNum--;
        slideProduct.style.transform = `translateX(-${sliderNum * 330}px)`;
    }
});

// the advertise section

let index = 0;

function showSlide(i) {
    slides.forEach((slide) => {
        slide.classList.remove("active");
    });

    slides[i].classList.add("active");
}

rightBtn.addEventListener("click", () => {
    index++;

    if (index >= slides.length) {
        index = 0;
    }

    showSlide(index);
});

leftBtn.addEventListener("click", () => {
    index--;

    if (index < 0) {
        index = slides.length - 1;
    }

    showSlide(index);
});

/* auto slider */

setInterval(() => {
    index++;

    if (index >= slides.length) {
        index = 0;
    }

    showSlide(index);
}, 4000);


// footer scroll animation

window.addEventListener("scroll", () => {

    const footerTop = footer.getBoundingClientRect().top;
    const screenHeight = window.innerHeight;

    if (footerTop < screenHeight + 110) {
        footer.classList.add("show");
    }

});


