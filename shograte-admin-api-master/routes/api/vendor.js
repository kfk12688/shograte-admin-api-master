const express = require("express");
const jwt = require("jsonwebtoken");
const key = require("../../config/keys");
const router = express.Router();
const SubCategory = require("../../models/SubCategory");
const Category = require("../../models/Category");
const Vendor = require("../../models/Vendor");

const checkAuth = require("../../middleware/check-auth");
const checkAdmin = require("../../middleware/check-role");

const validateEmail = require("../../validation/login");
const bcrypt = require("bcryptjs");
const saltRounds = 10;



//get pagination component
const pagination=require('../../components/pagination');



router.post("/register", (req, res) => {

  const { errors, isValid } = validateEmail(req.body);
  if (!isValid) {
    return res.json({success:false, errors });
  }

  var body=req.body;
  var vendor_name=body.vendor_name;
  var mobile=body.mobile;
  var password=body.password;

  if(!vendor_name){
    return res.json({success:false, msg:'Vendor name required.' });
  }

  if(!mobile){
    return res.json({success:false, msg:'Mobile required.' });
  }

  if(!password){
    return res.json({success:false, msg:'Password required.' });
  }
  

  

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {

      const vendor = new Vendor({
        vendor_name:vendor_name,
        owner_name: req.body.owner_name,
        mobile: mobile,
        email: req.body.email,
        password: password,
        modified_date: new Date()
      });

        //save the hash password in db
        vendor
        .save()
        .then(data => {
          res.json({
            success:true,
            msg: "Vendor is added successfully",
            data
          });
        })
        .catch(err => {
          let errors = {};
          Object.keys(err.errors).forEach(function(key) {
            errors[key] = err.errors[key].message;
          });
          res.json({ success:false,errors });
        });

    });
  });
 
});

router.get("/list",checkAuth, (req, res) => {

  console.log('query',req.query);

  const { page, size, title }=req.query;

  const { limit, offset } = pagination.getPagination(page, size);


  Vendor.paginate({},{ offset, limit })
    .then(vendor => {

      let output={
        success:true,
        data:vendor.docs,
        pagination:{
          totalDocs:vendor.totalDocs,
          totalPages:vendor.totalPages,
          page:vendor.page,
          pagingCounter:vendor.pagingCounter,
          hasPrevPage:vendor.hasPrevPage,
          hasNextPage:vendor.hasNextPage,
          limit:vendor.limit
        }
        
      }

      res.json(output);

    })
    .catch(err => {
      res.json({
        success:false,
        msg:"Error occured."
      });
    });
});

router.get("/list/:id",checkAuth, (req, res) => {
  Vendor.findOne({ _id: req.params.id })
    .then(data => {
      let output={
        success:true,
        data:data
      }
      res.json(output);

    })
    .catch(err => res.json({ err }));
});


// change status of the vendor user
router.post("/changeStatus/:id", checkAuth, (req, res) => {
  
  Vendor.findById({ _id: req.params.id }, (err, vendor) => {
   
    vendor.modified_date = new Date();
    vendor.is_active = req.body.is_active;

    vendor
      .save()
      .then(() => {
        res.json({
          success:true,
          msg: "Vendor is updated successfully"
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
});



router.post("/list/:id", checkAuth, (req, res) => {
  
  Vendor.findById({ _id: req.params.id }, (err, vendor) => {
    if (!vendor) return res.json({success:false, msg: "vendor not found" });
    if (!vendor.is_active && req.body.is_active === 0)
      return res.json({success:false, msg: "vendor is not activated" });
    
    vendor.modified_date = new Date();
    vendor.is_active = req.body.is_active;

    vendor
      .save()
      .then(() => {
        res.json({
          success:true,
          msg: "Vendor is updated successfully"
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
});

module.exports = router;