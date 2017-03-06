const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: {type: String, required: true},
  password: {type: String, required: true},
},{
  timestamps:
  {createdAt: 'created_at',
  updatedAt: 'updated_at'
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
