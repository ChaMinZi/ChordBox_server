const express = require('express')
const app = express()

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

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/')
    },
    filename: (req, file, callback) => {
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
app.use('/youtube',youtubes);


const hostname = 'ip 입력';
const port = 8080;

function FileResponse(fileId) {
    this.fileId = fileId;
}

// 오디오 파일 업로드
app.post('/uploadFile', upload.single('audiofile'), function (req, res) {
    console.log(req.body);
    console.log(req.file);

    var fileResponse = new FileResponse("1");
    console.log(fileResponse);

    res.send(fileResponse);
});

// Youtube url 업로드
app.post('/uploadUrl', function (req, res) {
    console.log("body : ", req.body.url);

    youtubes.save(req, res)

    res.send(req.stale);
});

// Push Test
app.get('/pushComplete', function (req, res, next) {
    let deviceToken = "DEVICE TOKEN"
    let message = {
        notification: {
            title: "Test",
            body: "push test in server"
        },
        token: deviceToken
    }

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
        })
});


/**
 * 모델 호출 API
 */
app.post('/resultFile', function (req, res, next) {
    // 1. DB에 저장하기
    console.log('Save in DB')
    next(); // 2. pusher 호출하기    
});

app.post('/resultFile', function (req, res, next) {
    let deviceToken = "DEVICE TOKEN"
    let message = {
        notification: {
            title: "Chord Box Notification",
            body: "musicrecord0.wav File separtion is complete"
        },
        token: deviceToken
    }

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
        })
});

// JSON 파일 호출하기
app.post('/fileChord', (req, res) => {
    // 1. DB에 저장된 json 호출 
    let json = {
        "fileName": "musicrecord0.wav",
        "chordList": ["Cmaj", "Emin", "Amin", "Gmaj", "Cmaj", "Emin", "Amin", "Gmaj", "Cmaj", "Emin", "Amin", "Gmaj", "Cmaj", "Emin", "Amin"],
        "timeList": [0, 2, 4, 6, 8, 10, 11, 13, 15, 17, 18, 21, 22, 24, 26]
    };

    // 2. 전송
    res.send(json);
});


// URl 추출 결과 호출
app.post('/resultUrl', upload.single('audiofile'), function (req, res, next) {
    console.log(req.body);
    console.log(req.file);

    next();
});

app.post('/resultUrl', function(req, res, next) {
    let deviceToken = "DEVICE TOKEN"
    let message = {
        notification: {
            title: "Chord Box Notification",
            body: "musicrecord0.wav File separtion is complete"
        },
        token: deviceToken
    }

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
        })
});


app.listen(port,'0.0.0.0', function () {
    console.log('Server is running...')
});