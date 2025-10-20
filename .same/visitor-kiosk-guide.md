# 📱 Visitor Kiosk Application Guide

## Overview
The Visitor Kiosk is a tablet-based self-service registration system for walk-in visitors at DSTI reception. It allows visitors to register themselves quickly without staff assistance.

---

## 🚀 Quick Setup

### Hardware Requirements:
- **Tablet**: iPad, Android tablet, or Windows tablet
- **Camera**: Front-facing camera (required for photos)
- **Internet**: Wi-Fi connection
- **Stand**: Tablet stand or mount for reception desk

### Software Requirements:
- **Browser**: Chrome, Safari, Edge (latest version)
- **Permissions**: Camera access enabled

### Setup Steps:
1. Place tablet at reception desk in a secure stand
2. Open browser and navigate to: **https://same-k1aagq7et6e-latest.netlify.app/kiosk/visitors/register**
3. Bookmark the page or set as homepage
4. Enable full-screen mode (F11 or browser full-screen)
5. Grant camera permissions when prompted
6. Configure device ID in localStorage: `kioskDeviceId = "RECEPTION-01"`
7. Keep tablet plugged into power
8. Done! The kiosk is ready for visitors

---

## 👋 Visitor Flow (Step-by-Step)

### Starting the Registration

**What Visitor Sees:**
- DSTI logo and branding
- "DSTI Visitor Registration" title
- Current date and time
- Progress bar showing 5 steps
- Clean, welcoming interface

**Instructions for Visitor:**
"Welcome! Please follow the steps to register your visit."

---

### **Step 1: Who are you visiting?**

**Purpose:** Identify the host employee or reason for visit

**Options:**

**Option A: Visiting a Specific Employee**
1. Start typing employee name in search box
2. Wait for search results (appears after 2+ characters)
3. Select the employee from dropdown
4. Green confirmation card appears showing selected employee
5. Click "Next" to proceed

**Option B: General Visit / No Specific Person**
1. Click the "Other / No specific person" card
2. Text field appears: "Reason for visit"
3. Type the reason (e.g., "Delivery", "Interview", "Meeting")
4. Click "Next" to proceed

**Validation:**
- ❌ Can't proceed without selecting Employee OR Other
- ❌ If "Other" selected, reason is required

---

### **Step 2: Location (Optional)**

**Purpose:** Specify destination if known

**Fields:**
- **Floor** (Optional) - Select from dropdown:
  - Ground Floor
  - First Floor
  - Second Floor
  - Third Floor
- **Block** (Optional) - Select from dropdown:
  - Block A, B, C, D, E, F

**Helper Text:**
"If you're not sure, you can leave these fields empty and Security will assist you."

**Notes:**
- ✅ Both fields are optional
- ✅ Can proceed without selecting anything
- ✅ Helps security direct visitor faster

---

### **Step 3: Your Details**

**Purpose:** Collect visitor contact information

**Required Fields:**
1. **First Name** *
   - Example: "John"
   - Required

2. **Surname** *
   - Example: "Doe"
   - Required

3. **Mobile Number** *
   - Format: `+27 XX XXX XXXX`
   - Example: `+27 82 123 4567`
   - Must be valid South African number
   - Required - used for security check-in

**Optional Field:**
4. **Company**
   - Example: "ABC Corporation"
   - Optional

**Privacy Notice (Shown on this step):**
```
🔒 Privacy Notice: By proceeding, you consent to DSTI processing
your information for access control and safety purposes.
```

**Validation:**
- ❌ First name is required
- ❌ Surname is required
- ❌ Mobile number is required
- ❌ Mobile must be valid format: +27XXXXXXXXX
- ❌ Shows specific error messages for each field

---

### **Step 4: Safety & Photo**

**Purpose:** Security declaration and photo capture

#### **Weapon Declaration**

**Question:** "Are you carrying any weapons?"

**Options:**
- ⭕ **No** (default)
- ⭕ **Yes**

**If "Yes" selected:**
- Text area appears: "Describe the weapon(s)"
- Required to provide detailed description
- Example: "Licensed firearm - Glock 19, permit #12345"

**Visual Design:**
- Amber/orange warning box
- Shield icon for security
- Clear, large radio buttons

#### **Photo Capture**

