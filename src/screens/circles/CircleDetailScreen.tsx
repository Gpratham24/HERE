import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Plus, Info, UserPlus, ShoppingBag, Share2, ChevronRight, X } from 'lucide-react-native';
import { Colors, Shadows } from '../../theme/Theme';
import { useAuth } from '../../context/AuthContext';
import { useCircleStore } from '../../store/circleStore';
import { useChat } from '../../hooks/useChat';
import { useGlobalPresence } from '../../hooks/useGlobalPresence';
import { AppHeader } from '../../components/AppHeader';
import { ChatBubble } from '../../components/ChatBubble';
import { TypingIndicator } from '../../components/TypingIndicator';
import { CircleSettingsPanel } from '../../components/CircleSettingsPanel';
import { createInvitation } from '../../services/api';
import { Share } from 'react-native';

const CircleDetailScreen = ({ route, navigation }: any) => {
  const { circleId, circleName } = route?.params || {};
  const { user } = useAuth();
  const onlineMembers = useGlobalPresence(circleId, user);
  const {
    messages,
    isLoading,
    typingUsers,
    sendMessage,
    handleTyping,
    refresh,
    markAsSeen,
    error: chatError
  } = useChat(circleId);

  const { 
    markCircleAsRead, 
    pendingMembers, 
    circle, 
    fetchPendingMembers,
    fetchProducts,
    products 
  } = useCircleStore();
  const [inputText, setInputText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showMarket, setShowMarket] = useState(false);

  const isAdmin = circle?.created_by === user?.id;

  useEffect(() => {
    if (isAdmin) {
      fetchPendingMembers(circleId);
    }
    fetchProducts(circleId);
  }, [circleId, isAdmin]);

  useEffect(() => {
    if (messages.length > 0 && user) {
      const unreadIds = messages
        .filter(m => m.user_id !== user.id)
        .map(m => m.id);
      if (unreadIds.length > 0) {
        markAsSeen(unreadIds);
        markCircleAsRead(circleId);
      }
    }
  }, [messages, user, markAsSeen, markCircleAsRead, circleId]);

  const [submitting, setSubmitting] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!inputText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await sendMessage(inputText.trim());
      setInputText('');
    } catch (err: any) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvite = async () => {
    try {
      const resp = await createInvitation(circleId);
      const category = circle?.category || 'Community';
      const inviteCode = circle?.invite_code || 'N/A';
      
      await Share.share({
        message: `Join my ${category} circle "${circleName}" on Circlo! 🚀\n\nUse my invite code: ${inviteCode}\nJoin here: ${resp.link}`,
        title: `Invite to ${circleName}`,
      });
    } catch (err: any) {
      Alert.alert('Invite Failed', err.message);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.user_id === user?.id;
    return (
      <ChatBubble
        content={item.content}
        timestamp={item.created_at}
        isMe={isMe}
        username={item.user?.username || 'Circle Member'}
        avatarUrl={item.user?.avatar_url}
        status={isMe ? 'delivered' : undefined}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <AppHeader
        title={circleName}
        showBackButton={true}
        onBack={() => navigation.goBack()}
        showSettings={true}
        onSettingsPress={() => setShowSettings(true)}
      />

      <CircleSettingsPanel
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        circleId={circleId}
      />

      <View style={styles.presenceBar}>
        <View style={styles.presenceInfo}>
          <View style={styles.onlineDot} />
          <Text style={styles.presenceText}>
            {onlineMembers.length} {onlineMembers.length === 1 ? 'person' : 'people'} online
          </Text>
        </View>
        
        <View style={styles.actionIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleInvite}>
            <UserPlus size={18} color={Colors.primary} />
            <Text style={styles.iconBtnText}>Invite</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => setShowMarket(true)}
          >
            <ShoppingBag size={18} color={Colors.textSecondary} />
            <Text style={styles.iconBtnText}>Shop</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Marketplace Modal */}
      <Modal visible={showMarket} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowMarket(false)}>
        <SafeAreaView style={styles.marketModal}>
          <View style={styles.marketHeader}>
             <Text style={styles.marketTitle}>Digital Marketplace</Text>
             <TouchableOpacity onPress={() => setShowMarket(false)}>
                <X size={24} color={Colors.text} />
             </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.marketScroll}>
            <View style={styles.marketHero}>
              <ShoppingBag size={48} color={Colors.primary} />
              <Text style={styles.marketHeroTitle}>Circle Exclusives</Text>
              <Text style={styles.marketHeroSub}>Direct access to premium ebooks and courses from this circle.</Text>
            </View>

            {!Array.isArray(products) || products.length === 0 ? (
               <View style={styles.emptyMarket}>
                  <Text style={styles.emptyMarketText}>No products available in this circle yet.</Text>
               </View>
            ) : (
              products.map((p: any) => (
                <TouchableOpacity key={p.id} style={styles.productCard}>
                  <View style={styles.productIcon}>
                     <Plus size={24} color={Colors.primary} />
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{p.name}</Text>
                    <Text style={styles.productPrice}>${p.price}</Text>
                  </View>
                  <ChevronRight size={20} color={Colors.textTertiary} />
                </TouchableOpacity>
              ))
            )}
            
            <View style={styles.contactCard}>
               <Info size={20} color={Colors.primary} />
               <Text style={styles.contactText}>Interested in selling? Contact the circle admin or our support team.</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {isAdmin && pendingMembers.length > 0 && (
        <TouchableOpacity 
          style={styles.adminBanner}
          onPress={() => Alert.alert('Join Requests', `${pendingMembers.length} new members want to join. Check Circle Settings to manage they.`)}
        >
          <Text style={styles.adminBannerText}>
             🚀 {pendingMembers.length} new membership requests pending
          </Text>
          <ChevronRight size={16} color={Colors.white} />
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        inverted
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
          ) : chatError ? (
            <View style={styles.emptyContainer}>
              <Info size={40} color="#EF4444" />
              <Text style={[styles.emptyText, { color: '#EF4444' }]}>
                Failed to load messages: {chatError.message || 'Unknown Error'}
              </Text>
              <TouchableOpacity onPress={() => refresh?.()} style={{ marginTop: 10 }}>
                <Text style={{ color: Colors.primary, fontWeight: '600' }}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Info size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
            </View>
          ) : null
        }
      />

      <TypingIndicator usernames={typingUsers.map(u => u.username)} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 90 : 0}
      >
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Message circle..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
                handleTyping();
              }}
              multiline
            />

            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}
              onPress={handleSend}
              disabled={submitting || !inputText.trim()}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Send size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.softBg },
  presenceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  presenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 8,
  },
  presenceText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
  },
  adminBanner: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminBannerText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontWeight: '600',
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  messageWrapper: { flexDirection: 'row', marginBottom: 24, maxWidth: '85%' },
  myMessageWrapper: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  theirMessageWrapper: { alignSelf: 'flex-start' },
  avatar: { width: 36, height: 36, borderRadius: 18, marginTop: 4 },
  bubbleCol: { marginLeft: 12, marginRight: 12, flexShrink: 1 },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 4,
  },
  senderName: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  roleBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  roleText: {
    color: '#B91C1C',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bubble: { borderRadius: 20, padding: 16, ...Shadows.soft },
  myBubble: { backgroundColor: Colors.primary, borderTopRightRadius: 4 },
  theirBubble: { backgroundColor: Colors.white, borderTopLeftRadius: 4 },
  messageText: { fontSize: 16, lineHeight: 22, fontWeight: '500' },
  myMessageText: { color: Colors.white },
  theirMessageText: { color: Colors.text },
  timeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },
  statusRow: { alignItems: 'center', marginVertical: 20 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E11D48',
    marginRight: 8,
  },
  statusText: { fontSize: 12, fontWeight: '700', color: '#9F1239' },
  inputWrapper: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
    fontWeight: '500',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
});

export default CircleDetailScreen;
