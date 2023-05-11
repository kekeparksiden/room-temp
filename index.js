const http = require('http');
const fs = require('fs');
require('dotenv').config();
const path = require('path');
const crypto = require('crypto');

const express = require('express');
const multer = require('multer');
const port = process.env.PORT || 3000;

const app = express();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './');
    },
    filename: function (req, file, cb) {
      // especifica el nombre del archivo deseado aquí
      cb(null, req.url.split("/")[2]);
    }
});
  
const upload = multer({ storage: storage,
    fileFilter: function (req, file, cb) {
        const exp = process.env.EXPIRATION_MINUTES || 60;
        setTimeout(() => {
          fs.unlink(path.join(__dirname, './' + req.url.split("/")[2]), function (err) {
            if (err) console.log(err);
          });
        }, 60000 * exp);
        cb(null, true);
} });

app.post('/room/:room', upload.single('file'), (req, res) => {
    const f = fs.readFileSync(path.join(__dirname, './' + req.url.split("/")[2]));
    const hash = crypto.createHash('md5').update(f).digest('hex');
    res.send(hash);
});   

app.get('/room/:room', (req, res) => {
    res.sendFile(path.join(__dirname, './' + req.url.split("/")[2]));
});

app.listen(port, () => console.log(`Started in port=${port}`));
