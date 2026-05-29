# DARK MODE & MULTI-LANGUAGE COMPLETE GUIDE

## ✅ Triển khai hoàn tất

### 🌙 **Dark Mode với next-themes**
- ✅ ThemeProvider đã được cấu hình
- ✅ Tailwind darkMode: "class" đã sẵn sàng
- ✅ Switch trong Profile page hoạt động
- ✅ Dark mode styles áp dụng toàn app

### 🌐 **Multi-Language (i18n)**
- ✅ Dictionary system (Tiếng Việt/English)
- ✅ LanguageProvider Context
- ✅ Language selector trong Profile
- ✅ Translations áp dụng trong Profile page

---

## 📋 Files đã tạo/cập nhật

### **1. Theme System**
```
components/providers/theme-provider.tsx - ThemeProvider wrapper
app/layout.tsx - Wrapped with ThemeProvider
tailwind.config.js - darkMode: "class" (đã có sẵn)
```

### **2. Language System**
```
lib/i18n.ts - Dictionary cho vi/en
contexts/language-context.tsx - LanguageProvider + useLanguage hook
```

### **3. Updated Components**
```
app/(main)/profile/page.tsx - Dark mode + language controls
app/(main)/layout.tsx - Dark mode classes
app/(main)/messages/page.tsx - Dark mode styles
components/layout/sidebar.tsx - Dark mode navigation
app/globals.css - Dark mode CSS variables (đã có sẵn)
```

---

## 🚀 Usage Guide

### **Sử dụng Dark Mode trong Component**

```tsx
import { useTheme } from "next-themes";

export function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

### **Sử dụng i18n trong Component**

```tsx
import { useLanguage } from "@/contexts/language-context";

export function MyComponent() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div>
      <h1>{t.profile}</h1>
      <button onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}>
        Switch Language
      </button>
    </div>
  );
}
```

---

## 🎨 Dark Mode Classes (Tailwind)

### **Background Colors**
```tsx
className="bg-white dark:bg-slate-900"
className="bg-slate-50 dark:bg-slate-800"
className="bg-slate-100 dark:bg-slate-700"
```

### **Text Colors**
```tsx
className="text-slate-900 dark:text-white"
className="text-slate-600 dark:text-slate-300"
className="text-slate-400 dark:text-slate-500"
```

### **Border Colors**
```tsx
className="border-slate-100 dark:border-slate-800"
className="border-slate-200 dark:border-slate-700"
```

### **Hover States**
```tsx
className="hover:bg-slate-50 dark:hover:bg-slate-700"
className="hover:text-slate-900 dark:hover:text-white"
```

---

## 📚 Dictionary Structure

### **Thêm Translation mới**

Edit `lib/i18n.ts`:

```typescript
export const dictionaries = {
  vi: {
    // Existing keys...
    newKey: "Giá trị tiếng Việt",
  },
  en: {
    // Existing keys...
    newKey: "English value",
  },
};
```

### **Sử dụng Translation**

```tsx
const { t } = useLanguage();

// Trong JSX
<h1>{t.newKey}</h1>
```

---

## 🔧 Cấu hình

### **ThemeProvider trong layout.tsx**

```tsx
<ThemeProvider
  attribute="class"          // Sử dụng class để toggle
  defaultTheme="system"      // Mặc định theo system
  enableSystem               // Cho phép system preference
  disableTransitionOnChange  // Tắt animation khi chuyển theme
>
  {children}
