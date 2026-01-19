// S3 bucket base URL for public assets
export const S3_ASSETS_BASE_URL =
  "https://chat-public-resources.s3.ap-south-1.amazonaws.com/assets";

export const getAssetUrl = (filename: string) => `${S3_ASSETS_BASE_URL}/${filename}`;
