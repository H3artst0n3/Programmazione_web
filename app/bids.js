const { verifyToken } = require("./auth.js");
const { isAuctionExpired } = require("./auctions.js");
const express = require("express");
const moment = require('moment');
const db = require("./db.js");
const router = express.Router();

router.get("/auctions/:id/bids", async (req, res) => {
  try {
    const mongo = await db.connect2db();
    const query = {asta: parseInt(req.params.id)};
    
    const cursor = await mongo.collection('bids').find(query);
    const bids = await cursor.toArray();
    res.json(bids)
  } catch (error) {
    console.error("Errore:", error);
    res.status(500).json({msg: "Errore interno del server"})
  }
});

router.post("/auctions/:id/bids", verifyToken, async (req, res) => {
  if (req.userId === null) {
      return res.redirect('/login.html')
      // res.status(404).json({msg: "Utente no autenticato"})
  }
  const mongo = await db.connect2db();
  const query = {id: parseInt(req.params.id)};
  const query_asta = {asta: parseInt(req.params.id)};

  console.log(query_asta)

  const asta = await mongo.collection('auctions').findOne(query)
  const best_bid = await mongo.collection('bids').findOne(query_asta, {sort: {id: -1}})

  let bid = 0;

  if (best_bid == null){
    bid = asta.offerta_iniziale;
  } else {
    bid = best_bid.offerta;
  }

  const { offerta } = req.body;
  if (typeof(offerta) !== 'number'){
    return res.status(400).json({msg: "Per favore inserire un numero"})
  }
  console.log("Bid: ", bid, "Offerta: ", offerta);

  const current = moment(new Date());
  const date = current.format('DD-MM-YYYY');

  if (isAuctionExpired(date, asta.scadenza)) {
    return res.status(400).json({ msg: "L'asta è scaduta"});
  }

  if (bid >= offerta) {
    res.status(408).json({msg: "Offerta non valida"})

  } else {
    const last_bid = await mongo.collection('bids').findOne({}, {sort: {id: -1}})

    let id = last_bid?.id !== undefined ? last_bid.id: -1;
    id++;

    const profiloProprietario = await mongo.collection('users').findOne({id: req.userId})

    const new_bid = {id, asta: parseInt(req.params.id), offerente: profiloProprietario.username, offerta, data: date};
    await mongo.collection('bids').insertOne(new_bid);
    await mongo.collection('auctions').updateOne(query, {$set : {offertaCorrente: offerta, vincitore: profiloProprietario.username}});
    res.status(200).json({msg: "Nuova offerta inviata!"})
  }
});

router.get("/bids/:id", async (req, res) => {
    try{
      const mongo = await db.connect2db();

      const query = {id: parseInt(req.params.id)}
      const bid = await mongo.collection('bids').findOne(query);
      res.json(bid);
    } catch (error) {
      console.error("Errore:", error);
      res.status(500).json({msg: "Errore interno del server"});
    }
});

module.exports = router;