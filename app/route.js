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

router.get('/auctions', async (req, res) => {
  const mongo = await db.connect2db();
  const cursor = await mongo.collection('auctions').find();
  const auctions = await cursor.toArray();
  res.json(auctions);
});


router.use(verifyToken, express.static('private'));

module.exports = router;