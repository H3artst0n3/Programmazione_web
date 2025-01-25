const express = require('express');
const cookieParser = require("cookie-parser");
const { router: auth} = require("./auth.js");
const { router: auctions} = require("./auctions.js");
const users = require("./users.js");
const bids = require("./bids.js");
const app = express();

app.use(express.static("public"));
app.use(express.static("restricted"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", auth);
app.use("/api/", auctions);
app.use("/api/", users);
app.use("/api/", bids);

app.listen(3000, () => {
  console.log('Server attivo!');
});