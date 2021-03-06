const express      = require('express');
const path         = require('path');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const layouts      = require('express-ejs-layouts');
const mongoose     = require('mongoose');

//------------ Needed for Passport.js ------------
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const flash = require('connect-flash');

//-------------- Loads .env FILE -------------------
//DotENV does the work to make sure the env file is recongized wven though it is in .ignore
const dotenv = require('dotenv');
const User = require('./models/user.js');

dotenv.config();
mongoose.connect(process.env.MONGODB_URI);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);

//------------------- PASSPORT ----------------------------------------
app.use(session({
  secret: "this is a my first web app using express and mongodb",
  resave: true,
  saveUninitialized: true
}));



app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next)=>{
  if(req.user){
    res.locals.user = req.user;
  } else {
    res.locals.user = null;
  }
  next();
});

//Local strategy - authentication is coming from internal check of records.
//By default the usernameField of the local strategy is set to 'username'
//By default the passwordField of the local strategy is set to 'password'
//If you want to check on anything else you need to over right the usernameField
//// by passing an object like below.
passport.use(new LocalStrategy({
  usernameField: 'email'
},(email, password, next)=>{
  //Check first if the database has an entry with that username.
  User.findOne({email}, (err, user)=>{
    if (err){
      return next(err);
    }
    //if user exits (fail) (authentication failed)-- (error message)
    else if(!user){
      return next(null, false, {message: "Incorrect email"});

    }
    else if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect password"});
    }else{
      //Return the user that we found.
      next(null,user);
    }
  });

}));

//Takes the user id and deserialized it. Takes user id and returns the
//corresponding user object.
passport.serializeUser((user,cb)=>{
  cb(null,user._id);
});

passport.deserializeUser((id, cb)=>{
  User.findOne({"_id": id},(err,user)=>{
    if(err){
      return cb(err);
    }
    cb(null,user);
  });
});




//------------------ ROUTES GO HERE ------------------
const index = require('./routes/index');
const shopRoutes = require('./routes/shop-routes');
const authRoutes = require('./routes/auth-routes');
const protRoutes = require('./routes/protected-routes');
app.use('/', index);
app.use('/', shopRoutes);
app.use('/', authRoutes);
app.use('/', protRoutes);
//----------------------------------------------------

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
