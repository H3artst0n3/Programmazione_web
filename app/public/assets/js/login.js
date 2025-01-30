const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('registration-form');
const auctionForm = document.getElementById('auction-form');
const auctionContainer = document.getElementById('auction-container');
const loginContainer = document.getElementById('login-container');
const registrationContainer = document.getElementById('registration-container');
const auctionDate = document.getElementById('auction-date').min = new Date().toISOString().split('T')[0];

loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const data = {
        username: document.getElementById('login-username').value,
        password: document.getElementById('login-password').value
    };

    const response = await fetch(loginForm.action, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
        alert(result.msg);
        auctionContainer.classList.remove('hidden');
        loginContainer.classList.add('hidden');
        registrationContainer.classList.add('hidden');
    } else {
        alert('Errore: ' + result.msg);
    }
});

registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const password = document.getElementById('registration-password').value;

    if (password.length < 8 || password.length > 20) {
        alert('La tua password deve essere lunga 8-20 caratteri.');
        return;
    }

    let hasLetter = false;
    let hasNumber = false;
    let hasSpecialChar = false;
    const specialChars = "@$!%*?&-";

    for (let i = 0; i < password.length; i++) {
        const char = password[i];
        if ((char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z')) {
            hasLetter = true;
        } else if (char >= '0' && char <= '9') {
            hasNumber = true;
        } else if (specialChars.includes(char)) {
            hasSpecialChar = true;
        } else {
            alert('La tua password non deve contenere spazi.');
            return;
        }
    }

    if (!hasLetter) {
        alert('La tua password deve contenere almeno una lettera.');
        return;
    }

    if (!hasNumber) {
        alert('La tua password deve contenere almeno un numero.');
        return;
    }

    if (!hasSpecialChar) {
        alert('La tua password deve contenere almeno un carattere speciale: @$!%*?&');
        return;
    }

    const data = {
        nome: document.getElementById('registration-name').value,
        cognome: document.getElementById('registration-surname').value,
        username: document.getElementById('registration-username').value,
        password: password
    };

    const response = await fetch(registerForm.action, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
        alert(result.msg);
        registrationContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    } else {
        alert('Errore: ' + result.msg);
    }
});

auctionForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const data = {
        titolo_asta: document.getElementById('auction-title').value,
        desc_asta: document.getElementById('auction-description').value,
        scadenza: document.getElementById('auction-date').value,
        offerta_iniziale: document.getElementById('auction-price').value
    };

    const response = await fetch(auctionForm.action, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();

    if (response.ok) {
        alert(result.msg);
        showAuctions();
    } else {
        alert('Errore: ' + result.msg);
        
        loginContainer.classList.remove('hidden');
        auctionContainer.classList.add('hidden');
    }
});