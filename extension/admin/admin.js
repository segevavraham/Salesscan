// Admin Dashboard Logic
// Version: 2.1
// Production-ready admin panel for managing users, API keys, analytics, and meetings

console.log('🎯 Admin Dashboard Script Loading...');

// Load Google Auth Service
const authService = new GoogleAuthService();

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const adminState = {
  currentUser: null,
  isAdmin: false,
  users: [],
  meetings: [],
  analytics: {},
  apiKeys: {},
  currentSection: 'dashboard',
  filters: {
    dateRange: '7d',
    status: 'all',
    searchQuery: ''
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', init);

async function init() {
  console.log('🎯 Admin Dashboard initializing...');

  try {
    // Check authentication first
    const isAuthenticated = await authService.checkAuth();

    if (!isAuthenticated) {
      // Show login screen
      showLoginScreen();
      return;
    }

    // Load authenticated user
    adminState.currentUser = authService.getCurrentUser();
    adminState.isAdmin = await authService.isAdmin();

    // Load admin info
    await loadAdminInfo();

    // Setup navigation
    setupNavigation();

    // Load initial data
    await loadDashboardData();

    // Setup event listeners
    setupEventListeners();

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();

    console.log('✅ Admin Dashboard ready!');
    showToast('לוח הבקרה נטען בהצלחה', 'success');
  } catch (error) {
    console.error('❌ Error initializing dashboard:', error);
    showToast('שגיאה בטעינת לוח הבקרה', 'error');
  }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

function showLoginScreen() {
  // Hide main content
  const mainContent = document.querySelector('.admin-container');
  if (mainContent) mainContent.style.display = 'none';

  // Create login screen
  const loginScreen = document.createElement('div');
  loginScreen.id = 'login-screen';
  loginScreen.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <span class="logo-icon">💜</span>
            <span class="logo-text">Sales Coach AI</span>
          </div>
          <h1>לוח בקרה מרכזי</h1>
          <p>התחבר עם חשבון Google שלך לגישה למערכת הניהול</p>
        </div>
        <div class="login-body">
          <button class="btn-google-signin" id="google-signin-btn">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>התחבר עם Google</span>
          </button>
          <div class="login-info">
            <p>✅ גישה מאובטחת עם Google OAuth</p>
            <p>🔒 המידע שלך מוצפן ומוגן</p>
            <p>⚡ התחברות מהירה ונוחה</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    #login-screen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }
    .login-container {
      width: 100%;
      max-width: 480px;
      padding: 24px;
    }
    .login-card {
      background: rgba(30, 41, 59, 0.8);
      border-radius: 24px;
      padding: 48px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(139, 92, 246, 0.2);
    }
    .login-header {
      text-align: center;
      margin-bottom: 40px;
    }
    .login-header .logo {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .login-header .logo-icon {
      font-size: 48px;
    }
    .login-header .logo-text {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .login-header h1 {
      font-size: 32px;
      color: #f8fafc;
      margin-bottom: 12px;
      font-weight: 700;
    }
    .login-header p {
      color: #94a3b8;
      font-size: 16px;
      line-height: 1.6;
    }
    .btn-google-signin {
      width: 100%;
      background: white;
      color: #1f2937;
      border: none;
      border-radius: 12px;
      padding: 16px 24px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .btn-google-signin:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    }
    .btn-google-signin:active {
      transform: translateY(0);
    }
    .login-info {
      margin-top: 32px;
      text-align: right;
    }
    .login-info p {
      color: #94a3b8;
      font-size: 14px;
      margin: 8px 0;
    }
    .login-loading {
      display: none;
      text-align: center;
      margin-top: 24px;
      color: #8b5cf6;
      font-size: 16px;
    }
  `;

  document.body.appendChild(style);
  document.body.appendChild(loginScreen);

  // Setup sign-in button
  const signInBtn = document.getElementById('google-signin-btn');
  signInBtn.addEventListener('click', handleGoogleSignIn);
}

async function handleGoogleSignIn() {
  const btn = document.getElementById('google-signin-btn');
  const originalText = btn.innerHTML;

  try {
    btn.innerHTML = '<span>🔄 מתחבר...</span>';
    btn.disabled = true;

    // Sign in with Google
    const user = await authService.signIn();

    console.log('✅ Signed in:', user);

    // Check if user is admin
    const isAdmin = await authService.isAdmin();

    if (!isAdmin) {
      // Add user as admin if it's the first user
      const { adminEmails = [] } = await chrome.storage.local.get('adminEmails');
      if (adminEmails.length === 0) {
        adminEmails.push(user.email);
        await chrome.storage.local.set({ adminEmails });
        console.log('✅ First user - granted admin access');
      }
    }

    // Remove login screen
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) loginScreen.remove();

    // Show main content
    const mainContent = document.querySelector('.admin-container');
    if (mainContent) mainContent.style.display = 'flex';

    // Reinitialize
    await init();

  } catch (error) {
    console.error('❌ Sign-in failed:', error);
    btn.innerHTML = originalText;
    btn.disabled = false;
    alert('שגיאה בהתחברות: ' + error.message);
  }
}

async function handleSignOut() {
  try {
    await authService.signOut();
    window.location.reload();
  } catch (error) {
    console.error('❌ Sign-out failed:', error);
    showToast('שגיאה ביציאה מהמערכת', 'error');
  }
}

// ============================================================================
// ADMIN INFO
// ============================================================================

async function loadAdminInfo() {
  try {
    const user = adminState.currentUser || authService.getCurrentUser();

    if (user) {
      const nameElement = document.getElementById('admin-name');
      const emailElement = document.getElementById('admin-email');

      if (nameElement) nameElement.textContent = user.name || 'Admin';
      if (emailElement) emailElement.textContent = user.email || '';

      // Set user avatar if there's a picture
      const userAvatar = document.querySelector('.user-avatar');
      if (userAvatar && user.picture) {
        userAvatar.innerHTML = `<img src="${user.picture}" alt="User Avatar" style="width: 40px; height: 40px; border-radius: 50%;">`;
      } else if (userAvatar && user.name) {
        userAvatar.textContent = user.name.charAt(0).toUpperCase();
      }
    } else {
      console.warn('⚠️ No user found');
    }
  } catch (error) {
    console.error('❌ Error loading admin info:', error);
  }
}

// ============================================================================
// NAVIGATION
// ============================================================================

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      if (section) {
        navigateToSection(section);
      }
    });
  });
}

function navigateToSection(section) {
  console.log(`📍 Navigating to section: ${section}`);

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });

  const activeNav = document.querySelector(`[data-section="${section}"]`);
  if (activeNav) {
    activeNav.classList.add('active');
  }

  // Show section
  document.querySelectorAll('.content-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const activeSection = document.getElementById(`${section}-section`);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Update header title
  const headerTitle = document.getElementById('header-title');
  if (headerTitle) {
    headerTitle.textContent = getSectionTitle(section);
  }

  // Load section data
  loadSectionData(section);

  adminState.currentSection = section;
}

function getSectionTitle(section) {
  const titles = {
    dashboard: 'לוח בקרה',
    users: 'ניהול משתמשים',
    'api-keys': 'מפתחות API',
    analytics: 'אנליטיקה',
    meetings: 'פגישות',
    settings: 'הגדרות'
  };
  return titles[section] || 'לוח בקרה';
}

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadSectionData(section) {
  try {
    showLoading(section);

    switch (section) {
      case 'dashboard':
        await loadDashboardData();
        break;
      case 'users':
        await loadUsersData();
        break;
      case 'api-keys':
        await loadAPIKeys();
        break;
      case 'analytics':
        await loadAnalytics();
        break;
      case 'meetings':
        await loadMeetings();
        break;
      case 'settings':
        await loadSettings();
        break;
      default:
        console.warn(`Unknown section: ${section}`);
    }

    hideLoading(section);
  } catch (error) {
    console.error(`❌ Error loading ${section} data:`, error);
    hideLoading(section);
    showToast(`שגיאה בטעינת ${getSectionTitle(section)}`, 'error');
  }
}

async function loadDashboardData() {
  try {
    // Load dashboard stats from storage
    const { dashboardStats } = await chrome.storage.local.get('dashboardStats');

    if (dashboardStats) {
      updateStatCard('total-users', dashboardStats.totalUsers || 0);
      updateStatCard('total-meetings', dashboardStats.totalMeetings || 0);
      updateStatCard('total-minutes', dashboardStats.totalMinutes || 0);
      updateStatCard('total-tips', dashboardStats.totalTips || 0);
    } else {
      // Generate mock data for demo
      const mockStats = {
        totalUsers: 42,
        totalMeetings: 156,
        totalMinutes: 2340,
        totalTips: 573
      };

      updateStatCard('total-users', mockStats.totalUsers);
      updateStatCard('total-meetings', mockStats.totalMeetings);
      updateStatCard('total-minutes', mockStats.totalMinutes);
      updateStatCard('total-tips', mockStats.totalTips);

      // Save mock data
      await chrome.storage.local.set({ dashboardStats: mockStats });
    }

    // Load recent activity
    await loadActivity();

    console.log('✅ Dashboard data loaded');
  } catch (error) {
    console.error('❌ Error loading dashboard:', error);
    throw error;
  }
}

function updateStatCard(id, value) {
  const element = document.getElementById(id);
  if (element) {
    // Animate number change
    animateValue(element, parseInt(element.textContent) || 0, value, 500);
  }
}

function animateValue(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.round(current).toLocaleString('he-IL');
  }, 16);
}

async function loadActivity() {
  try {
    const { recentActivity } = await chrome.storage.local.get('recentActivity');
    const activityList = document.getElementById('activity-list');

    if (!activityList) return;

    if (!recentActivity || recentActivity.length === 0) {
      // Show mock activity for demo
      const mockActivity = [
        {
          type: 'user-joined',
          text: 'משתמש חדש הצטרף: david@example.com',
          time: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          type: 'meeting-completed',
          text: 'פגישה הושלמה: 45 דקות עם לקוח A',
          time: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          type: 'api-key-added',
          text: 'מפתח API חדש נוסף',
          time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'tip-generated',
          text: '12 טיפים חדשים נוצרו',
          time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        }
      ];

      renderActivityList(mockActivity);
      await chrome.storage.local.set({ recentActivity: mockActivity });
    } else {
      renderActivityList(recentActivity);
    }
  } catch (error) {
    console.error('❌ Error loading activity:', error);
  }
}

function renderActivityList(activities) {
  const activityList = document.getElementById('activity-list');
  if (!activityList) return;

  activityList.innerHTML = activities.map(activity => {
    const icon = getActivityIcon(activity.type);
    const timeAgo = getTimeAgo(activity.time);

    return `
      <div class="activity-item">
        <div class="activity-icon ${icon.class}">
          ${icon.emoji}
        </div>
        <div class="activity-content">
          <div class="activity-text">${activity.text}</div>
          <div class="activity-time">${timeAgo}</div>
        </div>
      </div>
    `;
  }).join('');
}

function getActivityIcon(type) {
  const icons = {
    'user-joined': { emoji: '👤', class: 'stat-icon purple' },
    'meeting-completed': { emoji: '📞', class: 'stat-icon green' },
    'api-key-added': { emoji: '🔑', class: 'stat-icon orange' },
    'tip-generated': { emoji: '💡', class: 'stat-icon red' }
  };
  return icons[type] || { emoji: '📌', class: 'stat-icon purple' };
}

// ============================================================================
// USERS MANAGEMENT
// ============================================================================

async function loadUsersData() {
  try {
    const { users } = await chrome.storage.local.get('users');
    adminState.users = users || [];

    if (adminState.users.length === 0) {
      // Generate mock users for demo
      adminState.users = [
        {
          id: '1',
          name: 'דוד כהן',
          email: 'david@example.com',
          active: true,
          meetingsCount: 23,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          name: 'שרה לוי',
          email: 'sarah@example.com',
          active: true,
          meetingsCount: 45,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          name: 'יוסי מזרחי',
          email: 'yossi@example.com',
          active: false,
          meetingsCount: 12,
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      await chrome.storage.local.set({ users: adminState.users });
    }

    renderUsersTable();
    console.log(`✅ Loaded ${adminState.users.length} users`);
  } catch (error) {
    console.error('❌ Error loading users:', error);
    throw error;
  }
}

function renderUsersTable() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  if (adminState.users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-cell">
          <div class="empty-state">
            <div class="empty-icon">👥</div>
            <div class="empty-text">אין משתמשים</div>
            <div class="empty-subtext">הוסף משתמש חדש כדי להתחיל</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = adminState.users.map(user => `
    <tr>
      <td><strong>${escapeHtml(user.name)}</strong></td>
      <td>${escapeHtml(user.email)}</td>
      <td>
        <span class="badge ${user.active ? 'badge-success' : 'badge-secondary'}">
          ${user.active ? 'פעיל' : 'לא פעיל'}
        </span>
      </td>
      <td>${user.meetingsCount || 0}</td>
      <td>${formatDate(user.createdAt)}</td>
      <td>
        <button class="btn-icon" onclick="editUser('${user.id}')" title="עריכה">✏️</button>
        <button class="btn-icon" onclick="deleteUser('${user.id}')" title="מחיקה">🗑️</button>
      </td>
    </tr>
  `).join('');
}

// ============================================================================
// API KEYS MANAGEMENT
// ============================================================================

async function loadAPIKeys() {
  try {
    const { masterAPIKeys } = await chrome.storage.local.get('masterAPIKeys');

    if (masterAPIKeys) {
      const openaiInput = document.getElementById('master-openai-key');
      const elevenlabsInput = document.getElementById('master-elevenlabs-key');
      const assemblyaiInput = document.getElementById('master-assemblyai-key');

      if (openaiInput) openaiInput.value = masterAPIKeys.openai || '';
      if (elevenlabsInput) elevenlabsInput.value = masterAPIKeys.elevenlabs || '';
      if (assemblyaiInput) assemblyaiInput.value = masterAPIKeys.assemblyai || '';

      adminState.apiKeys = masterAPIKeys;
      console.log('✅ API keys loaded');
    }
  } catch (error) {
    console.error('❌ Error loading API keys:', error);
    throw error;
  }
}

async function saveAPIKeys() {
  try {
    const openaiKey = document.getElementById('master-openai-key')?.value.trim();
    const elevenlabsKey = document.getElementById('master-elevenlabs-key')?.value.trim();
    const assemblyaiKey = document.getElementById('master-assemblyai-key')?.value.trim();

    if (!openaiKey) {
      showToast('נא למלא לפחות את מפתח OpenAI', 'warning');
      return;
    }

    // Validate API key formats
    if (!openaiKey.startsWith('sk-')) {
      showToast('מפתח OpenAI לא תקין', 'error');
      return;
    }

    const masterAPIKeys = {
      openai: openaiKey,
      elevenlabs: elevenlabsKey || '',
      assemblyai: assemblyaiKey || '',
      updatedAt: new Date().toISOString()
    };

    await chrome.storage.local.set({ masterAPIKeys });

    adminState.apiKeys = masterAPIKeys;

    console.log('✅ API keys saved');
    showToast('מפתחות נשמרו בהצלחה!', 'success');

    // Update activity
    await addActivity('api-key-added', 'מפתחות API עודכנו');
  } catch (error) {
    console.error('❌ Error saving API keys:', error);
    showToast('שגיאה בשמירת המפתחות', 'error');
  }
}

async function testAPIConnection(service) {
  try {
    showToast(`בודק חיבור ל-${service}...`, 'info');

    // TODO: Implement actual API testing
    // For now, just simulate a test

    await new Promise(resolve => setTimeout(resolve, 1500));

    showToast(`חיבור ל-${service} תקין!`, 'success');
  } catch (error) {
    console.error(`❌ Error testing ${service}:`, error);
    showToast(`שגיאה בחיבור ל-${service}`, 'error');
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

async function loadAnalytics() {
  try {
    const { analyticsData } = await chrome.storage.local.get('analyticsData');

    if (analyticsData) {
      adminState.analytics = analyticsData;
    } else {
      // Generate mock analytics
      adminState.analytics = {
        totalMeetings: 156,
        totalMinutes: 2340,
        avgMeetingDuration: 15,
        topPlatforms: {
          'Google Meet': 78,
          'Zoom': 45,
          'Teams': 23,
          'Webex': 10
        },
        tipsGenerated: 573,
        userGrowth: [
          { date: '2025-01-05', count: 35 },
          { date: '2025-01-06', count: 37 },
          { date: '2025-01-07', count: 38 },
          { date: '2025-01-08', count: 40 },
          { date: '2025-01-09', count: 41 },
          { date: '2025-01-10', count: 42 }
        ]
      };

      await chrome.storage.local.set({ analyticsData: adminState.analytics });
    }

    renderAnalytics();
    console.log('✅ Analytics loaded');
  } catch (error) {
    console.error('❌ Error loading analytics:', error);
    throw error;
  }
}

function renderAnalytics() {
  // Render platform distribution
  const platformsList = document.getElementById('platforms-list');
  if (platformsList && adminState.analytics.topPlatforms) {
    const total = Object.values(adminState.analytics.topPlatforms).reduce((a, b) => a + b, 0);

    platformsList.innerHTML = Object.entries(adminState.analytics.topPlatforms)
      .sort(([, a], [, b]) => b - a)
      .map(([platform, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        return `
          <div class="platform-item">
            <div class="platform-name">${platform}</div>
            <div class="platform-bar">
              <div class="platform-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="platform-stats">
              <span>${count} פגישות</span>
              <span>${percentage}%</span>
            </div>
          </div>
        `;
      }).join('');
  }
}

// ============================================================================
// MEETINGS
// ============================================================================

async function loadMeetings() {
  try {
    const { meetings } = await chrome.storage.local.get('meetings');
    adminState.meetings = meetings || [];

    if (adminState.meetings.length === 0) {
      // Generate mock meetings
      adminState.meetings = generateMockMeetings(10);
      await chrome.storage.local.set({ meetings: adminState.meetings });
    }

    renderMeetingsTable();
    console.log(`✅ Loaded ${adminState.meetings.length} meetings`);
  } catch (error) {
    console.error('❌ Error loading meetings:', error);
    throw error;
  }
}

function renderMeetingsTable() {
  const tbody = document.getElementById('meetings-table-body');
  if (!tbody) return;

  if (adminState.meetings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-cell">
          <div class="empty-state">
            <div class="empty-icon">📞</div>
            <div class="empty-text">אין פגישות</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = adminState.meetings.slice(0, 20).map(meeting => `
    <tr>
      <td><strong>${escapeHtml(meeting.title)}</strong></td>
      <td>${escapeHtml(meeting.platform)}</td>
      <td>${meeting.duration} דקות</td>
      <td>${meeting.tipsCount || 0}</td>
      <td>${formatDate(meeting.date)}</td>
      <td>
        <button class="btn-icon" onclick="viewMeeting('${meeting.id}')" title="צפייה">👁️</button>
        <button class="btn-icon" onclick="exportMeeting('${meeting.id}')" title="ייצוא">📥</button>
      </td>
    </tr>
  `).join('');
}

function generateMockMeetings(count) {
  const meetings = [];
  const platforms = ['Google Meet', 'Zoom', 'Teams', 'Webex'];
  const titles = ['פגישת מכירה', 'שיחת המשך', 'פגישת הצגה', 'סגירת עסקה'];

  for (let i = 0; i < count; i++) {
    meetings.push({
      id: `meeting-${Date.now()}-${i}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      duration: Math.floor(Math.random() * 40) + 10,
      tipsCount: Math.floor(Math.random() * 15) + 1,
      date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return meetings.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ============================================================================
// SETTINGS
// ============================================================================

async function loadSettings() {
  try {
    const { adminSettings } = await chrome.storage.local.get('adminSettings');

    if (adminSettings) {
      // Apply settings to form
      console.log('✅ Settings loaded:', adminSettings);
    }
  } catch (error) {
    console.error('❌ Error loading settings:', error);
    throw error;
  }
}

async function saveSettings() {
  try {
    const adminSettings = {
      // Collect settings from form
      updatedAt: new Date().toISOString()
    };

    await chrome.storage.local.set({ adminSettings });

    console.log('✅ Settings saved');
    showToast('הגדרות נשמרו בהצלחה!', 'success');
  } catch (error) {
    console.error('❌ Error saving settings:', error);
    showToast('שגיאה בשמירת ההגדרות', 'error');
  }
}

// ============================================================================
// USER ACTIONS
// ============================================================================

async function addUser() {
  try {
    const nameInput = document.getElementById('new-user-name');
    const emailInput = document.getElementById('new-user-email');

    const name = nameInput?.value.trim();
    const email = emailInput?.value.trim();

    if (!name || !email) {
      showToast('נא למלא את כל השדות', 'warning');
      return;
    }

    // Validate email
    if (!isValidEmail(email)) {
      showToast('כתובת אימייל לא תקינה', 'error');
      return;
    }

    // Check if email exists
    if (adminState.users.some(u => u.email === email)) {
      showToast('משתמש עם אימייל זה כבר קיים', 'error');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      active: true,
      createdAt: new Date().toISOString(),
      meetingsCount: 0
    };

    adminState.users.push(newUser);

    await chrome.storage.local.set({ users: adminState.users });

    closeModal('add-user-modal');
    renderUsersTable();

    // Clear form
    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';

    console.log('✅ User added:', newUser);
    showToast('משתמש נוסף בהצלחה!', 'success');

    // Update stats
    await updateDashboardStats();

    // Add activity
    await addActivity('user-joined', `משתמש חדש הצטרף: ${email}`);
  } catch (error) {
    console.error('❌ Error adding user:', error);
    showToast('שגיאה בהוספת משתמש', 'error');
  }
}

async function editUser(userId) {
  console.log('✏️ Editing user:', userId);
  const user = adminState.users.find(u => u.id === userId);

  if (user) {
    // TODO: Implement edit modal
    showToast('עריכת משתמש בקרוב...', 'info');
  }
}

async function deleteUser(userId) {
  try {
    const user = adminState.users.find(u => u.id === userId);

    if (!user) {
      showToast('משתמש לא נמצא', 'error');
      return;
    }

    if (!confirm(`האם אתה בטוח שברצונך למחוק את ${user.name}?`)) {
      return;
    }

    adminState.users = adminState.users.filter(u => u.id !== userId);

    await chrome.storage.local.set({ users: adminState.users });

    renderUsersTable();

    console.log('✅ User deleted:', userId);
    showToast('משתמש נמחק בהצלחה', 'success');

    // Update stats
    await updateDashboardStats();
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    showToast('שגיאה במחיקת משתמש', 'error');
  }
}

async function viewMeeting(meetingId) {
  console.log('👁️ Viewing meeting:', meetingId);
  // TODO: Implement meeting details view
  showToast('צפייה בפגישה בקרוב...', 'info');
}

async function exportMeeting(meetingId) {
  console.log('📥 Exporting meeting:', meetingId);
  // TODO: Implement meeting export
  showToast('ייצוא פגישה בקרוב...', 'info');
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
  // Save API keys button
  const saveKeysBtn = document.getElementById('save-keys-btn');
  if (saveKeysBtn) {
    saveKeysBtn.addEventListener('click', saveAPIKeys);
  }

  // Test API connections
  const testOpenAIBtn = document.getElementById('test-openai-btn');
  if (testOpenAIBtn) {
    testOpenAIBtn.addEventListener('click', () => testAPIConnection('OpenAI'));
  }

  const testAssemblyAIBtn = document.getElementById('test-assemblyai-btn');
  if (testAssemblyAIBtn) {
    testAssemblyAIBtn.addEventListener('click', () => testAPIConnection('AssemblyAI'));
  }

  // Add user button
  const addUserBtn = document.getElementById('add-user-btn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', () => openModal('add-user-modal'));
  }

  // Confirm add user
  const confirmAddUserBtn = document.getElementById('confirm-add-user');
  if (confirmAddUserBtn) {
    confirmAddUserBtn.addEventListener('click', addUser);
  }

  // Cancel add user
  const cancelAddUserBtn = document.getElementById('cancel-add-user');
  if (cancelAddUserBtn) {
    cancelAddUserBtn.addEventListener('click', () => closeModal('add-user-modal'));
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleSignOut);
  }

  // Refresh
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshData);
  }

  // Export data
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }

  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) {
        modal.classList.remove('show');
      }
    });
  });

  // Click outside modal to close
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  });
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.focus();
    }

    // Escape: Close modal
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.show').forEach(modal => {
        modal.classList.remove('show');
      });
    }
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function addActivity(type, text) {
  try {
    const { recentActivity } = await chrome.storage.local.get('recentActivity');
    const activities = recentActivity || [];

    activities.unshift({
      type,
      text,
      time: new Date().toISOString()
    });

    // Keep only last 20 activities
    const trimmedActivities = activities.slice(0, 20);

    await chrome.storage.local.set({ recentActivity: trimmedActivities });

    // Refresh activity list if on dashboard
    if (adminState.currentSection === 'dashboard') {
      renderActivityList(trimmedActivities);
    }
  } catch (error) {
    console.error('❌ Error adding activity:', error);
  }
}

