import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Colors, Sizes } from '../theme/Theme';
import { useAuth } from '../context/AuthContext';

interface CommunityScreenProps {
  onComplete: () => void;
}

export default function CommunityScreen({ onComplete }: CommunityScreenProps) {
  const { userData } = useAuth();
  const [communities, setCommunities] = useState<any[]>([]);
  const [joinedNames, setJoinedNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('communities')
      .limit(30)
      .onSnapshot(snap => {
        if (snap) {
          let list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // Smart suggestions: Sort by user interests
          const userInterests = userData?.interests || [];
          if (userInterests.length > 0) {
            list = list.sort((a: any, b: any) => {
              const aName = (a.name || '').toLowerCase();
              const bName = (b.name || '').toLowerCase();
              const aMatch = userInterests.some((interest: string) => aName.includes(interest.toLowerCase()));
              const bMatch = userInterests.some((interest: string) => bName.includes(interest.toLowerCase()));
              if (aMatch && !bMatch) return -1;
              if (!aMatch && bMatch) return 1;
              return 0;
            });
          }
          setCommunities(list);
        }
        setLoading(false);
      }, err => console.error('Error fetching communities:', err));
    return () => unsubscribe();
  }, [userData?.interests]);

  const toggleJoin = (name: string) => {
    if (joinedNames.includes(name)) {
      setJoinedNames(joinedNames.filter(n => n !== name));
    } else {
      setJoinedNames([...joinedNames, name]);
    }
  };

  const handleContinue = async () => {
    if (joinedNames.length < 3) return;
    const uid = auth().currentUser?.uid;
    if (uid) {
      try {
        const batch = firestore().batch();
        const userRef = firestore().collection('users').doc(uid);
        
        // Update user
        batch.set(userRef, {
          joinedCommunities: joinedNames
        }, { merge: true });

        // Update each community member count
        joinedNames.forEach(name => {
          const formattedId = name.toLowerCase().replace(/ /g, '-');
          const commRef = firestore().collection('communities').doc(formattedId);
          batch.update(commRef, { membersCount: firestore.FieldValue.increment(1) });
        });

        await batch.commit();
      } catch (err) {
        console.error('Error updating communities:', err);
      }
    }
    onComplete();
  };

  const isContinueEnabled = joinedNames.length >= 3;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Floating Logo above sheet */}
      <View style={styles.logoWrapper}>
        <Text style={styles.logoMain}>HERE</Text>
        <Text style={styles.tagline}>Find your people. Share what matters.</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.sheetCard}>
          <Text style={styles.formHeader}>Recommended Communities</Text>
          <Text style={styles.formSubtitle}>Join at least 3 to continue ({joinedNames.length}/3)</Text>

          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {loading ? (
              <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 40 }} />
            ) : communities.length > 0 ? (
              communities.map(community => {
                const isJoined = joinedNames.includes(community.name);
                return (
                  <View key={community.id} style={styles.card}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName}>{community.name}</Text>
                      <Text style={styles.cardMembers}>{community.membersCount || 0} members</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.joinBtn, isJoined && styles.joinedBtn]}
                      activeOpacity={0.8}
                      onPress={() => toggleJoin(community.name)}
                    >
                      <Text style={[styles.joinBtnText, isJoined && styles.joinedBtnText]}>
                        {isJoined ? 'Joined' : 'Join'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <Text style={{ color: '#64748B', textAlign: 'center', marginTop: 40 }}>No communities found</Text>
            )}
          </ScrollView>

          <View style={{ marginTop: 10 }}>
            <TouchableOpacity
              style={[styles.primaryBtn, !isContinueEnabled && styles.primaryBtnDisabled]}
              activeOpacity={0.8}
              disabled={!isContinueEnabled}
              onPress={handleContinue}
            >
              <Text style={styles.btnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  logoWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    top: 60,
  },
  logoMain: {
    fontSize: 54,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -2,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  sheetCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    paddingTop: 44,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 10,
    marginTop: 180,
    flex: 1,
  },
  formHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  chipSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  chipText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  primaryBtn: {
    height: 52,
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnDisabled: {
    backgroundColor: '#C4B5FD',
    elevation: 0,
    shadowOpacity: 0,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  list: { gap: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  cardMembers: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  joinBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#8B5CF6' },
  joinedBtn: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  joinBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  joinedBtnText: { color: '#475569', fontWeight: '600' },
  skipBtnRow: { height: 52, backgroundColor: '#ffffff', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
});
