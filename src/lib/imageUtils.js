/**
 * Utility functions for handling product images
 * Ensures thumbnail and gallery images are never duplicated
 */

/**
 * Separate uploaded images into thumbnail and gallery
 * First image becomes thumbnail, rest go into gallery array
 * @param {Array} uploadedImages - Array of uploaded image URLs
 * @returns {Object} {image: thumbnailUrl, images: galleryArray}
 */
export function separateImages(uploadedImages) {
  if (!Array.isArray(uploadedImages) || uploadedImages.length === 0) {
    return {
      image: "",
      images: [],
    };
  }

  const thumbnail = uploadedImages[0];
  const gallery = uploadedImages.slice(1); // Skip first image

  return {
    image: thumbnail,
    images: gallery,
  };
}

/**
 * Build gallery array for display
 * Combines thumbnail and gallery images without duplication
 * Handles backward compatibility with old products that have duplicates
 * @param {Object} product - Product object with image and images fields
 * @returns {Array} Complete gallery array with no duplicates
 */
export function buildGalleryArray(product) {
  const thumbnailUrl = product?.image?.trim();
  const imagesArray = Array.isArray(product?.images) ? product.images : [];

  if (!thumbnailUrl) {
    // No thumbnail, return gallery as-is
    return imagesArray.filter(Boolean);
  }

  // Build gallery: thumbnail first, then remaining images
  const uniqueImages = new Map();

  // Add thumbnail first
  if (thumbnailUrl) {
    uniqueImages.set(thumbnailUrl, thumbnailUrl);
  }

  // Add remaining images, skipping duplicates
  imagesArray.forEach((img) => {
    const trimmed = img?.trim();
    if (trimmed && trimmed !== thumbnailUrl) {
      uniqueImages.set(trimmed, trimmed);
    }
  });

  return Array.from(uniqueImages.values());
}

/**
 * Deduplicate images while preserving order
 * Removes duplicate URLs from images array
 * @param {Array} images - Array of image URLs
 * @returns {Array} Deduplicated array
 */
export function deduplicateImages(images) {
  if (!Array.isArray(images)) return [];

  const seen = new Set();
  return images.filter((img) => {
    const trimmed = img?.trim();
    if (!trimmed) return false;
    if (seen.has(trimmed)) return false;
    seen.add(trimmed);
    return true;
  });
}
