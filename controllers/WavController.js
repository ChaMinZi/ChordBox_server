let Wavfile = require("../models/Wavfile");
let wavController = {};

// 전체 파일 목록 보기
wavController.list = function (req, res) {
    Wavfile.find({}).exec(function (err, files) {
        if (err) {
            console.log(`Error : ${err}`);
        } else {
            console.log(`wav files : ${files}`);
        }
        res.send(files);
    })
};

// Wav file 관련 데이터 저장
wavController.save = function (req, res) {
    var wavfile = new Wavfile(req.body);

    wavfile.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log(`wav : ${wavfile}`);
        }
        res.send(req.body);
    })
};

// Wav file 모두 삭제
wavController.removeAll = function (req, res) {
    Wavfile.remove({}, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
        }
        res.send(req.body);
    });
};

module.exports = wavController;