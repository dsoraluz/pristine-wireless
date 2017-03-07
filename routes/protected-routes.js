const express = require('express');
const ensure = require('connect-ensure-login');
const protRoutes = express.Router();
const Phone = require('../models/phone.js');
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

module.exports = protRoutes;
