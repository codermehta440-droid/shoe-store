const deleteForms = document.querySelectorAll(".delete-form");

deleteForms.forEach(form => {

    form.addEventListener("submit", (e) => {

        const confirmDelete = confirm(
            "Are you sure you want to delete this product?"
        );

        if(!confirmDelete){
            e.preventDefault();
        }

    });

});