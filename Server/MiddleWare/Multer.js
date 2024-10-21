const multer = require('multer')
const fs = require("fs")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = "./Public"
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

const upload = multer({ storage: storage })

module.exports = upload