// Simulazione di autenticazione
const loginForm = document.getElementById('login-form');
const auctionContainer = document.getElementById('auction-container');

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Simulazione: se il login ha successo, mostra il form per creare un'asta
    alert('Login effettuato con successo!');
    auctionContainer.classList.remove('hidden');
});