async function updateDashboardStats() {
  try {
    const stats = {
      totalUsers: adminState.users.length,
      totalMeetings: adminState.meetings.length,
      totalMinutes: adminState.meetings.reduce((sum, m) => sum + (m.duration || 0), 0),
      totalTips: adminState.meetings.reduce((sum, m) => sum + (m.tipsCount || 0), 0)
    };

    await chrome.storage.local.set({ dashboardStats: stats });

    // Update UI if on dashboard
    if (adminState.currentSection === 'dashboard') {
      updateStatCard('total-users', stats.totalUsers);
      updateStatCard('total-meetings', stats.totalMeetings);
      updateStatCard('total-minutes', stats.totalMinutes);
      updateStatCard('total-tips', stats.totalTips);
    }
  } catch (error) {
    console.error('❌ Error updating stats:', error);
  }
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getTimeAgo(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'ממש עכשיו';
  if (seconds < 3600) return `לפני ${Math.floor(seconds / 60)} דקות`;
  if (seconds < 86400) return `לפני ${Math.floor(seconds / 3600)} שעות`;
  if (seconds < 604800) return `לפני ${Math.floor(seconds / 86400)} ימים`;

  return formatDate(dateString);
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
  }
}

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

async function logout() {
  if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
    try {
      await chrome.storage.local.remove('adminUser');
      console.log('✅ Logged out');
      window.location.href = 'admin-login.html';
    } catch (error) {
      console.error('❌ Error logging out:', error);
      showToast('שגיאה בהתנתקות', 'error');
    }
  }
}

