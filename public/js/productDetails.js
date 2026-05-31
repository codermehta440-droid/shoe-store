// ================= IMAGE SLIDER =================

const smallImages = document.querySelectorAll(".small-img");
const mainImage = document.getElementById("mainImage");

smallImages.forEach((imgBox) => {
    imgBox.addEventListener("click", () => {

        // remove active class
        smallImages.forEach((item) => {
            item.classList.remove("active");
        });

        // add active class
        imgBox.classList.add("active");

        // change image
        const image = imgBox.querySelector("img").src;
        mainImage.src = image;
    });
});


// ================= SIZE ACTIVE =================

const sizes = document.querySelectorAll(".size");

sizes.forEach((size) => {
    size.addEventListener("click", () => {

        // remove active
        sizes.forEach((item) => {
            item.classList.remove("active");
        });

        // add active
        size.classList.add("active");
    });
});


// ================= COLOR ACTIVE =================

const colors = document.querySelectorAll(".color");

colors.forEach((color) => {
    color.addEventListener("click", () => {

        // remove active
        colors.forEach((item) => {
            item.classList.remove("active");
        });

        // add active
        color.classList.add("active");
    });
});


// ================= ADD TO CART =================

const cartBtn = document.querySelector(".cart-btn");

cartBtn.addEventListener("click", () => {
    cartBtn.innerHTML = `
    <i class="ri-check-line"></i>
    Added Successfully
  `;

    setTimeout(() => {
        cartBtn.innerHTML = `
      <i class="ri-shopping-cart-line"></i>
      Add To Cart
    `;
    }, 2000);
});


// ================= BUY NOW =================

const buyBtn = document.querySelector(".buy-btn");

buyBtn.addEventListener("click", () => {
    alert("Proceeding to checkout...");
});


// ================= WISHLIST BUTTON =================

const wishlistBtn = document.querySelector(".wishlist");

wishlistBtn.addEventListener("click", () => {

    wishlistBtn.classList.toggle("active");

    if (wishlistBtn.classList.contains("active")) {

        wishlistBtn.innerHTML = `
      <i class="ri-heart-fill"></i>
      Added Wishlist
    `;

    } else {

        wishlistBtn.innerHTML = `
      <i class="ri-heart-line"></i>
      Add Wishlist
    `;
    }
});


// ================= SHARE BUTTON =================

const shareBtn = document.querySelector(".share");

shareBtn.addEventListener("click", async () => {

    if (navigator.share) {

        await navigator.share({
            title: "Black Sneaker Running Shoe",
            text: "Check out this amazing sneaker!",
            url: window.location.href,
        });

    } else {

        alert("Sharing not supported on this browser");
    }
});


// ================= COMPARE BUTTON =================

const compareBtn = document.querySelector(".compare");

compareBtn.addEventListener("click", () => {
    compareBtn.innerHTML = `
    <i class="ri-check-double-line"></i>
    Added Compare
  `;

    setTimeout(() => {
        compareBtn.innerHTML = `
      <i class="ri-scales-line"></i>
      Compare
    `;
    }, 2000);
});