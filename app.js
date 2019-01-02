require('./config/config')
const express= require('express');
const bodyParser= require('body-parser');
const _= require('lodash');
const {mongoose}= require('./db/db');
let {Todo}= require('./models/todo');
let {User}= require('./models/user');
const {ObjectID}= require('mongodb');
let {authenticate} = require('./middleware/authenticate')
const app= express();
// setting up port
const port= process.env.PORT;
// middleware
app.use(bodyParser.json());

app.post('/todo', (req,res)=>{
    let newTodo= new Todo({
        text:req.body.text
    });
    newTodo.save().then((todo)=>{
        res.status(200).send({todo})
    }).catch((e)=>{
        res.status(400).send(e)
    })
});

// GET todo list

app.get('/todo', (req,res)=>{
    Todo.find().then((todos)=>{
        res.send({todos})
    }).catch((e)=> res.status(400).send(e))
});

// Fetch individual Todo

app.get('/todo/:id', (req,res)=>{
    let _id = req.params.id;
    if(!ObjectID.isValid(_id)) return res.status(404).send('Id does not exist')
    Todo.findById({_id}).then((todo)=>{
        if(!todo) return res.status(404).send()
        res.send({todo})
    }).catch((e)=>{
        res.status(400).send(e)
    })
});

// delete todo route
app.delete('/todo/:id', (req,res)=>{
    let _id= req.params.id;
    if (!ObjectID.isValid(_id)) return res.status(404).send('invalid id');
    Todo.findByIdAndRemove({_id}).then((todo)=>{
        if (!todo) return res.status(404).send('no Todo with such id')
        res.status(200).send({todo})
    }).catch((e)=>res.status(400).send(e));
});

// update todo

app.patch('/todo/:id', (req,res)=>{
    let _id= req.params.id
    let body= _.pick(req.body, ['text','completed'])

    //setting our completed with time
    if(_.isBoolean(body.completed) && body.completed) {
        body.completedAt= new Date().getTime()
    } else {
        body.completed= false;
        body.completedAt= null
    }
    if (!ObjectID.isValid(_id)) return res.status(404).send('invalid id');
    Todo.findByIdAndUpdate({_id},{$set:body},{new:true}).then((todo)=>{
        if (!todo) return res.status(404).send('no Todo with such id')
        res.send({todo})
    }).catch((e)=> res.status(400).send(e))
});

// users route


// users post route
app.post('/user', (req,res)=>{
    let body= _.pick(req.body,['email', 'password']);
    let user= new User(body);
    user.save().then((user)=>{
        // res.send(user)
       return user.genAuthentication()
    }).then((token)=>{
        res.header('x-auth',token).send(user)
    }).catch((e)=>res.status(400).send(e))
});


app.get('/user/me',authenticate ,(req,res)=>{
   res.send(req.user)
})
app.listen(port,()=>{
    console.log('server started')
});

module.exports.app= app;