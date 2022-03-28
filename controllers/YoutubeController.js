var Youtubefile = require("../models/Youtubefile");
var youtubeController = {};

// 전체 파일 목록 보기
youtubeController.list = function (req, res) {
    Youtubefile.find({}).exec(function (err, files) {
        if (err) {
            console.log(`Error : ${error}`);
        } else {
            console.log(`youtube files: ${files}`)
        };
        res.send(files);
    })
};

// token으로 파일 찾기
youtubeController.show = function (req, res) {
    Youtubefile.findOne({ token: req.params.token }).exec(function (err, youtubefile){
        if (err) {
            console.log(`Error : ${err}`);
        } else {
            console.log(`File : ${youtubefile}`);
        }
    })
};

// Youtube url 저장
youtubeController.save = function (req, res) {
    console.log(req.body);
    var youtubefile = new Youtubefile(req.body);

    youtubefile.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log(`file : ${youtubefile.url}`);
        }
        res.send(req.body);
    })
};

// 모두 삭제
youtubeController.removeAll = function (req, res) {
    Youtubefile.remove({}, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
        }
        res.send(req.body);
    });
};

// update File path
youtubeController.updatePath = function (req, res) {
    var path = req.body.path
    Youtubefile.findByIdAndUpdate(req.params.id, {file_path : path }, function(err, post) {
        if (err) {
            console.log(err);
        } else {
            console.log(post);
        }
    });
};

module.exports = youtubeController;