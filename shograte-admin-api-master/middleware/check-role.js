const UserMenus = require("../models/UserMenus");
const Menus = require("../models/Menus");

function permit(path) {


  return(request, response, next) => {

    // var token = "eyJ0eXAiO.../// jwt token";
  // var decoded = jwt_decode(token);

  //console.log('request',request);

  if(request.userData){

    if (request.userData.role == '601e1813e86e5e67c41249b24' || request.userData.role == 'SuperAdmin'){
      next();
    }else{
  

    //get the menus
  
    let menus= Menus.findOne({component:path})
    .then(menu => {
      //console.log('menu found',menu);
  
      //check the menu is in user menus
      UserMenus.findOne({menu_id:menu._id})
      .then(user_menu => {
        // console.log('user_menu found',user_menu);
  
        if(user_menu.length > 0){
          next();  
        } 
        
      })
      .catch(err =>{
        response.json({ success:false,message: "Access deined for this user" });
      });
  
    })
    .catch(err => {
      response.json({ success:false,message: "Access deined for this user" });
    });
  
  
    }

  }else{
    response.json({ success:false,message: "Access deined for this user" });
  }

 


    // if (request.userData.role && admin === request.userData.role) next();
    // else {
    //   response.json({ message: "Access deined for this user" });
    // }
  };
}
module.exports = permit;
