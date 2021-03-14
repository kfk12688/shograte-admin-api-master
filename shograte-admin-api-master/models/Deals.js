const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var aggregatePaginate = require('mongoose-aggregate-paginate-v2');

var DealsSchema = new Schema({
  deal_name: {
    type: String,
    required: [true, "Product name is required"]
  },
  deal_desc: {
    type: String,
    required: [true, "Product desc is required"]
  },
  deal_image: {
    type: Array,
    required: [true, "Product image is required"]
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product name is required"]
  },
  vendor_id: {
    type: Schema.Types.ObjectId,
    ref: "Vendor",
    required: [true, "vendor name is required"]
  },
  milestones: [],
  modified_date: {
    type: Date
  },
  is_active: {
    type: Boolean,
    default: 1
  }
});


DealsSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("Deal", DealsSchema);
