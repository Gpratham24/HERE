
export interface UserJanamkhundali {
   uid: string;
   username: string;
   email: string;
   bio?: string;
   photoURL?: string;
   coverPhotoURL?: string;
   createdAt?: any; // Firestore Timestamp

   // 📊 Live/Cached Statistical Aggregates
   stats: {
      postsCount: number;
      followersCount: number;
      followingCount: number;
      joinedCommunitiesCount: number;
      appreciationsTotal: number; // Sum of likes across posts
   };

   // 🔑 Structural Relations Lists
   joinedCommunities: string[];    // Array of string names/IDs
   savedPosts: string[];           // Array of post document IDs

   // 🛡 Privacy Configuration
   visibilitySettings?: {
      showPosts?: boolean;
      showFollowers?: boolean;
      showFollowing?: boolean;
      showSaved?: boolean;
      showCommunities?: boolean;
   };
}
