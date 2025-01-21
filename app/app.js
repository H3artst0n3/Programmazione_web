const express = require('express');
const cookieParser = require("cookie-parser");
const router = require("./route.js");
const auth = require("./auth.js");
const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/progetto", router);
app.use("/api/auth", auth);

app.listen(3000, () => {
  console.log('Server attivo!');
});