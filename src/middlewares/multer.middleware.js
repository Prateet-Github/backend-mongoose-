import multer from 'multer';    // Import the multer library for handling file uploads

const storage = multer.diskStorage({     // Configure storage for uploaded files in this casr ite the disk of your machine

  destination: function (req, file, cb) {  
    cb(null, './public/temp') // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Set the filename for the uploaded file
  }
})



export const upload = multer({ storage: storage })  // Create a multer instance with the defined storage configuration
