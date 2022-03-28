var mongoose = require('mongoose');

var Wavfile = mongoose.Schema({
    token : 'string',
    path : 'string',
    chords: 'string',
    times: 'string',
    createAt: {
        type: Date,
        expires:86400,
        default:Date.now
    }
});

module.exports = mongoose.model('Wavfile', Wavfile);