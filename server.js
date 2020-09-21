const express = require('express')
const mongoose = require('mongoose')
const app = express()
const shortUrl = require('./models/shortUrl.js')
const Users = require('./models/users.js')
const url = 'mongodb://localhost:27017/node-mongo'
const passport  = require('passport')
const sessions = require('express-session')
const flash = require('connect-flash')
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser')
const LocalStrategy = require('passport-local').Strategy
const connect = mongoose.connect(url)
var user;
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}))
app.use(sessions({
   secret:'secrectkey123',
   resave:true,
   saveUninitialized: true
}))
app.use(flash())
app.use(express.urlencoded({extended:true}))
app.use(passport.initialize());
app.use(passport.session());
connect.then((db)=>{
   console.log('connected to the database server')
})
app.get('/', checkAuthenticated, (req,res)=>{
   const name =req.user.username
  shortUrl.find({username: name})
    .then(products => {
       console.log(products)
      res.render('index.ejs',{shortUrls:products})
    })
 
})
app.get('/showall',async (req,res)=>{
  await  Users.find({})
   .then((list)=>{
      res.statusCode = 200
      res.setHeader('Content-type','application/json')
      res.json(list)
   },(err)=>{
      next(err)
   }).catch((err)=>{
      next(err)
   })
})
app.delete('/showall',(req,res)=>{
   Users.remove({})
   .then((lis)=>{
      console.log('removed all')
      res.json(lis)
   })
})
//register-routes
app.get('/register',checkNotAuthenticated,(req,res)=>{
   res.render('register.ejs')
})
app.post('/register',async (req,res,next)=>{
    user = req.body.username
    Users.findOne({username:req.body.username},async (err,user)=>{
    if(user!=null){
       console.log('user already exists')
       res.statusCode = 200
       res.setHeader('Content-type','application/json')
       res.redirect('/userExist')
    }
    else{
      try{
         const hashPass = await bcrypt.hash(req.body.password,10)
        Users.create({
           username:req.body.username,
           password:hashPass
         })
         res.statusCode = 200
         res.setHeader('Content-type','application/json')
         res.redirect('/login')
      }catch{
         res.redirect('/register')
      }
    }
   })
   
})
passport.use(new LocalStrategy(
   function(username, password, done) {
     Users.findOne({ username: username }, function (err, user) {
       if (err) { return done(err); }
       if (!user) {
         return done(null, false, { message: 'Incorrect username.' });
       }
       if (!bcrypt.compare(user.password,password)) {
        
         return done(null, false, { message: 'Incorrect password.' });
       }
       return done(null, user);
     });
   }
 ));
 passport.serializeUser(function(user, done) {
   done(null, user.id);
 });
 
 passport.deserializeUser(function(id, done) {
   Users.findById(id, function(err, user) {
     done(err, user);
   });
 });
//login-routes
app.get('/login',checkNotAuthenticated,(req,res,next)=>{
   res.render('login.ejs')
})
app.get('/loginF',(req,res,next)=>{
   res.render('logFailed.ejs')
})
app.get('/userExist',(req,res,next)=>{
   res.render('RuserExists.ejs')
})
app.get('/homepage',(req,res)=>{
   res.render('homepage.ejs')
})
function checkNotAuthenticated(req,res,next){
   if(req.isAuthenticated()){
      return res.redirect('/')
   }
   next()
}
function checkAuthenticated(req,res,next){
   if(!req.isAuthenticated()){
      return res.redirect('/homepage')
   }
   next()
}
app.post('/login', passport.authenticate('local', { successRedirect: '/',
                                                  failureRedirect: ('/loginF'),
                                                 failureFlash:true })
)
app.get('/logout', function(req, res){
   req.logout();
   res.redirect('/login');
 });

//see all
app.get('/show',(req,res,next)=>{
 shortUrl.find()
 .then((list)=>{
    res.statusCode = 200
    res.setHeader('Content-type','application/json')
    res.json(list)
 },(err)=>{
    next(err)
 }).catch((err)=>{
    next(err)
 })
})
app.post('/shortUrl',(req,res,next)=>{
  shortUrl.create({full:req.body.lUrl,username:req.body.username})
  res.redirect('/')
})
app.get('/:shortUrl', async (req, res) => {
   const smallUrl = await shortUrl.findOne({ short: req.params.shortUrl })
   if (smallUrl == null) return res.sendStatus(404)
 
   smallUrl.clicks++
   smallUrl.save()
 
   res.redirect(smallUrl.full)
 })
 app.get('/delete/:id',(req,res)=>{
    shortUrl.findByIdAndRemove(req.params.id)
    .then((resp)=>{
       res.statusCode = 200
       res.redirect('/')
    },(err)=>{
       console.log(err)
    }).catch((err)=>{
       console.log(err)
    })
 })
 
 
 
app.listen(process.env.port!!3000,()=>{
   console.log('server started')
})
