# KIẾN TRÚC HỆ THỐNG DANH BẠ & THÔNG BÁO

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        SOCKET.IO SERVER                         │
│  Events: notification:new, friendRequest:received, post:liked   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │ socket-provider │
                    │   (context)     │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    ▼                        ▼                        ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  /contacts   │    │ /notifications   │    │  /messages       │
│   (page)     │    │    (page)        │    │  (real-time)     │
└──────────────┘    └──────────────────┘    └──────────────────┘
    │                        │                        │
    ├─ useContacts()         ├─ useNotifications()   └─ useMessages()
    ├─ useFriendRequests()   ├─ useMarkAsRead()      + useSocket()
    ├─ useAcceptFR()         └─ useMarkAllAsRead()
    └─ useRemoveFriend()
         │                        │                        │
         └────────────┬───────────┴────────────┬───────────┘
                      │                        │
          ┌───────────▼──────────┐  ┌──────────▼────────────┐
          │  TanStack Query      │  │   Zustand Auth        │
          │  (Server State)      │  │   (Client State)      │
          └───────────┬──────────┘  └──────────┬────────────┘
                      │                        │
          ┌───────────▼──────────┐  ┌──────────▼────────────┐
          │   API Services       │  │   localStorage        │
          │  /contact.ts         │  │   auth-token cookie   │
          │  /notification.ts    │  │                       │
          └───────────┬──────────┘  └───────────────────────┘
                      │
                      │ Axios with JWT
                      │
          ┌───────────▼──────────────────┐
          │   Backend API                │
          │  http://localhost:5000/api   │
          └──────────────────────────────┘
```

---

## 🗂️ File Structure

```
chatmenow/
├── api/
│   ├── auth.ts              (Existing)
│   ├── chat.ts              (Existing)
│   ├── post.ts              (Existing)
│   ├── contact.ts           ✨ NEW - Friend management
│   └── notification.ts      ✨ NEW - Notification service
│
├── hooks/
│   ├── use-auth.ts          (Existing)
│   ├── use-chat.ts          (Existing)
│   ├── use-post.ts          (Existing)
│   ├── use-contact.ts       ✨ NEW - useContacts, useAcceptFR, etc.
│   └── use-notification.ts  ✨ NEW - useNotifications, useMarkAsRead, etc.
│
├── components/
│   ├── chat/                (Existing)
│   ├── providers/
│   │   └── socket-provider.tsx  📝 UPDATED - Real-time events
│   ├── contact/
│   │   └── friend-requests-list.tsx  ✨ NEW
│   └── ...
│
├── app/
│   └── (main)/
│       ├── contacts/
│       │   └── page.tsx     📝 UPDATED - Full integration
│       └── notifications/
│           └── page.tsx     📝 UPDATED - Full integration
│
└── types/
    ├── friend-request.ts    📝 UPDATED - Added sender/receiver objects
    ├── notification.ts      (Existing)
    └── user.ts              (Existing)
```

---

## 🔀 Data Flow Examples

### 1️⃣ Chấp Nhận Lời Mời Kết Bạn

```
User clicks "Chấp nhận"
        │
        ▼
handleAcceptFriendRequest(requestId)
        │
        ▼
useAcceptFriendRequest().mutate(requestId)
        │
        ▼
POST /users/friend-requests/:requestId/accept
        │
        ▼
✅ Backend returns { success: true }
        │
        ├─ invalidateQueries(["friend-requests"])
        │  └─ useQuery refetch → ui update
        │
        ├─ invalidateQueries(["contacts"])
        │  └─ useQuery refetch → refresh bạn bè
        │
        └─ toast.success("Đã chấp nhận...")
```

### 2️⃣ Nhận Thông Báo Real-time

```
Backend gửi sự kiện Socket.IO
        │
        ▼
socketInstance.on("notification:new", (notification) => {
        │
        ├─ setQueryData(["notifications"], ...)
        │  └─ Cập nhật cache ngay lập tức
        │
        ├─ toast.info(message)
        │  └─ Hiển thị cảnh báo
        │
        └─ unreadCount++
           └─ Tăng bộ đếm
});
```

### 3️⃣ Gửi Tin Nhắn & Socket Real-time

```
User types message
        │
        ▼
