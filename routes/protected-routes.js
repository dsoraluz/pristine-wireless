const express = require('express');
const ensure = require('connect-ensure-login');
const protRoutes = express.Router();
const User = require('../models/user.js');
const Phone = require('../models/phone.js');
const bcrypt = require('bcrypt');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
let uploads;
let getUploadWebAddress;

if(process.env.NODE_ENV === "production"){
  getUploadWebAddress = (file) => {
    return file.location;
  };
  const s3 = new aws.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  });
  uploads = multer({
    storage:multerS3({
      s3: s3,
      bucket: process.env.BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE
    })
  });
}else{
  getUploadWebAddress = (file) => {
    return `/uploads/${file.filename}`;
  };
  uploads = multer({
    dest: __dirname + '/../public/uploads/'
  });
}

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
  let phoneInfo = '';

  if(req.file === undefined){
    phoneInfo = {
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
    phoneInfo = {
      brand: req.body.brand,
      model: req.body.model,
      condition: req.body.condition,
      memory: req.body.memory,
      color: req.body.color,
      price: req.body.price,
      provider: req.body.provider,
      unlocked: req.body.unlocked,
      additionalDetails: req.body.additionalDetails,
      imageUrl: getUploadWebAddress(req.file),
      owner: req.user._id //<-- we add the user ID.. Because of passport, we get to use this.
    };
  }

  const newPhone = new Phone(phoneInfo);


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

//Post route for edit
protRoutes.post('/phones/:id',ensure.ensureLoggedIn(),uploads.single('picture'),(req,res,next)=>{
  const phoneId = req.params.id;

  let phoneUpdates = '';

  if(typeof req.file === undefined){
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
      imageUrl: getUploadWebAddress(req.file),
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
  let userUpdates;

  if(req.body.newPassword){

    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, salt);

    userUpdates = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashPass,
    };
  } else {
    userUpdates = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
    };
  }


  User.findByIdAndUpdate(userId, userUpdates, (err, user)=>{
    if(err){
      next(err);
      return;
    }
    res.redirect('/dashboard');
  });
});

protRoutes.get('/phones/my-phones/search',(req,res,next)=>{
  const searchTerm = req.query.searchTerm;

  if (searchTerm){
    Phone.search(searchTerm,(err, results)=>{
      console.log("results:", results);
      if(err){
        next(err);
        return;
      }
      res.render('phones/my-phones',{
        phones: results
      });
    });

  }else{

    res.redirect('/phones/my-phones');
  }
});

module.exports = protRoutes;
