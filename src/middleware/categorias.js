
function demoMiddleware(req, res, next) {
  const multer = require('multer');

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  });

  const upload = multer({ storage: storage });

  upload.single('img_url')(req, res, function (err) {
    if (err) {
      return res.status(500).send(err);
    }
    next();
  });
}

//Ojo al usar este midellware tendras que introducir como pramatreo al formulario lo siguiente enctype="multipart/form-data"

module.exports=demoMiddleware


