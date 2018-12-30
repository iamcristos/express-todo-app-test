const express= require('express');
const bodyParser= require('body-parser');
const {mongoose}= require('./db/db');
let {Todo}= require('./models/todo');
let {User}= require('./models/user');
const {ObjectID}= require('mongodb')
const app= express();

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
        res.send(todo)
    }).catch((e)=>{
        res.status(400).send(e)
    })
});

app.listen(3000,()=>{
    console.log('server started')
});

module.exports.app= app;