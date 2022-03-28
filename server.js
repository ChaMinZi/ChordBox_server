const express = require('express')
const app = express();

const FormData = require('form-data')
const fs = require('fs');
const path = require('path');
const axios = require('axios');


// Json 요청 받기
app.use(express.json());
// Field 요청 받기
app.use(express.urlencoded({ extended: true }));

/**
 * Push Alarm 
 **/
const admin = require("firebase-admin");
let serviceAccount = require("./firebase_admin_key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


/**
 * File upload
 **/
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/')
    },
    filename: (req, file, callback) => {
        //callback(null, file.fileName + "")
        callback(null, file.originalname + "")
    }
})
const upload = multer({ storage: storage });

/**
 * DB
 **/
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chordDB')
        .then(() => console.log('connected succesful'))
        .catch((err)=> console.error(err));

// Youtube url 관련 처리
var youtubes = require('./routes/YoutubeRouter');
app.use('/youtube', youtubes);

// Wav url 관련 처리
let waves = require('./routes/WavRouter');
app.use('/wav', waves);

const hostname = '외부 IP';
const port = '포트 번호';

/**
 * Models
 */
var YoutubeModel = require("./models/Youtubefile");
var WavfileModel = require("./models/Wavfile");

// wav 오디오 파일 업로드
app.post('/uploadFile', upload.single('audiofile'), async (req, res) => {
    try {
        var token = req.body.token.replace(/[\"]/gi,"");

        // DB 저장
        var wavModel = new WavfileModel(req.body);
        wavModel.token = token;
        wavModel.path = req.file.path;

        wavModel.save(function (err) {
            if (err) {
                console.log(err);
                res.status(404).send('Sorry cant upload that!');
            } else {
                console.log(`model : ${wavModel}`);
            }
        });
//    console.log(req.body);
//    console.log(req.file);

    // Model 서버에 전송
    var formData = new FormData();
    //const file = req.file;

    formData.append('_id', wavModel._id.valueOf());
    formData.append('file', fs.createReadStream(wavModel.path));

    try {
        const sendConfig = {
            method: 'post',
            url: 'http://서버 주소/predict_wav',
            headers: {
                'Content-Type': 'multipart/form-data',
                ...formData.getHeaders()
            },
            data: formData
        }

        await axios(sendConfig).then(function (res) {
            console.log("wav send ok");
            pushNotification(wavModel, req.file.filename, res);
            //res.status(200).send('Send Ok');
        }).catch(function (err) {
            console.log(err);
        });
    } catch(err) {
        console.log(err);
        res.status(404).send('wav send Error');
    }
        res.status(200).send('Ok');
    } catch(err) {
        console.log(err);
        res.status(404).send('wav send Error');
    }
});

function pushNotification(wavModel, filename, res) {
    WavfileModel.findByIdAndUpdate(wavModel._id,  {
        $set: {
            chords: res.data.chords,
            times: res.data.times
        }}, function(err, post) {
            if(err) {
                console.log(err);
                return next(err);
            } else {
                console.log(post);

                let deviceToken = post.token;
                console.log(filename.split('_'));
                let sendFileName = filename.split('_');
                let bodyContent = sendFileName[1] + " File separtion is complete"
                let message = {
                    notification: {
                        title: "Chord Box Notification",
                        body: bodyContent
                    },
                    token: deviceToken
                }

             // FCM push
                admin
                    .messaging()
                    .send(message)
                    .then(function (response) {
                        console.log('Successfully sent message: : ', response)
                        //res.status(200).json({ success: true })
                     })
                    .catch(function (err) {
                        console.log('Error Sending message!!! : ', err)
                        //res.status(400).json({ success: false })
                    });
            }
        }
    );
}

// Youtube url 업로드
app.post('/uploadUrl', async (req, res) => {
    console.log("body : ", req.body);

    var youtubeModel = new YoutubeModel(req.body);

    // 1. DB 저장
    youtubeModel.save(function (err) {
        if (err) {
            console.log(err);
            res.status(404).send('Sorry cant upload that!');
        } else {
            console.log(`model : ${youtubeModel}`);
        }
    });

    // 2. 서버 전송
    try {
        var formData = new FormData();
        formData.append('_id', youtubeModel._id.valueOf());
        formData.append('url', youtubeModel.url);

        const sendConfig = {
            method: 'post',
            url: 'http://서버 주소/predict_url',
            headers: {
                'Content-Type': 'multipart/form-data',
                ...formData.getHeaders()
            },
            data: formData
        }

        await axios(sendConfig).then(function (res) {
            console.log("url send ok");
        }).catch(function (err) {
            console.log(err);
            res.status(404).send('url send error');
        })
    } catch (err) {
        console.log(err);
    }

    res.send(req.stale);
});

/**
 * 모델 호출 API
 */

// youtube url 오디오 파일 업로드
app.put('/resultUrl', upload.single('audiofile'), function (req, res, next) {
    // 1. mp4 file upload
    console.log("req body id: "+req.body._id);
    console.log("req file name: "+req.file.filename);

    // 2.DB 저장 후 app notification 
    next();
});

app.put('/resultUrl', function (req, res) {
    var path = "/uploads/" + req.file.filename;
    //console.log(path)

    //let objectid = req.body._id.replace("\'","");
    //console.log(objectid)

    var modelId = req.body._id;
    var chordList = req.body.chords;
    var timeList = req.body.tiems;

    YoutubeModel.findOneAndUpdate(
        {_id: modelId},
        {
            $set: {
                chordfilename: req.body.chordfilename,
                file_path: req.file.path,
                chords: req.body.chords,
                times: req.body.times
            }
        },
        {
                new: true
        },
        function(err, post){
            console.log(err);
            if(err) {
              console.log(err);
              return next(err);
            }
            else {
                console.log("post");
                console.log(post);
                console.log("log");
                console.log(req.body);
                console.log(req.file);

                let deviceToken = post.token;
                let bodyContent = post.url + " Url File separation is complete"
                let message = {
                    notification: {
                        title: "Chord Box Notification",
                        body: bodyContent
                    },
                    token: deviceToken
                }

                // FCM push
                admin
                    .messaging()
                    .send(message)
                    .then(function (response) {
                        console.log('Successfully sent message: : ', response)
                        return res.status(200).json({ success: true })
                    })
                    .catch(function (err) {
                        console.log('Error Sending message!!! : ', err)
                        return res.status(400).json({ success: false })
                    });
            }
    });
});

// JSON 파일 호출하기
app.post('/fileChord', (req, res, next) => {
    var path = "uploads/"+req.body.filename;

    WavfileModel.findOne({path: path, token: req.body.token}, function (err, model) {
        if (err) {
            console.log(err);
            res.status(400).json({ success: false })
        } else {
            var json = {
                "fileName": req.body.filename,
                "chordList": model.chords,
                "timeList": model.times
            }
            console.log(json);
            res.send(json);
            next();
        }
    });
});

app.post('/fileChord', (req, res) => {
    var file = req.body.filename;
    fs.unlink(`./uploads/${file}`, (err)=>{
        if(err) {
            console.log("Error : ", err)
        }
        console.log("File deleted");
    })
});

app.post('/urlChord', (req, res) => {
    YoutubeModel.findOne({url: req.body.url}, function (err, model) {
        if (err) {
            console.log(err);
            res.status(400).json({success: false})
        } else {
            //console.log(model);
            var json = {
                "url": req.body.url,
                "filePath": model.file_path,
                "urlName": model.chordfilename,
                "chordList": model.chords,
                "timeList": model.times
            }
            console.log(json);
            res.send(json);
        }
    })
})

app.get('/download', (req, res, next) => {
    //var filePath = "./uplaods/" + req.filename
    console.log("download call")
    console.log(req.query.filename);

    let filePath = "./uploads/" + req.query.filename;
    //res.download(filePath)

    res.download(filePath, function (err) {
        if (err) {
            res.status(400).json({ success: false });
        } else {
            res.end();
            next();
        }
    })
});

app.get('/download', (req, res) => {
    let filePath = "./uploads/" + req.query.filename
    fs.unlink(`./uploads/${req.query.filename}`, (err) => {
        if (err) {
            console.log("Error : ", err)
        }
        console.log("File deleted");
    })
});

app.listen(port,'0.0.0.0', function () {
    console.log('Server is running...')
});