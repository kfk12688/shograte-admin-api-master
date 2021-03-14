const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');

var ProductSchema = new Schema({
  product_name: {
    type: String,
    required: [true, "Product name is required"]
  },
  product_desc: {
    type: String,
    required: [true, "Product desc is required"]
  },
  product_image: {
    type: String,
    required: [true, "Product image is required"]
  },
  product_images: {
    type: Array,
    required: [true, "Product image is required"]
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Category id is required"]
  },
  sub_category_id: {
    type: Schema.Types.ObjectId,
    ref: "Subcategory",
    required: [true, "Subcategory name is required"]
  },
  vendor_id: {
    type: Schema.Types.ObjectId,
    ref: "Vendor",
    required: [true, "vendor name is required"]
  },
  modified_date: {
    type: Date
  },
  is_active: {
    type: Boolean,
    default: 1
  }
});

ProductSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("Product", ProductSchema);
