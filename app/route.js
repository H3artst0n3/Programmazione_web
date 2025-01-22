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

router.post('/nuova_asta', verifyToken, async (req, res) => {
  const mongo = await db.connect2db();  
  let {titolo_asta, desc_asta, scadenza, offerta_iniziale} = req.body;
  let asta = {titolo_asta, desc_asta, scadenza, offerta_iniziale};
  console.log(asta);
  mongo.collection('auctions').insertOne(asta);
  // mongo.getAuctionsCollection().insertOne(asta);

  console.log('Nuova asta aggiunta con successo!');
});

router.delete('/auctions/:id', async (req, res) => { 
  const mongo = await db.connect2db();
  // let query = {titolo: req.params.id};
  await mongo.collection('auctions').deleteOne({_id: req.params.id});
  console.log('Asta eliminata con successo!');  
});

router.get('/users', async (req, res) => {
  const mongo = await db.connect2db();
  console.log("messaggio")
  const prova = await mongo.collection("users").find();
  res.json(prova)
});

router.get('/users/:username', async (req, res) => {
  const mongo = await db.connect2db();
  let del_user = req.params.username;
  console.log(del_user)
  let query = {username: del_user};
  console.log(query)

  const prova = await mongo.collection("users").findOne(query);
  res.json(prova)
});

router.delete('/users/:username', async (req, res) => {
  const mongo = await db.connect2db();
  let username = req.query.del_user;
  console.log(username)
  let query = {username: username};
  console.log(query)

  await mongo.collection("users").deleteOne(query);
});

router.use(verifyToken, express.static('private'));

module.exports = router;