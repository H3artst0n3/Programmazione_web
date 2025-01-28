const { verifyToken } = require("./auth.js");
const { isAuctionExpired } = require("./auctions.js");
const express = require("express");
const moment = require('moment');
const db = require("./db.js");
const router = express.Router();

const asteVinte = async (username) => {
  const mongo = await db.connect2db();
  const current = moment(new Date());
  const date = current.format('DD-MM-YYYY');

  const auctions = await mongo.collection('auctions').find({vincitore: username}).toArray();
  const asteVinte = [];
  auctions.forEach(auction => {
    if (isAuctionExpired(date, auction.scadenza)) {
      asteVinte.push({
        titolo: auction.titolo_asta,
        descrizione: auction.desc_asta,
        offertaIniziale: auction.offerta_iniziale,
        prezzoFinale: auction.offertaCorrente
      });
    }
  });

  const userDetails = {
    username: username,
    asteVinte: asteVinte
  }

  return userDetails;
}

router.get('/users/:id', async (req, res) => {
  try {
      const mongo = await db.connect2db();
      console.log("Connesso al database");
      const id = {id: parseInt(req.params.id)};
      const user = await mongo.collection("users").findOne(id);

      const userDetails = await asteVinte(user.username);

      res.json(userDetails);
  } catch (error) {
      console.error("Errore:", error);
      res.status(500).json({ msg: "Errore interno del server" });
  }
})

router.get('/users/', async (req, res) => {
  try {
      const mongo = await db.connect2db();
      console.log("Connesso al database");
      const query = req.query.q ? {username: { "$regex": req.query.q, "$options": "i" }} : {};
      console.log(query)
      const cursor = await mongo.collection("users").find(query);
      const users = await cursor.toArray();
      const usersDetails = [];

      for (const user of users) {
        const aste = await asteVinte(user.username);
        usersDetails.push(aste);
      }

      console.log(usersDetails)
      res.json(usersDetails);
  } catch (error) {
      console.error("Errore:", error);
      res.status(500).json({ msg: "Errore interno del server" });
  }
});

router.get("/whoami", verifyToken, async (req, res) => {
  try {
    const mongo = await db.connect2db();
    const query = {id: req.userId}
    const user = await mongo.collection("users").findOne(query);

    if (req.userId === null){
      return res.redirect('/login.html');
      // return res.status(404).json({ msg: "Utente non loggato" });
    }

    if (user) {
      return res.json(user.username);
    } else {
      return res.status(404).json({ msg: "Utente non trovato" });
    }
  } catch (error) {
    console.error("Errore:", error);
    return res.status(500).json({ msg: "Errore interno del server" });
  }
});

module.exports = router;