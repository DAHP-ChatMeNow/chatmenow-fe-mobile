# QUICK REFERENCE - USER PROFILE & SETTINGS

## 🚀 Quick Start

### Setup Environment Variables
```env
# .env.local
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

### Basic Usage

```typescript
import { useUpdateProfile, useUpdateAvatar } from '@/hooks/use-profile';

// Update all profile fields
const { mutate: updateProfile, isPending } = useUpdateProfile();

// Or just avatar
const { mutate: updateAvatar, isPending } = useUpdateAvatar();

// Call it
updateProfile({
  displayName: "John Doe",
  bio: "Developer"
});

// With avatar file
updateProfile({
  displayName: "John Doe",
  avatarFile: fileObject  // Auto-uploads to Cloudinary
});
```

---

## 🎯 Common Tasks

### Task 1: Upload Avatar Only
```typescript
const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    updateAvatar(file);  // Validates, uploads, saves
  }
};

return <input type="file" accept="image/*" onChange={handleAvatarChange} />;
```

### Task 2: Edit Profile Form
```typescript
const handleSave = () => {
  updateProfile({
    displayName: newName,
    bio: newBio,
    avatarFile: selectedFile  // Optional
  });
};
```

### Task 3: Show Loading State
```typescript
<button disabled={isPending}>
  {isPending ? 'Saving...' : 'Save'}
</button>
```

### Task 4: Handle Errors
```typescript
updateProfile(data, {
  onSuccess: () => {
    // Success - auto toast shown
    setShowDialog(false);
  },
  onError: (error) => {
    // Error - auto toast shown
    console.error(error);
  }
});
```

---

## 📝 Form Example (Complete)

```typescript
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useUpdateProfile } from '@/hooks/use-profile';

export function EditProfileForm() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const handleSave = () => {
    updateProfile({
      displayName: name,
      bio: bio,
      avatarFile: avatarFile || undefined
    });
  };

  return (
    <div className="space-y-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Display Name"
        disabled={isPending}
      />
      <Textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Bio"
        disabled={isPending}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
        disabled={isPending}
      />
      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? 'Saving...' : 'Save Profile'}
      </Button>
    </div>
  );
}
```

---

## 🎨 UI Components Used

```typescript
// Avatar with upload
<Avatar className="cursor-pointer" onClick={handleAvatarClick}>
  <AvatarImage src={user.avatar} />
  <AvatarFallback>US</AvatarFallback>
</Avatar>
<input ref={inputRef} type="file" onChange={handleUpload} hidden />

// Loading spinner
{isPending && <Loader className="animate-spin" />}

// Dialog form
<Dialog open={show} onOpenChange={setShow}>
  <DialogContent>
    <DialogTitle>Edit Profile</DialogTitle>
    <DialogHeader>
      {/* Form content */}
    </DialogHeader>
  </DialogContent>
</Dialog>

// Toast
import { toast } from 'sonner';
toast.success("Profile updated!");
```

---

## 🔧 Cloudinary Setup (Step-by-step)

1. **Create Account**
   - Go to cloudinary.com
   - Sign up for free account

2. **Get Cloud Name**
   - Dashboard → Account Settings
   - Copy "Cloud Name"
   - Add to .env.local as NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

3. **Create Upload Preset**
   - Dashboard → Settings → Upload
   - Scroll to "Upload presets"
   - Click "Create upload preset"
   - Set:
     - Name: (e.g., "chatmenow")
     - Unsigned: Enable (for client-side upload)
     - Folder: (optional, e.g., "chatmenow/avatars")
   - Click Save

4. **Get Upload Preset Name**
   - Copy the preset name
   - Add to .env.local as NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

5. **Test**
   - Restart dev server
   - Upload an image in profile
   - Should work!

---

## 📚 API Endpoints

```
PUT /users/profile
  Body: {
    displayName?: string
    bio?: string
    avatar?: string
    coverImage?: string
  }
  Response: {
    user: User
    message: string
  }
```

---

## 🎯 Feature Checklist

- [x] Avatar upload with preview
- [x] Avatar loading spinner
- [x] Profile form in modal
- [x] Bio field with character count
- [x] Display name field
- [x] Save/Cancel buttons
- [x] Loading state on save
- [x] Toast notifications
- [x] Error handling
- [x] Auth store auto-update
- [x] Cloudinary integration
- [x] File validation
- [x] Responsive design

---

## 🔍 File Validation

Automatically validates:
- ✅ File type: JPEG, PNG, WebP, GIF
- ✅ Max size: 5MB (configurable)
- ✅ Throws error if invalid

```typescript
// To change max size
uploadToCloudinary(file, 10)  // 10MB max
```

---

## 💡 Tips

1. **Preview before upload**
   ```typescript
   const reader = new FileReader();
   reader.onload = (e) => setPreview(e.target?.result);
   reader.readAsDataURL(file);
   ```

2. **Disable button during upload**
   ```typescript
   <button disabled={isPending}>Save</button>
   ```

3. **Show upload progress**
   ```typescript
   {isPending && <span>Uploading...</span>}
   ```

4. **Auto-close dialog on success**
   ```typescript
   updateProfile(data, {
     onSuccess: () => setShowDialog(false)
   });
   ```

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| File not uploading | Check Cloudinary env vars |
| "Upload preset not found" | Verify upload preset name |
| Avatar not showing | Check secure_url from Cloudinary |
| Auth store not updating | Token must exist (not null) |
| Form not submitting | Check network tab, see error |

---

## 🚀 Optimization Tips

- Use `isPending` instead of manual loading state
- Let hooks handle toast notifications automatically
- Rely on Zustand for state (don't duplicate in component)
- Cloudinary CDN handles image optimization
- Query cache prevents unnecessary refetches

---

## 📱 Mobile Considerations

- Avatar is touch-friendly (tap to upload)
- Dialog fits mobile screen
- Form fields are large enough
- Loading spinner visible during upload
- Error messages display clearly

---

## 🔐 Security

- ✅ File validated on client + server
- ✅ Cloudinary requires upload preset
- ✅ JWT token sent with every API call
- ✅ HttpOnly cookies for sensitive tokens
- ✅ No sensitive data logged

---

## 📊 Usage Stats

Track in Cloudinary dashboard:
- Upload count
- Storage usage
- Bandwidth
- Transformation requests
- API calls

Free tier: 10GB storage, 10GB bandwidth/month

---

## 🎓 Next Learning Steps

1. Add image cropping before upload
2. Add multiple image upload
3. Add image filters/effects
4. Add image compression
5. Add drag & drop upload
6. Add progress bar
7. Add image gallery

