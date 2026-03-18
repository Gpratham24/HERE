const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'screens', 'WelcomeScreen.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `  useEffect(() => {
    if (auth().currentUser && signupStep === 1) {
      setSignupStep(2); // Auto-navigate to Profile Setup Step if already logged in
    }
  }, []);`;

const replacement = `  useEffect(() => {
    if (typeof GoogleSignin !== 'undefined') {
      GoogleSignin.configure({
        webClientId: '933732005431-ihncm3bjh4d4s3bpepafumqq43pn9mv7.apps.googleusercontent.com',
      });
    }

    if (auth().currentUser && signupStep === 1) {
      setSignupStep(2);
    }
  }, []);`;

if (content.includes(target.trim())) {
  content = content.replace(target.trim(), replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Configure injected successfully via node!");
} else {
  console.log("Regex fallback attempt");
  content = content.replace(
    /useEffect\(\(\) => \{\s*if \(auth\(\)\.currentUser \&\& signupStep === 1\) \{\s*setSignupStep\(2\);\s*\/\/.*?\s*\}\s*\}, \[\]\);/,
    replacement
  );
  fs.writeFileSync(filePath, content, 'utf8');
}
鼓
