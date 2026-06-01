// Signup page client behavior — attach listeners only if elements exist
const passwordInput = document.querySelector("#password");
const confirmPassword = document.querySelector("#confirmPassword");

const togglePassword = document.querySelector(".toggle-password");
const toggleConfirm = document.querySelector(".toggle-confirm");

/* PASSWORD TOGGLE */
if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    togglePassword.classList.toggle("ri-eye-off-line", !isHidden);
    togglePassword.classList.toggle("ri-eye-line", isHidden);
  });
}

/* CONFIRM PASSWORD */
if (toggleConfirm && confirmPassword) {
  toggleConfirm.addEventListener("click", () => {
    const isHidden = confirmPassword.type === "password";
    confirmPassword.type = isHidden ? "text" : "password";
    toggleConfirm.classList.toggle("ri-eye-off-line", !isHidden);
    toggleConfirm.classList.toggle("ri-eye-line", isHidden);
  });
}
