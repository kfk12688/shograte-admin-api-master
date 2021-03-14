const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');


var VendorSchema = new Schema({
  vendor_name: {
    type: String,
    required: [true, "Vendor name is required"]
  },
  owner_name: {
    type: String,
    required: [true, "Owner name is required"]
  },
  mobile: {
    type: String,
    required: [true, "Mobile number is required"]
  },
  email: {
    type: String,
    required: [true, "Subcategory name is required"]
  },
  password: {
    type: String,
    required: [true, "Password id is required"]
  },
  // category_id: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Category",
  //   required: [true, "Category id is required"]
  // },
  // sub_category_id: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Subcategory",
  //   required: [true, "Subcategory name is required"]
  // },
  modified_date: {
    type: Date
  },
  is_active: {
    type: Boolean,
    default: 1
  }
});

VendorSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Vendor", VendorSchema);