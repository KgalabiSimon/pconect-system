# 💻 Laptop Tracking System Guide

## Overview
The Laptop Tracking System helps DSTI security and admin staff monitor which employees checked in with which laptops, detect when employees use unregistered laptops, and track security check-out verification.

---

## 🚀 Quick Access

### URLs:
- **Admin Login**: https://same-k1aagq7et6e-latest.netlify.app/admin/login
- **Laptop Tracking**: https://same-k1aagq7et6e-latest.netlify.app/admin/laptops

### How to Access:
1. Login to Admin Portal with your credentials
2. Click "Laptop Tracking" from the sidebar menu
3. Or click "Laptop Tracking" from the dashboard

---

## 📊 Statistics Dashboard

### Five Key Metrics (Color-Coded Cards):

**1. Total Laptops** (Gray Card 🔘)
- Total number of laptop check-in records
- All-time count

**2. Checked In** (Green Card 🟢)
- Employees currently in the building with laptops
- Real-time count
- These laptops are still in the building

**3. Checked Out** (Blue Card 🔵)
- Laptops verified and checked out by security officers
- Completed transactions
- Security has confirmed the laptop leaving the premises

**4. Total Mismatches** (Red Card 🔴)
- All instances where employee used wrong laptop
- Historical count
- Includes both checked-in and checked-out mismatches

**5. Unchecked Mismatches** (Orange Card 🟠)
- 🚨 **ACTIVE SECURITY ALERTS**
- Employees currently in building with unregistered laptop
- Requires immediate attention
- Security should investigate

---

## 🔍 How the System Works

### Registration vs Check-In

**Step 1: Employee Registration**
When an employee registers in the P-Connect system, they provide:
- Laptop Model (e.g., "Dell Latitude 5420")
- Asset Number (e.g., "DST-001")

**Step 2: Daily Check-In**
When the employee checks in at the security checkpoint:
- Security officer scans their QR code
- System captures the laptop they're carrying
- System compares against their registered laptop

**Step 3: Automatic Verification**
The system automatically checks:
- ✅ Does the laptop model match what's registered?
- ✅ Does the asset number match what's registered?
- 🚨 If NO = SECURITY ALERT

**Step 4: Check-Out Verification**
When employee leaves:
- Security officer physically verifies the laptop
- Security officer logs the check-out
- System records officer name and badge number
- Transaction complete

---

## 🚨 Security Alert System

### What Triggers an Alert?

An alert is triggered when:
- Employee checks in with a laptop that is **NOT** registered to them
- Example:
  - **Registered**: Dell Latitude 5420 (DST-001)
  - **Checked In With**: Lenovo ThinkPad X1 (DST-003)
  - **Result**: 🚨 MISMATCH ALERT

### How Alerts Look:

**Visual Indicators:**
1. **Red Border** - 2px thick red border around entire card
2. **Red Background** - Light red tint (bg-red-50)
3. **Alert Badge** - "UNREGISTERED LAPTOP" badge with pulsing animation
4. **Warning Icon** - AlertTriangle icon (animated)
5. **Security Alert Box** - Detailed warning message

**Alert Message Includes:**
- What laptop the employee brought
- What laptop is registered to them
- Clear "SECURITY ALERT" header
- Recommendation to investigate

---

## 📋 Laptop Record Details

### Each Record Shows:

**Header Section:**
- 👤 Employee Name
- 🆔 Employee ID
- 🔢 Record ID
- ✅/🚨 Match Status Badge
- 📍 Current Status (Checked In / Checked Out)

**Laptop Comparison (Side-by-Side):**

**LEFT: Registered Laptop** (Gray Box)
- Laptop model on file
- Asset number on file
- What SHOULD be used

**RIGHT: Checked-In Laptop** (Green or Red Box)
- Laptop actually brought
- Asset number scanned
- What WAS used
- Color: Green if match, Red if mismatch

**Location Information:**
- 🏢 Building
- 🏢 Floor
- 🏢 Block

**Time Information:**
- 🕐 Check-In Date & Time
- 🕐 Check-Out Date & Time (if applicable)
- ⏱️ Duration (if checked out)

