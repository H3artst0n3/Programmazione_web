const { verifyToken } = require("./auth.js");
const express = require("express");
const db = require("./db.js");
const router = express.Router();

router.get('/users/:id', async (req, res) => {
  try {
      const mongo = await db.connect2db();
      console.log("Connesso al database");
      const id = {id: parseInt(req.params.id)};
      const users = await mongo.collection("users").findOne(id);
      res.json(users);
  } catch (error) {
      console.error("Errore:", error);
      res.status(500).json({ message: "Errore interno del server" });
  }
});

router.get('/users/', async (req, res) => {
  try {
      const mongo = await db.connect2db();
      console.log("Connesso al database");
      const query = {cognome: req.query.q};
      console.log(query)
      const cursor = await mongo.collection("users").find(query);
      const users = await cursor.toArray();
      console.log(users)
      res.json(users);
  } catch (error) {
      console.error("Errore:", error);
      res.status(500).json({ message: "Errore interno del server" });
  }
});

router.get("/whoami", verifyToken, async (req, res) => {
  try {
    const mongo = await db.connect2db();
    const query = {id: req.userId}
    const user = await mongo.collection("users").findOne(query);
    console.log(user)
    // if (!req.userId){
    //   res.status(404).json({ msg: "Utente non loggato" });
    // }

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ msg: "Utente non trovato" });
    }
  } catch (error) {
    console.error("Errore:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
});

module.exports = router;