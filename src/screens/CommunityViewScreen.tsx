import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  ActivityIndicator 
} from 'react-native';
import { ArrowLeft, Plus, Heart, MessageSquare, Share2, MoreVertical, Flame } from 'lucide-react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Colors } from '../theme/Theme';
import EditCommunityModal from '../components/discover/EditCommunityModal';
import PostCard from '../components/home/PostCard';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

interface CommunityViewScreenProps {
  communityName: string;
  onClose: () => void;
}

export default function CommunityViewScreen({ communityName, onClose }: CommunityViewScreenProps) {
  const { userData } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [communityData, setCommunityData] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    // 1. Fetch Posts for this community
    const unsubPosts = firestore()
      .collection('posts')
      .where('communityName', '==', communityName)
      .onSnapshot((snap: any) => {
         if (snap) {
            const list = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            list.sort((a: any, b: any) => (b.likesCount || 0) - (a.likesCount || 0)); // Highlight best at top
            setPosts(list);
         }
         setLoading(false);
      });

    // 2. Fetch Joined Status and Member Counts
    const uid = auth().currentUser?.uid;
    const unsubUser = firestore().collection('users').doc(uid).onSnapshot((snap: any) => {
       if (snap && snap.exists()) {
          const list = snap.data()?.joinedCommunities || [];
          setJoined(list.some((c: string) => c.toLowerCase() === communityName.toLowerCase()));
       }
    });

    // 3. Fetch Community details for Creator matching checks 
    const formattedId = communityName.toLowerCase().replace(/ /g, '-');
    const unsubDetails = firestore()
       .collection('communities')
       .doc(formattedId)
       .onSnapshot((doc) => {
          if (doc.exists()) {
             const data = doc.data();
             setCommunityData(data || {});
             if (data?.membersCount) setMemberCount(data.membersCount);
          } else {
             setCommunityData({ error: 'NotFound' });
          }
       });

    return () => {
      unsubPosts();
      unsubUser();
      unsubDetails();
    };
  }, [communityName]);

  const handleJoinToggle = async () => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;
    const userRef = firestore().collection('users').doc(uid);
    if (joined) {
       await userRef.update({ joinedCommunities: firestore.FieldValue.arrayRemove(communityName) });
    } else {
       await userRef.update({ joinedCommunities: firestore.FieldValue.arrayUnion(communityName) });
    }
  };

  if (communityData === null) {
     return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
           <ActivityIndicator size="large" color={Colors.primary} />
        </View>
     );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070708" />
      
      {/* 🚀 Header Sticky */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={onClose}>
          <ArrowLeft size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>c/{communityName}</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MoreVertical size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        
        {/* 🏙 Banner + Avatar */}
        <View style={styles.bannerContainer}>
          <Image 
            source={{ uri: communityData?.bannerUrl || 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?w=600&q=80' }} 
            style={styles.bannerImage} 
          />
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
               <Text style={styles.avatarText}>{communityName[0].toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* 📝 Name & Controls */}
        <View style={styles.infoRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
             <Text style={styles.title}>c/{communityName}</Text>
             {communityData?.createdBy === auth().currentUser?.uid && (
                <View style={{ backgroundColor: '#FCD34D', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                   <Text style={{ color: '#000000', fontSize: 10, fontWeight: '800' }}>👑 ADMIN</Text>
                </View>
             )}
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.createBtn}>
              <Plus size={16} color="#ffffff" />
              <Text style={styles.createBtnText}>Post</Text>
            </TouchableOpacity>

            {communityData?.createdBy === auth().currentUser?.uid ? (
              <TouchableOpacity style={[styles.joinBtn, { backgroundColor: '#27272A' }]} onPress={() => setIsEditModalOpen(true)}>
                <Text style={styles.joinBtnText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.joinBtn, joined && styles.joinedBtn]} 
                onPress={handleJoinToggle}
              >
                <Text style={styles.joinBtnText}>{joined ? 'Joined' : 'Join'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 📈 Highlights / Rules Stub */}
        <View style={styles.aboutContainer}>
           <Text style={styles.memberCount}>{memberCount} Members • 👨‍💻 online</Text>
           <Text style={styles.aboutText}>
              {communityData?.description || `Welcome to c/${communityName}. No guidelines populated yet scaling offsets.`}
           </Text>
        </View>

        {/* 📑 Posts Feed */}
        <View style={styles.feedHeader}>
           <Flame size={16} color="#F59E0B" />
           <Text style={styles.feedHeaderTitle}>Best Posts</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
        ) : posts.length === 0 ? (
          <Text style={styles.emptyText}>No posts found inside this community.</Text>
        ) : (
          posts.map((post: any) => (
            <PostCard 
              key={post.id}
              item={post} 
              userData={userData} 
              followingList={[]} 
              onFollow={() => {}} 
              onCommentPress={() => {}} 
              onProfilePress={() => {}} 
            />
          ))
        )}

      </ScrollView>

      <EditCommunityModal 
         visible={isEditModalOpen} 
         communityName={communityName} 
         initialData={communityData} 
         onClose={() => setIsEditModalOpen(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070708',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    backgroundColor: '#0A0A0E',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  iconButton: {
    padding: 6,
  },
  bannerContainer: {
    height: 120,
    backgroundColor: '#16161E',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: -24,
    left: 16,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#070708',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3863FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  infoRow: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 4,
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  joinBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinedBtn: {
    backgroundColor: '#1C1C24',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  joinBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  aboutContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  memberCount: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  aboutText: {
    color: '#E4E4E7',
    fontSize: 13,
    letterSpacing: -0.1,
    lineHeight: 18,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
    gap: 6,
  },
  feedHeaderTitle: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  postCard: {
    backgroundColor: '#101015',
    marginBottom: 10,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  postAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#27272A',
  },
  postUser: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  postTime: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 1,
  },
  postCaption: {
    color: '#E4E4E7',
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    lineHeight: 19,
  },
  postMedia: {
    width: width,
    height: width * 0.7,
    backgroundColor: '#16161E',
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: '#A1A1AA',
    fontSize: 12,
  },
  emptyText: {
    color: '#A1A1AA',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 40,
  },
});
