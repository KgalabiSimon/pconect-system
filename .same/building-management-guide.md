# 🏢 Building Management System Guide

## Overview
The Building Management System allows DSTI administrators to manage all buildings, desks, offices, and meeting rooms that users can book through the P-Connect platform.

---

## 🚀 Quick Start

### Access Building Management
1. Login to Admin Portal: https://same-k1aagq7et6e-latest.netlify.app/admin/login
2. Click "Building Management" from the sidebar or dashboard
3. Or navigate directly to: https://same-k1aagq7et6e-latest.netlify.app/admin/buildings

---

## 📋 Main Features

### 1. Building List Overview

**What You See:**
- Grid of all buildings with:
  - Building name and ID
  - Address
  - Total floors and blocks
  - Total spaces count
  - Breakdown: Desks, Offices, Meeting Rooms
  - Action buttons

**Available Actions:**
- ✅ **Add Building** - Create new building
- 🔍 **Search** - Find buildings by name, address, or ID
- 👁️ **Manage Spaces** - View and edit spaces in a building
- ✏️ **Edit** - Update building details
- 🗑️ **Delete** - Remove building (also deletes all associated spaces)

---

## 🏗️ Managing Buildings

### Adding a New Building

**Steps:**
1. Click the "Add Building" button (top right)
2. Fill in the form:
   - **Building Name** * (required) - e.g., "Building 41"
   - **Address** * (required) - Full street address
   - **Number of Floors** - How many floors (default: 1)
   - **Number of Blocks** - How many blocks per floor (default: 1)
3. Click "Create Building"
4. You'll be redirected to the building detail page to add spaces

**Example:**
```
Building Name: Building 41
Address: 123 Innovation Drive, Pretoria, 0001
Number of Floors: 3
Number of Blocks: 9
```

### Editing a Building

**Steps:**
1. Click the "Edit" (pencil icon) button on a building card
2. Update the details
3. Click "Save Changes"

**Note:** Changing floors or blocks won't affect existing spaces. You manage spaces separately.

### Deleting a Building

**Steps:**
1. Click the "Delete" (trash icon) button on a building card
2. Confirm the deletion

**⚠️ Warning:** This will delete ALL spaces (desks, offices, meeting rooms) associated with this building. This action cannot be undone.

---

## 🪑 Managing Spaces (Desks, Offices, Meeting Rooms)

### Accessing Space Management

1. From the Building List, click "Manage Spaces" on any building
2. Or navigate to: `/admin/buildings/[BUILDING-ID]`

### Building Detail Page Overview

**Top Statistics:**
- Total Spaces
- Total Desks (green)
- Total Offices (blue)
- Total Meeting Rooms (purple)

**Filter Options:**
- All Space Types
- Desks Only
- Offices Only
- Meeting Rooms Only

---

## ➕ Adding a New Space

**Steps:**
1. Click "Add Space" button (top right)
2. Fill in the comprehensive form:

### Basic Information
- **Space Name** * - e.g., "Hot Desk 101", "Private Office 201", "Meeting Room 3A"
- **Space Type** * - Desk, Office, or Meeting Room
- **Floor** * - Ground Floor, First Floor, Second Floor, Third Floor
- **Block** * - Block A, B, C, D, E, F, G, H, I
- **Capacity** - Number of people (default: 1 for desks)

### Details
- **Description** - Brief description (shown to users when booking)
- **Image URL** - Link to space image (optional, defaults to placeholder)

### Amenities
Select all that apply (visual selector with icons):
- 📶 WiFi
- 🖥️ Monitor
- ☕ Coffee Machine
- 📹 Video Conferencing
- 📽️ Projector
- ⬜ Whiteboard
- 🔌 Power Outlet
- 🪑 Standing Desk
- 📞 Conference Phone

3. Click "Add Space"

**Example - Hot Desk:**
```
Space Name: Hot Desk 101
Space Type: Desk
Floor: Ground Floor
Block: Block A
Capacity: 1
Description: Modern hot desk with ergonomic chair and dual monitor setup
Amenities: WiFi, Monitor, Power Outlet
```

**Example - Meeting Room:**
```
Space Name: Meeting Room 3A
Space Type: Meeting Room
Floor: Second Floor
Block: Block G
Capacity: 10
Description: Modern meeting room with state-of-the-art AV equipment
Amenities: WiFi, Projector, Whiteboard, Video Conferencing, Coffee Machine
```

---

## ✏️ Editing a Space

**Steps:**
1. Find the space in the list
2. Click "Edit" button
3. Update any details
4. Click "Save Changes"

**What You Can Edit:**
- ✅ Name
- ✅ Type (desk → office → meeting room)
- ✅ Floor
- ✅ Block
- ✅ Capacity
- ✅ Description
- ✅ Image URL
- ✅ Amenities (add or remove)

---

## 🗑️ Deleting a Space

**Steps:**
1. Find the space in the list
2. Click "Delete" button
3. Confirm the deletion

**Note:** This only removes the space from the system. The building itself remains.

---

## 📊 Space Information Display

Each space card shows:

**Header:**
- Space name
- Type badge (colored)
- Space ID

**Details Grid:**
- Floor
- Block
- Capacity (with person icon)
- Status (Available/Occupied)

**Amenities:**
- Blue pills showing all selected amenities

**Actions:**
- Edit button
- Delete button

---

## 🔄 How This Connects to User Bookings

