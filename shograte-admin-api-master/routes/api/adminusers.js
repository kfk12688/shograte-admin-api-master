const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const key = require("../../config/keys");
const router = express.Router();
const ValidateLoginInput = require("../../validation/login");
const validateEmail = require("../../validation/login");
const AdminUsers = require("../../models/AdminUsers");
const checkAuth = require("../../middleware/check-auth");

const Mail = require("../../components/mail");
const { v4: uuidv4, v4 } = require("uuid");



const Menus = require("../../models/Menus");
const pagination=require('../../components/pagination');
const mongoose = require("mongoose");

var otpGenerator = require('otp-generator')
const saltRounds = 10;

router.get("/list", (req, res) => {
  AdminUsers.find()
    .then(user => {
      if (user) {
        
        return res.json({ success
          : true, user });
      } 
    })
    .catch(err => console.log(err));
});


router.post("/register", (req, res) => {
  AdminUsers.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        errors.email = "email already exists";
        return res.json({ status: 400, errors });
      } else {
        const newUser = new AdminUsers({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          role: req.body.role
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json({success:true,data:user}))
              .catch(err => res.json({success:false,data:err}));
          });
        });
      }
    })
    .catch(err => console.log(err));
});

//update user data
router.post("/list/:id", (req, res) => {
  AdminUsers.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        errors.email = "email not exists";
        return res.json({ success:false, status: 400, errors });
      } else {

        user.username = req.body.username;
        user.email = req.body.email;
        user.password = req.body.password;
        user.role = req.body.role;

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            user
              .save()
              .then(user => res.json({success:true,msg:'User updated successfully'}))
              .catch(err => res.json({success:false,data:err}));
          });
        });
      }
    })
    .catch(err => console.log(err));
});

//change user status alone

router.post("/changeStatus/:id", checkAuth, (req, res) => {
  
  AdminUsers.findById({ _id: req.params.id }, (err, user) => {   
    user.modified_date = new Date();
    user.is_active = req.body.is_active;
    user
      .save()
      .then(() => {
        res.json({
          success:true,
          msg: "User status is updated successfully"
        });
      })
      .catch(err => {
        let errors = {};
        Object.keys(err.errors).forEach(function(key) {
          errors[key] = err.errors[key].message;
        });
        res.json({success:true, errors });
      });
  });
});


router.post("/login", (req, res) => {
  const { errors, isValid } = validateEmail(req.body);
  if (!isValid) {
    return res.json({ errors });
  }

  const email = req.body.email;
  const password = req.body.password;

  AdminUsers.findOne({ email }).then( async (user) => {
    if (!user) {
      errors.email = "User not found";
      return res.json({
        success:false,
        msg:'Invalid login details.',
      });
    }

    //get menus list 

  let menus=await Menus.find({is_active:true})
  .then(menu => menu)
  .catch(err => console.log(err));

  console.log('menus',menus);


    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        const payload = {
          id: user._id,
          username: user.username,
          role: user.role
        };
        jwt.sign(
          payload,
          key.secretORKey,
          { expiresIn: 86400 },
          (err, token) => {
            res.json({
              success: true,
              token:token,
              role:user.role,
              menus:menus
            });
          }
        );
      } else {
        errors.password = "Password incorrect";
        return res.json({
          success:false,
          msg:'Invalid login details.',
        });
      }
    });
  });
});

// forget password :
router.post("/forget-password", (req, res) => {
  const { errors, isValid } = ValidateLoginInput(req.body);
  if (!isValid) {
    return res.json({ errors });
  }
  //check the email is valid or not

  const email = req.body.email;

  AdminUsers.findOne({ email }).then(async function(user) {
    if (!user) {
      errors.email = "User not found";
      let output={
        success:false,
        message:"User not found"
      }
      return res.json(output);
    }

    //create unique with expiry date

    let uniquecode = otpGenerator.generate(6, { upperCase: true, specialChars: false });
    let expiryDate = new Date(Date.now() + 3600 * 1000 * 24);

    console.log('expiryDate',expiryDate);
    console.log('uniquecode',uniquecode);

    //update admin user with unique code and expiry time
    //user.role = "SuperAdmin";
    user.forget_password_otp = uniquecode;
    user.forget_password_expiry = expiryDate;

    user
      .save()
      .then(async function(data) {
        // send mail test
        var response = await Mail.sendMail(
          "admin@gmail.com",
          user.email,
          "Forget Password",
          "<p>Please find the otp.<br> code : "+uniquecode+"</p>"
        ).catch(()=>{
          let output={
            success:false,
            message:'Error Occured.'
          }
          res.json(output);
        });

        console.log("response in function", response);

        let output={
          success:true,
          message:'Verification code sent email.'
        }
        return res.json(output);
      })
      .catch(err => {
        let errors = {};
        Object.keys(err.errors).forEach(function(key) {
          errors[key] = err.errors[key].message;
        });

        console.log('error',err);

        let output={
          success:false,
          message:'Email does not exists.'
        }
        res.json(output);
      });
  });
});

