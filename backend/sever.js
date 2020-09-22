// importing

// Creating The API
// Before (1) Go to package.json and add  "  "type": "module", "

//(1)
import express from 'express'
import mongoose from 'mongoose'
import Messages from "./dbMessages.js"

import Pusher from 'pusher'
import cors from "cors"
// app config
//(2)
const app = express()
const port = process.env.PORT || 9000


//pusher
var pusher = new Pusher({
  appId: '1069229',
  key: '8cccb3607d411beca41c',
  secret: '1a341a46f68c18602f4e',
  cluster: 'ap3',
  encrypted: true
});


//middleware
// (10)
app.use(express.json())
app.use(cors());
//security
// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "*");
//     next();

// })

// DB config
//(6)
const connection_url = 'mongodb+srv://yusuke:yusuke7828@cluster0.cffap.mongodb.net/chatappdb?retryWrites=true&w=majority'

// (7)
mongoose.connect(connection_url, {
    useCreateIndex:true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

//(8) create file  => dbMessages.js
// ????

const db = mongoose.connection

db.once('open', ()=> {
    console.log('DB has connected')

    const msgCollection = db.collection("messagecontents");

    const changeStream = msgCollection.watch();

    changeStream.on('change' , (change)=> {
        // console.log(change)
        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',
                {
                    name: messageDetails.name,
                    message: messageDetails.message,
                    timestamp: messageDetails.timestamp,
                    received: messageDetails.received
                }
                );
        }else{
            console.log('Error triggering pusher')
        }
    })
});





// api routes
//(3)
app.get('/', (req,res) => res.status(200).send('hello world'))
// what is (200) <=> it is kind of international rule <=> 200 means 'sever' is okay  [201 is as well]

app.get('/messages/sync', (req,res) => {
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

// (9)
app.post('/messages/new', (req, res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }

    })
} )


// listener
// (4)

app.listen(port, ()=>console.log(`Listening on localhost:${port}`))

// (5) Go to postman localhost:9000