**Security Verification (If Checked Out):**
- 🛡️ Security Officer Name
- 🎖️ Officer Badge Number
- ✅ Verified check-out confirmation

---

## 🔎 Filters & Search

### Search Bar
**What You Can Search:**
- Employee name (e.g., "John Doe")
- Laptop model (e.g., "Dell Latitude")
- Asset number (e.g., "DST-001")
- Employee ID (e.g., "USR-001")
- Record ID (e.g., "LAP-001")

**How to Use:**
1. Type in the search box
2. Results filter automatically as you type
3. Clear to see all records

### Status Filter
**Options:**
- **All Status** - Show everything
- **Checked In Only** - Currently in building
- **Checked Out Only** - Already left

**Use Case:**
- End of day: Filter "Checked In Only" to see who's still inside
- Audit: Filter "Checked Out Only" to review completed transactions

### Match Filter
**Options:**
- **All Laptops** - Show everything
- **Registered Match** - Only show correct laptops
- **Mismatches Only** - Only show security alerts

**Use Case:**
- Security Review: Filter "Mismatches Only" to investigate issues
- Compliance: Filter "Registered Match" to see compliant employees

### Building Filter
**Options:**
- **All Buildings** - Show all locations
- **Building 41** - Only this building
- **Building 42** - Only this building
- **DSTI Building** - Only this building

**Use Case:**
- Building Manager: Filter by your building only
- Security Team: Review specific building concerns

---

## 📥 CSV Export

### What Gets Exported:

**All Fields:**
1. Record ID
2. Employee Name
3. Employee ID
4. Registered Laptop Model
5. Registered Asset Number
6. Checked-In Laptop Model
7. Checked-In Asset Number
8. Match Status (Match/MISMATCH)
9. Status (Checked In/Checked Out)
10. Building
11. Floor
12. Block
13. Check-In Date
14. Check-In Time
15. Check-Out Date
16. Check-Out Time
17. Duration
18. Security Officer Name
19. Security Officer Badge Number

**How to Export:**
1. Apply any filters you want (optional)
2. Click "Export CSV" button (top right)
3. File downloads automatically
4. Filename: `laptop-tracking-YYYY-MM-DD.csv`
5. Success message confirms export

**Use Cases:**
- Monthly security reports
- Audit trail documentation
- Compliance reviews
- Management reporting
- Investigation evidence

---

## 🎯 Common Scenarios

### Scenario 1: Employee Uses Wrong Laptop

**What Happened:**
Mike Johnson registered with "Lenovo ThinkPad X1 (DST-003)" but checked in with "Dell Latitude 5420 (DST-001)"

**What You See:**
```
🚨 SECURITY ALERT

┌─────────────────────────────────────────────────┐
│ 👤 Mike Johnson (USR-003)                      │
│ 🚨 UNREGISTERED LAPTOP (pulsing)               │
│                                                 │
│ REGISTERED LAPTOP (Gray Box)                   │
│ 💻 Lenovo ThinkPad X1                          │
│ 🔢 Asset: DST-003                              │
│                                                 │
│ CHECKED-IN LAPTOP (Red Box)                    │
│ 💻 Dell Latitude 5420                          │
│ 🔢 Asset: DST-001                              │
│                                                 │
│ ⚠️ SECURITY ALERT:                             │
│ Employee checked in with Dell Latitude 5420    │
│ (DST-001), which is NOT registered to them.    │
│ Their registered laptop is Lenovo ThinkPad X1  │
│ (DST-003).                                      │
│                                                 │
│ 📍 Building 41 • Ground Floor • Block B        │
│ 🕐 Check-In: 2025-10-15 10:15 AM              │
│ Status: ⚠️ Still in Building                   │
└─────────────────────────────────────────────────┘
```

**What Security Should Do:**
1. Investigate immediately
2. Verify if it's a legitimate reason (forgot laptop, temporary replacement)
3. Check if DST-001 is actually assigned to someone else
4. Document the reason in notes
5. May need to verify at check-out

### Scenario 2: Normal Check-In and Check-Out

