import messaging from '@react-native-firebase/messaging';
import { updatePushToken } from './api';
import { Platform, Alert } from 'react-native';

export class NotificationService {
  static async requestUserPermission() {
    /* COMMENTED OUT: Firebase initialization fix
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      await this.getFcmToken();
    }
    */
  }

  static async getFcmToken() {
    /*
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        await updatePushToken(fcmToken);
      } else {
        console.log('Failed to get FCM token');
      }
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
    */
  }

  static async init() {
    // await this.requestUserPermission(); // COMMENTED OUT: Firebase initialization fix

    // Listen for token refreshes
    /*
    messaging().onTokenRefresh(token => {
      updatePushToken(token);
    });

    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });

    // Handle foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      if (remoteMessage.notification) {
        Alert.alert(
          remoteMessage.notification.title || 'New Notification',
          remoteMessage.notification.body || ''
        );
      }
    });

    return unsubscribe;
  }
}
