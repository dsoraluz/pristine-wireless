const express = require('express');
const Phone = require('../models/phone.js');

const shopRoutes = express.Router();

shopRoutes.get('/phones',(req,res,next)=>{
  Phone.find((err,allPhones)=>{
    if(err){
      next(err);
      return;
    }
    res.render('phones/browse-all',{phones: allPhones});
  });
});

module.exports = shopRoutes;
