// express
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
//Mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// corse & dotenv
const cors = require("cors")
require("dotenv").config()

app.use(cors());
app.use(express.json());

// Mongdb configuration
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lbqhd62.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        // service collection
        const serviceCollections = client.db("consultio").collection("services");
        // reviews collection
        const customerReviewCollection = client.db("consultio").collection("customerReviews");
        // service api 
        app.get("/services", async (req, res) => {
            const query = {}
            const cursor = serviceCollections.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })
        // home page limit service api 
        app.get("/services/limited", async (req, res) => {
            const query = {}
            const cursor = serviceCollections.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });
        // get single service 
        app.get("/services/:id", async (req, res) => {
            const service_id = req.params.id;
            const query = { _id: ObjectId(service_id) };
            const singleServiceDetails = await serviceCollections.findOne(query);
            res.send(singleServiceDetails);
        });

        // Get Reviews for single service
        app.get("/reviews/:serviceId", async (req, res) => {
            const serviceId = req.params.serviceId;
            const query = { serviceId: serviceId };
            const cursor = customerReviewCollection.find(query).sort({ date: -1 });
            const result = await cursor.toArray();

            res.send(result)
        })
        // Post Reviews
        app.post("/reviewpost", async (req, res) => {
            const query = req.body;
            const result = await customerReviewCollection.insertOne(query);
            res.send(result);
        })

    }
    finally {

    }
}

run().catch(error => console.log(error));



app.get("/", (req, res) => {
    res.send("Consultio server is running !");
})

app.listen(port, () => {
    console.log("Consultio server is running at port : ", port);
})