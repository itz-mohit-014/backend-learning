import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "./public/temp")
    },
    filename: function(req, file, cb){

        //  can save vie changing name to the file or add custom unique sufix.
        cb(null, file.originalname)
    }
})

export const upload = multer({
    storage,
})