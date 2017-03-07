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


protRoutes.post('/phones', ensure.ensureLoggedIn(),uploads.single('picture'), (req,res,next)=>{
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
