import storage from '@react-native-firebase/storage';

/**
 * Uploads a local file to Firebase Storage and returns the public download URL.
 * @param uri Local file URI (e.g., from image picker)
 * @param path Storage path (e.g., 'posts/uid' or 'profile/uid')
 */
export const uploadImageToStorage = async (uri: string, path: string): Promise<string> => {
  if (!uri) return '';
  
  try {
    // Generate a unique filename using timestamp to prevent overwrites
    const ext = uri.split('.').pop() || 'jpg';
    const filename = `${Date.now()}.${ext}`;
    const reference = storage().ref(`${path}/${filename}`);
    
    // Upload file
    await reference.putFile(uri);
    
    // Get download URL
    const url = await reference.getDownloadURL();
    return url;
  } catch (error) {
    console.error('Error uploading image to storage:', error, 'uri:', uri);
    throw error;
  }
};
