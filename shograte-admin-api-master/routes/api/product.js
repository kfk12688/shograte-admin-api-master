const express = require("express");
const router = express.Router();
const Category = require("../../models/Category");
const SubCategory = require("../../models/SubCategory");
const Vendor = require("../../models/Vendor");
const Product = require("../../models/Product");
const checkAuth = require("../../middleware/check-auth");
const checkAdmin = require("../../middleware/check-role");
var multer = require("multer");
const path = "uploads/";
bodyParser = require("body-parser").json();

const pagination=require('../../components/pagination');


var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, path);
  },
  filename: function(req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post(
  "/add",
  // checkAuth,
  // checkAdmin("admin"),
  // upload.single("product_image"),
  //  upload.array("product_images", 5),
  upload.fields([
    { name: "product_image", maxCount: 1 },
    { name: "product_images", maxCount: 4 }
  ]),
  (req, res) => {
    Category.findById({ _id: req.body.category_id }, (err, category) => {
      if (!category) return res.json({ msg: "Category not found" });
    });

    SubCategory.findById(
      { _id: req.body.sub_category_id },
      (err, subcategory) => {
        if (!subcategory) return res.json({ msg: "Sub Category not found" });
      }
    );

    Vendor.findById({ _id: req.body.vendor_id }, (err, vendor) => {
      if (!vendor) return res.json({ msg: "Vendor not found" });
    });
    let image = "";
    if (req.files && req.files.product_image) {
      image = Date.now() + req.files.product_image[0].filename;
    }
    let images = [];
    if (req.files && req.files.product_image) {
      req.files.product_images.forEach((data, index) => {
        images.push({ id: index, image: Date.now() + data.filename });
      });
    }

    const product = new Product({
      product_name: req.body.product_name,
      product_desc: req.body.product_desc,
      category_id: req.body.category_id,
      sub_category_id: req.body.sub_category_id,
      vendor_id: req.body.vendor_id,
      product_image: image,
      product_images: images,
      modified_date: new Date()
    });
    product
      .save()
      .then(data => {
        res.json({
          msg: "Product is added successfully",
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
  }
);

// router.get("/list", (req, res) => {
//   Product.find()
//     .then(product => {
//       res.json({ data: product });
//     })
//     .catch(err => console.log(err));
// });


//list products with category name and subcategory name and vendor name

router.get("/list", (req, res) => {

  var ProductAggregate = Product.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "category_id",
        foreignField: "_id",
        as: "categories"
      }
    },

    {
      $lookup: {
        from: "subcategories",
        localField: "sub_category_id",
        foreignField: "_id",
        as: "subcategories"
      }
    },

    {
      $lookup: {
        from: "vendors",
        localField: "vendor_id",
        foreignField: "_id",
        as: "vendors"
      }
    },


    { $unwind: "$categories" },
    { $unwind: "$subcategories" },
    { $unwind: "$vendors" },
    {
      $project: {
        subcategory_name: 1,
        subcategory_desc: 1,
        _id: 1,
        category_name: "$categories.category_name",
        category_name: "$categories.category_name",
        category_id: 1,
        sub_category_name: "$subcategories.subcategory_name",
        sub_category_id: 1,
        product_name: 1,
        product_desc: 1,
        product_image: 1,
        product_images: 1,
        vendor_name:"$vendors.vendor_name",
        vendor_id: 1,
        is_active:1
      }
    }
  ]);

  const { page, size, title }=req.query;

  const { limit, offset } = pagination.getPagination(page, size);

  Product.aggregatePaginate(ProductAggregate, { limit, offset })
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
    })
    .catch(err => res.json({
      success:false,
      msg:'Error Occured'
    }));


});

//change product status
router.post("/changeStatus/:id", checkAuth, (req, res) => {
  
  Product.findById({ _id: req.params.id }, (err, product) => {
   
    product.modified_date = new Date();
    product.is_active = req.body.is_active;

    product
      .save()
      .then(() => {
        res.json({
          success:true,
          msg: "Product is updated successfully"
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



router.get("/list/:id", (req, res) => {
  Product.findOne({ _id: req.params.id })
    .then(product => {
      res.json({ data: product });
    })
    .catch(err => console.log(err));
});

router.put(
  "/update/:category_id/:subcategory_id/:product_id",
  upload.fields([
    { name: "product_image", maxCount: 1 },
    { name: "product_images", maxCount: 4 }
  ]),
  //checkAuth,
  //checkAdmin("admin"),
  (req, res) => {
    Category.findById({ _id: req.params.category_id }, (err, categroy) => {
      if (!categroy) {
        res.json({ msg: "Category not found" });
      }
    });
    SubCategory.findById(
      { _id: req.params.subcategory_id },
      (err, subcategroy) => {
        if (!subcategroy) {
          res.json({ msg: "Subcategory not found" });
        }
      }
    );
    Product.findById({ _id: req.params.product_id }, (err, product) => {
      if (!product) {
        res.json({ msg: "Product not found" });
      }
      let image = "";
      if (req.files && req.files.product_image) {
        image = Date.now() + req.files.product_image[0].filename;
      }
      let images = [];
      if (req.files && req.files.product_image) {
        req.files.product_images.forEach((data, index) => {
          images.push({ id: index, image: Date.now() + data.filename });
        });
      }
      console.log(req.body);
      product.modified_date = new Date();
      product.product_name = req.body.product_name;
      product.product_desc = req.body.product_desc;
      product.product_image = image;
      product.product_images = images;
      product
        .save()
        .then(() => {
          res.json({ msg: "Product is updated successfully" });
        })
        .catch(err => {
          console.log(err);

          if (err.errors) {
            res.json({ errors: err });
          }
        });
    });
  }
);

router.delete("/delete", (req, res) => {
  Product.remove({}, function(err, result) {
    if (err) {
      console.log(err);
    }
    res.json({ data: result });
  });
});

module.exports = router;
