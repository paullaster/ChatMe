const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

const dbUrl = "mongodb+srv://proj-0-admin-0:project0admin@cluster0.6mz2g.mongodb.net/messagesDB?retryWrites=true&w=majority";

var Message =mongoose.model('Message',{
    name:String,
    message:String
})

app.post('/messages', (req,res) =>{
    var message = new Message(req.body);
    message.save().then(() =>{
        console.log('Saved to the database')
         Message.findOne(({message: "badword"}, (err, unkwon) =>{
                if(unkwon){
                    console.log('censored words found', unkwon);
                    Message.deleteOne({_id: unkwon.id}, (err) =>{
                        console.log('removed censored message',err);
                    })
                }
                else{
                    console.log(err);
                }
            })).catch((err) =>{
        res.sendStatus(500);
        return console.log('database error', err)
    });
        
        
    console.log(req.body);
    io.emit('message', req.body)
    res.sendStatus(200);
        
    });
    
});
app.get('/messages', (req,res) =>{
    Message.find({},{name: 1, message:1, _id: 0 }, (err,messages) =>{
        if(err){
            sendStatus(500);
        }
        let messageObject = messages.toString()
        res.send(JSON.stringify(messageObject)+'\n');
    });
    
});
app.get('/messages/:user', (req,res) =>{
    var user = req.params.user
    Message.find({name: user},{name: 1, message:1, _id: 0 }, (err,messages) =>{
        if(err){
            sendStatus(500);
        }
        res.send(messages)
    });
    
});
io.on('connection', (socket) =>{
    console.log('user connected');
});

mongoose.connect(dbUrl, {useMongoClient:true},{useNewUrlParser:true},{useUnifiedTopology: true},(err) =>{
    console.log('mongoDB connection', err);
})

let server = http.listen(4000, () =>{
    console.log('server is running on port', server.address().port);
});