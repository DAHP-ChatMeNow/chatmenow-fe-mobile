/**
 * Validate image file before upload
 * @param file - File to validate
 * @param maxSizeMB - Max file size in MB (default: 5)
 * @returns true if valid
 */
export const validateImageFile = (file: File, maxSizeMB: number = 5): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (!validTypes.includes(file.type)) {
    throw new Error('Loại tệp không hợp lệ. Chỉ JPEG, PNG, WebP và GIF được phép.');
  }

  if (file.size > maxBytes) {
    throw new Error(`Kích thước tệp vượt quá ${maxSizeMB}MB.`);
  }

  return true;
};

/**
 * Get image dimensions
 * @param file - Image file
 * @returns Promise with width and height
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
