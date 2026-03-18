import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const likePost = async (
  postId: string, 
  isLiked: boolean, 
  postCreatorUid: string, 
  actorUsername: string
) => {
  const uid = auth().currentUser?.uid;
  if (!uid) return;

  // Skip mock posts with short IDs
  if (String(postId).length < 5) {
    console.log('Skipping Firestore like for static Mock post ID:', postId);
    return;
  }

  try {
    const postRef = firestore().collection('posts').doc(postId);
    
    await postRef.update({
      likedBy: isLiked 
        ? firestore.FieldValue.arrayRemove(uid) 
        : firestore.FieldValue.arrayUnion(uid),
      likesCount: firestore.FieldValue.increment(isLiked ? -1 : 1),
    });

    // Notify Post Creator if liking (not unliking) and not self-like
    if (!isLiked && postCreatorUid && postCreatorUid !== uid) {
      await firestore().collection('notifications').add({
        type: 'like',
        actorUid: uid,
        actorUsername: actorUsername || 'user',
        targetUid: postCreatorUid,
        postId: postId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    }
  } catch (err) {
    console.error('Error in likePost service:', err);
    throw err;
  }
};
