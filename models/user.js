const mongoose= require('mongoose');
const validator= require('validator');
const jwt= require('jsonwebtoken');
const _= require('lodash');
const bcrypt= require('bcryptjs')

let userSchema= mongoose.Schema({
    email:{
        type:String,
        required: true,
        minlength:1,
        trim: true,
        unique: true,
        validate: {
            validator: (value)=>{
                return validator.isEmail(value)
            },
            message: '{VALUE} is not a valid email'
        }
        },
        password:{
            type:String,
            required: true,
            minlength: 6
        },
        tokens: [{
            access:{
                type: String,
                required: true
            },
            token:{
                type: String,
                required: true
            }
        }]
    });

userSchema.methods.toJSON= function() {
    let user= this;
    let userObject= user.toObject();
    return _.pick(userObject, ['_id','email'])
}

userSchema.methods.genAuthentication= function() {
    let user= this;
    let access="auth";
    let token= jwt.sign({_id:user._id.toHexString(),access}, '123abc').toString();

    user.tokens.push({access,token});

   return user.save().then(()=>{
        return token
    })
};

userSchema.statics.findByToken= function(token){
    let User=this;
    let decode; 

    try {
       decode= jwt.verify(token, '123abc')
        
    } catch (error) {
        return Promise.reject()
    }
    return User.findOne({
        '_id' : decode._id,
        'tokens.token' : token,
        'tokens.access':'auth'

    })

};

userSchema.pre('save', function(next){
    let user= this;

    if(user.isModified('password')) {
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(user.password,salt,(err,hash)=>{
                user.password=hash;
            });
            next()
        })
    } else {
        next()
    }
})

let User= mongoose.model('User', userSchema);

module.exports={User};