router.post("/add", (req, res) => {
  const adminUsers = new AdminUsers({
    email: req.body.email,
    username: req.body.username
  });
  adminUsers
    .save()
    .then(data => {
      res.json({
        msg: "AdminUsers is added successfully",
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


//verify forget password otp 

router.post("/forget-password-otp-verify", (req, res) => {
  
  const email = req.body.email;
  const otp = req.body.otp;

  console.log('email',email);
  console.log('otp',otp);
  console.log('date',new Date());

  AdminUsers.findOne({ email:email,forget_password_otp:otp,forget_password_expiry:{$gt: new Date()} }).then( async function (user) {
    if (!user) {
      return res.json({ 
        success:false,
        message:"Otp expired" 
      });
    }


    //once otp verified generate new code and  send back the uuid code 

    user.forget_password_token = uuidv4();

    user.save().then((data)=>{
      return res.json({
        success:true,
        message:"OTP verified",
        token:data.forget_password_token
      });

    }).catch((err)=>{
      return res.json({ 
        success:false,
        message:"Error Occured" 
      });
    })
  });

});

//update password:

// forget password :
router.post("/update-password", (req, res) => {

  const token = req.body.token;
  const password = req.body.password;

  AdminUsers.findOne({ forget_password_token:token }).then( async function (user) {
    if (!user) {
      errors.email = "Token expired.Please try again";
      let output={
        success:false,
        message:"Session expired.Please try again"
      }
      return res.json(output);
    }

    //update admin user with unique code and expiry time
    
    bcrypt.hash(password, saltRounds, function(err, hash) {
      // Store hash in your password DB.
      user.password=hash;  
      user.forget_password_otp='';
      user.forget_password_token='';
      user.forget_password_expiry='';

      user
      .save()
      .then( async function (data) {
  
          // send mail test
          var response=await Mail.sendMail('admin@gmail.com',user.email,'Password Updated','<p>Password Updated Successfully.</p>');
  
          let output={
            success:true,
            message:'Password updated successfully.'
          }
          return res.json(output);
       
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


});

router.get("/current", checkAuth, (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.username,
    email: req.user.email
  });
});


router.get("/delete/:id", async(req, res) => {

 await AdminUsers.deleteOne({_id:req.params.id})
  let output={
    success:true,
    message:'Password updated successfully.'
  }
  return res.json(output);
});



//list all the admin users with role and pagination

// forget password :
router.get("/listAll", (req, res) => {

  //list collection name in the collection
//   mongoose.connection.db.listCollections().toArray(function (err, names) {
//     console.log(names); // [{ name: 'dbname.myCollection' }]
   
// });

  console.log('query',req.query);

  var AdminUserAggregate = AdminUsers.aggregate([
    {
      $lookup: {
        from: "roles",
        localField: "role",
        foreignField: "_id",
        as: "roles"
      }
    },
     { $unwind: "$roles" },
    {
      $project: {
        email: 1,
        username: 1,
        _id: 1,
        role_name: "$roles.title",
        role: 1,
        is_active: 1,
      }
    }
  ]);


  const { page, size, title }=req.query;

  const { limit, offset } = pagination.getPagination(page, size);


  AdminUsers.aggregatePaginate(AdminUserAggregate, { limit, offset })
    .then(data => {

      let output={
        success:true,
        data:data.docs,
        pagination:{
          totalDocs:data.totalDocs,
          totalPages:data.totalPages,
          page:data.page,
          pagingCounter:data.pagingCounter,
          hasPrevPage:data.hasPrevPage,
          hasNextPage:data.hasNextPage,
          limit:data.limit
        }        
      }
      res.json(output);
      //res.json({ data });
    })
    .catch(err => res.json({
      success:false,
      msg:'Error Occured'
    }));


});


//list single user details

router.get("/list/:id", (req, res) => {
  AdminUsers.findOne({ _id: req.params.id })
    .then(user => {
      let output={
        success:true,
        data:user
      }
      res.json(output);
    })
    .catch(err => console.log(err));
});



module.exports = router;