**Steps:**
1. Click "Take Photo" button (blue, large)
2. Browser requests camera permission (first time only)
3. Grant permission when prompted
4. Front camera preview appears
5. Position face in frame
6. Click "Capture" button
7. Photo captured and displayed
8. Can click "Retake Photo" if needed

**Camera Features:**
- ✅ Uses front-facing camera (selfie mode)
- ✅ Live preview before capture
- ✅ Single-click capture
- ✅ Retake option anytime
- ✅ Photo shown in review step

**Validation:**
- ❌ Photo is required
- ❌ Weapon details required if "Yes" selected
- ❌ Clear error messages shown

---

### **Step 5: Review & Submit**

**Purpose:** Verify all information before submitting

**What's Displayed:**

**1. Visit Information Card**
- Who you're visiting / Reason for visit
- Edit link to jump back to Step 1

**2. Location Card** (if provided)
- Floor
- Block
- Edit link to jump back to Step 2

**3. Personal Details Card**
- Full name
- Company (if provided)
- Mobile number
- Edit link to jump back to Step 3

**4. Safety & Photo Card**
- Weapons: Yes/No (with details if Yes)
- Photo thumbnail
- Edit link to jump back to Step 4

**Actions:**
- **Back** - Return to Step 4
- **Submit Registration** - Green button, submits form

**During Submission:**
- Button shows spinner: "Submitting..."
- Button disabled to prevent double-click
- Takes 1-2 seconds

---

### **Success Screen**

**What Visitor Sees:**

```
┌─────────────────────────────────────────┐
│        ✅ (Large Green Checkmark)       │
│                                         │
│    Thank you for visiting DSTI!        │
│                                         │
│  Please give the Security at check-in  │
│  your mobile number +27 XX XXX XXXX    │
│  to complete your check-in.            │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Check In (Next Visitor)          │ │
│  │  (Big Red Button)                 │ │
│  └───────────────────────────────────┘ │
│                                         │
│  This screen will reset in 30 seconds  │
└─────────────────────────────────────────┘
```

**Key Elements:**
1. ✅ Green checkmark icon
2. Thank you heading
3. **Instructions**: Give mobile number to Security
4. **Mobile number displayed** for visitor to reference
5. **Big red button**: "Check In (Next Visitor)"
6. **Auto-reset timer**: 30 seconds

**What Happens:**
- ✅ Visitor registration saved to database
- ✅ Security notified (if weapon declared)
- ✅ Host employee notified (if applicable)
- ✅ Visitor proceeds to security desk
- ✅ Kiosk resets for next visitor

---

## ⏰ Auto-Reset & Idle Features

### 30-Second Auto-Reset (Success Screen)

**Purpose:** Automatically clear visitor data for privacy

**How it Works:**
1. Visitor completes registration
2. Success screen appears
3. 30-second countdown starts
4. Timer shown: "This screen will reset in 30 seconds"
5. After 30 seconds: Form resets to Step 1
6. All visitor data cleared
7. Ready for next visitor

**Manual Reset:**
- Visitor can click "Check In (Next Visitor)" anytime
- Immediately resets form
- No need to wait 30 seconds

### 2-Minute Idle Timeout (During Registration)

**Purpose:** Protect privacy if visitor abandons form

**How it Works:**
1. Visitor starts filling form
2. If no interaction for 2 minutes:
3. Alert appears: "Are you still there? The form will reset due to inactivity."
4. **If visitor clicks OK:** Timer resets, can continue
5. **If visitor clicks Cancel or no response:** Form resets to Step 1

**When it Activates:**
- ✅ Only during Steps 1-4 (not on success screen)
- ✅ Only after 2 minutes of no clicks/typing
- ✅ Warns before resetting
- ✅ Protects visitor data

---

## 🔒 Security Features

### Weapon Declaration

**If visitor declares weapons:**
1. ❗ Amber warning box highlights the declaration
2. ❗ Required to describe weapon(s)
3. ❗ Information saved with registration
4. ❗ Security immediately alerted
5. ❗ Shows in red on review screen

**Security Response:**
- Check weapon permit/license
- Log weapon details
- Escort visitor if needed
- Follow DSTI security protocols

### Privacy & Data Protection

