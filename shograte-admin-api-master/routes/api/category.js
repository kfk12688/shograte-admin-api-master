const express = require("express");
const router = express.Router();
const Category = require("../../models/Category");
const checkAuth = require("../../middleware/check-auth");
const checkAdmin = require("../../middleware/check-role");


//get pagination component

const pagination=require('../../components/pagination');

router.post("/add",  (req, res) => {
  const categroy = new Category({
    category_name: req.body.category_name,
    category_desc: req.body.category_desc,
    modified_date: new Date()
  });
  categroy
    .save()
    .then(data => {
      res.json({
        success:true,
        msg: "Category is added successfully",
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

// router.get("/list", (req, res) => {
//   Category.find()
//     .then(categroy => {
//       res.json({ data: categroy });
//     })
//     .catch(err => console.log(err));
// });



router.get("/list",checkAuth, (req, res) => {

  console.log('query',req.query);

  const { page, size, title }=req.query;

  const { limit, offset } = pagination.getPagination(page, size);

  Category.paginate({},{ offset, limit })
    .then(categroy => {

      let output={
        success:true,
        data:categroy.docs,
        pagination:{
          totalDocs:categroy.totalDocs,
          totalPages:categroy.totalPages,
          page:categroy.page,
          pagingCounter:categroy.pagingCounter,
          hasPrevPage:categroy.hasPrevPage,
          hasNextPage:categroy.hasNextPage,
          limit:categroy.limit
        }
        
      }

      res.json(output);

    })
    .catch(err => console.log(err));
});

router.get("/list/:id", (req, res) => {
  Category.findOne({ _id: req.params.id })
    .then(categroy => {

      let output={
        success:true,
        data:categroy
      }
      res.json(output);
    })
    .catch(err => console.log(err));
});

router.post("/list/:id", checkAuth,  (req, res) => {
  Category.findById({ _id: req.params.id }, (err, categroy) => {
    if (!categroy) {
      res.json({ msg: "Category not found" });
    }

    categroy.modified_date = new Date();
    categroy.category_name = req.body.category_name;
    categroy.category_desc = req.body.category_desc;

    categroy
      .save()
      .then(() => {
        res.json({ 
          success:true,
          msg: "Category is updated successfully"
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
  Category.findById({ _id: req.params.id }, (err, categroy) => {
    if (!categroy) {
      res.json({ 
        success:false,
        msg: "Category not found" });
      }
  
    categroy
      .deleteOne({ _id: req.params.id })
      .then(() => {
        res.json({ 
          success:true,
          msg: "Category deleted successfully"
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
