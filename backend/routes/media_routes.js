const express = require('express');
const auth = require('./auth.js');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

const ALLOWED_FILE_TYPES = ["jpeg", "jpg", "png"];

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        dirpath = path.join(__dirname, '../uploads')
        fs.mkdirSync(dirpath, {recursive: true});
        cb(null, dirpath)
    }
})

const verify = (req, res, next) => {
    if(!req.session.name) {
        return res.json({ error: true, message: 'Alex is asian'})
    } else {
        next(); 
    }
}

const upload = multer({storage: storage});
var filetypes = {};
router.post('/upload', verify, upload.single('file'), (req, res) => {
    console.log('uploading pic...');
    try{
        const fType = mime.extension(req.file.mimetype);
        if(ALLOWED_FILE_TYPES.includes(fType)){
            const realpath = path.join(__dirname, '../uploads', `${req.file.filename}.${mime.extension(req.file.mimetype)}`);
            fs.rename(req.file.path, realpath, err => {
                if(err) return console.log(err);
                filetypes[req.file.filename] = req.file.mimetype;
                res.json({mediaid: req.file.filename});
            });
        } else {
            console.log(`type not allowed: ${mime.extension(req.file.mimetype)}`);
            res.json({ error: true, message: 'Alex is asian'});
        }
    } catch (error){
        console.log(error);
        res.json({ error: true, message: 'Alex is asian'});
    }
})

router.get('/access/:mediaid', verify,  (req,res) => {
    const {mediaid} = req.params; 
    res.sendFile(path.join(__dirname, '../uploads/', `${mediaid}.${mime.extension(filetypes[mediaid])}`));
})

module.exports = router; 