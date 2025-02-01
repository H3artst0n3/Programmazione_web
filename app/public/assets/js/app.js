const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("registration-form");
const auctionForm = document.getElementById("auction-form");
const editAuctionForm = document.getElementById("editAuction-form");
const bidsForm = document.getElementById("bids-form");

function showSection(...sectionIds) {
  document.querySelectorAll(".container").forEach((container) => {
    container.classList.add("hidden");
  });

  sectionIds.forEach((id) => {
    document.getElementById(id)?.classList.remove("hidden");
  });
}

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
    showSection("auction-container")
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
    showSection("login-container")
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
    showSection("login-container")
  }
});

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

      fetch(`api/whoami`)
        .then((response) => response.json())
        .then((username) => {
          if (username === auction.proprietario) {
            showSection("auction-details-container", "editAuction-container")
          } else {
            showSection("auction-details-container", "bids-container")
          }
        })

      const vincitore = auction.vincitore ?? " ";
      const offertaCorrente = auction.offertaCorrente ?? " ";

      const details = document.getElementById("auction-details");
      details.innerHTML = `<h3 id="auction-title-details">${auction.titolo_asta}</h3>
                          <p><strong>Proprietario:</strong> ${auction.proprietario}</p>
                          <p><strong>Offerta iniziale:</strong> €${auction.offerta_iniziale} - <strong>Scadenza:</strong> ${auction.scadenza}<p>
                          <p><strong>Descrizione:</strong> ${auction.desc_asta}</p>
                          <p><strong>Offerta corrente:</strong> €${offertaCorrente} - <strong>Vincitore:</strong> ${vincitore}<p>`;
    });
}

function searchAuctions(event) {
  event.preventDefault();
  showSection("auction-list-container");
  const searchTerm = document.getElementById("search-bar").value.trim();
  fetch(`/api/auctions/?q=${encodeURIComponent(searchTerm)}`)
    .then((response) => response.json())
    .then((auctions) => {
      const list = document.getElementById("auction-list");
      list.innerHTML = "";

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

      fetch(`/api/whoami`)
        .then((response) => response.json())
        .then((username) => {
          if (!document.getElementById('logout-button')) {
            if (username === user.username){
              const item = document.getElementById('users-details-container')
              item.innerHTML += `<button id='logout-button' class="danger-button" onclick="logout()">Logout</button>`
            }
          } else {
            const button = document.getElementById('logout-button')
            button.remove();
          }
        })

      const asteVinte = user.asteVinte ?? " ";
      const aste = document.createElement("ul");

      asteVinte.forEach((asta) => {
        const item = document.createElement("li");
        item.innerHTML = `<p><strong>Titolo:</strong> ${asta.titolo}</p>
                          <p>Descrizione: ${asta.descrizione}</p>
                          <p>Offerta iniziale: €${asta.offertaIniziale} - Prezzo finale: €${asta.prezzoFinale}`;
        aste.appendChild(item);
      });

      const details = document.getElementById("users-details");
      details.innerHTML = `<h3>${user.username}</h3>
                            <p><strong>Nome:</strong> ${user.nome} - <strong>Cognome:</strong> ${user.cognome}</p>
                            <p><strong>Aste vinte:</strong></p>`;
      details.appendChild(aste);
    });
}

editAuctionForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const titolo = document.getElementById("auction-title-details").innerHTML;

  const response1 = await fetch(`/api/auctions/?q=${encodeURIComponent(titolo)}`);
  if (!response1.ok) throw new Error("Errore nel recupero dell'ID dell'asta");

  const auctions = await response1.json();
  if (auctions.length === 0) throw new Error("Asta non trovata");

  const auctionId = auctions[0].id;

  const data = {
    titolo_asta: document.getElementById("editAuction-title").value,
    desc_asta: document.getElementById("editAuction-desc").value,
  };
  const response = await fetch(`api/auctions/${auctionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json()

  if (response.ok) {
    alert(result.msg);
    showAuctions();
  } else {
    alert("Errore: " + result.msg);
  }
});

async function deleteAuction() {
  const titolo = document.getElementById("auction-title-details").innerHTML;

  const response1 = await fetch(`/api/auctions/?q=${encodeURIComponent(titolo)}`);
  if (!response1.ok) throw new Error("Errore nel recupero dell'ID dell'asta");

  const auctions = await response1.json();
  if (auctions.length === 0) throw new Error("Asta non trovata");

  const auctionId = auctions[0].id;

  const response2 = await fetch(`/api/auctions/${auctionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response2.ok) {
    const errorMessage = await response2.json();
    alert(errorMessage.msg)
  }

  const result = await response2.json();
  alert(result.msg);
  showAuctions();
}

function logout(){
  fetch(`api/auth/logout`)
  .then(response => response.json())
  .then(data => {
      if (data.msg) {
          alert(data.msg);
      } else {
          alert("Errore durante il logout.");
      }
  })

  const button = document.getElementById('logout-button')
  button.remove()
}

bidsForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const titolo = document.getElementById("auction-title-details").innerHTML;

  const response1 = await fetch(`/api/auctions/?q=${encodeURIComponent(titolo)}`);
  if (!response1.ok) throw new Error("Errore nel recupero dell'ID dell'asta");

  const auctions = await response1.json();
  if (auctions.length === 0) throw new Error("Asta non trovata");

  const auctionId = auctions[0].id;

  const data = {
    offerta: document.getElementById("bids-price").value,
  };

  const response = await fetch(`api/auctions/${auctionId}/bids`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  const result = await response.json()

  if (response.ok) {
    alert(result.msg);
    showAuctions();
  } else {
    alert("Errore: " + result.msg);
  }
});

