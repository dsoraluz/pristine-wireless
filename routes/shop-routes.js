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

shopRoutes.get('/phones/search',(req,res,next)=>{
  res.render('phones/search');
});

shopRoutes.post('/phones/search',(req,res,next)=>{
  console.log("crapout");
  const searchTerm = req.body.searchTerm;
  console.log(searchTerm);
  Phone.search(searchTerm,(err, results)=>{
    console.log("results:"+results);
    if(err){
      next(err);
      return;
    }
    res.redirect('/phones/search');
  });
});
module.exports = shopRoutes;
