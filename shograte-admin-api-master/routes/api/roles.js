const express = require("express");
const router = express.Router();
const Roles = require("../../models/Roles");
const checkAuth = require("../../middleware/check-auth");
const checkAdmin = require("../../middleware/check-role");


//get pagination component

const pagination=require('../../components/pagination');

router.post("/add",  (req, res) => {
  const roles = new Roles({
    title: req.body.title
  });
  roles
    .save()
    .then(data => {
      res.json({
        success:true,
        msg: "Roles added successfully",
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


router.get("/list", (req, res) => {

  console.log('query',req.query);

  const { page, size, title }=req.query;

  const { limit, offset } = pagination.getPagination(page, size);

  Roles.paginate({},{ offset, limit })
    .then(roles => {

      let output={
        success:true,
        data:roles.docs,
        pagination:{
          totalDocs:roles.totalDocs,
          totalPages:roles.totalPages,
          page:roles.page,
          pagingCounter:roles.pagingCounter,
          hasPrevPage:roles.hasPrevPage,
          hasNextPage:roles.hasNextPage,
          limit:roles.limit
        }
        
      }

      res.json(output);

    })
    .catch(err => console.log(err));
});

router.get("/list/:id", (req, res) => {
  Roles.findOne({ _id: req.params.id })
    .then(role => {

      let output={
        success:true,
        data:role
      }
      res.json(output);
    })
    .catch(err => console.log(err));
});

router.put("/list/:id", checkAuth,  (req, res) => {
  Roles.findById({ _id: req.params.id }, (err, role) => {
    if (!role) {
      res.json({ success:false,msg: "Role not found" });
    }

    role.title = req.body.title;

    role
      .save()
      .then(() => {
        res.json({ 
          success:true,
          msg: "Role is updated successfully"
         });
      })
      .catch(err => {
        if (err.errors) {
          res.json({ 
            success:false,
            errors: err });
        }
      });
  });
});


router.get("/delete/:id", (req, res) => {
  Roles.findById({ _id: req.params.id }, (err, role) => {
    if (!role) {
      res.json({ 
        success:false,
        msg: "Role is not found" });
      }
  
      role
      .deleteOne({ _id: req.params.id })
      .then(() => {
        res.json({ 
          success:true,
          msg: "Role deleted successfully"
         });
      })
      .catch(err => {
        if (err.errors) {
          res.json({ 
            success:false,
            errors: err
           });
        }
      });
  });
});

module.exports = router;
