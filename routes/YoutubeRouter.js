var express = require('express');
var router = express.Router();

var youtubefile = require('../controllers/YoutubeController.js');

router.get('/lists', youtubefile.list);

router.post('/save', youtubefile.save);

router.get('/show/:token', youtubefile.show);

router.get('/deleteAll', youtubefile.removeAll);

router.put('/:id', youtubefile.updatePath);

module.exports = router;