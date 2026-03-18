/**
 * Uploads a local file to Cloudinary and returns the secure URL.
 * @param uri Local file URI from image picker
 * @param type Optional media type (e.g., 'image/jpeg', 'video/mp4')
 */
export const uploadToCloudinary = async (uri: string, type?: string): Promise<string> => {
  if (!uri) return '';
  
  try {
    const data = new FormData();
    const ext = uri.split('.').pop() || 'jpg';
    
    // Auto-detect whether it is a video or image based on file extension
    const isVideo = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext.toLowerCase()) || (type && type.startsWith('video'));
    const uploadUrl = isVideo 
      ? 'https://api.cloudinary.com/v1_1/dfn00e4fx/video/upload' 
      : 'https://api.cloudinary.com/v1_1/dfn00e4fx/image/upload';

    // ⚠️ Note: 'my_preset' is a placeholder from Cloudinary docs. 
    // If upload fails with 400, make sure you create an Unsigned Upload Preset in your Cloudinary Dashboard under Settings > Upload.
    const preset = 'your_unsigned_preset_name'; 

    data.append('file', {
      uri: uri,
      type: type || (isVideo ? 'video/mp4' : 'image/jpeg'),
      name: `upload.${ext}`,
    } as any);

    data.append('upload_preset', preset);

    const res = await fetch(uploadUrl, {
      method: 'POST',
      body: data,
    });

    const result = await res.json();
    if (result.secure_url) {
      return result.secure_url;
    } else {
      console.error('Cloudinary upload response:', result);
      throw new Error(result.error?.message || 'Cloudinary upload failed');
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error, 'uri:', uri);
    throw error;
  }
};
