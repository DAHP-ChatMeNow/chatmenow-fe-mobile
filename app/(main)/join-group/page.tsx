"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Users, ShieldAlert, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatService } from "@/services/chat";
import { userService } from "@/services/user";
import { toast } from "sonner";

function JoinGroupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [groupAvatarUrl, setGroupAvatarUrl] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      toast.error("Thiếu mã nhóm trò chuyện");
      router.replace("/messages");
      return;
    }

    const loadGroupInfo = async () => {
      try {
        const info = await chatService.getGroupJoinInfo(conversationId);
        if (info.isMember) {
          // If already a member, redirect to chat immediately
          router.replace(`/messages?conversationId=${conversationId}`);
          return;
        }
        setGroupInfo(info);

        if (info.groupAvatar && !info.groupAvatar.startsWith("http")) {
          try {
            const presigned = await userService.getPresignedUrl(info.groupAvatar);
            if (presigned?.viewUrl) {
              setGroupAvatarUrl(presigned.viewUrl);
            }
          } catch (err) {
            console.error("Lỗi khi lấy link ảnh đại diện nhóm:", err);
          }
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Không thể lấy thông tin nhóm");
        router.replace("/messages");
      } finally {
        setLoading(false);
      }
    };

    void loadGroupInfo();
  }, [conversationId, router]);

  const handleJoinGroup = async () => {
    if (!conversationId || submitting) return;
    setSubmitting(true);
    try {
      const res = await chatService.joinGroupByLink(conversationId);
      if (res.joined) {
        toast.success("Tham gia nhóm thành công!");
        router.replace(`/messages?conversationId=${conversationId}`);
      } else if (res.pendingApproval || res.requestCreated) {
        setRequestSent(true);
        toast.info("Đã gửi yêu cầu tham gia, vui lòng chờ duyệt");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi tham gia nhóm");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900/30">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500">Đang tải thông tin nhóm...</p>
      </div>
    );
  }

  if (requestSent) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl border p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-600">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Yêu cầu đã gửi</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Yêu cầu gia nhập nhóm <strong>{groupInfo?.name}</strong> đã được gửi tới quản trị viên. Vui lòng chờ phê duyệt.
            </p>
          </div>
          <Button className="w-full" onClick={() => router.replace("/messages")}>
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/30">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl border p-8 text-center space-y-6 shadow-sm">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-3xl overflow-hidden mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
          {groupAvatarUrl ? (
            <img src={groupAvatarUrl} alt="Group" className="w-full h-full object-cover" />
          ) : (
            <Users className="h-10 w-10" />
          )}
        </div>

        {/* Info */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 line-clamp-2">
            {groupInfo?.name}
          </h2>
          <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
            <Users className="h-4 w-4 text-slate-400" />
            {groupInfo?.memberCount || 0} thành viên
          </p>
        </div>

        {/* Approval notice */}
        {groupInfo?.joinApprovalEnabled && (
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 p-4 text-left flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-normal">
              Nhóm này đã bật tính năng duyệt thành viên. Quản trị viên cần phê duyệt yêu cầu trước khi bạn có thể bắt đầu nhắn tin.
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-3">
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 h-11"
            disabled={submitting}
            onClick={handleJoinGroup}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Tham gia nhóm
          </Button>
          <Button
            variant="ghost"
            className="w-full text-slate-500 h-11"
            disabled={submitting}
            onClick={() => router.replace("/messages")}
          >
            Bỏ qua
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function JoinGroupPage() {
  return (
    <Suspense fallback={
      <div className="h-full w-full flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900/30">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500">Đang chuẩn bị...</p>
      </div>
    }>
      <JoinGroupContent />
    </Suspense>
  );
}
