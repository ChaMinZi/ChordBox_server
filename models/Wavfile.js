var mongoose = require('mongoose');
  
var Wavfile = mongoose.Schema({
    token : 'string',
    path : 'string',
    chord_path : 'string'
});

module.exports = mongoose.model('Wavfile', Wavfile);