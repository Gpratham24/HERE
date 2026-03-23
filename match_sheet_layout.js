const fs = require('fs');
const path = require('path');

function wrapWithSheet(fileName, headerContent) {
  const filePath = path.join(__dirname, 'src', 'screens', fileName);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add style sheetCard
  const styleInclusion = `  sheetCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    paddingTop: 40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 10,
    marginTop: 180,
    flex: 1,
  },`;

  if (!content.includes('sheetCard: {')) {
    content = content.replace('container: {', `${styleInclusion}\n  container: {`);
  }

  // 2. Wrap Render
  const renderTarget = `<SafeAreaView style={styles.container}>\n      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />\n      <View style={styles.content}>`;
  const renderReplacement = `<SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Floating Logo above sheet */}
      <View style={{ position: 'absolute', top: 50, left: 0, right: 0, alignItems: 'center' }}>
        <Text style={{ fontSize: 44, fontWeight: '900', color: '#0F172A', textTransform: 'uppercase', letterSpacing: -2 }}>HERE</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.sheetCard}>`;

  if (content.includes('<View style={styles.content}>')) {
     content = content.replace('<View style={styles.content}>', renderReplacement.replace('<SafeAreaView style={styles.container}>\n      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />\n      ', ''));
     content = content.replace('</View>\n    </SafeAreaView>', '</View>\n      </ScrollView>\n    </SafeAreaView>');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Wrapped ${fileName} correctly!`);
}

wrapWithSheet('InterestScreen.tsx');
wrapWithSheet('CommunityScreen.tsx');
鼓
