const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middeleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1gieptu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection= client.db("HomeCleanDb").collection("service");
    const ratingCollection= client.db("HomeCleanDb").collection("rating");
    const cartCollection= client.db("HomeCleanDb").collection("carts");
// services for get all database 
    app.get("/service", async(req,res)=>{
        const result = await serviceCollection.find().toArray();
        res.send(result);

    });
    // rating get all client for database
    app.get("/rating", async(req,res)=>{

      const result =await ratingCollection.find().toArray();
      res.send(result);

    });
    // carts length get 
    app.get('/carts',async(req,res)=>{
      const result = await cartCollection.find().toArray();
      res.send(result);
    })
    // carts coleection post 
    app.post('/carts' ,async(req,res)=>{
      const cartItem=req.body;
      const result =await cartCollection.insertOne(cartItem);
      res.send(result);

    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req, res)=>{
    res.send('Home Cleaning Services')
});

app.listen(port, ()=>{
    console.log(`Home Cleaning servicess avilable ${port}`);
});
// NAMING CONVENITTION
// app.get("/users")shob users ke pite chile 
// app.get("/users/:id")spaceifiq user pate chie 
// app.post("/users") akta users created make database
// app.put("/users") akta spaceifiq users ke kichu korte chile
// app.delete("/users") akta spaceifiq users ke delete korte chile