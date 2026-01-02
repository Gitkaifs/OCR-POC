import path from "path";

/**
 * Helper function to create image URL for local hosted images
 * returned string will be stored in database as image path.
 */
export const imgUrlConverter = (imagePath) => {
  const relativePath = path.relative(process.cwd(), imagePath);
  const publicUrl = relativePath.replace(/\\/g, "/");
  return publicUrl;
};