**Privacy Notice (shown at Step 3 & 4):**
```
🔒 Privacy Notice: By proceeding, you consent to DSTI
processing your information for access control and
safety purposes.
```

**Data Collected:**
- Name and contact info
- Photo (for identification)
- Visit purpose
- Weapon declaration
- Timestamp
- Device ID (for audit)

**Data Protection:**
- ✅ Auto-reset clears screen after 30 seconds
- ✅ Idle timeout prevents abandoned data
- ✅ Encrypted transmission (HTTPS)
- ✅ Secure storage
- ✅ Audit trail logging

---

## 📸 Camera Troubleshooting

### Issue: "Camera not accessible"

**Possible Causes:**
1. Camera permissions not granted
2. Another app using camera
3. Camera hardware issue

**Solutions:**

**Step 1: Check Permissions**
- **Chrome:** Settings → Privacy → Camera → Allow
- **Safari:** Settings → Safari → Camera → Allow
- **Edge:** Settings → Cookies and site permissions → Camera → Allow

**Step 2: Reload Page**
- Refresh the browser
- Try camera again

**Step 3: Restart Browser**
- Close all browser windows
- Reopen and try again

**Step 4: Test Camera**
- Open camera app directly
- If camera works in camera app, browser issue
- If camera doesn't work, hardware issue

### Issue: Camera shows rear camera instead of front

**Solution:**
- The app is coded to use front camera (`facingMode: "user"`)
- If rear camera shows, may be device limitation
- Try refreshing page
- Check device settings for default camera

### Issue: Photo is blurry or dark

**Solutions:**
- Ensure good lighting
- Clean camera lens
- Hold device steady
- Retake photo if needed

---

## 🎯 Common Visitor Questions

**Q: Is this required?**
A: Yes, all visitors must register for security and safety compliance.

**Q: Why do you need my photo?**
A: For security identification and access control records.

**Q: Why do you need my mobile number?**
A: Security uses it to complete your check-in at the desk. It's your unique identifier.

**Q: I don't know which floor/block**
A: No problem! Leave it blank. Security will assist you at check-in.

**Q: I'm visiting multiple people**
A: Select the primary contact, or choose "Other" and specify "Multiple meetings".

**Q: I made a mistake**
A: Use the "Back" button to return to previous steps, or use "Edit" links on the review screen.

**Q: Can I use this in my language?**
A: Currently English only. Multilingual support coming soon.

**Q: What if I need help?**
A: Ask reception staff for assistance. They can guide you through the form.

---

## 👨‍💼 Reception Staff Guide

### Daily Startup Routine

**Morning:**
1. Turn on tablet
2. Open browser
3. Navigate to kiosk URL (should be bookmarked)
4. Verify camera works
5. Test one registration
6. Place "Self-Service Registration" sign
7. Ready for visitors!

**During the Day:**
- Monitor tablet periodically
- Ensure it hasn't crashed or frozen
- Keep tablet charged
- Assist visitors if they look confused

**End of Day:**
- Leave tablet running (no need to close)
- Plug into charger overnight
- Lock screen if required

### Troubleshooting Guide

**Problem: Tablet froze / not responding**
- Solution: Restart browser or tablet
- Bookmark should restore page

**Problem: Visitor can't find employee**
- Solution: Tell them to choose "Other" and describe purpose
- Manually notify employee

**Problem: Camera not working**
- Solution: See Camera Troubleshooting section
- Worst case: Take photo with separate camera and attach later

