// express
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
// corse & dotenv
const cors = require("cors")
require("dotenv").config()

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Consultio server is running !");
})

app.listen(port, () => {
    console.log("Consultio server is running at port : ", port);
})