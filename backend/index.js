import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import cloudinary from './util/config.js';
import QRCode from 'qrcode';
import sharp from 'sharp';
import Document from './model/document.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Multer (store images in memory)
const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 5000;

// app.post('/upload', upload.single("image"), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ success: false, message: 'No image uploaded' });
//         }

//         // Upload Image to Cloudinary
//         const imageBuffer = req.file.buffer;
//         const uploadResult = await cloudinary.uploader.upload_stream(
//             { resource_type: "image" },
//             async (error, result) => {
//                 if (error) {
//                     console.error(error);
//                     return res.status(500).json({ success: false, message: 'Cloudinary upload failed' });
//                 }

//                 // Get Image Metadata (Width & Height)
//                 const { width, height } = await sharp(imageBuffer).metadata();
                
//                 // 🔹 Increase QR Code Size (25-30% of image width)
//                 const qrSize = Math.floor(width * 0.3);  // 30% of image width for a larger QR code
//                 const qrCodeBuffer = await QRCode.toBuffer(result.secure_url); // Generate QR for the uploaded image URL

//                 // Resize QR Code to match calculated size
//                 const resizedQRCode = await sharp(qrCodeBuffer).resize(qrSize, qrSize).toBuffer();

//                 // 🔹 Set Position (bottom-right) with more padding
//                 const qrX = width - qrSize - 30; // 30px padding for larger QR code
//                 const qrY = height - qrSize - 30; // 30px padding for larger QR code

//                 // Embed QR Code on Image
//                 const modifiedImageBuffer = await sharp(imageBuffer)
//                     .composite([{ input: resizedQRCode, top: qrY, left: qrX }])
//                     .toBuffer();

//                 // Upload Modified Image
//                 const modifiedUploadResult = await cloudinary.uploader.upload_stream(
//                     { resource_type: "image" },
//                     (error, modifiedResult) => {
//                         if (error) {
//                             console.error(error);
//                             return res.status(500).json({ success: false, message: 'Modified image upload failed' });
//                         }

//                         res.json({
//                             success: true,
//                             message: "Image uploaded & QR embedded",
//                             originalImage: result.secure_url,
//                             qrCodeImage: modifiedResult.secure_url
//                         });
//                     }
//                 );

//                 modifiedUploadResult.end(modifiedImageBuffer); // Upload modified image
//             }
//         );

//         uploadResult.end(imageBuffer); // Upload original image to Cloudinary
//     } catch (error) {
//         console.log("Something went wrong:", error);
//         res.status(500).json({ success: false, message: 'Failed to process image' });
//     }
// });


app.post('/upload', upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }

        // Upload Image to Cloudinary
        const imageBuffer = req.file.buffer;
        const uploadResult = await cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            async (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ success: false, message: 'Cloudinary upload failed' });
                }

                
                const { width, height } = await sharp(imageBuffer).metadata();
                
               
                const qrSize = Math.floor(width * 0.3); 
                

                const qrData = `https://679fbc90f2285f6dfb571244--onestepdocumentverifier.netlify.app//verify/${result.public_id}`; 
                const qrCodeBuffer = await QRCode.toBuffer(qrData); 

    
                const resizedQRCode = await sharp(qrCodeBuffer).resize(qrSize, qrSize).toBuffer();

                const qrX = width - qrSize - 30;
                const qrY = height - qrSize - 30; 

        
                const modifiedImageBuffer = await sharp(imageBuffer)
                    .composite([{ input: resizedQRCode, top: qrY, left: qrX }])
                    .toBuffer();

             
                const modifiedUploadResult = await cloudinary.uploader.upload_stream(
                    { resource_type: "image" },
                    async (error, modifiedResult) => {
                        if (error) {
                            console.error(error);
                            return res.status(500).json({ success: false, message: 'Modified image upload failed' });
                        }

                     
                        const newDocument = new Document({
                            originalImageUrl: result.secure_url, 
                            qrCodeData: qrData, 
                            publicId: result.public_id, 
                            qrCodeImage: modifiedResult.secure_url,
                        });

                        await newDocument.save();

                  
                        res.json({
                            success: true,
                            message: "Image uploaded & QR embedded & saved to database",
                            originalImage: result.secure_url,
                            qrCodeImage: modifiedResult.secure_url,
                            qrRedirectUrl: qrData 
                        });
                    }
                );

                modifiedUploadResult.end(modifiedImageBuffer); 
            }
        );

        uploadResult.end(imageBuffer); 
    } catch (error) {
        console.log("Something went wrong:", error);
        res.status(500).json({ success: false, message: 'Failed to process image' });
    }
});

app.get('/verify/:public_id', async (req, res) => {
    const { public_id } = req.params;

    const document = await Document.findOne({ publicId: public_id });

    if (!document) {
        return res.status(404).json({ message: "Document not found" });
    }

    // Return the verification info as a JSON response
    res.json({
        message: "Document Verified",
        imageUrl: document.originalImageUrl, // Return the image URL
    });
});




app.listen(PORT, () => {
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(`Server running on port ${PORT}`);
});