**Problem: Visitor can't read small text**
- Solution: Tablet should be large (10" or bigger)
- Can pinch-zoom if needed
- Offer assistance

**Problem: Form keeps resetting**
- Solution: Check idle timeout (2 minutes)
- Tell visitor to work quicker
- Or help them fill it out

---

## 📊 Admin Dashboard Integration

### Accessing Kiosk from Admin

**Location:** Admin Dashboard → "Visitor Kiosk" Card

**Card Details:**
- **Title:** "Visitor Kiosk"
- **Description:** "Open the visitor registration kiosk on a tablet at reception for walk-in visitors"
- **Button:** "Open Visitor Kiosk (New Tab)"
- **Color:** Teal theme

**Workflow:**
1. Login to admin portal
2. Go to dashboard
3. Find teal "Visitor Kiosk" card
4. Click "Open Visitor Kiosk (New Tab)"
5. New tab opens with kiosk
6. Fullscreen the tab
7. Place tablet at reception

### Viewing Registrations (Future Feature)

Coming soon:
- View all visitor registrations
- Export visitor reports
- Search by date/name
- Contact visitors

---

## 🔌 API Integration

### For Developers

**Base URL:** `https://same-k1aagq7et6e-latest.netlify.app`

#### 1. Employee Search
```http
GET /api/employees/search?q=john&limit=10

Response:
[
  {
    "id": "EMP-001",
    "fullName": "John Doe",
    "department": "Programme 1A",
    "phoneExt": "1234"
  }
]
```

#### 2. Photo Upload
```http
POST /api/uploads
Content-Type: multipart/form-data

Body: { file: <image blob> }

Response:
{
  "url": "https://...",
  "filename": "photo.jpg",
  "size": 123456,
  "type": "image/jpeg"
}
```

#### 3. Visitor Registration
```http
POST /api/visitors/registrations
Content-Type: application/json

Body:
{
  "timestamp": "2025-10-15T10:30:00Z",
  "purpose": "EmployeeVisit",
  "employeeId": "EMP-001",
  "employeeName": "John Doe",
  "firstName": "Jane",
  "surname": "Smith",
  "company": "ABC Corp",
  "mobile": "+27821234567",
  "hasWeapons": false,
  "photoUrl": "https://...",
  "deviceId": "KIOSK-001"
}

Response:
{
  "id": "VIS-000001",
  "status": "received",
  "message": "Registration successful"
}
```

#### 4. Get Recent Registrations
```http
GET /api/visitors/registrations?limit=50

Response:
[
  {
    "id": "VIS-000001",
    "timestamp": "...",
    "firstName": "Jane",
    "surname": "Smith",
    ...
  }
]
```

---

## 📱 Tablet Recommendations

### Recommended Devices:

**Budget Option:**
- **Amazon Fire HD 10** (10.1", $150)
- **Samsung Galaxy Tab A** (10.1", $200)

**Mid-Range:**
- **iPad (9th Gen)** (10.2", $330)
- **Samsung Galaxy Tab S6 Lite** (10.4", $350)

**Premium:**
- **iPad Air** (10.9", $600)
- **iPad Pro** (11", $800)

### Specifications:
- **Screen:** 10" or larger (for readability)
- **Camera:** Front-facing (at least 2MP)
- **Storage:** 32GB minimum
- **RAM:** 3GB minimum
- **Battery:** Full-day usage
- **Stand:** Secure desk mount

---

## 🎨 Customization Options

### Future Enhancements:

**Branding:**
- Custom logo upload
- Color theme customization
- Welcome message configuration

**Fields:**
- Add/remove custom fields
- Make fields required/optional
- Conditional field visibility

**Languages:**
- Multi-language support
- Language switcher button
- Translated form labels

**Integration:**
- Email notifications to hosts
- SMS confirmation to visitors
- Badge printer integration
- Access control system sync

---

## 📞 Support

**For Visitors:**
- Ask reception staff for assistance
- No support contact needed

**For Reception Staff:**
- **Email:** support@pconnect.com
- **Phone:** +27 74 245 0193
- **Available:** Monday-Friday, 8 AM - 5 PM

**For IT/Admin:**
- **Email:** support@pconnect.com
- **Documentation:** `.same/visitor-kiosk-guide.md`
- **API Docs:** See API Integration section above

---

## ✅ Deployment Checklist

Before going live:

- [ ] Tablet purchased and set up
- [ ] Kiosk URL bookmarked
- [ ] Camera permissions granted
- [ ] Device ID configured
- [ ] Tablet mount installed
- [ ] Power cable connected
- [ ] Test registration completed successfully
- [ ] Staff trained on basic troubleshooting
- [ ] Signage placed ("Self-Service Registration")
- [ ] Security team briefed on visitor flow
- [ ] Phone number validation tested
- [ ] Photo capture tested
- [ ] Success screen and reset verified

---

**Version:** 84
**Last Updated:** October 2025
**P-Connect Visitor Kiosk** - Powered by DSTI
**Mode:** Self-Service Kiosk (No Login Required)
**Purpose:** Walk-In Visitor Registration
