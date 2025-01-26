const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db.js");
const router = express.Router();

const verifyToken = (req, res, next) => {
  const token = req.cookies["token"];
  if (!token){
    // res.status(403).send("Autenticazione fallita")
    req.userId = null;
    return next();
  }

  try{
    const decoded = jwt.verify(token, "ssshhh");
    req.userId = decoded.id;
    next();
  } catch(error) {
    req.userId = null;
    next();
  }
};


router.post('/signup', async (req, res) => {
  try {
    const mongo = await db.connect2db();

    const { nome, cognome, username, password } = req.body;
    const user = await mongo.collection("users").findOne({ username: new RegExp(`^${username}$`, 'i') });
    
    if (user) {
      return res.status(409).json({msg: "Username già registrato"})
    } else {
      const last_user = await mongo.collection("users").findOne({}, {sort: {id: -1}} );
      
      let id = last_user?.id !== undefined ? last_user.id: -1;
      id++;

      const new_user = {id, nome, cognome, username, password};
      await mongo.collection("users").insertOne(new_user);
      
      return res.json({msg: "Registrazione effettuata con successo!"});
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: "Internal Error"});
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
      return res.redirect('/aste.html')
    } else {
      return res.status(401).json({ msg: "Username o password errati" });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Internal Error" });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie("token", {httpOnly: true});
  res.json({ msg: "Logout effettuato con successo" });
});
    
module.exports = { router, verifyToken };