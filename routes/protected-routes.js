const express = require('express');
const ensure = require('connect-ensure-login');
const protRoutes = express.Router();

protRoutes.get('/new',ensure.ensureLoggedIn(), (req,res,next)=>{
  res.render('phones/new');
});

module.exports = protRoutes;
