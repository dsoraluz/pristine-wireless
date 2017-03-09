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
  const searchTerm = req.query.searchTerm;

  if (searchTerm){
    Phone.search(searchTerm,(err, results)=>{
      console.log("results:", results);
      if(err){
        next(err);
        return;
      }
      res.render('phones/results',{
        searchTerm: searchTerm,
        phones: results
      });
    });

  }else{

    res.redirect('/phones');
  }
});

module.exports = shopRoutes;
