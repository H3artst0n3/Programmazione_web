// function toggleMenu() {
//   const menu = document.getElementById("menu-dropdown");
//   menu.style.display = menu.style.display === "block" ? "none" : "block";
// }

function showSection(sectionId) {
  document.querySelectorAll('.container').forEach(container => {
    container.classList.add('hidden');
  });
  document.getElementById(sectionId).classList.remove('hidden');
}

function showAuctions() {
  showSection('auction-list-container');
  fetch('api/auctions')
    .then(response => response.json())
    .then(auctions => {
      const list = document.getElementById("auction-list");
      list.innerHTML = "";
      auctions.forEach(auction => {
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
  showSection('auction-details-container');
  fetch(`api/auctions/${auctionId}`)
    .then(response => response.json())
    .then(auction => {
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
  showSection('auction-list-container');
  const searchTerm = document.getElementById("search-bar").value.trim();
  fetch(`/api/auctions/?q=${encodeURIComponent(searchTerm)}`)
    .then(response => response.json())
    .then(auctions => {
      const list = document.getElementById("auction-list");
      list.innerHTML = ""; // Pulisce la lista precedente

      if (auctions.length === 0) {
        list.innerHTML = "<p>Nessuna asta trovata.</p>";
        return;
      }

      auctions.forEach(auction => {
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
    .catch(error => console.error("Errore nella ricerca:", error));
}