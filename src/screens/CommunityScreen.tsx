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

interface CommunityScreenProps {
  onComplete: () => void;
}
 

export default function CommunityScreen({ onComplete }: CommunityScreenProps) {
  const [communities, setCommunities] = useState<any[]>([]);
  const [joinedNames, setJoinedNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('communities')
      .limit(20)
      .onSnapshot(snap => {
        if (snap) {
          const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCommunities(list);
        }
        setLoading(false);
      }, err => console.error('Error fetching communities:', err));
    return () => unsubscribe();
  }, []);

  const toggleJoin = (name: string) => {
    if (joinedNames.includes(name)) {
      setJoinedNames(joinedNames.filter(n => n !== name));
    } else {
      setJoinedNames([...joinedNames, name]);
    }
  };

  const handleContinue = async () => {
    if (joinedNames.length < 1) return;
    const uid = auth().currentUser?.uid;
    if (uid) {
      try {
        await firestore().collection('users').doc(uid).set({
          joinedCommunities: joinedNames
        }, { merge: true });
      } catch (err) {
        console.error('Error updating communities:', err);
      }
    }
    onComplete();
  };

  const isContinueEnabled = joinedNames.length >= 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.header}>Recommended Communities</Text>
        <Text style={styles.subheader}>Join at least 1 to continue</Text>

        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
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
                    style={[
                      styles.joinBtn,
                      isJoined && styles.joinedBtn
                    ]}
                    activeOpacity={0.8}
                    onPress={() => toggleJoin(community.name)}
                  >
                    <Text style={[
                      styles.joinBtnText,
                      isJoined && styles.joinedBtnText
                    ]}>
                      {isJoined ? 'Joined' : 'Join'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <Text style={{ color: '#A1A1AA', textAlign: 'center', marginTop: 40 }}>No communities found</Text>
          )}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { flex: 7, marginTop: 0 },
              !isContinueEnabled && styles.primaryBtnDisabled
            ]}
            activeOpacity={0.8}
            disabled={!isContinueEnabled}
            onPress={handleContinue}
          >
            <Text style={styles.btnText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.skipBtnRow, { flex: 3 }]}
            activeOpacity={0.8}
            onPress={onComplete}
          >
            <Text style={{ color: '#E4E4E7', fontSize: 15, fontWeight: '600' }}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  content: {
    flex: 1,
    padding: Sizes.padding * 1.5,
  },
  header: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
  },
  subheader: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  list: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16161E',
    padding: 16,
    borderRadius: Sizes.radiusMd,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardMembers: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  joinBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  joinedBtn: {
    backgroundColor: '#2E2F3E', // subtle dark accent
  },
  joinBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  joinedBtnText: {
    color: Colors.textMuted,
  },
  primaryBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: Sizes.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnDisabled: {
    backgroundColor: 'rgba(56, 99, 250, 0.4)', // Faded primary
    elevation: 0,
    shadowOpacity: 0,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipBtnRow: {
    height: 52,
    backgroundColor: '#16161E',
    borderRadius: Sizes.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
});
