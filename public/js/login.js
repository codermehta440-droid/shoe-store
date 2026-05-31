const passwordInput = document.querySelector("#password");
const togglePassword = document.querySelector(".toggle-password");

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".links");

// PASSWORD SHOW/HIDE

togglePassword.addEventListener("click", () => {

  if(passwordInput.type === "password"){

    passwordInput.type = "text";

    togglePassword.classList.remove("ri-eye-off-line");
    togglePassword.classList.add("ri-eye-line");

  }

  else{

    passwordInput.type = "password";

    togglePassword.classList.remove("ri-eye-line");
    togglePassword.classList.add("ri-eye-off-line");

  }

});

// MOBILE MENU

menuToggle.addEventListener("click", () => {

  navLinks.classList.toggle("active");

});

// OUTSIDE CLICK CLOSE

document.addEventListener("click", (e) => {

  if(
    !menuToggle.contains(e.target) &&
    !navLinks.contains(e.target)
  ){

    navLinks.classList.remove("active");

  }

});