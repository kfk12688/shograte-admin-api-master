const mongoose = require("mongoose");

const mongoosePaginate = require('mongoose-paginate-v2');

var CategorySchema = new mongoose.Schema({
  category_name: {
    type: String,
    required: [true, "Catgory name is required"],
    unique : true,
    index: true
  },
  category_desc: {
    type: String
  },
  is_active: {
    type: Boolean,
    default: 1
  },
  modified_date: {
    type: Date
  }
});

CategorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Category", CategorySchema);
