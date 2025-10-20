# 📊 P-Connect Admin Portal Guide

## Overview
The P-Connect Admin Portal is a comprehensive management system for DSI administrators to oversee all aspects of the P-Connect system including users, check-ins, and bookings.

---

## 🔐 Access

**Admin Portal URL**: https://same-k1aagq7et6e-latest.netlify.app/admin/login

**Login Credentials** (Demo):
- Email: admin@dsti.gov.za
- Password: (any password for demo)

---

## 📱 Main Features

### 1. Dashboard (`/admin`)

**Overview Statistics:**
- Total registered users
- Active check-ins today
- Total check-ins (all time)
- Total bookings

**Today's Overview:**
- Bookings today
- Bookings this week
- Active users

**Usage Statistics:**
- Average check-in time
- Average check-out time
- Most used floor

**Quick Actions:**
- Manage Users
- Manage Bookings
- Download Reports

---

### 2. User Management (`/admin/users`)

**Features:**
- View all registered users in table format
- Search by name, email, or phone number
- Filter by:
  - Building (Building 41, Building 42, DSTI)
  - Programme (Programme 1A, 1B, 2, 3, etc.)
- Export filtered results to CSV

**User Table Columns:**
- User (Name + ID)
- Contact (Email + Phone)
- Building
- Programme
- Total Check-Ins
- Actions (View, Edit, Delete)

**Actions:**
- **View**: Opens individual user detail page
- **Edit**: Edit user information (coming soon)
- **Delete**: Remove user from system
- **Export CSV**: Download user list with all details

**Sample CSV Export:**
```
ID,First Name,Last Name,Email,Phone,Building,Programme,Check-Ins
USR-001,John,Doe,john.doe@example.com,+27 82 123 4567,Building 41,Programme 1A,45
```

---

### 3. Individual User Detail (`/admin/users/[id]`)

**User Information:**
- Email address
- Phone number
- Building assignment
- Programme/Department
- Laptop model
- Asset number
- Member since date

**Monthly Statistics:**
- October: Check-ins + Total hours
- September: Check-ins + Total hours
- August: Check-ins + Total hours

**Check-In History:**
- Complete list of all check-ins
- For each check-in:
  - Date
  - Time in / Time out
  - Duration
  - Floor
  - Block
  - Building

**Download Report:**
- Generates comprehensive CSV report
- Includes user info, check-in history, and monthly summary
- File name: `[FirstName]-[LastName]-checkin-report.csv`

---

### 4. Booking Management (`/admin/bookings`)

**Statistics:**
- Bookings today
- Bookings this week
- Active meeting rooms

**Features:**
- View all bookings
- Search by user name, space name, or booking ID
- Filter by:
  - Type (Desk, Office, Meeting Room)
  - Building
  - Date

**Booking Information:**
- Space name and type
- User name and email
- Building and floor
- Date and time
- Status (Confirmed/Cancelled)
- Guest list (for meeting rooms)

**Actions:**
- **Edit**: Modify booking details
- **Invite**: Send email invites to guests
- **Delete**: Cancel and remove booking
- **Export CSV**: Download booking list

**Sample CSV Export:**
```
ID,User,Email,Type,Space,Building,Date,Time,Status
BK-001,John Doe,john.doe@example.com,meeting_room,Meeting Room 3A,Building 41,2025-10-20,14:00-16:00,confirmed
```

---

### 5. Check-In History (`/admin/checkins`)

**Multi-Filter Options:**
- Search by name or ID
- Filter by:
  - Building
  - Floor (Ground, First, Second)
  - Block (A, B, C, D, etc.)
  - Programme
  - Date

**Check-In Information:**
- User name and programme
- Check-in ID
- Date
- Time in / Time out
- Duration
- Location (Building, Floor, Block)
- Link to user profile

**Export Functionality:**
- Export filtered results to CSV
- Includes all check-in details
- File name: `checkin-history.csv`

---

### 6. Reports & Analytics (`/admin/reports`)

**Report Filters:**
- Start date
- End date
- Building
- Programme

**Available Reports:**

#### 1. User List Report
- Complete list of all users
- Includes contact info, building, programme
- Total check-ins per user

#### 2. Check-In History Report
- Detailed check-in/out records
- Time tracking and duration
- Location information

#### 3. Booking Report
- All bookings with user details
- Space and time information
- Status tracking

