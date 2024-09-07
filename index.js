const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middeleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const userCollection= client.db("HomeCleanDb").collection("users");
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
  
  
    
    // users carts add inbox  length get 
    // cart to update the cart items count
    app.get('/carts',async(req,res)=>{
      const email=req.query.email;
      const query={email:email};
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })
    // carts coleection post 
    app.post('/carts' ,async(req,res)=>{
      const cartItem=req.body;
      const result =await cartCollection.insertOne(cartItem);
      res.send(result);

    });
// carts table deleted users 
app.delete('/carts/:id',async(req,res)=>{
  const id=req.params.id;
  const query= {_id: new ObjectId(id)}
  const result = await cartCollection.deleteOne(query);
  res.send(result);

});
// users register created database
app.post('/users',async (req,res)=>{
  const user=req.body;
  const  query ={email: user.email}
  const existinguser= await userCollection.findOne(query);
  if(existinguser){
    return res.send({massage:'user already exists',insertedId:null})
  }
  const result= await userCollection.insertOne(user);
  res.send(result);
});

  // jwt web token access  related API
    // token ta kotha thika call hobe ta bujte hobe tr mane 
    // user ji jagie login, signin, social login, takbe sikhane call korbo 
    app.post('/jwt', async(req,res)=>{
      const user=req.body;
      const token=jwt.sign(user,process.env.SECRET_KEY,{
        expiresIn: '1h'});
        res.send({token});
    })


  // middelwares verify token 
    // mideelwares jodi banietachie tahole 3ta pramiters thake
    const verifyToken  = (req,res,next) =>{
      console.log('inside veryfey token',req.headers.authorization);
    // user jodi access token na thake tahole take same agite dibo na
      if(!req.headers.authorization){
 return res.status(401).send({message:'forbidden access'});
      }
      const token=req.headers.authorization.split(' ')[1];
      // console.log('1 index token:',token);
      jwt.verify(token, process.env.SECRET_KEY, (err, decoded)=> {
        // console.log(decoded.foo) 
        if(err){
          return res.status(401).send({message:'forbidden access'})

        }
        req.decoded=decoded;
        next();
      });
     
    }


// Admin dashboard  signin all users show in the table 
app.get('/users', verifyToken,async (req,res)=>{
  // check jwt token access here but amra middelware e korbo
  // console.log(req.headers);
  const result= await userCollection.find().toArray();
  res.send(result);

});

// admin or user check releted api
app.get('/users/admin/:email',verifyToken ,async(req,res)=>{
const email =req.params.email;

if(email !=req.decoded.email){
  return res.status(403).send({message:'unauthorized access'})

}
const query ={email: email};
const user =await userCollection.findOne(query);
let admin =false;
if(user){
  admin =user.role === 'admin';
}
res.send({admin});

});



// admin users deleted api 
app.delete('/users/:id' ,async (req,res)=>{
const id=req.params.id;
const query = {_id: new ObjectId(id)};
const result = await userCollection.deleteOne(query);
res.send(result);
});
// kwka amra jodi admin korte chie user role ke Ui te 
// kono particuller field ke amra jodi change krte chie tahole amra patch use kori
app.patch('/users/admin/:id',async(req, res)=>{
  const id= req.params.id;
  const filter= { _id: new ObjectId(id)};
  const updateDoc = {
    $set:{
      role: 'admin'
    }
  }
  const result = await userCollection.updateOne(filter, updateDoc);
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