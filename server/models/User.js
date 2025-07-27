const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: String, // Only for local login
  googleId: String, // Only for Google login
  name: String,     // From user input or Google profile
});
module.exports = mongoose.model('User', UserSchema);
