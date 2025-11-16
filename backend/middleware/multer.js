import multer from "multer";
import fs from 'fs'
import path from 'path'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(process.cwd(),'uploads')
        try { fs.mkdirSync(uploadDir, { recursive: true }) } catch {}
        cb(null, uploadDir)
    },
    filename:function(req,file,callback){
        const unique = Date.now() + '-' + Math.round(Math.random()*1e6)
        callback(null, unique + '-' + file.originalname)
    }
})

const upload = multer({storage})

export default upload