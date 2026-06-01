const passwordInput = document.querySelector("#password");
const confirmPassword = document.querySelector("#confirmPassword");

const togglePassword = document.querySelector(".toggle-password");
const toggleConfirm = document.querySelector(".toggle-confirm");

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".links");
if (passwordInput && confirmPassword && togglePassword && toggleConfirm && menuToggle && navLinks) {
  /* PASSWORD TOGGLE */

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

  /* CONFIRM PASSWORD */

  toggleConfirm.addEventListener("click", () => {

    if(confirmPassword.type === "password"){

      confirmPassword.type = "text";

      toggleConfirm.classList.remove("ri-eye-off-line");
      toggleConfirm.classList.add("ri-eye-line");

    }

    else{

      confirmPassword.type = "password";

      toggleConfirm.classList.remove("ri-eye-line");
      toggleConfirm.classList.add("ri-eye-off-line");

    }

  });

  /* MOBILE MENU */

  menuToggle.addEventListener("click", () => {

    navLinks.classList.toggle("active");

  });

  /* OUTSIDE CLICK */

  document.addEventListener("click", (e) => {
    // Only run outside-click logic if both elements exist
    if (!menuToggle || !navLinks) return;

    if (
      !menuToggle.contains(e.target) &&
      !navLinks.contains(e.target)
    ) {
      navLinks.classList.remove("active");
    }

  });
}

/* PASSWORD TOGGLE */

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

/* CONFIRM PASSWORD */

toggleConfirm.addEventListener("click", () => {

  if(confirmPassword.type === "password"){

    confirmPassword.type = "text";

    toggleConfirm.classList.remove("ri-eye-off-line");
    toggleConfirm.classList.add("ri-eye-line");

  }

  else{

    confirmPassword.type = "password";

    toggleConfirm.classList.remove("ri-eye-line");
    toggleConfirm.classList.add("ri-eye-off-line");

  }

});

/* MOBILE MENU */

menuToggle.addEventListener("click", () => {

  navLinks.classList.toggle("active");

});

/* OUTSIDE CLICK */

document.addEventListener("click", (e) => {

  if(
    !menuToggle.contains(e.target) &&
    !navLinks.contains(e.target)
  ){

    navLinks.classList.remove("active");

  }

});