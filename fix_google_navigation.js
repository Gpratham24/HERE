const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'screens', 'WelcomeScreen.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `      await auth().signInWithCredential(googleCredential);
      if (onComplete) onComplete(false);`;

const replacement = `      await auth().signInWithCredential(googleCredential);
      
      const uid = auth().currentUser?.uid;
      if (uid) {
        const userDoc = await firestore().collection('users').doc(uid).get();
        if (userDoc.exists() && userDoc.data()?.username) {
           if (onComplete) onComplete(false);
        } else {
           setSignupStep(2);
        }
      }`;

if (content.includes(target.trim())) {
  content = content.replace(target.trim(), replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated Google Sign-In navigation successfully!");
} else {
  console.log("Target not found!");
}
鼓
