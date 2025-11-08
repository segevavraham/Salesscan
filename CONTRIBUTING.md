# 🤝 Contributing to Sales Coach AI

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Testing](#testing)
6. [Pull Request Process](#pull-request-process)
7. [Project Structure](#project-structure)

---

## 📜 Code of Conduct

### Our Pledge
- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Our Standards
- ✅ Using welcoming and inclusive language
- ✅ Being respectful of differing viewpoints
- ✅ Gracefully accepting constructive criticism
- ✅ Focusing on what is best for the community

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- Git
- Google Chrome
- Code editor (VS Code recommended)

### Fork and Clone
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/Salesscan.git
cd Salesscan

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/Salesscan.git
```

### Install Dependencies
```bash
npm install
```

### Run Development Build
```bash
npm run dev
```

---

## 🔄 Development Workflow

### 1. Create a Branch
```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Branch Naming Convention:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `perf/` - Performance improvements

### 2. Make Changes
- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes
```bash
# Lint your code
npm run lint

# Format code
npm run format

# Build to check for errors
npm run build
```

### 4. Commit Your Changes
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add competitor detection in German"
```

### Commit Message Format:
```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, semicolons, etc)
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Adding tests
- `chore` - Maintenance tasks

**Examples:**
```
feat: add Spanish language support
fix: resolve memory leak in waveform visualizer
docs: update installation instructions
refactor: simplify state management logic
```

### 5. Push and Create Pull Request
```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

---

## 📏 Code Standards

### JavaScript Style

#### Use ES6+ Features
```javascript
// ✅ Good
const user = { name, email };
const items = [...oldItems, newItem];
const greeting = `Hello, ${name}!`;

// ❌ Bad
var user = { name: name, email: email };
var items = oldItems.concat([newItem]);
var greeting = 'Hello, ' + name + '!';
```

#### Use Async/Await
```javascript
// ✅ Good
async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// ❌ Bad
function fetchData() {
  return fetch(url)
    .then(response => response.json())
    .then(data => data)
    .catch(error => console.error(error));
}
```

#### Error Handling
```javascript
// ✅ Good - Always handle errors
async function processTranscript(transcript) {
  try {
    const result = await aiService.analyze(transcript);
    return result;
  } catch (error) {
    console.error('Failed to analyze transcript:', error);
    // Show user-friendly error
    showNotification('Analysis failed. Please try again.');
    return null;
  }
}

// ❌ Bad - No error handling
async function processTranscript(transcript) {
  const result = await aiService.analyze(transcript);
  return result;
}
```

#### Class Structure
```javascript
// ✅ Good - Well organized class
export class FeatureName {
  constructor(options = {}) {
    // Initialize properties
    this.config = { ...defaults, ...options };
    this.state = this.getInitialState();
  }

  // Public methods first
  async initialize() {
    // ...
  }

  // Private/helper methods after
  _helperMethod() {
    // ...
  }

  // Cleanup
  destroy() {
    // ...
  }
}
```

### File Organization

```
extension/
├── background/          # Service worker
├── content/            # Content scripts
├── components/         # UI components
├── services/           # Business logic & API
├── utils/             # Helper functions
├── popup/             # Extension popup
├── options/           # Settings page
├── styles/            # CSS files
└── assets/            # Images, icons
```

### Naming Conventions

- **Files**: `kebab-case.js`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private methods**: `_prefixWithUnderscore`

```javascript
// ✅ Good
const MAX_RETRIES = 3;
class AudioProcessor {
  processStream(stream) { }
  _initializeContext() { }
}

// ❌ Bad
const maxretries = 3;
class audio_processor {
  ProcessStream(stream) { }
  initializeContext() { }
}
```

---

## 🧪 Testing

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Extension loads without errors
- [ ] All features work on Google Meet
- [ ] All features work on Zoom
- [ ] Settings page saves correctly
- [ ] Keyboard shortcuts work
- [ ] No console errors
- [ ] No memory leaks
- [ ] Performance is acceptable

### Testing on Different Platforms

```bash
# Test on each platform
1. Google Meet: https://meet.google.com/new
2. Zoom: https://zoom.us/test
3. Microsoft Teams: https://teams.microsoft.com/
4. Webex: https://www.webex.com/test-meeting.html
```

---

## 🔍 Pull Request Process

### Before Submitting

1. ✅ Run linter: `npm run lint`
2. ✅ Format code: `npm run format`
3. ✅ Build successfully: `npm run build`
4. ✅ Test thoroughly
5. ✅ Update documentation
6. ✅ Write clear commit messages

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Google Meet
- [ ] Tested on Zoom
- [ ] No console errors
- [ ] Performance tested

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
```

### Review Process

1. Maintainer will review within 3-5 days
2. Address review comments
3. Once approved, PR will be merged
4. Your contribution will be credited!

---

## 🏗️ Project Structure

### Key Files

| File | Purpose |
|------|---------|
| `manifest.json` | Chrome extension configuration |
| `webpack.config.js` | Build configuration |
| `package.json` | Dependencies and scripts |
| `.eslintrc.json` | Linting rules |
| `.prettierrc` | Code formatting rules |

### Core Components

| Component | Location | Purpose |
|-----------|----------|---------|
| UltimateSalesCoach | `content/ultimate-content-script.js` | Main orchestrator |
| AssemblyAI | `services/assemblyai-realtime.js` | Transcription |
| OpenAI | `services/openai-streaming.js` | AI suggestions |
| StateManager | `utils/state-manager.js` | State management |
| ProactiveCoach | `services/proactive-coaching-engine.js` | Coaching logic |

---

## 💡 Feature Requests

Have an idea? We'd love to hear it!

1. Check existing [issues](https://github.com/YOUR_USERNAME/Salesscan/issues)
2. Create new issue with `[Feature Request]` prefix
3. Describe:
   - Use case
   - Expected behavior
   - Why it's valuable
   - Implementation ideas (optional)

---

## 🐛 Bug Reports

Found a bug? Help us fix it!

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- Chrome version:
- Extension version:
- OS:

**Console Errors**
```
Paste errors here
```
```

---

## 📞 Questions?

- **GitHub Issues**: For bugs and features
- **Discussions**: For general questions
- **Email**: your-email@example.com

---

## 🎉 Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Given shoutouts on social media

Thank you for contributing! 🙏
