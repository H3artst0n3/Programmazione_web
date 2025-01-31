const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("registration-form");
const auctionForm = document.getElementById("auction-form");
const auctionContainer = document.getElementById("auction-container");
const loginContainer = document.getElementById("login-container");
const registrationContainer = document.getElementById("registration-container");
const auctionDate = (document.getElementById("auction-date").min = new Date()
  .toISOString()
  .split("T")[0]);

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const data = {
    username: document.getElementById("login-username").value,
    password: document.getElementById("login-password").value,
  };

  const response = await fetch(loginForm.action, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (response.ok) {
    alert(result.msg);
    auctionContainer.classList.remove("hidden");
    loginContainer.classList.add("hidden");
    registrationContainer.classList.add("hidden");
  } else {
    alert("Errore: " + result.msg);
  }
});

registerForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const password = document.getElementById("registration-password").value;

  if (password.length < 8 || password.length > 20) {
    alert("La tua password deve essere lunga 8-20 caratteri.");
    return;
  }

  let hasLetter = false;
  let hasNumber = false;
  let hasSpecialChar = false;
  const specialChars = "@$!%*?&-";

  for (let i = 0; i < password.length; i++) {
    const char = password[i];
    if ((char >= "A" && char <= "Z") || (char >= "a" && char <= "z")) {
      hasLetter = true;
    } else if (char >= "0" && char <= "9") {
      hasNumber = true;
    } else if (specialChars.includes(char)) {
      hasSpecialChar = true;
    } else {
      alert("La tua password non deve contenere spazi.");
      return;
    }
  }

  if (!hasLetter) {
    alert("La tua password deve contenere almeno una lettera.");
    return;
  }

  if (!hasNumber) {
    alert("La tua password deve contenere almeno un numero.");
    return;
  }

  if (!hasSpecialChar) {
    alert(
      "La tua password deve contenere almeno un carattere speciale: @$!%*?&"
    );
    return;
  }

  const data = {
    nome: document.getElementById("registration-name").value,
    cognome: document.getElementById("registration-surname").value,
    username: document.getElementById("registration-username").value,
    password: password,
  };

  const response = await fetch(registerForm.action, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (response.ok) {
    alert(result.msg);
    registrationContainer.classList.add("hidden");
    loginContainer.classList.remove("hidden");
  } else {
    alert("Errore: " + result.msg);
  }
});

auctionForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const data = {
    titolo_asta: document.getElementById("auction-title").value,
    desc_asta: document.getElementById("auction-description").value,
    scadenza: document.getElementById("auction-date").value,
    offerta_iniziale: document.getElementById("auction-price").value,
  };

  const response = await fetch(auctionForm.action, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();

  if (response.ok) {
    alert(result.msg);
    showAuctions();
  } else {
    alert("Errore: " + result.msg);

    loginContainer.classList.remove("hidden");
    auctionContainer.classList.add("hidden");
  }
});

function showSection(sectionId) {
  document.querySelectorAll(".container").forEach((container) => {
    container.classList.add("hidden");
  });
  document.getElementById(sectionId).classList.remove("hidden");
}

function showAuctions() {
  showSection("auction-list-container");
  fetch("api/auctions")
    .then((response) => response.json())
    .then((auctions) => {
      const list = document.getElementById("auction-list");
      list.innerHTML = "";
      auctions.forEach((auction) => {
        const item = document.createElement("li");
        item.innerHTML = `<h3><a href="#" onclick="showAuctionDetails(${auction.id})">${auction.titolo_asta}</a></h3>
                            <p><strong>Offerta iniziale:</strong> €${auction.offerta_iniziale} - <strong>Scadenza:</strong> ${auction.scadenza}<p>
                            <p>Descrizione</p>
                            <p>${auction.desc_asta}</p>`;
        list.appendChild(item);
      });
    });
}

