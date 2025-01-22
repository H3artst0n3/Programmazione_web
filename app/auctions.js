const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("./db.js");

router.post('/auctions', async (req, res) => {
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

module.exports = router;