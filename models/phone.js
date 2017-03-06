const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const phoneSchema = new Schema({
  brand: {type: String, required: true},
  model: {type: String, required: true},
  memory: {type: String, required: true},
  color: {type: String, required: true},
  price: {type: String, required: true},
  provider: {type: String, required: true},
  unlocked:{type: String, required: true},
  flaws: {type: String, required: true},
  imageUrl: {type: String, required: true},
  owner: {type: Schema.Types.ObjectId, ref:'User'}
});

phoneSchema.set('timestamps', true);

const Phone = mongoose.model('Phone', phoneSchema);

module.exports = Phone;
