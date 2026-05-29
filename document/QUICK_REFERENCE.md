# QUICK REFERENCE - DANH BẠ & THÔNG BÁO

## 🚀 Nhanh chóng bắt đầu

### 1. Lấy danh sách bạn bè
```typescript
import { useContacts } from '@/hooks/use-contact';

export function MyComponent() {
  const { data: contactsData, isLoading } = useContacts();
  const contacts = contactsData?.contacts || [];
  
  return (
    <>
      {contacts.map(contact => (
        <p key={contact.id}>{contact.displayName}</p>
      ))}
    </>
  );
}
```

### 2. Chấp nhận lời mời kết bạn
```typescript
import { useAcceptFriendRequest } from '@/hooks/use-contact';

export function AcceptButton({ requestId }) {
  const { mutate: accept, isPending } = useAcceptFriendRequest();
  
  return (
    <button 
      onClick={() => accept(requestId)}
      disabled={isPending}
    >
      {isPending ? 'Đang xử lý...' : 'Chấp nhận'}
    </button>
  );
}
```

### 3. Lấy thông báo
```typescript
import { useNotifications } from '@/hooks/use-notification';

export function NotificationBell() {
  const { data: notiData } = useNotifications();
  const unread = notiData?.unreadCount || 0;
  
  return <Badge>{unread} thông báo mới</Badge>;
}
```

### 4. Đánh dấu thông báo đã đọc
```typescript
import { useMarkNotificationAsRead } from '@/hooks/use-notification';

const { mutate: markAsRead } = useMarkNotificationAsRead();
markAsRead(notificationId);
```

---

## 📝 API Endpoints

```typescript
// CONTACTS
GET    /users/contacts
GET    /users/friend-requests/pending
POST   /users/friend-requests/:userId
PUT    /users/friend-requests/:requestId/accept
PUT    /users/friend-requests/:requestId/reject
DELETE /users/friends/:userId

// NOTIFICATIONS
GET    /notifications
PUT    /notifications/:notificationId/read
PUT    /notifications/read-all
DELETE /notifications/:notificationId
```

---

## 🔔 Socket Events

```typescript
// Receive from server
socket.on('notification:new', (notification) => {
  // Notification { id, type, message, senderId, createdAt }
});

socket.on('friendRequest:received', () => {
  // Invalidate friend-requests cache
});

socket.on('post:liked', ({ postId }) => {
  // Invalidate feed
});

// Send to server
socket.emit('joinConversation', conversationId);
socket.emit('typing', { conversationId, userId, displayName });
socket.emit('stopTyping', { conversationId, userId });
```

---

## 🎨 UI Components

### Friend Card
```tsx
<div className="p-3 rounded-xl hover:bg-slate-50">
  <Avatar>
    <img src={contact.avatar} alt={contact.displayName} />
  </Avatar>
  <p className="font-semibold">{contact.displayName}</p>
  <p className="text-xs text-slate-400">
    {contact.isOnline ? '✅ Đang hoạt động' : 'Ngoại tuyến'}
  </p>
</div>
```

### Notification Item
```tsx
<div className="flex items-start gap-4 p-4 rounded-2xl">
  <Avatar>
    <img src={noti.sender?.avatar} />
  </Avatar>
  <div className="flex-1">
    <p>{noti.message}</p>
    <p className="text-xs text-slate-400">{formatTime(noti.createdAt)}</p>
  </div>
  {!noti.isRead && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
</div>
```

---

## 🔄 Common Patterns

### Pattern 1: Load & Display
```typescript
const { data: contactsData, isLoading } = useContacts();
const contacts = contactsData?.contacts || [];

if (isLoading) return <Skeleton />;
if (!contacts.length) return <EmptyState />;

return contacts.map(c => <Card key={c.id} contact={c} />);
```

### Pattern 2: Mutate with Loading
```typescript
const { mutate: accept, isPending } = useAcceptFriendRequest();

return (
  <Button
    onClick={() => accept(id)}
    disabled={isPending}
  >
    {isPending ? <Spinner /> : 'Chấp nhận'}
  </Button>
);
```

### Pattern 3: Real-time Update
```typescript
useEffect(() => {
  const handleNotification = (noti) => {
    // Automatic cache update via setQueryData
    // Toast shows automatically
  };
  
  socket.on('notification:new', handleNotification);
  return () => socket.off('notification:new', handleNotification);
}, [socket]);
```

---

## ⚠️ Common Issues & Fixes

### Issue: Bạn bè không update
```typescript
// ❌ Sai - chỉ invalidate friend-requests
queryClient.invalidateQueries({ queryKey: ["friend-requests"] });

// ✅ Đúng - cần invalidate contacts
queryClient.invalidateQueries({ queryKey: ["contacts"] });
```

### Issue: Notifications không realtime
```typescript
// ✅ Kiểm tra socket provider wraps app
<SocketProvider>
  <App />
</SocketProvider>

// ✅ Kiểm tra socket.io-client installed
npm install socket.io-client
```

### Issue: Search không hoạt động
```typescript
// ✅ Đúng cách filter
const filtered = contacts.filter(c =>
  c.displayName.toLowerCase().includes(query.toLowerCase())
);

// ❌ Không filter trước khi map
contacts.map(...) // sẽ render tất cả
```

---

## 🧩 Integration Checklist

- [x] API services created
- [x] Hooks implemented
- [x] Components built
- [x] Socket events added
- [x] Pages integrated
- [x] Types enhanced
- [x] Error handling
- [x] Loading states
- [x] Toast notifications
- [x] Responsive design

---

## 📊 Types

```typescript
// User (từ types/user.ts)
interface User {
  id: string;
  accountId: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  isOnline: boolean;
  // ...
}

// FriendRequest (types/friend-request.ts)
interface FriendRequest {
  id: string;
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  status: string;
  createdAt: Date;
}

// Notification (types/notification.ts)
interface Notification {
  id: string;
  recipientId: string;
  senderId?: string;
  type: 'friend_request' | 'like' | 'message';
  referenced?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// API Responses
interface ContactsResponse {
  contacts: User[];
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}
```

---

## 🎯 Feature Matrix

| Feature | Implemented | Real-time | Optimistic |
|---------|:---:|:---:|:---:|
| Load contacts | ✅ | - | - |
| Search contacts | ✅ | ✅ | - |
| Accept friend req | ✅ | ✅ | ✅ |
| Remove friend | ✅ | ✅ | ✅ |
| Get notifications | ✅ | ✅ | - |
| Mark as read | ✅ | ✅ | ✅ |
| Real-time notify | ✅ | ✅ | - |
| Friend req modal | ✅ | ✅ | - |
| Online status | ✅ | ✅ | - |

---

## 📚 File Locations

```
src/
├── api/contact.ts              API calls
├── api/notification.ts         API calls
├── hooks/use-contact.ts        Queries & mutations
├── hooks/use-notification.ts   Queries & mutations
├── components/contact/
│   └── friend-requests-list.tsx UI component
├── components/providers/
│   └── socket-provider.tsx     Real-time setup
├── app/(main)/contacts/
│   └── page.tsx               Full page
└── app/(main)/notifications/
    └── page.tsx               Full page
```

---

## 🌐 Environment Variables

```env
# .env.local
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 💡 Tips & Tricks

1. **Debug Queries**: Open React Query DevTools
2. **Debug Socket**: `socket.onAny((event, ...args) => console.log(event, args))`
3. **Clear Cache**: `queryClient.clear()`
4. **Force Refetch**: `queryClient.refetchQueries({ queryKey: ["contacts"] })`
5. **Check Connected**: `useSocket().isConnected`

