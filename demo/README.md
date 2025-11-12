# 🎤 Sales Coach AI - Demo Environment

סביבת דמו לבדיקת האקסטension Sales Coach AI.

## 🚀 איך להריץ את הדמו

### שיטה 1: פתיחה ישירה (פשוטה)

1. פתח את הקובץ `index.html` בדפדפן Chrome
2. ודא שהאקסטension טעון ב-Chrome (`chrome://extensions/`)
3. לחץ על "התחל הקלטה" בדמו
4. אפשר גישה למיקרופון
5. דבק למיקרופון ותראה את התמלול וההצעות

### שיטה 2: שרת מקומי (מומלץ)

```bash
# התקן http-server (אם עדיין לא מותקן)
npm install -g http-server

# נווט לתיקיית הדמו
cd demo

# הרץ שרת מקומי
http-server -p 8080

# פתח בדפדפן
# http://localhost:8080
```

או עם Python:

```bash
cd demo
python3 -m http.server 8080
```

## 📋 דרישות

1. **Chrome או Edge** - לתמיכה ב-Web Speech API
2. **מיקרופון** - להקלטת קול
3. **האקסטension טעון** - ודא שהאקסטension טעון ב-Chrome
4. **API Key מוגדר** - ודא שהגדרת API Key בהגדרות האקסטension

## ✅ מה לבדוק

- [ ] האקסטension טעון ב-Chrome
- [ ] API Key מוגדר בהגדרות
- [ ] התמלול עובד (דבר למיקרופון)
- [ ] הצעות AI מופיעות אחרי כמה שניות
- [ ] אין שגיאות ב-Console (F12)

## 🐛 פתרון בעיות

### התמלול לא עובד
- ודא שהדפדפן תומך ב-Web Speech API (Chrome/Edge)
- בדוק שהמיקרופון עובד
- בדוק את ה-Console (F12) לשגיאות

### הצעות AI לא מופיעות
- ודא שה-API Key מוגדר נכון
- בדוק שיש קרדיטים בחשבון ה-API
- פתח את ה-Console (F12) ובדוק שגיאות רשת

### האקסטension לא מזהה את הדמו
- ודא שהדמו רץ על `http://localhost` או `https://`
- בדוק שה-manifest.json כולל את ה-URL של הדמו ב-`matches`

## 📝 הערות

- הדמו משתמש ב-Web Speech API של הדפדפן לתמלול
- הצעות AI דורשות API Key תקין (OpenAI או Anthropic)
- הדמו מדמה סביבת פגישה לבדיקת הפיצ'רים

---

**Happy Testing! 🚀**


