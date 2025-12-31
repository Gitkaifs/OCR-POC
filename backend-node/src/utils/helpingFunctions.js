import path from "path";

export const imgUrlConverter = (imagePath) => {
  const relativePath = path.relative(process.cwd(), imagePath);
  const publicUrl = relativePath.replace(/\\/g, "/");
  return publicUrl;
};