#### 4. Usage Statistics
- Total users and active today
- Total check-ins and bookings
- Most used floor and programme
- Average check-in/out times

#### 5. Monthly Summary
- Check-ins per month
- Bookings per month
- Active users per month
- Total hours per month

#### 6. Programme Report
- Activity breakdown by programme
- Users, check-ins, bookings per programme
- Average hours per user

**Download Process:**
1. Select report type
2. Set date range (optional)
3. Apply building/programme filters (optional)
4. Click "Download Report"
5. CSV file downloads automatically

---

## 📊 Sample Use Cases

### Use Case 1: Monthly User Activity Report

**Scenario**: HR wants to see which users were most active in October

**Steps:**
1. Go to User Management
2. Export user list to CSV
3. Sort by "Check-Ins" column
4. Identify top users
5. Click individual users to see detailed history

### Use Case 2: Programme-Specific Analysis

**Scenario**: Manager wants to see Programme 1A check-in patterns

**Steps:**
1. Go to Check-In History
2. Filter by "Programme 1A"
3. Review the filtered list
4. Export to CSV for further analysis
5. Go to Reports → Programme Report for summary

### Use Case 3: Building Usage Report

**Scenario**: Facilities team needs occupancy data for Building 41

**Steps:**
1. Go to Check-In History
2. Filter by "Building 41"
3. Set date range (e.g., last month)
4. Review floor and block distribution
5. Export data for capacity planning

### Use Case 4: Meeting Room Utilization

**Scenario**: Admin needs to track meeting room bookings

**Steps:**
1. Go to Booking Management
2. Filter by Type: "Meeting Room"
3. Review booking frequency
4. Download Booking Report for analysis
5. Check which rooms are most popular

---

## 🎨 Design & Branding

### Color Scheme:
- **Primary**: Blue (#265e91) - P-Connect brand
- **Success**: Green - Active/Confirmed states
- **Warning**: Orange - Pending states
- **Error**: Red - Cancelled/Deleted states

### Logos:
- **P-Connect Logo**: Top left of every page
- **DSTI Logo**: Top right badge showing client organization

### Mobile Responsive:
- Optimized for tablet and desktop use
- Mobile hamburger menu on small screens
- Responsive tables with horizontal scroll

---

## 🔒 Security & Permissions

### Current Implementation:
- Session-based authentication
- Admin login required for all pages
- Auto-redirect to login if not authenticated

### Future Enhancements:
- Role-based access control (Super Admin, Manager, Viewer)
- Audit logs for all admin actions
- Two-factor authentication
- IP whitelisting

---

## 📝 Data Export Formats

All exports are in **CSV (Comma-Separated Values)** format.

**Why CSV?**
- Opens in Excel, Google Sheets, Numbers
- Easy to import into databases
- Lightweight and universal format
- Can be processed by analytics tools

**Export File Naming:**
- User List: `users-export.csv`
- Check-Ins: `checkin-history.csv`
- Bookings: `bookings-export.csv`
- Individual User: `[Name]-checkin-report.csv`
- Reports: `[report-type]-report-[date].csv`

---

## 🚀 Quick Start Guide

### For New Admins:

1. **Login**
   - Go to `/admin/login`
   - Enter credentials
   - Click "Login to Admin Portal"

2. **Familiarize with Dashboard**
   - Review current statistics
   - Check today's activity
   - Note quick action buttons

3. **Explore User Management**
   - Browse user list
   - Try search and filters
   - View a user's detail page

4. **Check Recent Activity**
   - Visit Check-In History
   - Filter by today's date
   - See who's currently in the building

5. **Download a Report**
   - Go to Reports page
   - Select "Usage Statistics"
   - Download and review

---

## 📞 Support

For admin portal assistance:
- **Email**: support@pconnect.com
- **Phone**: +27 74 245 0193
- **Documentation**: See this guide

---

## 🔄 Version History

**Version 72** (Current)
- Initial admin portal release
- Complete user management
- Booking management system
- Check-in history with filters
- 6 report types
- CSV export functionality

**Planned Features:**
- User add/edit modals
- Meeting room guest invitations
- Real-time dashboard updates
- Advanced analytics charts
- Bulk user import
- Email notifications to users

---

**Last Updated**: October 2025
**P-Connect Admin Portal** - Powered by DSTI
