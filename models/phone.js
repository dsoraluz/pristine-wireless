const mongoose = require('mongoose');

const Schema = mongoose.Schema;

mongoose.plugin(require('mongoose-regex-search'));

const phoneSchema = new Schema({
  brand: {type: String, index: true, searchable: true, required: true},
  model: {type: String, index: true, searchable: true, required: true},
  condition: {type: String, index: true, searchable: true, required: true},
  memory: {type: String,index: true, searchable: true, required: true},
  color: {type: String, index: true, searchable: true, required: true},
  price: {type: String, index: true, searchable: true, required: true},
  provider: {type: String,index: true, searchable: true, required: true},
  unlocked:{type: String, index: true, searchable: true, required: true},
  additionalDetails: {type: String, required: true},
  imageUrl: {type: String, required: true},
  owner: {type: Schema.Types.ObjectId, ref:'User'}
});

phoneSchema.set('timestamps', true);

const Phone = mongoose.model('Phone', phoneSchema);

module.exports = Phone;
