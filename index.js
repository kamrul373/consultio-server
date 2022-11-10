// express
const express = require("express");
const jwt = require("jsonwebtoken");
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
// jwt verfication 
function verifyJWT(req, res, next) {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) {
        res.status(401).send("Unauthorized Request")
    }
    // verifying token
    const token = authHeaders.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (error, decoded) {
        if (error) {
            res.status(403).send("Unauthorized Access")
        }
        req.decoded = decoded;
        next();
    })
}
async function run() {
    try {
        // jwt token generation
        app.post("/jwt", (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: "1h" });

            res.send({ token });
        })

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
        // add service 
        app.post("/addservice", async (req, res) => {
            const query = req.body;
            const result = serviceCollections.insertOne(query);
            res.send(result)
        })
        // home page limit service api 
        app.get("/services/limited", async (req, res) => {
            const query = {}
            const cursor = serviceCollections.find(query).sort({ _id: -1 });
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
        });

        // get all reviews of an user 
        app.get("/userreviews", verifyJWT, async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            } else {
                query = {
                    uid: req.query.uid
                }
            }
            const cursor = customerReviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        // get a single review 
        app.get("/review/:id", async (req, res) => {
            const reviewId = req.params.id;
            const query = { _id: ObjectId(reviewId) };
            const result = await customerReviewCollection.findOne(query);
            res.send(result)
        });
        // update a single review  

        app.patch("/update/:id", async (req, res) => {
            const data = req.body;
            const reviewId = req.params.id;

            const query = { _id: ObjectId(reviewId) };

            const updateDoc = {
                $set: {
                    customerRating: data.customerRating,
                    customerReview: data.customerReview
                }
            }
            const result = await customerReviewCollection.updateOne(query, updateDoc)
            res.send(result)
        })

        // delete a review 
        app.delete("/delete/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await customerReviewCollection.deleteOne(query);

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