**What Happened:**
Sarah Williams checked in with her registered laptop and later checked out

**What You See:**
```
✅ REGISTERED LAPTOP

┌─────────────────────────────────────────────────┐
│ 👤 Sarah Williams (USR-002)                    │
│ ✅ Registered Laptop (green badge)             │
│ 🔵 Checked Out (blue badge)                    │
│                                                 │
│ REGISTERED LAPTOP (Gray Box)                   │
│ 💻 HP EliteBook 840                            │
│ 🔢 Asset: DST-002                              │
│                                                 │
│ CHECKED-IN LAPTOP (Green Box)                  │
│ 💻 HP EliteBook 840 ✅                         │
│ 🔢 Asset: DST-002 ✅                           │
│                                                 │
│ 📍 Building 42 • First Floor • Block D         │
│ 🕐 Check-In: 2025-10-14 09:00 AM              │
│ 🕐 Check-Out: 2025-10-14 06:15 PM             │
│ ⏱️ Duration: 9h 15m                            │
│                                                 │
│ 🛡️ Verified by: Officer Mike Thompson         │
│ 🎖️ Badge: SEC-045                              │
└─────────────────────────────────────────────────┘
```

**What This Means:**
- ✅ Employee used correct laptop
- ✅ Security verified at check-out
- ✅ Complete transaction
- ✅ No further action needed

### Scenario 3: End of Day Security Check

**Task:** Find all employees still in building with laptops

**Steps:**
1. Go to Laptop Tracking page
2. Set **Status Filter** to "Checked In Only"
3. Review the list
4. Check for any mismatches (red cards)
5. Verify physical security at exits

**What You See:**
- Count of checked-in laptops
- Which buildings they're in
- Any security alerts (mismatches)

### Scenario 4: Investigating Multiple Mismatches

**Task:** Review all instances of wrong laptop usage

**Steps:**
1. Go to Laptop Tracking page
2. Set **Match Filter** to "Mismatches Only"
3. Review all red-highlighted records
4. Export to CSV for reporting
5. Create action plan

**Statistics Show:**
- **Total Mismatches**: 2
- **Unchecked Mismatches**: 2 (both still in building)

**You'll See:**
- Mike Johnson - Wrong laptop, still inside
- David Martinez - Wrong laptop, still inside

### Scenario 5: Building-Specific Report

**Task:** Get all laptop records for Building 41

**Steps:**
1. Go to Laptop Tracking page
2. Set **Building Filter** to "Building 41"
3. Optional: Set date range (future feature)
4. Click "Export CSV"
5. Generate report

**Use Case:**
- Building manager needs monthly report
- Audit for specific building
- Compliance check for one location

---

## 📈 Best Practices

### For Security Officers:

**Daily Morning Routine:**
1. Check "Unchecked Mismatches" stat
2. Should be 0 at start of day
3. If not, investigate holdovers from previous day

**During the Day:**
1. Monitor "Checked In" count
2. Watch for new mismatch alerts (red cards)
3. Investigate mismatches immediately
4. Verify employee has legitimate reason

**End of Day:**
1. Filter "Checked In Only"
2. Verify all remaining laptops
3. Check out each employee properly
4. Enter your name and badge number
5. Ensure "Unchecked Mismatches" = 0

### For Admin Staff:

**Weekly Reviews:**
1. Export full CSV report
2. Review mismatch trends
3. Identify repeat offenders
4. Update laptop registrations if needed

**Monthly Audits:**
1. Compare check-in/check-out counts
2. Verify security officer compliance
3. Review average duration
4. Generate management reports

### For Compliance:

**Documentation:**
1. Export CSV regularly
2. Store in secure location
3. Maintain audit trail
4. Include in security reports

**Reporting:**
1. Mismatch rate percentage
2. Security verification rate
3. Building-by-building breakdown
4. Trend analysis

---

## 🔧 Technical Details

### Data Flow:

