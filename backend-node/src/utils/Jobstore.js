// In-memory job storage (POC only - resets on server restart)
const jobStore = new Map();

/**
 * Create a new job
 */
export const createJob = (jobId) => {
  jobStore.set(jobId, {
    status: 'pending',
    extractedText: null,
    error: null
  });
};

/**
 * Get job by ID
 */
export const getJob = (jobId) => {
  return jobStore.get(jobId);
};

/**
 * Update job status
 */
export const updateJobStatus = (jobId, status, data = {}) => {
  const job = jobStore.get(jobId);
  if (!job) return false;
  
  jobStore.set(jobId, {
    ...job,
    status,
    ...data
  });
  return true;
};

/**
 * Check if job exists
 */
export const jobExists = (jobId) => {
  return jobStore.has(jobId);
};