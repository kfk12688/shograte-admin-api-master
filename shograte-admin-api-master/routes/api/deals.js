const express = require("express");
const router = express.Router();
const Vendor = require("../../models/Vendor");
const Product = require("../../models/Product");
const Deals = require("../../models/Deals");
const checkAuth = require("../../middleware/check-auth");
const checkAdmin = require("../../middleware/check-role");
var multer = require("multer");
const path = "uploads";

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
  upload.fields([{ name: "deal_image", maxCount: 1 }]),
  (req, res) => {
    console.log(req.body);
    Vendor.findById({ _id: req.body.vendor_id }, (err, vendor) => {
      if (!vendor) return res.json({ msg: "Vendor not found" });
    });
    Product.findById({ _id: req.body.product_id }, (err, product) => {
      if (!product) return res.json({ msg: "Product not found" });
    });

    let image = "";
    if (req.files && req.files.deal_image) {
      image = Date.now() + req.files.deal_image[0].filename;
    }
    const deals = new Deals({
      deal_name: req.body.deal_name,
      deal_desc: req.body.deal_desc,
      deal_image: image,
      product_id: req.body.product_id,
      milestones: req.body.milestones,
      vendor_id: req.body.vendor_id,
      modified_date: new Date()
    });
    deals
      .save()
      .then(data => {
        res.json({
          msg: "Deal is added successfully",
          data
        });
      })
      .catch(err => {
        console.log(err.errors);
        let errors = {};
        Object.keys(err.errors).forEach(function(key) {
          errors[key] = err.errors[key].message;
        });
        res.json({ errors });
      });
  }
);

// router.get("/list", (req, res) => {
//   Deals.find()
//     .then(deals => {
//       res.json({ data: deals });
//     })
//     .catch(err => console.log(err));
// });


//list deals with product name  and vendor name

router.get("/list", (req, res) => {

  var DealsAggregate = Deals.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "product_id",
        foreignField: "_id",
        as: "products"
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


    { $unwind: "$products" },
    { $unwind: "$vendors" },
    {
      $project: {
        deal_name: 1,
        deal_desc: 1,
        _id: 1,
        product_name: "$products.product_name",
        product_id: 1,
        vendor_name:"$vendors.vendor_name",
        vendor_id: 1,
        is_active:1
      }
    }
  ]);

  const { page, size, title }=req.query;

  const { limit, offset } = pagination.getPagination(page, size);

  Deals.aggregatePaginate(DealsAggregate, { limit, offset })
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
  
  Deals.findById({ _id: req.params.id }, (err, deal) => {
   
    deal.modified_date = new Date();
    deal.is_active = req.body.is_active;

    deal
      .save()
      .then(() => {
        res.json({
          success:true,
          msg: "Deal is updated successfully"
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
  Deals.findOne({ _id: req.params.id })
    .then(deals => {
      res.json({ data: deals });
    })
    .catch(err => console.log(err));
});
module.exports = router;
