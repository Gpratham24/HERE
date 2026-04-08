import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../../screens/auth/SplashScreen';
import LoginScreen from '../../screens/auth/LoginScreen';
import SignupScreen from '../../screens/auth/SignupScreen';
import IntroScreen from '../../screens/auth/IntroScreen';
import ChoiceScreen from '../../screens/auth/ChoiceScreen';
import OnboardCircleScreen from '../../screens/auth/OnboardCircleScreen';
import JoinCircleScreen from '../../screens/auth/JoinCircleScreen';
import InviteScreen from '../../screens/auth/InviteScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade', // Smooth transitions for the brand experience
        gestureEnabled: false, // Focus on the flow
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Onboarding Flow (Post-Signup) */}
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="Choice" component={ChoiceScreen} />
      <Stack.Screen name="CreateCircle" component={OnboardCircleScreen} />
      <Stack.Screen name="JoinCircle" component={JoinCircleScreen} />
      <Stack.Screen name="Invite" component={InviteScreen} />
    </Stack.Navigator>
  );
};
