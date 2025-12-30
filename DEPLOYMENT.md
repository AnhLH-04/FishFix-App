# Hướng Dẫn Deploy & Configuration

## 🚀 Deploy Production

### Option 1: Expo Build Service (EAS)

#### Bước 1: Cài đặt EAS CLI
```bash
npm install -g eas-cli
```

#### Bước 2: Login vào Expo
```bash
eas login
```

#### Bước 3: Configure uild
```bash
eas uild:configure
```

#### Bước 4: Build APK (Android)
```bash
# Build APK cho as -platform android --profile preview

# Build AAB cho Google Play
eas build --platform android --profile production
```

#### Bước 5: Build IPA (iOS)
```bash
# Build cho TestFlight
eas build --platform ios --profile preview

# Build cho App Store
eas build --platform ios --profile production
```

### Option 2: Local Build

#### Android APK
```bash
# Cài đặt dependencies
npm install

# Build APK
npx expo build:android -t apk

# Download APK file từ link Expo cung cấp
```

#### iOS (Chỉ trên MacOS)
```bash
# Build IPA
npx expo build:ios

# Submit lên App Store
```

---

## 🔧 Configuration Files

### 1. Google Vision API Setup

#### Tạo file `.env`:
```bash
# Google Cloud
GOOGLE_VISION_API_KEY=your_api_key_here
GOOGLE_CLOUD_PROJECT_ID=your_project_id

# Backend API
API_BASE_URL=https://api.yourdomain.com
API_TIMEOUT=30000

# Payment Gateway
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key

ZALOPAY_APP_ID=your_zalopay_app_id
ZALOPAY_KEY1=your_zalopay_key1
ZALOPAY_KEY2=your_zalopay_key2

# Firebase
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# OneSignal (Push Notifications)
ONESIGNAL_APP_ID=your_onesignal_app_id
```

#### Cài đặt env loader:
```bash
npm install react-native-dotenv
```

#### Update babel.config.js:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }]
    ]
  };
};
```

### 2. Firebase Setup

#### Cài đặt Firebase:
```bash
npm install firebase
```

#### Tạo file `src/config/firebase.js`:
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 3. Payment Gateway Integration

#### MoMo Payment:
```bash
npm install crypto-js axios
```

Xem doc: https://developers.momo.vn/

#### ZaloPay:
Xem doc: https://docs.zalopay.vn/

---

## 📱 App Store Submission

### Google Play Store (Android)

#### Requirements:
- ✅ App icon (512x512px)
- ✅ Feature graphic (1024x500px)
- ✅ Screenshots (phone & tablet)
- ✅ Privacy policy URL
- ✅ App description
- ✅ Content rating
- ✅ APK/AAB file

#### Steps:
1. Create Developer Account ($25 one-time)
2. Create App
3. Fill Store Listing
4. Upload APK/AAB
5. Submit for review (2-3 days)

### Apple App Store (iOS)

#### Requirements:
- ✅ App icon (1024x1024px)
- ✅ Screenshots (all device sizes)
- ✅ Privacy policy
- ✅ App description
- ✅ Developer Program membership ($99/year)
- ✅ IPA file

#### Steps:
1. Enroll in Apple Developer Program
2. Create App in App Store Connect
3. Upload via Xcode/Transporter
4. Fill metadata
5. Submit for review (1-2 weeks)

---

## 🔐 Security Checklist

- [ ] Encrypt API keys
- [ ] Enable SSL/HTTPS
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Use secure storage for tokens
- [ ] Implement 2FA for admin
- [ ] Regular security audits
- [ ] GDPR compliance
- [ ] Data backup strategy

---

## 📊 Analytics Setup

### Google Analytics for Firebase
```bash
npm install @react-native-firebase/analytics
```

### Mixpanel
```bash
npm install mixpanel-react-native
```

### Amplitude
```bash
npm install @amplitude/analytics-react-native
```

---

## 🧪 Testing

### Unit Tests (Jest)
```bash
npm install --save-dev jest @esting-library/react-native
```

### E2E Tests (Detox)
```bash
npm install --save-dev detox
```

---

## 📈 Performance Optimization

### Image Optimization
```bash
npm install expo-image
```

### Code Splitting
```bash
# Use React.lazy() for lazy loading
```

### Caching Strategy
```bash
npm install @react-native-async-storage/async-storage
```

---

## 🌍 Internationalization (i18n)

```bash
npm install i18n-js
```

Create `src/i18n/`:
- `vi.json` - Vietnamese
- `en.json` - English

---

## 📧 Email Service

### SendGrid
```bash
npm install @sendgrid/mail
```

### AWS SES
Configure via AWS Console

---

## 💬 Customer Support

### Zendesk
### Intercom
### Freshdesk

---

## 🎯 Marketing Tools

### Deep Linking
```bash
npm install expo-linking
```

### Branch.io
For attribution tracking

### Facebook SDK
For social login & ads

---

## 📦 CI/CD Pipeline

### GitHub Actions
Create `.github/workflows/deploy.yml`

### Bitrise
Alternative CI/CD for mobile

---

## 🔄 Version Control

### Git Workflow
- `main` - Production
- `develop` - Development
- `feature/*` - Features
- `hotfix/*` - Urgent fixes

### Semantic Versioning
- Major.Minor.Patch
- Example: 1.2.3

---

## 📞 Support

Need help? Contact:
- Email: dev@suachuanhanh.vn
- Slack: #dev-support
- Documentation: docs.suachuanhanh.vn

---

**Happy Deploying! 🚀**
