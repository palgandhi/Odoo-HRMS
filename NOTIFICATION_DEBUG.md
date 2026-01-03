# 🔔 Notification System - Testing & Debugging Guide

## 🐛 **Debugging the Read State Issue**

### **What We Fixed:**

1. **Added localStorage persistence** - Read notifications are now saved to browser storage
2. **Added debug logging** - Console logs show when notifications are marked as read
3. **Improved click handling** - Dropdown stays open briefly when clicking notification
4. **Event propagation** - Prevents dropdown from closing immediately

### **How to Test:**

#### **Step 1: Open Browser Console**
- Press `F12` or `Cmd+Option+I` (Mac)
- Go to "Console" tab

#### **Step 2: Check localStorage**
In the console, run:
```javascript
localStorage.getItem('dayflow_read_notifications')
```

You should see an array of notification IDs like:
```json
["leave-123", "leave-status-456", "attendance-missing-2026-01-03"]
```

#### **Step 3: Test the Flow**

1. **Login** → Bell shows unread count
2. **Click bell** → Dropdown opens
3. **Click a notification** → Watch console logs:
   ```
   [NotificationService] Marked as read: leave-123
   [NotificationService] All read IDs: ["leave-123"]
   ```
4. **Dropdown closes** after 100ms
5. **Click bell again** → Notification should still be marked as read
6. **Wait 30 seconds** → Notifications auto-refresh
7. **Check console**:
   ```
   [NotificationService] Fetching notifications. Read IDs from localStorage: ["leave-123"]
   ```
8. **Verify** → Previously read notification should still show as read

---

## 🔍 **Common Issues & Solutions**

### **Issue 1: Notifications show as unread after refresh**

**Cause**: localStorage might be disabled or cleared

**Solution**:
1. Check if localStorage is enabled:
   ```javascript
   typeof localStorage !== 'undefined'
   ```
2. Check browser privacy settings (incognito mode disables localStorage)
3. Clear and reset:
   ```javascript
   localStorage.removeItem('dayflow_read_notifications')
   ```

### **Issue 2: Notification count doesn't update**

**Cause**: State not updating after marking as read

**Solution**:
- Check console logs - should see "Marked as read"
- Verify the notification ID matches
- Check if `onMarkAsRead` is being called in Dashboard

### **Issue 3: Dropdown closes immediately**

**Cause**: Click event bubbling

**Solution**: Already fixed with `e.stopPropagation()` and `setTimeout`

---

## 📊 **How It Works**

### **1. Fetching Notifications**
```typescript
fetchNotifications() {
  1. Load read IDs from localStorage
  2. Fetch notifications from Odoo
  3. Mark each notification as read/unread based on localStorage
  4. Return sorted notifications
}
```

### **2. Marking as Read**
```typescript
markAsRead(id) {
  1. Get current read IDs from localStorage
  2. Add new ID to the set
  3. Save back to localStorage
  4. Update local state
  5. Log to console
}
```

### **3. Auto-Refresh**
```typescript
useEffect(() => {
  fetchNotifications(); // Initial fetch
  setInterval(fetchNotifications, 30000); // Every 30s
}, [session]);
```

---

## 🧪 **Manual Testing Checklist**

- [ ] Login and see notification count
- [ ] Click bell to open dropdown
- [ ] Click a notification
- [ ] Verify console shows "Marked as read"
- [ ] Close dropdown
- [ ] Reopen dropdown
- [ ] Verify notification is still marked as read
- [ ] Wait 30 seconds
- [ ] Verify notification stays marked as read
- [ ] Refresh page (F5)
- [ ] Verify notification is STILL marked as read
- [ ] Check localStorage in console
- [ ] Clear localStorage and verify notifications reset

---

## 🔧 **Debugging Commands**

### **View all read notifications:**
```javascript
JSON.parse(localStorage.getItem('dayflow_read_notifications'))
```

### **Clear all read notifications:**
```javascript
localStorage.removeItem('dayflow_read_notifications')
```

### **Manually mark a notification as read:**
```javascript
const readIds = JSON.parse(localStorage.getItem('dayflow_read_notifications') || '[]');
readIds.push('leave-123');
localStorage.setItem('dayflow_read_notifications', JSON.stringify(readIds));
```

### **Check notification state in React DevTools:**
1. Install React DevTools extension
2. Open DevTools → Components tab
3. Find `Dashboard` component
4. Check `notifications` state
5. Verify `read: true` for clicked notifications

---

## ✅ **Expected Behavior**

### **Scenario 1: First Time User**
1. Login → See 3 unread notifications
2. Click notification → Marked as read
3. Badge shows 2 unread
4. Refresh page → Still shows 2 unread ✅

### **Scenario 2: Returning User**
1. Login → See previously read notifications as read ✅
2. Only new notifications show as unread ✅
3. Badge count is accurate ✅

### **Scenario 3: Auto-Refresh**
1. Notifications refresh every 30s ✅
2. Read state persists across refreshes ✅
3. New notifications appear as unread ✅

---

## 🎯 **If Issue Persists**

If notifications still show as unread after clicking:

1. **Check console for errors**
2. **Verify localStorage is working**:
   ```javascript
   localStorage.setItem('test', 'value');
   console.log(localStorage.getItem('test')); // Should print "value"
   ```
3. **Check if browser is in incognito mode** (localStorage disabled)
4. **Try a different browser**
5. **Clear all browser data and retry**

---

## 📝 **Next Steps**

Once confirmed working:
1. Remove console.log statements (or keep for demo)
2. Add visual feedback (toast notification)
3. Add "Clear all" button
4. Add notification preferences

---

**Status**: Debugging enabled with console logs
**Test it now** and check the browser console! 🔍
