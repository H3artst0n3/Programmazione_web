const { verifyToken } = require("./auth.js");
const express = require("express");
const moment = require('moment');
const db = require("./db.js");
const router = express.Router();

router.post('/auctions', verifyToken, async (req, res) => {
  try {
    const mongo = await db.connect2db();  
    const {titolo_asta, desc_asta, scadenza, offerta_iniziale} = req.body;
    const titolo = await mongo.collection("auctions").findOne({titolo_asta: new RegExp(`^${titolo_asta}$`, 'i')});

    if (titolo) {
      res.status(409).send("Titolo già in uso")
    } else {
      const last_auction = await mongo.collection("auctions").findOne({}, {sort: {id: -1}} );
      
      let id = last_auction?.id !== undefined ? last_auction.id: -1;
      id++;

      const date = moment(scadenza);
      const result = date.format('DD/MM/YYYY');

      const new_auction = {id, proprietario: req.userId, titolo_asta, desc_asta, scadenza: result, offerta_iniziale};
      await mongo.collection('auctions').insertOne(new_auction);
      res.send("Nuova asta aggiunta con successo!")
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Error");
  }
});

router.get('/auctions/', async (req, res) => {
  try {
    const mongo = await db.connect2db();
    console.log("Connesso al database");
    const query = req.query.q ? {titolo_asta: { "$regex": req.query.q, "$options": "i" }} : {};
    const cursor = await mongo.collection("auctions").find(query);
    const auctions = await cursor.toArray();
    res.json(auctions);
  } catch (error) {
    console.error("Errore:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
});

router.get('/auctions/:id', async (req, res) => {
  try {
    const mongo = await db.connect2db();
    console.log("Connesso al database");
    const id = {id: parseInt(req.params.id)};
    const auction = await mongo.collection("auctions").findOne(id);
    res.json(auction);
  } catch (error) {
    console.error("Errore:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
});

router.put('/auctions/:id', verifyToken, async (req, res) => {
  try {
    const mongo = await db.connect2db();

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      console.error("Invalid ID:", req.params.id);
      return res.status(400).send("Invalid ID");
    }
    const titolo_asta = req.body.titolo_asta;
    const desc_asta = req.body.desc_asta;

    const updated_auction = {titolo_asta, desc_asta};

    const query = {id: id};

    const auction = await mongo.collection("auctions").findOne(query);
    
    if (auction.proprietario !== req.userId) {
      console.error('UPSIE')
      return res.status(405).send('Utente non autorizzato alla modifica!')
    }

    await mongo.collection("auctions").updateOne(query, {$set: updated_auction});
    res.send("Auction updated successfully");
  } catch (error) {
    console.error("Errore:", error);
    res.status(500).send("Errore interno del server")
  }
});

router.delete('/auctions/:id', verifyToken, async (req, res) => {
  try {
    const mongo = await db.connect2db();
    console.log("Connesso al database");

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      console.error("Invalid ID:", req.params.id);
      return res.status(400).send("Invalid ID");
    }
    const query = {id: id};

    const auction = await mongo.collection("auctions").findOne(query);
    console.log(auction)

    if (auction.proprietario !== req.userId) {
      console.error('ERRORE')
      return res.status(405).send('Utente non autorizzato alla cancellazione!')
    }

    await mongo.collection("auctions").deleteOne(query);
    res.send("Auction deleted successfully")
  } catch (error) {
    console.error("Errore:", error);
    res.status(500).send("Errore interno del server") 
  }
});

module.exports = router;
