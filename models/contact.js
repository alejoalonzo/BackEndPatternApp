"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var contactSchema = Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
});

module.exports = mongoose.model("Contact", contactSchema);
