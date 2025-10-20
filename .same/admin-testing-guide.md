# 🧪 Admin Portal Testing Guide - Version 75

## Overview
Version 75 includes extensive debugging features to help identify and fix any issues with the admin user management page.

---

## 🚀 Quick Test

### Step 1: Admin Login
1. Open your browser's **Developer Console** (Press F12 or Right-click → Inspect → Console tab)
2. Go to: https://same-k1aagq7et6e-latest.netlify.app/admin/login
3. Enter credentials:
   - Email: `admin@dsti.gov.za` (or any email)
   - Password: `password123` (or any password)
4. Click "Login to Admin Portal"

**Expected Console Output:**
```
🔐 Admin login attempt...
✅ Admin session created
Email: admin@dsti.gov.za
Session stored: true
🚀 Redirecting to admin dashboard...
```

### Step 2: Dashboard Verification
1. Should automatically redirect to `/admin`
2. Check console for:
```
🔍 Dashboard: Checking admin authentication...
🔐 Dashboard: Admin status = true
✅ Dashboard: Admin authenticated
```

### Step 3: User Management Access
1. Click **"User Management"** from the sidebar (desktop) or menu (mobile)
2. Watch console for:
```
🔍 Checking admin authentication...
🔐 Admin logged in status: true
✅ Admin authenticated, loading user management page
```

3. Page should load with a **yellow debug banner** at the top showing:
   - `🐛 Debug Mode: Admin Session = true`
   - A "Check Session" button

### Step 4: Verify Session
1. On the user management page, click the **"Check Session"** button
2. An alert should appear showing:
   - `Admin Session: true`
   - `Email: admin@dsti.gov.za`

---

## 🐛 Debugging Features

### 1. Console Logging
Every authentication check now logs to the console with emoji indicators:

- 🔍 = Checking/Inspecting
- 🔐 = Authentication status
- ✅ = Success
- ❌ = Error
- 🚀 = Navigation/Redirect

### 2. Debug Banner (Yellow Bar)
Located at the top of the user management page:
- Shows real-time session status
- "Check Session" button for manual verification
- Will be removed in production version

### 3. Enhanced Error Messages
- All errors now show user-friendly alerts
- Console shows detailed error information
- Automatic redirect to login on authentication failures

---

## 🔍 Troubleshooting Common Issues

### Issue 1: Redirected to Login Immediately

**Symptoms:**
- Click "User Management"
- Immediately redirected to `/admin/login`
- Console shows: `❌ No admin session found`

**Solution:**
1. Clear your browser cache and sessionStorage:
   - In console, type: `sessionStorage.clear()`
   - Press Enter
2. Login again from `/admin/login`
3. Check console for session creation confirmation

### Issue 2: "Loading..." Screen Stuck

**Symptoms:**
- User management page shows "Loading..." forever
- No error messages
- Console shows authentication check

**Solution:**
1. Click the **"Back to Login"** button (now visible on loading screen)
2. Login again
3. If issue persists, check console for error messages

### Issue 3: Session Not Found Alert

**Symptoms:**
- Click "Check Session" button
- Alert shows: `Admin Session: Not Found`

**Solution:**
1. You've been logged out or session expired
2. Return to `/admin/login`
3. Login again
4. Console will show: `✅ Admin session created`

---

## 📊 What to Report if Still Broken

If the admin portal still doesn't work after these fixes, please provide:

### 1. Console Logs Screenshot
- Open console before testing
- Perform all steps above
- Take screenshot of ALL console messages

### 2. Step Where It Failed
Specify exactly which step fails:
- [ ] Login (can't login at all)
- [ ] Dashboard redirect (login works but can't reach dashboard)
- [ ] User Management access (dashboard works but user management fails)
- [ ] Page loading (user management redirects back to login)

### 3. Session Status
- Click "Check Session" button if you can reach user management
- Or in console, type: `sessionStorage.getItem("adminLoggedIn")`
- Report what it shows

### 4. Browser & Device
- Browser: (Chrome, Firefox, Safari, Edge)
- Version: (Check in browser settings → About)
- Device: (Windows PC, Mac, Tablet, etc.)
- OS: (Windows 11, macOS, etc.)

### 5. Screenshot of Error
- Take screenshot of the error screen
- Include URL bar showing which page you're on

---

## ✅ Success Indicators

You'll know everything is working correctly when:

1. ✅ Login shows success message in console
2. ✅ Dashboard loads without errors
3. ✅ User Management page loads and shows:
   - Yellow debug banner
   - User table with sample data
   - Filters and search working
4. ✅ "Check Session" shows `Admin Session: true`
5. ✅ No redirects to login page

---

## 🔄 Testing All Admin Features

Once user management loads successfully, test these features:

### Search & Filter
1. Search for "John" in search box
2. Filter by "Building 41"
3. Filter by "Programme 1A"
4. Combine multiple filters
5. Click "X" to clear filters

### Actions
1. Click "Add User" button → Modal should open
2. Click "Edit" icon on a user → Edit modal opens
3. Click "View" (eye icon) → Navigate to user detail page
4. Click "Delete" → Confirmation dialog appears
5. Click "Export CSV" → CSV file downloads

### Navigation
1. Click back to Dashboard
2. Navigate to Check-In History
3. Navigate to Bookings
4. Navigate to Reports
5. Return to User Management

All navigation should work without being logged out.

---

## 🎯 Expected User Flow

### Happy Path (Everything Working):

```
1. Visit /admin/login
   ↓
2. Enter email & password
   ↓
3. Click "Login to Admin Portal"
   ↓ (Console: ✅ Admin session created)
4. Auto-redirect to /admin
   ↓ (Console: ✅ Dashboard authenticated)
5. Click "User Management"
   ↓ (Console: ✅ Loading user management)
6. Page loads with debug banner
   ↓
7. Click "Check Session" → Shows "Admin Session: true"
   ↓
8. All features working:
   - Search ✅
   - Filters ✅
   - Add/Edit/Delete ✅
   - Export CSV ✅
   - Navigation ✅
```

---

## 🛠️ Developer Notes

### Debug Code Locations

**Admin Login:**
- File: `/src/app/admin/login/page.tsx`
- Line: ~45 - Enhanced logging in handleSubmit

**Dashboard:**
- File: `/src/app/admin/page.tsx`
- Line: ~40 - Authentication check with logging

**User Management:**
- File: `/src/app/admin/users/page.tsx`
- Line: ~70 - Enhanced auth check with 100ms delay
- Line: ~145 - Debug banner component

### Timing Fix
Added 100ms delay before checking sessionStorage to ensure browser has completed storage operation:
```typescript
const timer = setTimeout(() => {
  checkAuth();
}, 100);
```

This solves race condition issues where page loads before sessionStorage is fully set.

---

## 📞 Support

If you encounter issues not covered in this guide:

**Email**: support@pconnect.com
**Subject**: Admin Portal Debug - Version 75
**Include**: Console logs, screenshots, and step where it failed

---

**Version**: 75
**Date**: October 2025
**Status**: Debug Build - Yellow banner will be removed in production
**Purpose**: Diagnose and fix admin user management access issues
