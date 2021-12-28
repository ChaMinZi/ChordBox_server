var mongoose = require('mongoose');
  
var Youtubefile = mongoose.Schema({
    token : 'string',
    url : 'string',
    chord_path : 'string'
});

module.exports = mongoose.model(`Youtubefile`, Youtubefile);