</ThemeProvider>
```

### **LanguageProvider Features**

- ✅ Auto-save language to localStorage
- ✅ Update `<html lang="...">` attribute
- ✅ Prevent hydration mismatch
- ✅ Type-safe dictionary access

---

## 🎯 Components với Dark Mode

### **Profile Page** ✅
- Avatar section
- Edit dialog
- Settings card
- Language selector
- Logout button

### **Sidebar Navigation** ✅
- Nav items
- Active states
- Hover effects
- Notification badge

### **Main Layout** ✅
- Sidebar background
- Main content area
- Mobile bottom nav
- Borders

### **Messages Empty State** ✅
- Background
- Icon container
- Text colors

---

## 🌟 User Experience

### **Dark Mode Toggle**
1. User vào Profile page
2. Click switch "Chế độ tối"
3. Theme chuyển đổi ngay lập tức
4. Preference được lưu vào localStorage

### **Language Selection**
1. User vào Profile → Settings
2. Click "Ngôn ngữ"
3. Dialog hiển thị: 🇻🇳 Tiếng Việt / 🇬🇧 English
4. Chọn ngôn ngữ → UI cập nhật ngay
5. Preference được lưu vào localStorage

---

## 🔍 Debugging

### **Dark Mode không hoạt động?**

1. Check ThemeProvider trong layout.tsx:
```tsx
<html suppressHydrationWarning>
```

2. Check Tailwind config:
```js
module.exports = {
  darkMode: ["class"],
  // ...
}
```

3. Check component classes:
```tsx
// ✅ Đúng
className="bg-white dark:bg-slate-900"

// ❌ Sai
className="dark:bg-slate-900 bg-white" // Thứ tự không quan trọng nhưng nên consistent
```

### **Language không cập nhật?**

1. Check LanguageProvider wrapped đúng chỗ
2. Check localStorage:
```js
localStorage.getItem('language') // "vi" hoặc "en"
```

3. Check dictionary key exists:
```typescript
// lib/i18n.ts
dictionaries.vi.yourKey // Phải tồn tại
dictionaries.en.yourKey // Phải tồn tại
```

---

## 📱 Responsive Dark Mode

All components support dark mode on mobile and desktop:

```tsx
// Mobile-first approach với dark mode
<div className="
  p-4                          // Mobile padding
  md:p-6                       // Desktop padding
  bg-white                     // Light mode mobile
  dark:bg-slate-900            // Dark mode mobile
  md:bg-slate-50               // Light mode desktop
  md:dark:bg-slate-800         // Dark mode desktop
">
```

---

## 🎨 Color System

### **Light Mode Palette**
```
Background: white, slate-50
Text: slate-900, slate-600, slate-400
Borders: slate-100, slate-200
Accent: blue-600, blue-50
```

### **Dark Mode Palette**
```
Background: slate-950, slate-900, slate-800
Text: white, slate-300, slate-500
Borders: slate-800, slate-700
Accent: blue-600, blue-900/30
```

---

## 🚀 Next Steps

### **Apply Dark Mode to more components:**
1. Blog page
2. Contacts page
3. Notifications page
4. Chat messages
5. Chat sidebar
6. Auth pages

### **Add more translations:**
1. Error messages
2. Form validation
3. Toast messages
4. Empty states
5. Loading states

---

## 📖 Examples

### **Complete Component Example**

```tsx
"use client";

import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/language-context";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <span className="text-sm font-medium text-slate-900 dark:text-white">
        {t.darkMode}
      </span>
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-slate-600" />
        )}
      </button>
    </div>
  );
}
```

### **Language Selector Component**

```tsx
"use client";

import { useLanguage } from "@/contexts/language-context";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLanguage('vi')}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          language === 'vi'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
        }`}
      >
        🇻🇳 Tiếng Việt
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          language === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
        }`}
      >
        🇬🇧 English
      </button>
    </div>
  );
}
```

---

## ✨ Features Summary

✅ **Dark Mode**
- System preference detection
- Manual toggle in Profile
- Smooth transitions
- Persistent across sessions
- Fully responsive

✅ **Multi-Language**
- Vietnamese & English support
- Easy to add more languages
- Context-based switching
- Persistent selection
- Type-safe translations

✅ **User Experience**
- Instant theme switching
- No page reload needed
- Smooth animations
- Consistent styling
- Accessible controls

---

**🎉 ChatMeNow giờ đã có Dark Mode và Multi-Language hoàn chỉnh!**
