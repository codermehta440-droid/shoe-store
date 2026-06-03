const form = document.querySelector(".product-form");
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const previewImage = document.getElementById("previewImage");

dropZone.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", (e) => {
    showPreview(e.target.files[0]);
});

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    const file = e.dataTransfer.files[0];

    if (file) {
        fileInput.files = e.dataTransfer.files;
        showPreview(file);
    }
});

function showPreview(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewImage.style.display = "block";
    };

    reader.readAsDataURL(file);
}



form.addEventListener("submit", () => {

    const btn = document.querySelector(".submit-btn");

    btn.innerText = "Please Wait...";

    btn.disabled = true;

});