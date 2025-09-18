# TODO List for Post Status and Edit Improvements

## 1. Fix Status Options in AdminDashboard User-Uploaded Tab
- [x] Change status dropdown options to match model: pending, coming soon, approved
- [x] Update status display labels to be consistent

## 2. Fix Status Display in AdminDashboard Questions Tab
- [x] Ensure status labels match: pending, coming soon, approved
- [x] Remove inconsistent 'posted' or 'under review' mappings

## 3. Add Status Selection in AdminDashboard Create Post Tab
- [x] Add status dropdown in the create post form for admin
- [x] Default to 'pending'

## 4. Adjust Interaction Logic in UserDashboard PostCard
- [x] Modify canInteract to only allow for status === 'approved'
- [x] For 'coming soon', show post but disable like, download, link interactions

## 5. Add Edit Functionality in AdminDashboard Questions Tab
- [x] Add edit button for each post in questions tab
- [x] Implement inline edit similar to UserDashboard PostCard
- [x] Allow admin to edit title, content, courseCategory, file, link
- [x] Do not allow status edit in edit mode (separate dropdown)

## 6. Test Status Behavior
- Ensure pending posts are not visible to users
- Coming soon posts are visible but non-interactive
- Approved posts allow full interaction
- Admin can see and manage all posts

## 7. Add Status to PYQ Model
- [x] Add status field to PYQ model with enum ['pending', 'coming soon', 'approved'], default 'approved'
- [x] Update pyqRoutes.js to handle status in creation
- [x] Ensure PYQ.js hides download and preview links when status is 'coming soon'