### Data Flow:
```
Admin adds/edits space in Building Management
        ↓
Space data saved with all details
        ↓
Users see this exact information when browsing available spaces
        ↓
Users can book based on:
  - Type (desk/office/meeting room)
  - Building and location (floor/block)
  - Capacity
  - Amenities
  - Images and descriptions
```

### What Users See:
When a user goes to book a space, they will see:
- **Building List** - All buildings you've created
- **Space Type** - Desks, Offices, Meeting Rooms (as defined by you)
- **Availability View** - Spaces with images, descriptions, amenities
- **All Details** - Floor, block, capacity, amenities you've configured

---

## 💡 Best Practices

### Building Organization
1. **Use Clear Names** - "Building 41" instead of "Bldg41"
2. **Complete Addresses** - Include street, city, postal code
3. **Accurate Floor/Block Counts** - Should match physical layout

### Space Setup
1. **Descriptive Names** - Include floor/block in name for easy identification
2. **Accurate Capacity** - Set realistic occupancy limits
3. **High-Quality Images** - Use professional photos of actual spaces
4. **Detailed Descriptions** - Help users understand what they're booking
5. **Complete Amenities** - List all available facilities

### Naming Conventions

**Recommended Format:**
- Desks: "Hot Desk [Number]" or "Desk [Floor][Block]-[Number]"
  - Example: "Hot Desk 101", "Desk 1A-05"
- Offices: "Private Office [Number]" or "Office [Floor][Block]"
  - Example: "Private Office 201", "Office 2D"
- Meeting Rooms: "Meeting Room [Floor][Block]" or "[Name] Conference Room"
  - Example: "Meeting Room 3A", "Executive Conference Room"

---

## 📸 Image Best Practices

### Recommended Image URLs:
- Use Unsplash for free professional images
- Desk images: `https://images.unsplash.com/photo-1497366216548-37526070297c?w=400`
- Office images: `https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400`
- Meeting room images: `https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400`

### Tips:
- Use `?w=400` to optimize image size
- Ensure images show the actual space or similar
- Consistent image dimensions for better UI

---

## 🎯 Common Scenarios

### Scenario 1: Setting Up a New Building

**Task:** Add Building 41 with 3 floors, 25 desks, 10 offices, 10 meeting rooms

**Steps:**
1. Add Building: "Building 41", 3 floors, 9 blocks
2. For Desks (25 total):
   - Add "Hot Desk 101" (Ground Floor, Block A, Capacity 1)
   - Add "Hot Desk 102" (Ground Floor, Block A, Capacity 1)
   - ... continue for all 25
3. For Offices (10 total):
   - Add "Private Office 201" (First Floor, Block D, Capacity 4)
   - ... continue for all 10
4. For Meeting Rooms (10 total):
   - Add "Meeting Room 3A" (Second Floor, Block G, Capacity 10)
   - ... continue for all 10

### Scenario 2: Updating Space Amenities

**Task:** Add video conferencing to all meeting rooms

**Steps:**
1. Go to Building Detail page
2. Filter by "Meeting Rooms Only"
3. For each meeting room:
   - Click "Edit"
   - Select "Video Conferencing" amenity
   - Click "Save Changes"

### Scenario 3: Closing a Floor

**Task:** Temporarily remove all spaces from First Floor for maintenance

**Steps:**
1. Go to Building Detail page
2. Filter by "First Floor" (if filter available)
3. Or manually identify First Floor spaces
4. Delete each space individually
5. When maintenance is done, re-add the spaces

---

## 📈 Space Statistics

The system automatically calculates and displays:

**Per Building:**
- Total Spaces count
- Desks count
- Offices count
- Meeting Rooms count

**On Building Detail Page:**
- Real-time count of each space type
- Color-coded statistics (green, blue, purple)

---

## 🔐 Permissions & Access

### Who Can Access Building Management?
- Only logged-in admin users
- Requires admin authentication
- Access via `/admin/buildings`

### What Admins Can Do:
- ✅ View all buildings and spaces
- ✅ Add new buildings
- ✅ Edit building details
- ✅ Delete buildings
- ✅ Add new spaces (desks, offices, meeting rooms)
- ✅ Edit space details
- ✅ Delete spaces
- ✅ Update amenities
- ✅ Change availability status

### What Regular Users See:
- Only available spaces for booking
- Cannot edit or delete
- See same information but in booking context

---

## 🆘 Troubleshooting

### Issue: Can't add a space
**Check:**
- All required fields filled? (Name, Type, Floor, Block)
- Are you logged in as admin?
- Try refreshing the page

### Issue: Space not showing in user booking flow
**Check:**
- Is the space set to "Available"?
- Is the building active?
- Check if filters are hiding it

### Issue: Changes not saving
**Check:**
- Internet connection
- Admin session still active
- Try logging out and back in

---

## 📞 Support

For help with Building Management:
- **Email**: support@pconnect.com
- **Phone**: +27 74 245 0193
- **Admin Guide**: This document

---

## 🎓 Training Checklist

Before managing buildings in production:

- [ ] Practice adding a test building
- [ ] Practice adding all 3 space types (desk, office, meeting room)
- [ ] Practice editing space details
- [ ] Practice selecting multiple amenities
- [ ] Test filtering spaces by type
- [ ] Understand the delete confirmation warnings
- [ ] Review how data flows to user booking system
- [ ] Take screenshots of your building setup for documentation

---

**Version**: 77
**Last Updated**: October 2025
**P-Connect Building Management** - Powered by DSTI
