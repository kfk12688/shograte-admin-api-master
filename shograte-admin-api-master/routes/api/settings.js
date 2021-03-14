const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const key = require("../../config/keys");
const router = express.Router();
const ValidateLoginInput = require("../../validation/login");
const validateEmail = require("../../validation/login");
const Settings = require("../../models/Settings");
const checkAuth = require("../../middleware/check-auth");

const Mail = require("../../components/mail");
const { v4: uuidv4, v4 } = require("uuid");


const Menus = require("../../models/Menus");
const pagination=require('../../components/pagination');
const mongoose = require("mongoose");

var otpGenerator = require('otp-generator')
const saltRounds = 10;

router.get("/list", (req, res) => {
  Settings.find()
    .then(data => {
      if (data) {        
        return res.json(
            { success: true, data: data }
          );
      } 
    })
    .catch(err =>{
      return res.json(
        { success: false,  error: err }
      );
    } );
});

router.post("/add", (req, res) => {

  console.log('req',req.body);
  const setting = new Settings({
    store_title: req.body.store_title,
    store_name: req.body.store_name,
    address: req.body.address,
    email: req.body.email,
    phone: req.body.phone,
    country: req.body.country,
    state: req.body.state,
    modified_date: new Date()
  });
  setting
    .save()
    .then(data => {
      res.json({
        msg: "Setting is added successfully",
        data
      });
    })
    .catch(err => {
      let errors = {};
      Object.keys(err.errors).forEach(function(key) {
        errors[key] = err.errors[key].message;
      });
      res.json({ errors });
    });
});

//update user data
router.post("/list/:id", (req, res) => {

  Settings.findById({ _id: req.params.id })
  .then(setting => {

    setting.store_title= req.body.store_title; 
    setting.store_name= req.body.store_name; 
    setting.address= req.body.address; 
    setting.email= req.body.email; 
    setting.phone= req.body.phone; 
    setting.country= req.body.country; 
    setting.state= req.body.state; 
    setting.modified_date= req.body.modified_date; 

    setting
    .save()
    .then(data => {
      res.json({
        success:true,
        msg: "Setting is updated successfully",
        data
      });
    })
    .catch(err => {
      let errors = {};
      Object.keys(err.errors).forEach(function(key) {
        errors[key] = err.errors[key].message;
      });
      res.json({ errors });
    });
      

    })
    .catch(err => console.log(err));
});


module.exports = router;
