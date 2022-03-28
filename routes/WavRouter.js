var express = require('express');
var router = express.Router();

var wavController = require('../controllers/WavController.js');

router.get('/lists', wavController.list);

router.post('/save', wavController.save);

router.get('/deleteAll', wavController.removeAll);

module.exports = router;