import cloudinary from 'cloudinary';
import dotenv from 'dotenv'
dotenv.config();
cloudinary.v2.config({
    cloud_name: process.env.name,
    api_key: process.env.apiKey,
    api_secret: process.env.apiSecret
})
export default cloudinary.v2;