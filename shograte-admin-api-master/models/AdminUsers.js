const mongoose = require("mongoose");
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const Schema = mongoose.Schema;


var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique : true
  },
  email: {
    type: String,
    required: true,
    unique : true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: "Roles",
    required: [true, "Role id is required"]
  },
  forget_password_expiry: {
    type: Date
  },
  forget_password_otp: {
    type: String
  },
  forget_password_token: {
    type: String
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


UserSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("AdminUsers", UserSchema);
