const express = require('express');

const authRoutes = express.Router();

const User = require('../models/user.js');
const passport = require('passport');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');

authRoutes.get('/signup', (req,res,next)=>{
  res.render('auth/signup');
});

authRoutes.post('/signup',(req,res,next)=>{
  const email = req.body.email;
  const password = req.body.password;

  //If user does not provide username and password.
  if (email === '' || password === ''){
    res.render('auth/signup',{
      errorMessage: "Please fill out both an email and password"
    });
    return;
  }

  //Check to see if user exists.
  User.findOne({email: email}, {email:1}, (err,foundUser)=>{
    if(err){
      next(err);
      return;
    }

    //If the foundUser is not null (meaning it does have something), render
    //page with error message and early return.
    if(foundUser !== null){
      res.render('auth/signup',{
        errorMessage: 'The email already exits'
      });
      return;
    }

    //If username does not exits, continue with user creation.
    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, salt);

    //create userInfo with hashed  password
    const userInfo = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: email,
      password: hashPass
    };

    //Creage user object with the user model using the entered userInfo (email and password)
    const theUser = new User(userInfo);

    //Save the created user to the database/
    //If error, gracefully notify user.
    //Commit save and notify user of success with a flash message.
    theUser.save((err)=>{
      if(err){
        res.render('auth/signup', {
          errorMessage: "This was odd... There was a problem saving. Try again later."
        });
        return;
      }else{
        req.flash('success', 'You have been registered. Try logging in');
        res.redirect('/');
      }
    });

  });
});

//Stays the same
// authRoutes.get('/login', (req,res,next)=>{
//   res.render('auth/login-view.ejs', {errorMessage: req.flash('error')});
// });
authRoutes.get('/login', (req,res,next)=>{
  res.render('auth/login', {errorMessage: req.flash('error')});
});

//changes..says that the authentication is done by passport and its using the
//local strategy
authRoutes.post("/login",
 passport.authenticate("local", {
  successReturnToOrRedirect: "/", //instead of successRedirect (which takes you to home no matter where you were).. successReturnToOrRedirect takes you to the last page you were on.
  failureRedirect: "/",
  failureFlash: true, //get flash messages from login fail.
  successFlash: 'You have been logged in, user', //get flash messages from login success
  passReqToCallback: true
}));

module.exports = authRoutes;
