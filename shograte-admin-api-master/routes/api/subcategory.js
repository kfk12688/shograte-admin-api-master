const express = require("express");
const router = express.Router();
const SubCategory = require("../../models/SubCategory");
const Category = require("../../models/Category");
const checkAuth = require("../../middleware/check-auth");
const checkAdmin = require("../../middleware/check-role");

const pagination=require('../../components/pagination');



router.post("/add", checkAuth, (req, res) => {
  Category.findById({ _id: req.body.category_id }, (err, category) => {
    if (!category) return res.json({ 
      success:false,
      msg: "Category not found"
     });
  });

  const subcategory = new SubCategory({
    subcategory_name: req.body.subcategory_name,
    subcategory_desc: req.body.subcategory_desc,
    category_id: req.body.category_id,
    modified_date: new Date()
  });
  subcategory
    .save()
    .then(data => {
      res.json({
        success:true,
        msg: "Subcategory is added successfully",
        data
      });
    })
    .catch(err => {
      let errors = {};
      Object.keys(err.errors).forEach(function(key) {
        errors[key] = err.errors[key].message;
      });
      res.json({success:false, errors });
    });
});

router.get("/list", (req, res) => {  
  console.log('query',req.query);
  var SubCategoryAggregate = SubCategory.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "category_id",
        foreignField: "_id",
        as: "categories"
      }
    },
    { $unwind: "$categories" },
    {
      $project: {
        subcategory_name: 1,
        subcategory_desc: 1,
        _id: 1,
        category_name: "$categories.category_name",
        category_id: 1
      }
    }
  ]);

  const { page, size, title }=req.query;

  const { limit, offset } = pagination.getPagination(page, size);

  SubCategory.aggregatePaginate(SubCategoryAggregate, { limit, offset })
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

router.get("/list/:id", (req, res) => {
  SubCategory.findOne({ _id: req.params.id })
    .then(data => {
      let output={
        success:true,
        data:data
      }
      res.json(output);
    })
    .catch(err => res.json({ err }));
});

router.post("/list/:id", checkAuth,  (req, res) => {
  Category.findById({ _id: req.body.category_id }, (err, category) => {
    if (!category) return res.json({ success:false, msg: "Category not found" });
  });
  SubCategory.findById({ _id: req.params.id }, (err, subcategory) => {
    if (!subcategory) return res.json({ success:false, msg: "Subcategory not found" });
    if (!subcategory.is_active && req.body.is_active === 0)
      return res.json({ success:true, msg: "Subcategory is not activated" });
    subcategory.modified_date = new Date();
    subcategory.subcategory_name = req.body.subcategory_name;
    subcategory.subcategory_desc = req.body.subcategory_desc;
    subcategory.category_id = req.body.category_id;
    subcategory.is_active = req.body.is_active == 1 ? req.body.is_active : 0;

    subcategory
      .save()
      .then(() => {
        res.json({
          success:true,
          msg: "Sub category is updated successfully"
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


router.get("/delete/:id", (req, res) => {
  SubCategory.findById({ _id: req.params.id }, (err, subcategory) => {
    if (!subcategory) {
      res.json({ 
        success:false,
        msg: "Sub Category not found" });
      }
  
      subcategory
      .deleteOne({ _id: req.params.id })
      .then(() => {
        res.json({ 
          success:true,
          msg: "Sub Category deleted successfully"
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
