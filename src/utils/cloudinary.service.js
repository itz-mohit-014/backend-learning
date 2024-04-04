import {v2 as cloudinary} from "cloudinary";
import fs from "fs"
import { url } from "inspector";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadFileOnCloudinary = async function (locallyBrowserFilePath){

    try {
        if(!locallyBrowserFilePath) return null;
        // upload file on cloudinary ...
       const fileUploadResponse = await cloudinary.uploader.upload(locallyBrowserFilePath , {
            resource_type:"auto",
        })

        console.log('File Have be uploaded successfull. URL : \n ', fileUploadResponse.url);
        
        fs.unlinkSync(locallyBrowserFilePath);
        return fileUploadResponse;
        
    } catch (error) {
        console.log(error)
        //  Remove the temporary upload file if any error occurs.  
        fs.unlinkSync(locallyBrowserFilePath)    
        return null
    }
} 


export {uploadFileOnCloudinary}



