const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("./db.js");

router.use(express.static("public"))

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

router.get('/users', async (req, res) => {
  try {
      const mongo = await db.connect2db();
      console.log("Connesso al database");
      const cursor = await mongo.collection("users").find();
      const users = await cursor.toArray();
      res.json(users);
  } catch (error) {
      console.error("Errore:", error);
      res.status(500).json({ message: "Errore interno del server" });
  }
});

router.get('/users/:username', async (req, res) => {
  try {
      const mongo = await db.connect2db();
      console.log("Connesso al database");
      const username = {username: req.params.username};
      const users = await mongo.collection("users").findOne(username);
      res.json(users);
  } catch (error) {
      console.error("Errore:", error);
      res.status(500).json({ message: "Errore interno del server" });
  }
});

router.use(verifyToken, express.static('private'));

module.exports = router;