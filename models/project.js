"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var projectSchema = Schema({
  name: String,
  description: String,
  category: String,
  langs: String,
  image: String,
  repository: String,
  preview: String,
});

module.exports = mongoose.model("Project", projectSchema);
