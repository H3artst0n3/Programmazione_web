const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db.js");
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const mongo = await db.connect2db();

    let { nome, cognome, username, password } = req.body;
    let user = await mongo.collection("users").findOne({ username: new RegExp(`^${username}$`, 'i') });
    
    if (user) {
      res.status(409).json({msg: "Utente già registrato"})
    } else {
      const last_user = await mongo.collection("users").findOne({}, {sort: {id: -1}} );
      
      let id = last_user?.id !== undefined ? last_user.id: -1;
      id++;

      const new_user = {id, nome, cognome, username, password};
      await mongo.collection("users").insertOne(new_user);
      
      res.send("Registrazione effettuata con successo!");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({msg: "Internal Error"});
  }
});

router.post('/signin', async (req, res) => {
  try{
    const mongo = await db.connect2db();
    const { username, password } = req.body;
    const user = await mongo.collection("users").findOne({ username: new RegExp(`^${username}$`, 'i') });
    console.log(user);
    if (user && user.password === password && user.username === username) {
      const data = { id: user.id };
      const token = jwt.sign(data, "ssshhh");
      res.cookie("token", token, {httpOnly: true});
      res.redirect('/aste.html')
    } else {
      res.status(401).json({ msg: "Username o password errati" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Internal Error" });
  }
});
    
module.exports = router;