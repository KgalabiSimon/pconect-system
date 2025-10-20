# 🐛 Security Scanner Debugging Instructions

## Version 71 - Debug Build with Extensive Logging

This version includes comprehensive debugging to help identify exactly where the scanner is failing.

---

## 🧪 Test #1: Modal Rendering Test

**Purpose**: Verify that the modal can open and display user information.

### Steps:
1. Go to: https://same-k1aagq7et6e-latest.netlify.app/security/login
2. Enter any badge/PIN (e.g., `SEC001` / `123456`)
3. Click "Login to Checkpoint"
4. At the bottom of the screen, you should see a **yellow button** labeled "🧪 TEST MODAL (Debug)"
5. Click it

### Expected Result:
✅ A modal should appear with test user information:
- Name: Test User
- Phone: +27 82 123 4567
- Floor: Ground Floor
- Block: Block A
- etc.

### If Modal Appears:
✓ Modal rendering is working fine
✓ The issue is in the QR scanning flow

### If Modal Doesn't Appear:
✗ There's a React rendering issue
✗ Check browser console for errors

---

## 🧪 Test #2: Check-In Data Storage Test

**Purpose**: Verify that user data is stored in localStorage when creating a QR code.

### Steps:
1. **Open Browser Console** (F12 or Right-click → Inspect → Console)
2. Go to: https://same-k1aagq7et6e-latest.netlify.app/login
3. Login with any email/password (or register a new user)
4. Click "Check-in/out" from home page
5. Fill in the form:
   - Floor: Ground Floor
   - Block: Block A
   - Laptop: Yes
   - Laptop Name: Dell Latitude
   - Asset Number: TEST-001
6. Click "CHECK IN"

### What to Watch in Console:
You should see logs like:
```
Storing check-in data to localStorage: {employeeId: "...", firstName: "...", ...}
Stored successfully. Key: checkin_xxxxx-xxxxx-xxxxx
```

### Manual Verification:
1. In browser console, type:
```javascript
localStorage
```
2. Look for a key starting with `checkin_`
3. Type:
```javascript
localStorage.getItem("checkin_xxxxx") // use the actual key
```
4. You should see JSON data with your user information

### Expected Result:
✅ Data is stored in localStorage
✅ You can retrieve it manually

### If Data NOT Stored:
✗ The issue is in the check-in page
✗ Check console for errors when clicking "CHECK IN"

---

## 🧪 Test #3: QR Code Scanning Test

**Purpose**: Test the complete scanning flow with full debugging.

### Steps:

#### Part A: Create QR Code
1. Complete Test #2 above to create a QR code
2. **IMPORTANT**: Note the `employeeId` from the console (it's a UUID like `abc123-def456-...`)
3. Keep the QR code page open

#### Part B: Open Security Scanner
1. Open a **NEW browser tab** (same browser, new tab)
2. Open browser console (F12)
3. Go to: https://same-k1aagq7et6e-latest.netlify.app/security/login
4. Login with any badge/PIN
5. Scanner should start automatically

#### Part C: Scan the QR Code
1. Hold the QR code from Part A up to your camera
2. OR display it on another device/screen
3. Wait for the beep sound

### What to Watch in Console:
You should see a series of logs:

```
=== QR CODE SCANNED ===
Raw QR Data: https://p-connect.web.app/checkin?data=...&employeeId=xxxxx&date=2025-10-15
--- parseQRCode START ---
QR Data: https://p-connect.web.app/checkin?...
isCheckIn: true isBooking: false
employeeIdMatch: ["employeeId=xxxxx", "xxxxx"]
Extracted employeeId: xxxxx
Looking for key: checkin_xxxxx
localStorage data: {"employeeId":"xxxxx","firstName":"John",...}
✓ Parsed check-in data: {employeeId: "...", firstName: "..."}
✓ Created userData object: {name: "John", surname: "Smith", ...}
--- parseQRCode END (SUCCESS) ---
Parsed User Data: {name: "John", ...}
✓ User data found, setting scannedUser state
*** scannedUser state changed: {name: "John", ...}
✓ Modal should now be visible!
```

### Debugging Checklist:

#### ❌ If you see "No employee ID found":
- QR code format is wrong
- Copy the QR code URL and check if it contains `employeeId=`

#### ❌ If you see "No check-in data found in localStorage":
- Data wasn't stored properly
- Check if you're using the same browser (localStorage is per-browser)
- The console will show "All localStorage keys:" - check if your `checkin_` key is there

#### ❌ If parseQRCode returns null:
- Check the error message in console
- It will tell you exactly what's missing

#### ❌ If parseQRCode succeeds but modal doesn't open:
- Check for the log: "✓ User data found, setting scannedUser state"
- Check for the log: "✓ Modal should now be visible!"
- If both appear but modal doesn't show, there's a rendering issue

---

## 🔍 Common Issues & Solutions

### Issue 1: Different Browser/Tab
**Problem**: Created QR in Chrome, scanning in Firefox
**Solution**: localStorage is per-browser. Use the same browser for both.

### Issue 2: Incognito/Private Mode
**Problem**: localStorage is cleared when closing incognito window
**Solution**: Use normal browser mode for testing

### Issue 3: Multiple Tabs in Same Browser
**Problem**: Security checkpoint in different tab can't see QR data
**Solution**: This should work! localStorage is shared across tabs in same browser.

### Issue 4: Old QR Code
**Problem**: Scanning a QR code created before this update
**Solution**: Create a fresh QR code with version 71

### Issue 5: Camera Not Working
**Problem**: Camera permission denied
**Solution**:
- Check browser permissions
- Try the yellow "TEST MODAL" button first to confirm modal works
- Use phone number check-in as alternative

---

## 📊 What to Report

If the scanner still doesn't work, please provide:

1. **Screenshot of browser console** showing all the logs
2. **Which test failed**:
   - [ ] Test #1 (Modal doesn't open even with test button)
   - [ ] Test #2 (Data not storing in localStorage)
   - [ ] Test #3 (QR scan doesn't trigger modal)

3. **Last log message you see** before it fails

4. **Browser and device**:
   - Browser: ________________
   - Device: _________________
   - OS: ____________________

---

## 🎯 Success Criteria

The scanner is working correctly if:
- ✅ Test button opens modal
- ✅ Console shows data being stored in localStorage
- ✅ Console shows QR being scanned and parsed
- ✅ Console shows "Modal should now be visible!"
- ✅ Modal actually appears with user information

---

**Version**: 71
**Date**: October 2025
**Status**: Debug Build - Not for Production Use
