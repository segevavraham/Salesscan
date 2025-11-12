# 🔐 Google OAuth Setup Guide

## Overview

The Sales Coach AI admin dashboard uses Google OAuth for secure authentication. This allows users to sign in with their Google account and automatically manage API keys centrally.

---

## 📋 Setup Steps

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "Sales Coach AI"
3. Enable APIs:
   - Google+ API (for user profile)
   - Google Calendar API (for calendar integration)

### Step 2: Configure OAuth Consent Screen

1. Navigate to: **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Fill in application information:
   - **App name**: Sales Coach AI
   - **User support email**: your@email.com
   - **Developer contact**: your@email.com
4. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `calendar.readonly`
5. Save and continue

### Step 3: Create OAuth Client ID

1. Navigate to: **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Chrome App** as application type
4. Get your Chrome Extension ID:
   ```
   - Load extension in Chrome
   - Go to chrome://extensions/
   - Find "Sales Coach AI"
   - Copy the Extension ID (e.g., abcdefghijklmnop...)
   ```
5. Enter Application ID: your extension ID
6. Click **Create**
7. Copy the **Client ID** (format: `xxxxx.apps.googleusercontent.com`)

### Step 4: Update Manifest

1. Open `extension/manifest.json`
2. Find the `oauth2` section:
   ```json
   "oauth2": {
     "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
     "scopes": [
       "https://www.googleapis.com/auth/userinfo.email",
       "https://www.googleapis.com/auth/userinfo.profile",
       "https://www.googleapis.com/auth/calendar.readonly"
     ]
   }
   ```
3. Replace `YOUR_CLIENT_ID` with your actual Client ID
4. Save the file

### Step 5: Reload Extension

1. Go to `chrome://extensions/`
2. Click **Remove** on old version
3. Click **Load unpacked**
4. Select extension folder
5. Extension is now ready with OAuth!

---

## 🎯 How It Works

### First User (Admin)

1. Open admin dashboard: Click extension icon → "Admin Dashboard"
2. Login screen appears with "Sign in with Google" button
3. Click to authenticate with Google
4. First user is automatically granted admin privileges
5. Admin can now:
   - Set Master API Keys (shared by all users)
   - Add/manage users
   - View analytics
   - Configure settings

### Additional Users

1. Login with Google account
2. If email is in admin's user list → access granted
3. If not in list → access denied (admin must add them first)

### API Keys Priority

The system uses a 3-tier priority for API keys:

```
Priority 1: Master API Keys (set by admin)
    ↓
Priority 2: User-specific keys (assigned by admin)
    ↓
Priority 3: User's own keys (from options page)
```

This means:
- Admin sets master OpenAI key once
- All users automatically use it
- No need for each user to enter their own key
- Centralized billing and control

---

## 🔒 Security

### What's Stored

- **User profile**: name, email, picture URL
- **OAuth token**: encrypted by Chrome
- **API keys**: stored in chrome.storage.local (encrypted)

### What's NOT Stored

- Google password (never touched)
- Full OAuth credentials (handled by Chrome)
- Sensitive personal data

### Token Management

- Tokens expire automatically after ~1 hour
- Extension requests new token when needed
- User can revoke access anytime from Google Account settings
- Logout completely clears all tokens

---

## 🧪 Testing

### Test OAuth Flow

1. Load extension with OAuth configured
2. Open admin dashboard
3. Should see login screen
4. Click "Sign in with Google"
5. Google popup appears
6. Choose account
7. Grant permissions
8. Redirected back to dashboard

### Common Issues

#### Error: "redirect_uri_mismatch"
**Solution**: Extension ID in manifest doesn't match Google Cloud Console

#### Error: "unauthorized_client"
**Solution**: OAuth consent screen not published or configured correctly

#### Error: "invalid_client"
**Solution**: Client ID in manifest is incorrect

#### No popup appears
**Solution**:
- Check if `identity` permission is in manifest
- Try removing and re-adding extension
- Clear Chrome cache

---

## 📊 Admin Dashboard Features

### Once Authenticated

1. **Dashboard**
   - View active users
   - See meeting statistics
   - Monitor API usage

2. **Users Management**
   - Add new users by email
   - Assign custom API keys
   - Deactivate users
   - View usage per user

3. **API Keys**
   - Set master OpenAI key
   - Set master AssemblyAI key
   - View usage statistics
   - Monitor costs

4. **Analytics**
   - Meeting duration trends
   - Tips given per user
   - Success rate metrics
   - Export reports

5. **Settings**
   - Configure system defaults
   - Set permissions
   - Manage integrations

---

## 🚀 Production Deployment

### Before Publishing

1. ✅ Set up Google Cloud Project
2. ✅ Configure OAuth correctly
3. ✅ Test authentication flow
4. ✅ Add OAuth client ID to manifest
5. ✅ Submit OAuth consent screen for verification (if publishing publicly)
6. ✅ Test with multiple users
7. ✅ Document admin procedures

### For Private Use (Company Internal)

- No need to verify OAuth consent screen
- Add all users to test users list in Google Cloud Console
- Each user can authenticate immediately

### For Public Use (Chrome Web Store)

- Must submit OAuth consent screen for Google verification
- Can take 2-4 weeks
- Must provide privacy policy
- Must explain why each permission is needed

---

## 📞 Support

If you encounter issues:

1. Check console logs: Right-click → Inspect → Console
2. Look for authentication errors
3. Verify OAuth client ID is correct
4. Test in incognito mode
5. Check Google Cloud Console quota limits

---

**Current Status**: ✅ OAuth integration complete, ready for Client ID configuration!
