const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

var UserMenusSchema = new mongoose.Schema({
  menu_id: {
    type: String,
    required: true
  },
  role_id: {
    type: String,
    required: true
  },
  is_active: {
    type: Boolean,
    default: 1
  },
  date: {
    type: Date,
    default: Date.now
  }
});


UserMenusSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("UserMenus", UserMenusSchema);