function showAuctionDetails(auctionId) {
  showSection("auction-details-container");
  fetch(`api/auctions/${auctionId}`)
    .then((response) => response.json())
    .then((auction) => {
      const offertaCorrente = auction.offertaCorrente ?? " ";
      const vincitore = auction.vincitore ?? " ";

      const details = document.getElementById("auction-details");
      details.innerHTML = `<h3>${auction.titolo_asta}</h3>
                             <p><strong>Proprietario:</strong> ${auction.proprietario}</p>
                             <p><strong>Offerta iniziale:</strong> €${auction.offerta_iniziale} - <strong>Scadenza:</strong> ${auction.scadenza}<p>
                             <p><strong>Descrizione:</strong> ${auction.desc_asta}</p>
                             <p><strong>Offerta corrente:</strong> €${offertaCorrente} - <strong>Vincitore:</strong> ${vincitore}<p>`;
    });
}

function searchAuctions(event) {
  event.preventDefault(); // Evita il ricaricamento della pagina
  showSection("auction-list-container");
  const searchTerm = document.getElementById("search-bar").value.trim();
  fetch(`/api/auctions/?q=${encodeURIComponent(searchTerm)}`)
    .then((response) => response.json())
    .then((auctions) => {
      const list = document.getElementById("auction-list");
      list.innerHTML = ""; // Pulisce la lista precedente

      if (auctions.length === 0) {
        list.innerHTML = "<p>Nessuna asta trovata.</p>";
        return;
      }

      auctions.forEach((auction) => {
        const item = document.createElement("li");
        const offertaCorrente = auction.offertaCorrente ?? " ";
        const vincitore = auction.vincitore ?? " ";

        item.innerHTML = `<h3><a href="#" onclick="showAuctionDetails(${auction.id})">${auction.titolo_asta}</a></h3>
                            <p><strong>Proprietario:</strong> ${auction.proprietario}</p>
                            <p><strong>Offerta iniziale:</strong> €${auction.offerta_iniziale} - <strong>Scadenza:</strong> ${auction.scadenza}<p>
                            <p><strong>Descrizione:</strong> ${auction.desc_asta}</p>
                            <p><strong>Offerta corrente:</strong> €${offertaCorrente} - <strong>Vincitore:</strong> ${vincitore}<p>`;

        list.appendChild(item);
      });
    })
    .catch((error) => console.error("Errore nella ricerca:", error));
}

function showUsers() {
  showSection("users-list-container");
  fetch("api/users")
    .then((response) => response.json())
    .then((users) => {
      const list = document.getElementById("users-list");
      list.innerHTML = "";
      users.forEach((user) => {
        const item = document.createElement("li");
        item.innerHTML = `<p><a href="#" onclick="showUsersDetails(${user.id})">${user.username}</a></p>`;
        list.appendChild(item);
      });
    });
}

function showUsersDetails(userId) {
  showSection("users-details-container");
  fetch(`api/users/${userId}`)
    .then((response) => response.json())
    .then((user) => {
      const asteVinte = user.asteVinte ?? " ";
      // const prova = asteVinte.map(item => `<li>${item.titolo} - ${item.descrizione} - ${item.prezzoFinale}</li>`).join("");

      const prova = document.createElement("ul");
      asteVinte.forEach((asta) => {
        const item = document.createElement("li");
        item.innerHTML = `<p><strong>Titolo:</strong> ${asta.titolo}</p>
                            <p>Descrizione: ${asta.descrizione}</p>
                            <p>Offerta iniziale: €${asta.offertaIniziale} - Prezzo finale: €${asta.prezzoFinale}`;
        prova.appendChild(item);
      });

      const details = document.getElementById("users-details");
      details.innerHTML = `<h3>${user.username}</h3>
                            <p><strong>Nome:</strong> ${user.nome} - <strong>Cognome:</strong> ${user.cognome}</p>
                            <p><strong>Aste vinte:</strong></p>`;
      details.appendChild(prova);
    });
}