```
Employee Registers
    ↓ (Stores laptop info)
sessionStorage["userLaptop"] = "Dell Latitude 5420"
sessionStorage["userAssetNumber"] = "DST-001"
    ↓
Employee Checks In
    ↓ (Security scans QR)
Security Scanner reads QR code
    ↓ (Extracts data)
System compares:
  - Registered: Dell Latitude 5420 (DST-001)
  - Actual: [Scanned from QR]
    ↓
Match Check:
  if (registered === actual) {
    ✅ Green card, no alert
  } else {
    🚨 Red card, security alert
  }
    ↓
Check-Out:
  - Security officer name entered
  - Badge number recorded
  - Duration calculated
  - Status = "checked_out"
```

### Sample Data Structure:

```typescript
interface LaptopRecord {
  id: string;                          // "LAP-001"
  employeeId: string;                  // "USR-001"
  employeeName: string;                // "John Doe"
  registeredLaptop: string;            // "Dell Latitude 5420"
  registeredAssetNumber: string;       // "DST-001"
  checkedInLaptop: string;             // "Dell Latitude 5420"
  checkedInAssetNumber: string;        // "DST-001"
  isMatch: boolean;                    // true/false
  building: string;                    // "Building 41"
  floor: string;                       // "Ground Floor"
  block: string;                       // "Block A"
  checkInDate: string;                 // "2025-10-15"
  checkInTime: string;                 // "08:30 AM"
  checkOutDate?: string;               // "2025-10-15"
  checkOutTime?: string;               // "05:45 PM"
  checkedOutBySecurityOfficer?: string;// "Officer Mike Thompson"
  securityOfficerBadge?: string;       // "SEC-045"
  status: "checked_in" | "checked_out";
  duration?: string;                   // "9h 15m"
}
```

---

## 🎨 Visual Design

### Color Coding:

**Green** = ✅ Good
- Registered laptop match
- Check boxes on right side

**Red** = 🚨 Alert
- Unregistered laptop
- Security concern
- Entire card highlighted

**Blue** = ℹ️ Info
- Checked out status
- Security verification box

**Gray** = 📄 Neutral
- Registered laptop box (left side)
- Normal information

**Orange** = ⚠️ Warning
- Unchecked mismatches stat
- Requires attention

### Icons:

- 👤 User = Employee info
- 💻 Laptop = Laptop icon
- 🛡️ Shield = Security officer
- 🎖️ Badge = Officer badge
- ⚠️ AlertTriangle = Warning
- ✅ CheckCircle = Verified
- ❌ XCircle = Error
- 🕐 Clock = Time
- 📍 MapPin = Location

---

## 🆘 Troubleshooting

### Issue: No Records Showing

**Check:**
1. Are you logged in as admin?
2. Try clearing all filters
3. Check if data is being loaded
4. Refresh the page

### Issue: Can't Export CSV

**Check:**
1. Do you have records in the filtered view?
2. Check browser console for errors
3. Allow pop-ups if blocked
4. Try with no filters applied

### Issue: Mismatch Not Showing

**Check:**
1. Is the employee's laptop registered correctly?
2. Was check-in data captured properly?
3. Verify in User Management page
4. Check registration data

### Issue: Security Officer Name Not Showing

**Check:**
1. Was check-out completed by security?
2. Did officer enter their name and badge?
3. Is status = "checked_out"?
4. May need to complete check-out first

---

## 📞 Support

For help with Laptop Tracking:
- **Email**: support@pconnect.com
- **Phone**: +27 74 245 0193
- **Admin Portal**: /admin/laptops
- **This Guide**: `.same/laptop-tracking-guide.md`

---

## 🎓 Training Checklist

Before using Laptop Tracking in production:

- [ ] Understand the 5 statistics
- [ ] Know how to identify a mismatch
- [ ] Practice using all filters
- [ ] Test the search function
- [ ] Export a sample CSV report
- [ ] Review a normal check-in record
- [ ] Review a mismatch alert record
- [ ] Understand the color coding
- [ ] Know what to do when mismatch found
- [ ] Practice end-of-day routine

---

**Version**: 83
**Last Updated**: October 2025
**P-Connect Laptop Tracking** - Powered by DSTI
**Security Level**: Admin Only
**Purpose**: Laptop Security & Compliance Monitoring
