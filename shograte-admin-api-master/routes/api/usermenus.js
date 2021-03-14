const express = require("express");
const router = express.Router();
const UserMenus = require("../../models/UserMenus");
const checkAuth = require("../../middleware/check-auth");
const checkAdmin = require("../../middleware/check-role");

const Menus = require("../../models/Menus");


//get pagination component

const pagination=require('../../components/pagination');

router.post("/add",  (req, res) => {
  const userMenus = new UserMenus({
    menu_id: req.body.menu_id,
    role_id: req.body.role_id,
    modified_date: new Date()
  });
  userMenus
    .save()
    .then(data => {
      res.json({
        success:true,
        msg: "Menu assigned successfully",
        data
      });
    })
    .catch(err => {

      console.table(err);
      let errors = {};
      Object.keys(err.errors).forEach(function(key) {
        errors[key] = err.errors[key].message;
      });
      res.json({ err });
    });
});


router.get("/list", (req, res) => {

  console.log('query',req.query);

  const { page, size, title }=req.query;

  const { limit, offset } = pagination.getPagination(page, size);

  UserMenus.paginate({},{ offset, limit })
    .then(usermenus => {

      let output={
        success:true,
        data:usermenus.docs,
        pagination:{
          totalDocs:usermenus.totalDocs,
          totalPages:usermenus.totalPages,
          page:usermenus.page,
          pagingCounter:usermenus.pagingCounter,
          hasPrevPage:usermenus.hasPrevPage,
          hasNextPage:usermenus.hasNextPage,
          limit:usermenus.limit
        }
        
      }

      res.json(output);

    })
    .catch(err => console.log(err));
});

//update user menus based on role id

router.post("/update/:roleId",  (req, res) => {

  //delete all the user menus for the role

  //check if menus ids present
  let menuIds=req.body.menu_id;

  if(!menuIds){
    res.json({ 
      success:false,
      msg: "Menus not found" });
  }

  // UserMenus.collection.drop();

  UserMenus
      .deleteMany({ role_id:req.params.roleId })
      .then(() => {

        //after delete successfull insert all the data

        //loop through array and format the arra
        let insertArray=[];

        menuIds.forEach(function(doc,index){
          insertArray.push({
            "menu_id":doc,
            "role_id":req.params.roleId
          });
        })

        console.log('insertArrays',insertArray);
        //insert many data in mongo

      
        UserMenus.insertMany(insertArray)
          .then(data => {

            res.json({ 
              success:true,
              msg: "Menus assigned successfully"
            });

          })
          .catch(err => console.log(err));

         
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



router.get("/listByRole/:id", async(req, res) => {

  //get menus list 

  let menus=await Menus.find({is_active:true})
  .then(menu => menu)
  .catch(err => console.log(err));

  console.log('menus',menus);

  UserMenus.find({ role_id: req.params.id })
    .then(userMenus => {

      let output={
        success:true,
        data:{
          "menus":menus,
          "user_menus":userMenus,
        }        
        
      }
      res.json(output);
    })
    .catch(err => console.log(err));
 
});



router.get("/list/:id", (req, res) => {
  UserMenus.find({ role_id: req.params.id })
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


module.exports = router;
