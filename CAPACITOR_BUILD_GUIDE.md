# 📱 Baby Cry Detective - Native App Build Guide

## ✅ Capacitor Setup Complete!

Your app is now configured for native iOS and Android builds. You can continue developing in Lovable's browser preview - no native tools needed yet!

---

## 🚀 When You're Ready to Build Native Apps

Follow these steps on your local computer:

### Step 1: Export & Clone Project

1. In Lovable, click **GitHub** → **Connect to GitHub** (if not connected)
2. Click **Create Repository** to push your code to GitHub
3. On your computer, open Terminal/Command Prompt and run:
```bash
git clone [your-github-repo-url]
cd BabyCryDetective
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build the Web App

```bash
npm run build
```

### Step 4: Add Native Platforms

**For Android:**
```bash
npx cap add android
```

**For iOS (Mac only):**
```bash
npx cap add ios
```

### Step 5: Sync & Update

```bash
# Sync your web code to native projects
npx cap sync

# Update native dependencies
npx cap update android  # For Android
npx cap update ios      # For iOS
```

---

## 📱 Running on Emulators/Devices

### Android

**Requirements:**
- Android Studio installed
- Android SDK configured

**Run:**
```bash
npx cap run android
```

Or open in Android Studio:
```bash
npx cap open android
```

### iOS

**Requirements:**
- Mac computer
- Xcode installed (from App Store)
- iOS Simulator or physical device

**Run:**
```bash
npx cap run ios
```

Or open in Xcode:
```bash
npx cap open ios
```

---

## 🔄 Development Workflow

### During Development (Best Practice):

1. **Make changes in Lovable** - Use the browser preview for fast iteration
2. **Changes auto-sync to GitHub** - No manual pushing needed
3. **Pull changes locally** when ready to test on device:
```bash
git pull
npm run build
npx cap sync
```

### Testing Changes on Device:

After making changes in Lovable:
```bash
git pull              # Get latest changes
npm install           # Update dependencies if needed
npm run build         # Build web app
npx cap sync          # Sync to native projects
npx cap run android   # Run on Android
npx cap run ios       # Run on iOS
```

---

## 📦 Building for Production

### Android APK/AAB

1. Open in Android Studio:
```bash
npx cap open android
```

2. In Android Studio:
   - **Build** → **Generate Signed Bundle / APK**
   - Choose **Android App Bundle** for Google Play
   - Or choose **APK** for direct distribution

### iOS IPA

1. Open in Xcode:
```bash
npx cap open ios
```

2. In Xcode:
   - Select target device or "Any iOS Device"
   - **Product** → **Archive**
   - **Distribute App** → Follow App Store submission steps

---

## 🔑 App Store Submission Requirements

### iOS (Apple App Store)

**Before submitting:**
- [ ] Apple Developer Account ($99/year)
- [ ] App icons (1024x1024 and various sizes)
- [ ] Screenshots for different devices
- [ ] Privacy policy URL
- [ ] App description and keywords
- [ ] Remove `server.url` from capacitor.config.ts for production

### Android (Google Play Store)

**Before submitting:**
- [ ] Google Play Developer Account ($25 one-time)
- [ ] App icons (512x512 and various sizes)
- [ ] Screenshots for different devices
- [ ] Privacy policy URL
- [ ] App description and keywords
- [ ] Signed AAB file

---

## ⚠️ Important Notes

### Microphone Permissions

Your app uses the microphone for cry detection. Make sure to:

**iOS:** Add to `Info.plist`:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>Baby Cry Detective needs microphone access to detect and analyze baby cries.</string>
```

**Android:** Already included in manifest (Capacitor handles this)

### Production Build

For production, update `capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.282d188385f34568bd7187b4db78e88d',
  appName: 'Baby Cry Detective',
  webDir: 'dist',
  // Remove or comment out server.url for production
  // server: {
  //   url: '...',
  // }
};
```

---

## 🆘 Troubleshooting

**"Command not found: npx"**
- Install Node.js from nodejs.org

**"Android SDK not found"**
- Install Android Studio
- Configure SDK path in Android Studio settings

**"Xcode not installed"**
- Install from Mac App Store (free, but Mac required)

**"Build failed"**
- Run `npm run build` first
- Make sure `dist` folder exists
- Try `npx cap sync` again

---

## 🎯 Next Steps

1. ✅ **Continue developing in Lovable** - Test in browser
2. 🔜 **Add Stripe for payments** - Enable monetization
3. 🔜 **Fix audio files** - Complete cry database
4. 🔜 **Integrate ML model** - Real cry detection
5. 🔜 **Build native apps** - When features are ready
6. 🔜 **Submit to app stores** - Start earning!

---

Need help? Check the [Capacitor docs](https://capacitorjs.com/docs) or ask in Lovable!
