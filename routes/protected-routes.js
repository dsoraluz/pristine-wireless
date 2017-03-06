const express = require('express');
const ensureLogin = require('connect-ensure-login');
const protRoutes = express.Router();

protRoutes.get('/new', (req,res,next)=>{
  res.render('phones/new');
});

module.exports = protRoutes;
