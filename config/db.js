const mongoose = require('mongoose');
module.exports = async function (uri) {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  mongoose.connection.on('error', (e) => console.error('Mongo error', e));
  mongoose.connection.on('connected', () => console.log('Mongo connected'));
};
