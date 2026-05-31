// PASSWORD SHOW/HIDE

const togglePassword = document.querySelector('.toggle-password');

const password = document.querySelector('#password');

togglePassword.addEventListener('click', () => {

    // CHECK TYPE
    const type = password.getAttribute('type') === 'password'
        ? 'text'
        : 'password';

    // CHANGE INPUT TYPE
    password.setAttribute('type', type);

    // CHANGE ICON
    if(type === 'password'){

        togglePassword.classList.remove('ri-eye-line');

        togglePassword.classList.add('ri-eye-off-line');

    } else {

        togglePassword.classList.remove('ri-eye-off-line');

        togglePassword.classList.add('ri-eye-line');
    }

});



// INPUT ANIMATION EFFECT

const inputs = document.querySelectorAll('.input-field input');

inputs.forEach(input => {

    input.addEventListener('focus', () => {

        input.parentElement.style.boxShadow =
            '0 0 0 4px rgba(17, 24, 39, 0.1)';

    });

    input.addEventListener('blur', () => {

        input.parentElement.style.boxShadow = 'none';

    });

});



// BUTTON LOADING EFFECT

const form = document.querySelector('form');

const loginBtn = document.querySelector('.login-btn');

form.addEventListener('submit', () => {

    loginBtn.innerHTML = 'Please Wait...';

    loginBtn.style.opacity = '0.8';

});



// CARD FLOAT EFFECT

const card = document.querySelector('.shoe-card');

document.addEventListener('mousemove', (e) => {

    const x = (window.innerWidth / 2 - e.pageX) / 30;

    const y = (window.innerHeight / 2 - e.pageY) / 30;

    card.style.transform =
        `rotateY(${x}deg) rotateX(${-y}deg)`;

});



// RESET CARD POSITION

document.addEventListener('mouseleave', () => {

    card.style.transform =
        'rotateY(0deg) rotateX(0deg)';

});