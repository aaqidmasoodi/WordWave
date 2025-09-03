# OneSignal Push Notifications Setup

## 1. Create OneSignal Account
1. Go to [OneSignal.com](https://onesignal.com)
2. Sign up for a free account
3. Create a new app for WordWave

## 2. Configure Web Push
1. In OneSignal dashboard, go to Settings > Platforms
2. Click "Web Push" and configure:
   - **Site Name**: WordWave
   - **Site URL**: Your domain (e.g., https://yoursite.com)
   - **Default Icon URL**: https://yoursite.com/icons/icon-192x192.png
   - **Choose Integration**: Custom Code

## 3. Get Your App ID
1. In OneSignal dashboard, go to Settings > Keys & IDs
2. Copy your **OneSignal App ID**
3. Replace `YOUR_ONESIGNAL_APP_ID` in `js/notifications.js` with your actual App ID

## 4. Update Configuration
```javascript
// In js/notifications.js, line 4:
this.appId = 'YOUR_ACTUAL_ONESIGNAL_APP_ID';
```

## 5. Test Notifications
1. Open WordWave in browser
2. Go to Settings
3. Enable Push Notifications
4. Grant permission when prompted

## 6. Send Test Notification
1. In OneSignal dashboard, go to Messages > New Push
2. Create a test message:
   - **Title**: "WordWave - Time to Practice! 📚"
   - **Message**: "Keep your streak going! Practice some words today."
   - **Action**: Set URL to your site
3. Send to All Users or Test Users

## 7. Notification Types You Can Send

### Practice Reminders
```json
{
  "title": "WordWave - Time to Practice! 📚",
  "message": "Keep your streak going! Practice some words today.",
  "action": "practice"
}
```

### Quiz Challenges
```json
{
  "title": "WordWave - Quiz Challenge! 🧠",
  "message": "Test your knowledge with a quick quiz!",
  "action": "quiz"
}
```

### Progress Updates
```json
{
  "title": "WordWave - Great Progress! 🎉",
  "message": "You've learned 50 words! Check your progress.",
  "action": "progress"
}
```

### App Updates
```json
{
  "title": "WordWave - New Update Available! ✨",
  "message": "New features and improvements are ready!",
  "action": "update"
}
```

## 8. User Segmentation
Users are automatically tagged with:
- `difficulty_level`: beginner/intermediate/advanced
- `words_learned`: Number of words learned
- `streak_count`: Current streak
- `last_study_date`: When they last studied

Use these tags to send targeted notifications!

## 9. Advanced Features
- **Scheduled Notifications**: Set up daily/weekly reminders
- **A/B Testing**: Test different message styles
- **Analytics**: Track notification performance
- **Rich Media**: Add images to notifications

## 10. Production Checklist
- [ ] Replace test App ID with production App ID
- [ ] Set correct site URL and icon URLs
- [ ] Test on different browsers/devices
- [ ] Set up notification scheduling
- [ ] Configure user segments
- [ ] Test notification actions (practice, quiz, etc.)
