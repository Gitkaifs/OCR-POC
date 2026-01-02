import { v4 as uuidv4 } from 'uuid';

import { processOCR } from '../services/Ocr.service.js';
import { imgUrlConverter } from '../utils/helpingFunctions.js';
import { saveDocument , getAllDocuments } from '../services/document.service.js';

// ----------------------------

let extractedText ;
let imagePath ;



// --------------------------------

/**
 * API 1: Upload Image (Create OCR Job)
 * POST /api/upload
 */
export const uploadImage = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided'
      });
    }

 
    imagePath = req.file.path ;

    // Extracting text using OCR funtion
    extractedText = await processOCR(imagePath);
    

    // Save data in database.
    await saveDocument(imgUrlConverter(imagePath) , extractedText);
 

    return res.status(200).json({
  
      message: 'Image uploaded successfully.'
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Failed to upload image',
      details: error.message
    });
  }
};



/**
 * API 2: Get all documents from database and send to client
 * GET /api/getall
 */
export const getAll = async (req , res) => {
  try{
 
    let database = await getAllDocuments();
    console.log(database)

    res.status(200).json({
      allData : database , 
      message : "All data fetched from DB."
    })

  }
  catch(err){
    res.status(404).json({
      message : "Data not found.",
      errorMsg : err.message
    })

  }
}