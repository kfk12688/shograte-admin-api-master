const mongoose = require("mongoose");

var aggregatePaginate = require('mongoose-aggregate-paginate-v2');


const Schema = mongoose.Schema;

var SubCategorySchema = new Schema({
  subcategory_name: {
    type: String,
    required: [true, "Subcategory name is required"],
    unique : true
  },
  subcategory_desc: {
    type: String
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "category id is required"]
  },
  modified_date: {
    type: Date
  },
  is_active: {
    type: Boolean,
    default: 1
  }
});

SubCategorySchema.plugin(aggregatePaginate);

module.exports = mongoose.model("SubCategories", SubCategorySchema);
