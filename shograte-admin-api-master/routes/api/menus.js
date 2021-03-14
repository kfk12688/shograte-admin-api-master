const express = require("express");
const router = express.Router();
const Menus = require("../../models/Menus");
const checkAuth = require("../../middleware/check-auth");
const checkAdmin = require("../../middleware/check-role");


//get pagination component

const pagination=require('../../components/pagination');

router.post("/add",  (req, res) => {
  const menus = new Menus({
    path: req.body.path,
    name: req.body.name,
    icon: req.body.icon,
    component: req.body.component
  });
  menus
    .save()
    .then(data => {
      res.json({
        success:true,
        msg: "Menu is added successfully",
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

  Menus.paginate({},{ offset, limit })
    .then(menus => {

      let output={
        success:true,
        data:menus.docs,
        pagination:{
          totalDocs:menus.totalDocs,
          totalPages:menus.totalPages,
          page:menus.page,
          pagingCounter:menus.pagingCounter,
          hasPrevPage:menus.hasPrevPage,
          hasNextPage:menus.hasNextPage,
          limit:menus.limit
        }
        
      }

      res.json(output);

    })
    .catch(err => console.log(err));
});

router.get("/list/:id", (req, res) => {
  Menus.findOne({ _id: req.params.id })
    .then(menu => {

      let output={
        success:true,
        data:menu
      }
      res.json(output);
    })
    .catch(err => console.log(err));
});

router.post("/list/:id", checkAuth,  (req, res) => {
  Menus.findById({ _id: req.params.id }, (err, menu) => {
    if (!menu) {
      res.json({success:false, msg: "Menu is not found" });
    }

    menu.path= req.body.path,
    menu.name= req.body.name,
    menu.icon= req.body.icon,
    menu.component= req.body.component


    menu
      .save()
      .then(() => {
        res.json({ 
          success:true,
          msg: "Menu is updated successfully"
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
  Menus.findById({ _id: req.params.id }, (err, menu) => {
    if (!menu) {
      res.json({ 
        success:false,
        msg: "Menu is not found" });
      }
  
      menu
      .deleteOne({ _id: req.params.id })
      .then(() => {
        res.json({ 
          success:true,
          msg: "Menu deleted successfully"
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