handleSendMessage(text)
        │
        ├─ useSendMessage.mutate()
        │  └─ POST /chat/messages
        │
        ├─ Socket.IO "typing" event
        │
        └─ Socket.IO "stopTyping" event
            
Backend sends message
        │
        ▼
socketInstance.on("newMessage", (message) => {
        │
        └─ setQueryData(["messages", conversationId], ...)
           └─ Cache update
```

---

## 🎯 Key Features

### ✅ Optimistic Updates
- UI cập nhật ngay trước khi server confirm
- Rollback nếu lỗi
- Smooth user experience

### ✅ Real-time Synchronization
- Socket.IO listeners tự động invalidate query
- Multiple browser tabs sync
- Push notifications

### ✅ Query Caching
- Queries được cache dựa vào queryKey
- Auto-refetch mỗi 30s cho notifications
- Manual refetch khi cần

### ✅ Loading States
- Skeleton loading components
- Disabled buttons khi pending
- Loading spinners

### ✅ Error Handling
- Toast error messages
- Try-catch trong mutations
- User-friendly error text

### ✅ Search & Filter
- Realtime search bạn bè
- Filter bạn bè theo search query
- Responsive grid layout

---

## 🧪 Testing Scenarios

### Contact Management
```
1. ✓ Load friends list
   - useFriendRequests() → list pending
   - useContacts() → list active friends

2. ✓ Accept friend request
   - Modal shows "Chấp nhận"
   - Click → mutation → friend-requests updated
   - Contacts list updated

3. ✓ Remove friend
   - Hover → show × button
   - Click → mutation → contacts updated

4. ✓ Search friends
   - Type in search → filter realtime
   - Clear search → show all
```

### Notifications
```
1. ✓ Load notifications
   - useNotifications() → list from API
   - unreadCount displayed

2. ✓ Mark as read
   - Click notification → mark as read
   - Badge disappears

3. ✓ Accept from notification
   - Notification type: friend_request
   - Buttons: Chấp nhận | Từ chối
   - Click → same as contacts modal

4. ✓ Real-time notification
   - Backend sends notification:new
   - Socket receives → toast shows
   - Cache updates
   - List refreshes
```

### Real-time Events
```
1. ✓ Friend request notification
   - Backend → notification:new
   - Type: friend_request
   - Socket → toast → list update

2. ✓ Like notification
   - Post liked → notification:new
   - Toast: "Ai đó đã thích bài viết"
   - Feed invalidate

3. ✓ Message typing indicator
   - User types → emit "typing"
   - Others receive userTyping event
   - Show "đang soạn tin..."
```

---

## 🔐 Security Considerations

- ✅ JWT token in headers (interceptor)
- ✅ API endpoints require auth
- ✅ Socket.IO auth with token
- ✅ Cookie httpOnly for token
- ✅ Type-safe frontend validation
- ✅ Backend should validate friend status

---

## 📱 Responsive Design

```
Mobile (1 column)
┌────────────────┐
│  Friend Card   │
├────────────────┤
│  Friend Card   │
├────────────────┤
│  Friend Card   │
└────────────────┘

Tablet (2-3 columns)
┌────────────┬────────────┐
│   Card     │   Card     │
├────────────┼────────────┤
│   Card     │   Card     │
└────────────┴────────────┘

Desktop (4+ columns)
┌─────┬─────┬─────┬─────┐
│ C   │ C   │ C   │ C   │
├─────┼─────┼─────┼─────┤
│ C   │ C   │ C   │ C   │
└─────┴─────┴─────┴─────┘
```

---

## 🚀 Performance Optimizations

1. **Query Caching**: Không refetch nếu data còn fresh
2. **Optimistic Updates**: UI instant response
3. **Debounced Search**: Tìm kiếm không gửi request quá nhanh
4. **Socket Batch Updates**: Group notifications
5. **Lazy Loading**: Load more khi scroll
6. **Image Optimization**: Avatar caching

---

## 🔄 Future Enhancements

- [ ] Pagination for large friend lists
- [ ] Advanced search filters (online, recently active)
- [ ] Block/unblock users
- [ ] Friend groups/lists
- [ ] Notification preferences
- [ ] Seen status for notifications
- [ ] Like notifications with user info
- [ ] Activity feed
- [ ] Friend suggestions
- [ ] Bulk operations

