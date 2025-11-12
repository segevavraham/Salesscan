# 🔐 Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.1.x   | ✅ Yes             |
| 2.0.x   | ✅ Yes             |
| 1.0.x   | ⚠️ Limited support |
| < 1.0   | ❌ No              |

---

## 🚨 Reporting a Vulnerability

### Please Do NOT:
- ❌ Create public GitHub issues for security vulnerabilities
- ❌ Disclose the vulnerability publicly before it's fixed
- ❌ Exploit the vulnerability in production environments

### Please DO:
1. ✅ Email security concerns to: **security@your-domain.com**
2. ✅ Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)
3. ✅ Allow us 90 days to fix before public disclosure

### Response Timeline:
- **24 hours**: Initial response acknowledging receipt
- **7 days**: Assessment and severity classification
- **30-90 days**: Fix development and testing
- **After fix**: Public disclosure and credit (if desired)

---

## 🔒 Security Best Practices

### For Users

#### API Key Security
```javascript
// ✅ GOOD - Store keys in Chrome storage (encrypted)
chrome.storage.local.set({ apiKey: 'your-key' });

// ❌ BAD - Never hardcode API keys
const API_KEY = 'sk-1234567890abcdef'; // DON'T DO THIS
```

**Recommendations:**
- ✅ Use Chrome's built-in secure storage
- ✅ Never commit API keys to Git
- ✅ Rotate keys regularly
- ✅ Use environment-specific keys
- ✅ Monitor API usage for anomalies

#### Data Privacy
- **What we collect**: None (everything stays local)
- **What we send**: Only transcripts to AssemblyAI/OpenAI
- **What we store**: Settings and API keys (locally)

**Your data:**
- ✅ Stays on your device
- ✅ Transmitted encrypted (HTTPS/WSS)
- ✅ Not logged or stored by us
- ✅ You control API keys and data flow

#### Network Security
- ✅ All API calls use HTTPS/WSS
- ✅ Certificate validation enabled
- ✅ No third-party tracking
- ✅ No analytics collection

---

### For Developers

#### Code Security Checklist

##### Input Validation
```javascript
// ✅ GOOD - Validate and sanitize
function processTranscript(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid transcript');
  }
  const sanitized = text.trim().slice(0, 10000); // Limit size
  return sanitized;
}

// ❌ BAD - No validation
function processTranscript(text) {
  return text; // Could be malicious
}
```

##### API Key Handling
```javascript
// ✅ GOOD - Retrieve from secure storage
async function getApiKey() {
  const { apiKey } = await chrome.storage.local.get('apiKey');
  if (!apiKey) {
    throw new Error('API key not configured');
  }
  return apiKey;
}

// ❌ BAD - Store in code or localStorage
const apiKey = 'sk-...'; // Never do this
localStorage.setItem('apiKey', key); // Not encrypted
```

##### XSS Prevention
```javascript
// ✅ GOOD - Use textContent for user data
function displayMessage(text) {
  const elem = document.createElement('div');
  elem.textContent = text; // Safe from XSS
  return elem;
}

// ❌ BAD - Using innerHTML with user data
function displayMessage(text) {
  div.innerHTML = text; // XSS vulnerability!
}
```

##### Content Security Policy
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

---

## 🛡️ Security Features

### Built-in Protections

#### 1. Chrome Extension Permissions
We request minimal permissions:
- ✅ `activeTab` - Only active tab access
- ✅ `tabCapture` - Only for audio recording
- ✅ `storage` - Secure local storage
- ✅ `scripting` - Content script injection
- ❌ No `<all_urls>` or excessive permissions

#### 2. Manifest V3
- ✅ Service workers (more secure than background pages)
- ✅ Stricter CSP rules
- ✅ No remote code execution
- ✅ Enhanced permission model

#### 3. Secure Communication
```javascript
// All APIs use secure protocols
const assemblyAIUrl = 'wss://api.assemblyai.com/v2/realtime/ws'; // WSS
const openAIUrl = 'https://api.openai.com/v1/chat/completions'; // HTTPS
```

#### 4. Error Handling
```javascript
// Never expose sensitive info in errors
try {
  await api.call();
} catch (error) {
  console.error('API call failed'); // Generic message
  // Don't log: API key, user data, full error
}
```

---

## 🚫 Known Limitations

### What We DON'T Protect Against:
1. **Compromised API Keys**
   - If your OpenAI/AssemblyAI keys are stolen, we can't help
   - Solution: Rotate keys immediately, monitor usage

2. **Man-in-the-Middle Attacks**
   - If user's network is compromised, data could be intercepted
   - Solution: Use VPN, ensure HTTPS

3. **Malicious Browser Extensions**
   - Other extensions could read our data
   - Solution: Only install trusted extensions

4. **Phishing**
   - User could be tricked into entering keys on fake sites
   - Solution: Only enter keys in extension settings

---

## 🔍 Security Audits

### Automated Scanning
We use:
- ✅ ESLint security rules
- ✅ npm audit
- ✅ Dependabot alerts
- ✅ CodeQL analysis

### Manual Reviews
- ✅ Code review required for all PRs
- ✅ Security checklist for releases
- ✅ Penetration testing (periodic)

### Dependency Management
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Update dependencies
npm update
```

---

## 🔐 Encryption

### Data at Rest
- **API Keys**: Stored in Chrome's encrypted storage
- **Settings**: Stored in Chrome's encrypted storage
- **Transcripts**: NOT stored (processed in memory only)

### Data in Transit
- **AssemblyAI**: WSS (WebSocket Secure)
- **OpenAI**: HTTPS (TLS 1.2+)
- **Chrome Storage Sync**: Encrypted by Chrome

---

## 📋 Compliance

### GDPR
- ✅ No personal data collection
- ✅ No cookies or tracking
- ✅ User controls all data
- ✅ Data minimization
- ✅ Right to erasure (uninstall extension)

### CCPA
- ✅ No data sale
- ✅ No data sharing (except to user's chosen APIs)
- ✅ Transparent data usage

### SOC 2
- Third-party APIs (OpenAI, AssemblyAI) are SOC 2 compliant
- Extension itself doesn't store data

---

## 🚀 Secure Development Practices

### Pre-commit Hooks
```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm audit"
```

### Secret Scanning
```bash
# Use git-secrets
git secrets --scan

# Or truffleHog
trufflehog --regex --entropy=True .
```

### Dependency Scanning
```bash
# Audit dependencies
npm audit

# Use Snyk
npx snyk test
```

---

## 📞 Contact

### Security Team
- **Email**: security@your-domain.com
- **PGP Key**: [Link to public key]
- **Response Time**: Within 24 hours

### Bug Bounty
We currently don't have a formal bug bounty program, but we:
- ✅ Credit researchers in release notes
- ✅ Fast-track fixes for reported vulnerabilities
- ✅ Public acknowledgment (if desired)

---

## 📚 Resources

### Security Guidelines
- [Chrome Extension Security Best Practices](https://developer.chrome.com/docs/extensions/mv3/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Mozilla Web Security](https://infosec.mozilla.org/guidelines/web_security)

### External Audits
- Last audit: N/A (first release)
- Next audit: Planned for Q2 2024

---

**Last Updated**: 2024-11-08
**Version**: 2.1.0
