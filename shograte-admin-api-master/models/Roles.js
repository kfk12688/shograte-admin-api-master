const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

var RolesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique : true
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


RolesSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Roles", RolesSchema);
