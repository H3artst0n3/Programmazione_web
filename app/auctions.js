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
    let {titolo_asta, desc_asta, scadenza, offerta_iniziale} = req.body;
    let titolo = await mongo.collection("auctions").findOne({titolo_asta: new RegExp(`^${titolo_asta}$`, 'i')});

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

module.exports = router;