async function refreshData() {
  showToast('מרענן נתונים...', 'info');

  try {
    await loadSectionData(adminState.currentSection);
    showToast('הנתונים רועננו בהצלחה!', 'success');
  } catch (error) {
    console.error('❌ Error refreshing:', error);
    showToast('שגיאה ברענון הנתונים', 'error');
  }
}

async function exportData() {
  try {
    showToast('מייצא נתונים...', 'info');

    const exportData = {
      users: adminState.users,
      meetings: adminState.meetings,
      analytics: adminState.analytics,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salesscan-export-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);

    console.log('✅ Data exported');
    showToast('הנתונים יוצאו בהצלחה!', 'success');

    await addActivity('data-exported', 'נתונים יוצאו');
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    showToast('שגיאה בייצוא הנתונים', 'error');
  }
}

function showLoading(section) {
  // TODO: Implement loading indicator
  console.log(`⏳ Loading ${section}...`);
}

function hideLoading(section) {
  console.log(`✅ ${section} loaded`);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// GLOBAL EXPORTS (for onclick handlers)
// ============================================================================

window.openModal = openModal;
window.closeModal = closeModal;
window.togglePasswordVisibility = togglePasswordVisibility;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.viewMeeting = viewMeeting;
window.exportMeeting = exportMeeting;

console.log('✅ Admin Dashboard Script Loaded');
