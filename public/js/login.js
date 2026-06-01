const passwordInput = document.querySelector("#password");
const togglePassword = document.querySelector(".toggle-password");

// PASSWORD SHOW/HIDE
if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    togglePassword.classList.toggle("ri-eye-off-line", !isHidden);
    togglePassword.classList.toggle("ri-eye-line", isHidden);
  });
}
