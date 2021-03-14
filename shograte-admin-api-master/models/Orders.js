const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const mongoosePaginate = require('mongoose-paginate-v2');

var OrderSchema = new Schema({
  customer_id: {
    type: String,
    ref: "Customers",
    required: [true, "Custormer Id is required"]
  },
  vendor_id: {
    type: String,
    ref: "Vendors",
    required: [true, "Vendor Id is required"]
  },
  order_status: {
    type: String,
    required: [true, "Order Status is required"]
  },
  order_total: {
    type: String,
    required: [true, "Order Total is required"]
  },
  created_date: {
    type: Date
  },  
  modified_date: {
    type: Date
  },
  is_active: {
    type: Boolean,
    default: 1
  }
});

// OrderSchema.plugin(aggregatePaginate);
OrderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Order", OrderSchema);