// Dictionary cho Tiếng Việt và Tiếng Anh
export type Language = "vi" | "en";

export const dictionaries = {
  vi: {
    // Common
    save: "Lưu",
    cancel: "Hủy",
    edit: "Chỉnh sửa",
    delete: "Xóa",
    confirm: "Xác nhận",
    close: "Đóng",
    loading: "Đang tải...",
    error: "Lỗi",
    success: "Thành công",
    
    // Navigation
    messages: "Tin nhắn",
    contacts: "Liên hệ",
    notifications: "Thông báo",
    blog: "Bài viết",
    profile: "Hồ sơ",
    
    // Profile Page
    editProfile: "Chỉnh sửa hồ sơ",
    displayName: "Tên hiển thị",
    bio: "Tiểu sử",
    settings: "Cài đặt",
    logout: "Đăng xuất",
    darkMode: "Chế độ tối",
    language: "Ngôn ngữ",
    notifications_setting: "Thông báo",
    privacy: "Riêng tư",
    
    // Toast messages
    profileUpdated: "Hồ sơ đã được cập nhật",
    avatarUpdated: "Avatar đã được cập nhật",
    updateFailed: "Không thể cập nhật",
    
    // Auth
    login: "Đăng nhập",
    signup: "Đăng ký",
    email: "Email",
    password: "Mật khẩu",
    
    // Messages
    typeMessage: "Nhập tin nhắn...",
    sendMessage: "Gửi",
    newMessage: "Tin nhắn mới",
    
    // Contacts
    addFriend: "Thêm bạn",
    acceptRequest: "Chấp nhận",
    rejectRequest: "Từ chối",
    friendRequests: "Lời mời kết bạn",
    
    // Notifications
    newNotification: "Thông báo mới",
    markAsRead: "Đánh dấu đã đọc",
    markAllAsRead: "Đánh dấu tất cả đã đọc",
    
    // Blog
    newPost: "Bài viết mới",
    like: "Thích",
    comment: "Bình luận",
    share: "Chia sẻ",
  },
  
  en: {
    // Common
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    close: "Close",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    
    // Navigation
    messages: "Messages",
    contacts: "Contacts",
    notifications: "Notifications",
    blog: "Blog",
    profile: "Profile",
    
    // Profile Page
    editProfile: "Edit Profile",
    displayName: "Display Name",
    bio: "Bio",
    settings: "Settings",
    logout: "Logout",
    darkMode: "Dark Mode",
    language: "Language",
    notifications_setting: "Notifications",
    privacy: "Privacy",
    
    // Toast messages
    profileUpdated: "Profile updated successfully",
    avatarUpdated: "Avatar updated successfully",
    updateFailed: "Update failed",
    
    // Auth
    login: "Login",
    signup: "Sign Up",
    email: "Email",
    password: "Password",
    
    // Messages
    typeMessage: "Type a message...",
    sendMessage: "Send",
    newMessage: "New message",
    
    // Contacts
    addFriend: "Add Friend",
    acceptRequest: "Accept",
    rejectRequest: "Reject",
    friendRequests: "Friend Requests",
    
    // Notifications
    newNotification: "New notification",
    markAsRead: "Mark as read",
    markAllAsRead: "Mark all as read",
    
    // Blog
    newPost: "New Post",
    like: "Like",
    comment: "Comment",
    share: "Share",
  },
} as const;

export type Dictionary = (typeof dictionaries)["vi"] | (typeof dictionaries)["en"];
