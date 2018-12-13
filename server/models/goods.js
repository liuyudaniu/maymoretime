var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
  "ProductId":String,
  "ProductName":String,
  "salePrice":Number,
  "ProductImage":String,
  "checked":String,
  "productNum":Number,
});

module.exports = mongoose.model('Good',ProductSchema);

