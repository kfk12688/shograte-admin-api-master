const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

var MenusSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
    unique : true
  },
  name: {
    type: String,
    required: true,
    unique : true
  },
  icon: {
    type: String,
    required: true
  },
  component: {
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


MenusSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Menus", MenusSchema);
