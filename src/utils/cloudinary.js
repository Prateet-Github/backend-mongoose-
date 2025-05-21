import { v2 as cloudinary } from 'cloudinary'     // Importing the Cloudinary library
import fs from 'fs'

// Configuration for Cloudinary

        cloudinary.config({ 
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET 
            });
            
          // Upload an image to Cloudinary

          const uploadOnCloudinary = async (localFilePath ) => {
              const uploadResult = await cloudinary.uploader    //  Uploading a file to Cloudinary
                .upload(localFilePath, {
                    public_id: 'shoes',
                    resource_type: 'auto', // Automatically detect the resource type
                })
        .then((uploadResult) => {
            fs.unlinkSync(localFilePath); // Delete the local file after successful upload
            return uploadResult;
        })
                
                .catch((error) => {
                    fs.unlinkSync(localFilePath); // Delete the local file if upload fails
                    return null;
                });
          
              return uploadResult; // Return the result of the upload
          }
        

export { uploadOnCloudinary } // Export the function for use in other modules
    