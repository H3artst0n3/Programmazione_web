const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("./db.js");

const verifyToken = (req, res, next) => {
  const token = req.cookies["token"];
  if (!token){
    res.status(403).send("Autenticazione fallita")
    return;
  }

  try{
    const decoded = jwt.verify(token, "ssshhh");
    req.userId = decoded.id;
    next();
  } catch(error) {
    res.status(401).send("Non autorizzato!");
  }
};

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
      
      const new_auction = {id, titolo_asta, desc_asta, scadenza, offerta_iniziale};
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
      const query = {titolo_asta: { "$regex": req.query.q, "$options": "i" }};
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

router.put('/auctions/:id', async (req, res) => {
  try {
    const mongo = await db.connect2db();

    const id = parseInt(req.params.id);
    const titolo_asta = req.body.titolo_asta;
    const desc_asta = req.body.desc_asta;
    const scadenza = req.body.scadenza;
    const offerta_iniziale = req.body.offerta_iniziale;  

    const auction = {id, titolo_asta, desc_asta, scadenza, offerta_iniziale};

    const query = {id: id};
    console.log(query)

    await mongo.collection("auctions").updateOne(query, {$set: auction});
    res.send(auction);
  } catch (error) {
    console.error("Errore:", error);
    res.status(500).send("Errore interno del server")
  }
});

router.delete('/auctions/:id', async (req, res) => {
  try {
    const mongo = await db.connect2db();
    console.log("Connesso al database");

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      console.error("Invalid ID:", req.params.id);
      return res.status(400).send("Invalid ID");
    }
    const query = {id: id};

    console.log("id:", id)
    console.log("query:", query)

    const result = await mongo.collection("auctions").deleteOne(query);
    if (result.deletedCount === 0) {
      console.log("No document found with the given ID");
      return res.status(404).send("Auction not found");
    }
    res.status().send("Auction deleted successfully")
  } catch (error) {
    console.error("Errore:", error);
    res.status(500).send("Errore interno del server") 
  }
});

module.exports = router;