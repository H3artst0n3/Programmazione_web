const { verifyToken } = require("./auth.js");
const express = require("express");
const moment = require('moment');
const db = require("./db.js");
const router = express.Router();

const isAuctionExpired = (currentDate, auctionEndDate) => {
  const [currentDay, currentMonth, currentYear] = currentDate.split('-');
  const [endDay, endMonth, endYear] = auctionEndDate.split('-');

  return parseInt(currentYear) > parseInt(endYear) ||
  (parseInt(currentYear) === parseInt(endYear) && parseInt(currentMonth) > parseInt(endMonth)) ||
  (parseInt(currentYear) === parseInt(endYear) && parseInt(currentMonth) === parseInt(endMonth) && parseInt(currentDay) > parseInt(endDay));
};

router.post('/auctions', verifyToken, async (req, res) => {
  try {
    if (req.userId === null){
      return res.redirect('/login.html');
    }

    const mongo = await db.connect2db();  
    const {titolo_asta, desc_asta, scadenza, offerta_iniziale} = req.body;
    const titolo = await mongo.collection("auctions").findOne({titolo_asta: new RegExp(`^${titolo_asta}$`, 'i')});

    if (titolo) {
      return res.status(409).json({msg: "Titolo già in uso"})
    } else {
      const last_auction = await mongo.collection("auctions").findOne({}, {sort: {id: -1}} );
      
      let id = last_auction?.id !== undefined ? last_auction.id: -1;
      id++;

      const date = moment(scadenza);
      const result = date.format('DD-MM-YYYY');

      const profiloProprietario = await mongo.collection('users').findOne({id: req.userId})

      const new_auction = {id, proprietario: profiloProprietario.username, titolo_asta, desc_asta, scadenza: result, offerta_iniziale};
      await mongo.collection('auctions').insertOne(new_auction);
      return res.status(201).json({msg: "Nuova asta aggiunta con successo!"})
    }
  } catch (error) {
    console.error("Errore:", error);
    return res.status(500).json({msg: "Internal Error"});
  }
});

router.get('/auctions/', async (req, res) => {
  try {
    const mongo = await db.connect2db();
    console.log("Connesso al database");
    const query = req.query.q ? {titolo_asta: { "$regex": req.query.q, "$options": "i" }} : {};
    const cursor = await mongo.collection("auctions").find(query);
    const auctions = await cursor.toArray();
    return res.status(200).json(auctions);
  } catch (error) {
    console.error("Errore:", error);
    return res.status(500).json({ msg: "Errore interno del server" });
  }
});

router.get('/auctions/:id', async (req, res) => {
  try {
    const mongo = await db.connect2db();
    console.log("Connesso al database");
    const ID = parseInt(req.params.id);
    const auction = await mongo.collection("auctions").findOne({id: ID});

    if (!auction) {
      return res.status(404).json({msg: "Asta non trovata"})
    }

    return res.status(200).json(auction)
  } catch (error) {
    console.error("Errore:", error);
    return res.status(500).json({ msg: "Errore interno del server" });
  }
});

router.put('/auctions/:id', verifyToken, async (req, res) => {
  try {
    if (req.userId === null) {
      return res.redirect('/login.html');
    }

    const mongo = await db.connect2db();

    const id = parseInt(req.params.id);

    const titolo_asta = req.body.titolo_asta;
    const desc_asta = req.body.desc_asta;

    const updated_auction = {titolo_asta, desc_asta};

    const query = {id: id};

    const auction = await mongo.collection("auctions").findOne(query);
    const user = await mongo.collection("users").findOne({id: req.userId});

    
    if (auction.proprietario !== user.username) {
      return res.status(403).json({msg: 'Utente non autorizzato alla modifica!'})
    }

    await mongo.collection("auctions").updateOne(query, {$set: updated_auction});
    return res.status(200).json({msg: "Auction updated successfully"});
  } catch (error) {
    console.error("Errore:", error);
    return res.status(500).json({msg: "Errore interno del server"})
  }
});

router.delete('/auctions/:id', verifyToken, async (req, res) => {
  try {
    if (req.userId === null) {
      return res.redirect('/login.html');
    }
    const mongo = await db.connect2db();
    console.log("Connesso al database");

    const id = parseInt(req.params.id);
    const query = {id: id};
    console.log(query)

    const auction = await mongo.collection("auctions").findOne(query);
    console.log(auction)
    const user = await mongo.collection("users").findOne({id: req.userId})

    if (auction.proprietario !== user.username) {
      return res.status(403).json({msg: 'Utente non autorizzato alla cancellazione!'})
    }

    await mongo.collection("auctions").deleteOne(query);
    return res.status(200).json({msg: "Auction deleted successfully"})
  } catch (error) {
    console.error("Errore:", error);
    return res.status(500).json({msg: "Errore interno del server"}) 
  }
});

module.exports = { router, isAuctionExpired };
