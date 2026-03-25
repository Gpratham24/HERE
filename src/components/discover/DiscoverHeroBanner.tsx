import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function DiscoverHeroBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>hearth.</Text>
        <Text style={styles.subtitle}>
          Join thousands of creators, thinkers, and explorers in niche communities built for meaningful connection.
        </Text>
      </View>
      <View style={styles.imageOverlay}>
         <Image 
           source={{ uri: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400' }} 
           style={styles.bgImage} 
           blurRadius={2}
         />
         <View style={styles.gradient} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#7C3AED',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    height: 160,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  textContainer: {
    flex: 2,
    padding: 20,
    justifyContent: 'center',
    zIndex: 2,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
    fontFamily: 'sans-serif-condensed',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  imageOverlay: {
    flex: 1.2,
    position: 'relative',
  },
  bgImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 60,
    backgroundColor: '#7C3AED',
    opacity: 0.8,
  },
});
