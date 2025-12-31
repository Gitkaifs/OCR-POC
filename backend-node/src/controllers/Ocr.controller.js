import { v4 as uuidv4 } from 'uuid';
import { createJob, getJob, updateJobStatus, jobExists } from '../utils/jobStore.js';
import { processOCR } from '../services/ocr.service.js';
import { imgUrlConverter } from '../utils/helpingFunctions.js';

// ------------------------------
// Temporary helper functions

let extractedText ;
const database = [];
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

    // // Generate unique job ID
    // const jobId = uuidv4();

    // // Create job in store with pending status
    // createJob(jobId);

    // // Start OCR processing asynchronously (don't wait for it)
    // processImageAsync(jobId, req.file.path);

    // const extractedText = await processOCR(imagePath); // Uncomment later -uncom
    imagePath = req.file.path ;
    extractedText = await processOCR(imagePath);
    

    // -----------------------------------------
    // kaif add image , text add to db here and retrun promise add await before it.
    //-----------------------------------------

    // -----------------------
    // Temporary helper function to mimic database work

    database.push({
      textid : Date.now ,
      docText : extractedText ,
      docImage : imgUrlConverter(imagePath)
    })

    //-------------------------------------

    // Return job ID immediately
    return res.status(200).json({
      // jobId,
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
 * API 2: Get OCR Status (Polling API)
 * GET /api/status/:jobId
 */
export const getStatus = (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job exists
    if (!jobExists(jobId)) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }

    // Get job from store
    const job = getJob(jobId);

    // Return status based on job state
    if (job.status === 'rejected') {
      return res.status(200).json({
        status: 'rejected',
        error: job.error || 'Image is unreadable or invalid'
      });
    }

    // Return current status (pending, processing, or done)
    return res.status(200).json({
      status: job.status
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Failed to get status',
      details: error.message
    });
  }
};

/**
 * API 3: Get OCR Result (Final Output)
 * GET /api/result/:jobId
 */
export const getResult = (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job exists
    if (!jobExists(jobId)) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }

    // Get job from store
    const job = getJob(jobId);

    // Check if OCR is completed
    if (job.status !== 'done') {
      return res.status(200).json({
        message: 'OCR not completed yet'
      });
    }

    // Return extracted text
    return res.status(200).json({
      jobId,
      text: job.extractedText
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Failed to get result',
      details: error.message
    });
  }
};

/**
 * Helper function to process image asynchronously
 * This runs in the background and updates job status
 */
const processImageAsync = async (jobId, imagePath) => {
  try {
    // Update status to processing
    updateJobStatus(jobId, 'processing');

    // Call OCR service (implemented by colleague)
    const extractedText = await processOCR(imagePath);

    // Update status to done with extracted text
    updateJobStatus(jobId, 'done', {
      extractedText
    });

  } catch (error) {
    // Update status to rejected on error
    updateJobStatus(jobId, 'rejected', {
      error: error.message || 'Image is unreadable or invalid'
    });
  }
};


export const getAll = async (req , res) => {
  try{
    // const data = await FetctAllData(); // This should return all data in ary of obj.


    res.status(200).json({
      allData : database , 
      message : "All data fetched from DB."
    })

  }
  catch(err){
    res.status(404).json({
      message : "Data not found.",
      errorMsg : err
    })

  }
}