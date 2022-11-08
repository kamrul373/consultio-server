// express
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
//Mongodb
const { MongoClient, ServerApiVersion } = require('mongodb');
// corse & dotenv
const cors = require("cors")
require("dotenv").config()

app.use(cors());
app.use(express.json());

// Mongdb configuration
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lbqhd62.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

}

run().catch(error => console.log(error));



app.get("/", (req, res) => {
    res.send("Consultio server is running !");
})

app.listen(port, () => {
    console.log("Consultio server is running at port : ", port);
})