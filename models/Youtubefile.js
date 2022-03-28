var mongoose = require('mongoose');

var Youtubefile = new mongoose.Schema({
    token : 'string',
    url : 'string',
    chordfilename: 'string',
    file_path : 'string',
    chords : 'string',
    times : 'string',
    createAt: {
        type: Date,
        expires:86400,
        default:Date.now
    }
});

module.exports = mongoose.model(`Youtubefile`, Youtubefile);