const express = require('express');
const ensure = require('connect-ensure-login');
const protRoutes = express.Router();
const User = require('../models/user.js');
const Phone = require('../models/phone.js');
const bcrypt = require('bcrypt');
const multer = require('multer');
const uploads = multer({
  dest: __dirname + '/../public/uploads/'
});

//Get route for the
protRoutes.get('/phones/new',ensure.ensureLoggedIn(), (req,res,next)=>{
  res.render('phones/new');
});

//Note: Multer has to be this to works
//                                 |          ('picture')
//                                 ----------------------------------
//   refers to <input type="file" name="picture"> in phones/new.ejs |
//
protRoutes.post('/phones', ensure.ensureLoggedIn(),uploads.single('picture'), (req,res,next)=>{
  // Note that req.file.filename referes to an attribute of .file that does not get defined by
  // developer.. Meaning that "file.filename" will return the literal filename of the file as a string.
  //It is then used as a means to populate the imageUrl for our phoneInfo object.
  const filename = req.file.filename;

  const newPhone = new Phone ({
    brand: req.body.brand,
    model: req.body.model,
    condition: req.body.condition,
    memory: req.body.memory,
    color: req.body.color,
    price: req.body.price,
    provider: req.body.provider,
    unlocked: req.body.unlocked,
    additionalDetails: req.body.additionalDetails,
    imageUrl: `/uploads/${filename}`,
    owner: req.user._id //<-- we add the user ID.. Because of passport, we get to use this.
  });


  newPhone.save ((err)=>{
    if(err){
      next(err);
      return;
    } else {
      req.flash('success', 'Your phone has been added.');
      res.redirect("/phones");
    }
  });
});

//Get route that renders user's listings.
protRoutes.get('/phones/my-phones',ensure.ensureLoggedIn(),(req,res,next)=>{
  Phone.find({owner: req.user._id}, (err, myPhones)=>{
    if (err){
      next(err);
      return;
    }
    res.render('phones/my-phones', { phones: myPhones });
  });
});

//Get route that renders the edit view with the phones attributes prefilled so
//that the user can keep the information or update.
protRoutes.get('/phones/:id/edit',(req,res,next)=>{
  const phoneId = req.params.id;

  Phone.findById(phoneId, (err,phone)=>{
    if(err){
      next(err);
      return;
    }
    res.render('phones/edit', {phone: phone});
  });
});

protRoutes.post('/phones/:id',ensure.ensureLoggedIn(),uploads.single('picture'),(req,res,next)=>{
  // const filename = req.file.filename;
  // console.log(uploads);

  const phoneId = req.params.id;
  //
  //
  // if(req.file){
  //   let filename = req.file.filename;
  // }
  //
  //
  // Phone.findById(phoneId, {imageUrl: 1}, (err, currentFilename)=>{
  //   if(err){
  //     next(err);
  //     return;
  //   }
  //   console.log("current filename" + currentFilename);
  //   //If user has changed the phone's image.
  //   if (req.file.filename === undefined){
  //     filename = currentFilename;
  //     console.log("req.file.filename is undefined, filename is equal to currentURL "+ req.file.filename);
  //   }else{
  //     filename = req.file.filename;
  //     console.log("req.file.filename is defined, filename is equal to req.file.filename " + req.file.filename);
  //
  //   }
  //
  // });
  let phoneUpdates = '';

  if(typeof req.file === 'undefined'){
    phoneUpdates = {
      brand: req.body.brand,
      model: req.body.model,
      condition: req.body.condition,
      memory: req.body.memory,
      color: req.body.color,
      price: req.body.price,
      provider: req.body.provider,
      unlocked: req.body.unlocked,
      additionalDetails: req.body.additionalDetails,
      owner: req.user._id //<-- we add the user ID.. Because of passport, we get to use this.
    };
  }else{
    const filename = req.file.filename;

    phoneUpdates = {
      brand: req.body.brand,
      model: req.body.model,
      condition: req.body.condition,
      memory: req.body.memory,
      color: req.body.color,
      price: req.body.price,
      provider: req.body.provider,
      unlocked: req.body.unlocked,
      additionalDetails: req.body.additionalDetails,
      imageUrl: `/uploads/${filename}`,
      owner: req.user._id //<-- we add the user ID.. Because of passport, we get to use this.
    };
  }


  Phone.findByIdAndUpdate(phoneId, phoneUpdates, (err,phone)=>{
    if(err){
      next(err);
      return;
    }
    res.redirect('/phones/my-phones');
  });
});

//Post route for delete
protRoutes.post('/phones/:id/delete',ensure.ensureLoggedIn(),(req,res,next)=>{
  const phoneId = req.params.id;

  Phone.findByIdAndRemove(phoneId, (err, phone)=>{
    if(err){
      next(err);
      return;
    }
    res.redirect('/phones/my-phones');
  });
});

//Get route that renders user's dashboard.
protRoutes.get('/dashboard',ensure.ensureLoggedIn(),(req,res,next)=>{
  res.render('dashboard/profile');
});

//Get route for user profile edit page.
protRoutes.get('/dashboard/profile/:id/edit',ensure.ensureLoggedIn(), (req, res, next)=>{
  res.render('dashboard/edit-profile');
});

protRoutes.post('/dashboard/profile/:id',ensure.ensureLoggedIn(),(req,res, next)=>{
  const userId = req.params.id;

  const password = req.body.newPassword;

  const salt = bcrypt.genSaltSync(10);
  const hashPass = bcrypt.hashSync(password, salt);

  const userUpdates = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hashPass,
  };

  User.findByIdAndUpdate(userId, userUpdates, (err, user)=>{
    if(err){
      next(err);
      return;
    }
    res.redirect('/dashboard');
  });
});

module.exports = protRoutes;
