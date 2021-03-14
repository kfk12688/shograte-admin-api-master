const express = require("express");
const router = express.Router();
const SubCategory = require("../../models/SubCategory");
const Orders = require("../../models/Orders");
const checkAuth = require("../../middleware/check-auth");
const checkAdmin = require("../../middleware/check-role");

const pagination=require('../../components/pagination');

router.post("/add", (req, res) => {
  // Orders.findById({ _id: req.body.customer_id }, (err, order) => {
  //   if (!order) return res.json({ 
  //     success:false,
  //     msg: "Customer not found"
  //    });
  // });

  const orders = new Orders({
    customer_id: req.body.customer_id,
    vendor_id: req.body.vendor_id,    
    order_status: 'Received',
    order_total: req.body.order_total,
    created_date: new Date(),
    modified_date: new Date()
  });
  orders
    .save()
    .then(data => {
      res.json({
        success:true,
        msg: "Orders is added successfully",
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

  const { page, size, title }=req.query;

  const { limit, offset } = pagination.getPagination(page, size);

  Orders.paginate({},{ offset, limit })
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
    .catch(err => console.log(err));
});

// router.get("/list", (req, res) => {  
//   console.log('query',req.query);
//   var OrdersAggregate = Orders.aggregate([
//     {
//       $lookup: {
//         from: "customers",
//         localField: "customer_id",
//         foreignField: "_id",
//         as: "Customers"
//       }
//     },
//     { $unwind: "$customers" },
//     {
//       $project: {
//         customer_id: 1,
//         order_status: 1,
//         order_total: 1,
//         created_date: 1,
//         _id: 1,
//         customer_name: "$customers.first_name",
//       }
//     }
//   ]);

//   const { page, size, title }=req.query;

//   const { limit, offset } = pagination.getPagination(page, size);

//   Orders.aggregatePaginate(OrdersAggregate, { limit, offset })
//     .then(data => {

//       let output={
//         success:true,
//         data:data.docs,
//         pagination:{
//           totalDocs:data.totalDocs,
//           totalPages:data.totalPages,
//           page:data.page,
//           pagingCounter:data.pagingCounter,
//           hasPrevPage:data.hasPrevPage,
//           hasNextPage:data.hasNextPage,
//           limit:data.limit
//         }
        
//       }

//       res.json(output);


//       //res.json({ data });
//     })
//     .catch(err => res.json({
//       success:false,
//       msg:'Error Occured'
//     }));
// });

router.get("/list/:id", (req, res) => {
  Orders.findOne({ _id: req.params.id })
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
  // Cus.findById({ _id: req.body.category_id }, (err, category) => {
  //   if (!category) return res.json({ success:false, msg: "Category not found" });
  // });
  Orders.findById({ _id: req.params.id }, (err, orders) => {
    if (!orders) return res.json({ success:false, msg: "order not found" });
   

    orders.modified_date = new Date();
    orders.status = req.body.subcategory_name;

    orders
      .save()
      .then(() => {
        res.json({
          success:true,
          msg: "Order is updated successfully"
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
  Orders.findById({ _id: req.params.id }, (err, order) => {
    if (!order) {
      res.json({ 
        success:false,
        msg: "Order not found" });
      }
  
      order
      .deleteOne({ _id: req.params.id })
      .then(() => {
        res.json({ 
          success:true,
          msg: "Order deleted successfully"
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
