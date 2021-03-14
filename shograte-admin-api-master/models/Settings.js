const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

var SettingSchema = new Schema({
  store_title: {
    type: String,
    required: [true, "Store Title is required"]
  },
  store_name: {
    type: String,
    required: [true, "Store name is required"]
  },
  address: {
    type: String,
    required: [true, "Address is required"]
  },
  email: {
    type: String,
    required: [true, "Subcategory name is required"]
  },
  phone: {
    type: String,
    required: [true, "Phone id is required"]
  },
  country: {
    type: String,
    required: [true, "Country is required"]
  },
  state: {
    type: String,
    required: [true, "Region / State is required"]
  },
  store_logo: {
    type: String,
    required: [false, "Store Logo is required"]
  },
  store_icon: {
    type: String,
    required: [false, "Store Icon is required"]
  },
  modified_date: {
    type: Date
  }
});

SettingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Setting", SettingSchema);