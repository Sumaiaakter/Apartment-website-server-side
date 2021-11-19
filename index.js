const express = require("express");
const app = express();
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require('mongodb');
const cors = require("cors");
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rx3na.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("victress_rose");
        const apartmentsCollection = database.collection("apartments");
        const cartsCollection = database.collection("cart");

        app.get('/apartments', async (req, res) => {
            // console.log(req.query);
            const size = parseInt(req.query.size);
            const page = req.query.page
            const cursor = apartmentsCollection.find({});

            //pagination-------------
            const count = await cursor.count();
            console.log(count);
            let apartments;
            if (size && page) {
                apartments = await cursor.skip(size * page).limit(size).toArray();
            }
            else {
                apartments = await cursor.toArray();
            }
            // ---------------------//


            res.json({ count, apartments });
            // console.log({ count, apartments });
            // res.json(apartments);

        })

        // load single details
        app.get('/apartments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const apartment = await apartmentsCollection.findOne(query);
            res.json(apartment);
        });

        //load cart data------------
        app.get('/cart/:uid', async (req, res) => {
            const uid = req.params.uid;
            console.log(uid);
            const query = { uid: uid };
            const result = await cartsCollection.find(query).toArray();
            res.json(result);

        });

        //add data to cart collection---------
        app.post('/apartment/add', async (req, res) => {
            const apartment = req.body;
            const result = await cartsCollection.insertOne(apartment);
            console.log(result.insertedId);
            res.json(result);
        });

        // delete data from cart

        app.delete("/delete/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cartsCollection.deleteOne(query);
            res.json(result)
        });

        // delete after purchasing---------------
        app.delete("/purchase/:uid", async (req, res) => {
            const uid = req.params.uid;
            const query = { uid: uid };
            const result = await cartsCollection.deleteMany(query);
            res.json(result);

        })



    }
    finally {
        // await client.close();

    }

}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("victress is running");
});


app.listen(port, () => console.log(`victress is running on port ${port}`));