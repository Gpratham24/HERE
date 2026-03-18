const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'screens', 'WelcomeScreen.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `      const { idToken } = await GoogleSignin.signIn();`;
const replacement = `      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken || response.idToken;`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated Google Sign-In response structure successfully!");
} else {
  console.log("Target not found!");
}
鼓
