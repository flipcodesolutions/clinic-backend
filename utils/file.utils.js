const fs = require('fs');
const path = require('path');

/**
 * Utility to delete old uploaded files from the disk when an image is updated or deleted.
 * @param {string} fileUrl - Relative or absolute URL of the file (e.g. "/uploads/doctors/abc.jpg")
 */
function deleteOldFile(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string') return;

  // Skip base64 data URLs or external HTTP images not stored in /uploads/
  if (fileUrl.startsWith('data:') || (fileUrl.startsWith('http') && !fileUrl.includes('/uploads/'))) {
    return;
  }

  let relativePath = fileUrl;
  if (relativePath.includes('/uploads/')) {
    relativePath = relativePath.substring(relativePath.indexOf('/uploads/'));
  } else {
    return;
  }

  const normalizedPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
  const absolutePath = path.join(__dirname, '..', normalizedPath);

  try {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log(`[File Utility] Successfully deleted old file: ${absolutePath}`);
    }
  } catch (err) {
    console.error(`[File Utility] Failed to delete file ${absolutePath}:`, err.message);
  }
}

module.exports = {
  deleteOldFile,
};
