const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'screens', 'WelcomeScreen.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Configure
if (!content.includes('GoogleSignin.configure')) {
  content = content.replace(
    /useEffect\(\(\) => \{\s*if \(auth\(\)\.currentUser \&\& signupStep === 1\) \{\s*setSignupStep\(2\);\s*\}\s*\}, \[\]\);/,
    `useEffect(() => {
    GoogleSignin.configure({
      webClientId: '933732005431-ihncm3bjh4d4s3bpepafumqq43pn9mv7.apps.googleusercontent.com',
    });

    if (auth().currentUser && signupStep === 1) {
      setSignupStep(2);
    }
  }, []);`
  );
}

// 2. Add function
if (!content.includes('const onGoogleButtonPress')) {
  const insertIndex = content.indexOf('const handlePickImage');
  if (insertIndex !== -1) {
    const code = `const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      if (onComplete) onComplete(false);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Google Auth Fail', error instanceof Error ? error.message : 'Login Cancelled');
    }
  };\n\n  `;
    content = content.slice(0, insertIndex) + code + content.slice(insertIndex);
  }
}

// 3. Add onPress to social row
if (!content.includes('onPress={onGoogleButtonPress}')) {
  content = content.replace(
    /<TouchableOpacity activeOpacity=\{0\.8\}>\s*<Animated\.View style=\{\[styles\.socialBtnAnimated/,
    `<TouchableOpacity activeOpacity={0.8} onPress={onGoogleButtonPress}>
                      <Animated.View style={[styles.socialBtnAnimated`
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("WelcomeScreen fixes applied successfully!");
鼓
