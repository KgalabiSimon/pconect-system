# Security Checkpoint Application Guide

## 🔐 Overview
The Security Checkpoint Application is a dedicated tool for security personnel to manage building access control, monitor occupancy, and track visitors in real-time.

## 📍 Access URLs
- **Login**: `/security/login`
- **Main Checkpoint**: `/security`
- **Phone Check-In**: `/security/phone-checkin`
- **Employee Register**: `/security/register`
- **Visitor Register**: `/security/visitors`
- **Building Statistics**: `/security/stats`

## 🎯 Key Features

### 1. **Main Checkpoint Screen** (`/security`)
**Split-Screen Design:**
- **Top Half**: Live camera view for QR code scanning
  - Uses device back camera
  - Visual scanning frame with corner indicators
  - Real-time scan feedback
  - Displays last scan result

- **Bottom Half**: Controls and statistics
  - 3 real-time stats cards:
    - Total in Building (blue)
    - Employees (green)
    - Visitors (orange)
  - Action buttons:
    - Phone Check-In
    - View Register

**Features:**
- Automatic camera initialization
- QR code detection
- Real-time stats updates
- Last scan notification

### 2. **Security Login** (`/security/login`)
**Authentication System:**
- Badge number input
- PIN (6-digit) with show/hide toggle
- Session-based authentication
- Secure access control

### 3. **Phone Number Check-In** (`/security/phone-checkin`)
**Manual Entry System:**
- Phone number search
- User lookup and verification
- Check-in/Check-out buttons
- Recent activity log
- For users without phones who filled guest tablet forms

**Features:**
- Real-time phone number search
- Display user photo (initials)
- Show user details (name, type, building)
- Quick check-in/out actions
- Activity history

### 4. **Employee Register** (`/security/register`)
**Complete Employee Tracking:**
- All employees currently in building
- Search by name, floor, or block
- Export to CSV functionality

**Displayed Information:**
- Photo/Initials
- Full name
- Employee type
- Floor location
- Block assignment
- Phone number
- Check-in time
- Status badge

### 5. **Visitor Register** (`/security/visitors`)
**Visitor Management:**
- All visitors currently in building
- Company and host information
- Purpose of visit
- Search and export capabilities

**Displayed Information:**
- Photo/Initials
- Full name
- Company name
- Host employee
- Floor & block location
- Phone number
- Check-in time
- Visit purpose
- Visitor type badge

### 6. **Building Statistics** (`/security/stats`)
**Real-Time Analytics:**

**Main Stats:**
- Total in Building
- Employees count
- Visitors count
- Check-ins today

**Additional Metrics:**
- Peak time periods
- Average stay duration
- Auto-refresh every 30 seconds

**Floor Distribution:**
- Visual breakdown by floor
- Percentage distribution
- Count per floor
- Progress bar visualization

**Recent Activity:**
- Live activity feed
- Check-in/out actions
- Timestamp for each action
- User type indication

## 🎨 Design System

### Color Coding:
- **Blue** (#3B82F6): Total/General
- **Green** (#16A34A): Employees
- **Orange** (#EA580C): Visitors
- **Purple** (#9333EA): Trends/Analytics
- **Gray-900** (#111827): Background
- **Gray-800** (#1F2937): Cards

### Layout:
- Dark theme (optimized for security stations)
- Large touch targets (tablet-friendly)
- High contrast for readability
- Split-screen for scanning view

## 🔄 User Flow

### Security Officer Workflow:
```
1. Login with badge & PIN
   ↓
2. Main Checkpoint Screen
   - Camera ready for QR scanning
   - Stats visible at bottom
   ↓
3. When user approaches:
   - User presents QR code
   - Scan QR code with camera
   - System auto check-in/out
   - Confirmation shown
   ↓
4. Alternative: Phone Check-In
   - User provides phone number
   - Security enters number
   - Search for user
   - Manual check-in/out
   ↓
5. Monitoring:
   - View employee register
   - View visitor register
   - Check building statistics
   - Export reports as needed
```

## 📊 Statistics & Reporting

### Real-Time Data:
- Total occupancy
- Employee vs Visitor ratio
- Floor distribution
- Peak times
- Average stay duration
- Check-in/out trends

### Export Capabilities:
- Employee register → CSV
- Visitor register → CSV
- Daily reports
- Activity logs

## 🔍 Search & Filter

### Employee Register Search:
- By name
- By floor
- By block
- Live results

### Visitor Register Search:
- By visitor name
- By company
- By host employee
- Live results

## 🛡️ Security Features

### Access Control:
- Badge-based login
- PIN authentication
- Session management
- Auto-logout option

### Data Protection:
- Secure session storage
- Real-time validation
- Activity logging
- Audit trail

## 📱 Device Compatibility

### Optimized For:
- **Tablets** (primary)
  - iPad
  - Android tablets
  - Surface devices

- **Desktops** (backup)
  - Workstation monitors
  - Security kiosks

### Camera Support:
- Back camera (environment)
- Front camera (fallback)
- External webcams
- USB cameras

## 🚀 Future Enhancements

### Planned Features:
- [ ] Facial recognition integration
- [ ] Automated QR code scanning
- [ ] Visitor badge printing
- [ ] Emergency evacuation mode
- [ ] Multi-building support
- [ ] API integration with HR systems
- [ ] SMS notifications
- [ ] Email alerts for security events
- [ ] Advanced analytics dashboard
- [ ] Historical data reports

## 📝 Notes

### Best Practices:
1. Keep tablet charged and mounted
2. Clean camera lens regularly
3. Ensure good lighting for QR scanning
4. Export registers daily
5. Monitor stats throughout the day
6. Verify visitor information
7. Log out at end of shift

### Troubleshooting:
- **Camera not working**: Check browser permissions
- **QR scan failing**: Clean lens, improve lighting
- **Stats not updating**: Click refresh button
- **Search not working**: Check spelling
- **Export failing**: Check browser downloads settings
