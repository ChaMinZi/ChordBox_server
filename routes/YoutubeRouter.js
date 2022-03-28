var express = require('express');
var router = express.Router();

var youtubeController = require('../controllers/YoutubeController.js');
var YoutubeModel = require("../models/Youtubefile");

router.get('/lists', youtubeController.list);

router.post('/save', youtubeController.save);

router.post('/uploadUrl', function (req, res) {
    console.log("body : ", req.body);

    var youtubeModel = new YoutubeModel(req.body);

    youtubeModel.save(function (err) {
        if (err) {
            console.log(err);
            res.status(404).send('Sorry cant find that!');
        } else {
            console.log(`youtube model : ${youtubeModel}`);
            res.send();
        }
    });
});

router.get('/show/:token', youtubeController.show);

router.get('/deleteAll', youtubeController.removeAll);

router.put('/:id', youtubeController.updatePath);

module.exports = router;