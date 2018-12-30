const request= require('supertest');
const expect= require('expect');
const {ObjectID}= require('mongodb');
const app= require('./../app').app;
let {Todo}= require('./../models/todo');

let seedTodo= [{_id:new ObjectID(),text:'Hello 1'}, {_id:new ObjectID(),text:'Hello 2'}]

beforeEach((done)=>{
    Todo.remove({}).then((res)=>{
        return Todo.insertMany(seedTodo);
    }).then(()=> done())
});

describe('POST /todo',()=>{
    it ('should create new Todos',(done)=>{
        let text= "a new test"
        console.log({text})
        request(app)
            .post('/todo')
            .send({text})
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(text)
            })
            .end((err,res)=>{
                if (err) return done(err)
                Todo.find({text}).then((todo)=>{
                    expect(todo.length).toBe(1)
                    expect(todo[0].text).toBe(text)
                    done()
                }).catch((e)=> done(e))
            })
    });

    it('should not create new Todo', (done)=>{
        request(app)
            .post('/todo')
            .send({})
            .expect(400)
            .end((err,res)=>{
                if (err) return done(err)
                Todo.find().then((todo)=>{
                    expect(todo.length).toBe(2)
                    done()
                }).catch((e)=> done(e))
            });
    })
});

describe('GET /todo', ()=>{
    it('shoul get all Todos', (done)=>{
        request(app)
            .get('/todo')
            .expect(200)
            .expect((res)=>{
                console.log(res.body)
                expect(res.body.todos.length).toBe(2)
            })
            .end(done)
    })
});

describe('GET /todo/:id',()=>{
    it('should a todo with the id', (done)=>{
        request(app)
            .get(`/todo/${seedTodo[0]._id.toHexString()}`)
            .expect(200)
            .expect((res)=>{
                expect(res.body.text).toBe(`${seedTodo[0].text}`)
            })
            .end(done)
    });

    it('shoul return not found',(done)=>{
        request(app)
            .get(`/todo/${new ObjectID()}`)
            .expect(404)
            .end(done)

    });

    it('shoul return not found',(done)=>{
        request(app)
            .get('/todo/1232345555588727384235347662')
            .expect(404)
            .end(done)

    })
})
