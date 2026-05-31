const form = document.querySelector(".product-form");

form.addEventListener("submit", () => {

    const btn = document.querySelector(".submit-btn");

    btn.innerText = "Please Wait...";
    
    btn.disabled = true;

});