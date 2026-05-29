import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Users, Lock, Music2, X, ChevronRight } from "lucide-react";
import { StoryPrivacy } from "@/types/story";
import { MusicTrack } from "@/types/music";
import { MusicPickerModal } from "@/components/music/music-picker-modal";

interface StoryPrivacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  privacy: StoryPrivacy;
  onPrivacyChange: (privacy: StoryPrivacy) => void;
  onConfirm: (opts: { musicUrl?: string | null; musicTitle?: string | null; musicArtist?: string | null }) => void;
  isCreating: boolean;
}

const PRIVACY_OPTIONS: { value: StoryPrivacy; icon: React.ElementType; label: string; desc: string }[] = [
  { value: "public", icon: Globe, label: "Công khai", desc: "Bất kỳ ai trên ChatMeNow" },
  { value: "friends", icon: Users, label: "Bạn bè", desc: "Chỉ bạn bè của bạn mới thấy" },
  { value: "private", icon: Lock, label: "Chỉ mình tôi", desc: "Lưu dưới dạng cá nhân" },
];

export function StoryPrivacyDialog({
  open,
  onOpenChange,
  file,
  privacy,
  onPrivacyChange,
  onConfirm,
  isCreating,
}: StoryPrivacyDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [musicPickerOpen, setMusicPickerOpen] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl("");
    }
  }, [file]);

  // Reset music when dialog closes
  useEffect(() => {
    if (!open) setSelectedTrack(null);
  }, [open]);

  const isVideo = file?.type.startsWith("video/");

  const handlePost = () => {
    onConfirm({
      musicUrl: selectedTrack?.url ?? null,
      musicTitle: selectedTrack?.title ?? null,
      musicArtist: selectedTrack?.artist ?? null,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo tin mới</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Preview */}
            <div className="relative overflow-hidden bg-black rounded-xl aspect-[9/16] max-h-[38vh] mx-auto flex items-center justify-center w-full">
              {previewUrl && (
                <>
                  {isVideo ? (
                    <video
                      src={previewUrl}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      muted
                      loop
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      className="w-full h-full object-contain"
                      alt="Story preview"
                    />
                  )}
                </>
              )}

              {/* Music overlay badge */}
              {selectedTrack && (
                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1.5">
                  <Music2 className="w-3.5 h-3.5 text-purple-300 shrink-0 animate-spin [animation-duration:3s]" />
                  <span className="text-white text-xs truncate flex-1">
                    {selectedTrack.title} — {selectedTrack.artist}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack(null)}
                    className="text-white/60 hover:text-white shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Music picker button */}
            <button
              type="button"
              onClick={() => setMusicPickerOpen(true)}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Music2 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                {selectedTrack ? (
                  <>
                    <p className="text-sm font-medium text-slate-900 truncate">{selectedTrack.title}</p>
                    <p className="text-xs text-slate-500 truncate">{selectedTrack.artist}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-600">Thêm nhạc nền từ Jamendo</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {/* Privacy options */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-slate-900">Ai có thể xem tin này?</h4>
              <div className="flex flex-col gap-2">
                {PRIVACY_OPTIONS.map(({ value, icon: Icon, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${privacy === value
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-slate-200 hover:bg-slate-50"
                      }`}
                    onClick={() => onPrivacyChange(value)}
                  >
                    <div
                      className={`p-2 rounded-full ${privacy === value
                          ? "bg-blue-100 text-blue-600"
                          : "bg-slate-100 text-slate-500"
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium text-sm ${privacy === value ? "text-blue-900" : "text-slate-900"
                          }`}
                      >
                        {label}
                      </p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
              Hủy
            </Button>
            <Button
              onClick={handlePost}
              disabled={isCreating || !file}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                "Đăng tin"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MusicPickerModal
        open={musicPickerOpen}
        onClose={() => setMusicPickerOpen(false)}
        onSelect={setSelectedTrack}
        selectedTrack={selectedTrack}
      />
    </>
  );
}
