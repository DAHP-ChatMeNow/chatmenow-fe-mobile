"use client";

import { useState } from "react";
import { Search, UserPlus, Loader, X, MapPin, GraduationCap, History, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PresignedAvatar } from "@/components/ui/presigned-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useSearchUsers,
  useSendFriendRequest,
  useGetUserEmailById,
} from "@/hooks/use-contact";
import {
  useSearchHistory,
  useDeleteSearchHistory,
  useProfileVisitHistory,
  useDeleteProfileVisitHistory,
} from "@/hooks/use-user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const VIETNAM_CITIES = [
  "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", 
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", 
  "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", 
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", 
  "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", 
  "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình", 
  "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", 
  "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", 
  "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", 
  "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", 
  "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", 
  "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", 
  "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

interface SearchAndAddFriendProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SearchResultItem({
  user,
  onSendRequest,
  isSending,
}: {
  user: User;
  onSendRequest: (userId: string) => void;
  isSending: boolean;
}) {
  const { data: emailData } = useGetUserEmailById(user.id);
  const router = useRouter();

  return (
    <div className="flex items-center justify-between p-4 transition-all duration-300 border border-transparent rounded-2xl bg-white hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm group">
      <div 
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => router.push(`/profile?userId=${user.id}`)}
      >
        <PresignedAvatar
          avatarKey={user.avatar}
          displayName={user.displayName}
          className="w-14 h-14 ring-2 ring-transparent transition-all group-hover:ring-blue-100"
          fallbackClassName="text-xl"
        />
        <div className="flex flex-col">
          <p className="text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600">
            {user.displayName}
          </p>
          {emailData?.email && (
            <p className="text-sm font-medium text-gray-500">{emailData.email}</p>
          )}
        </div>
      </div>
      <Button
        size="sm"
        onClick={() => onSendRequest(user.id)}
        disabled={isSending}
        className="flex items-center gap-2 px-4 h-10 text-white transition-all bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isSending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span className="font-medium">Thêm bạn</span>
          </>
        )}
      </Button>
    </div>
  );
}

export function SearchAndAddFriend({
  open,
  onOpenChange,
}: SearchAndAddFriendProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const router = useRouter();

  const { data: searchData, isLoading } = useSearchUsers(searchQuery, cityFilter, schoolFilter);
  const { mutate: sendFriendRequest, isPending: isSendingRequest } = useSendFriendRequest();

  // History Hooks
  const { data: searchHistoryData } = useSearchHistory();
  const { mutate: deleteSearchHistory, isPending: isDeletingSearch } = useDeleteSearchHistory();
  
  const { data: profileVisitData } = useProfileVisitHistory();
  const { mutate: deleteVisitHistory, isPending: isDeletingVisit } = useDeleteProfileVisitHistory();

  const searchResults = searchData?.users || [];
  const searchHistory = searchHistoryData?.data || [];
  const profileVisits = profileVisitData?.data || [];

  const handleSendRequest = (userId: string) => {
    if (!userId) return;
    sendFriendRequest(userId);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setCityFilter("");
    setSchoolFilter("");
  };

  const isBrowsingHistory = searchQuery.trim() === "" && cityFilter.trim() === "" && schoolFilter.trim() === "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 bg-slate-50/50 rounded-3xl border-0 shadow-2xl sm:max-w-[640px] p-0 overflow-hidden">
        <DialogHeader className="relative px-6 py-5 border-b border-gray-100 bg-white z-10 shadow-sm">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Tìm kiếm bạn bè
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute p-0 transition-colors rounded-full top-4 right-4 w-9 h-9 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col flex-1 px-6 pb-6 space-y-4 overflow-hidden bg-white">
          {/* Main Search Input */}
          <div className="relative group pt-4">
            <Search className="absolute w-5 h-5 text-gray-400 transition-colors -translate-y-1/2 group-focus-within:text-blue-500 left-4 top-1/2 mt-2" />
            <Input
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              className="h-14 pl-12 pr-12 text-base text-gray-900 transition-all duration-200 border-2 border-gray-100 bg-gray-50 focus-visible:bg-white focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/20 rounded-2xl placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute p-0 transition-colors -translate-y-1/2 right-3 top-1/2 mt-2 h-8 w-8 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3 pb-2 border-b border-gray-100">
            <div className="relative">
              <MapPin className="absolute z-10 w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none left-3 top-1/2" />
              <Select value={cityFilter || undefined} onValueChange={(val) => setCityFilter(val === "all" ? "" : val)}>
                <SelectTrigger className="h-10 pl-9 text-sm bg-gray-50 border-gray-100 rounded-xl focus:ring-blue-500/20 focus:border-blue-500">
                  <SelectValue placeholder="Thành phố quê quán..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-60">
                  <SelectItem value="all" className="font-semibold text-blue-600">Tất cả thành phố</SelectItem>
                  {VIETNAM_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <GraduationCap className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <Input
                placeholder="Trường học (Đại học, Cấp 3)..."
                className="h-10 pl-9 pr-8 text-sm bg-gray-50 border-gray-100 rounded-xl focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
              />
              {schoolFilter && (
                <button 
                  onClick={() => setSchoolFilter("")}
                  className="absolute right-2.5 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Content Area */}
          <ScrollArea className="flex-1 -mx-2 px-2">
            {!isBrowsingHistory ? (
              // Search Results
              <>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader className="w-8 h-8 mb-4 text-blue-500 animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">Đang tìm kiếm...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
                    <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gray-50">
                      <UserPlus className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">Không tìm thấy kết quả</h3>
                    <p className="max-w-xs text-sm text-gray-500">
                      Không tìm thấy bạn bè nào khớp với thông tin bạn cung cấp. Hãy thử thay đổi bộ lọc.
                    </p>
                    <Button variant="outline" className="mt-4 rounded-full" onClick={handleClearFilters}>
                      Xóa bộ lọc
                    </Button>
                  </div>
                ) : (
                  <div className="pr-1 space-y-1 pb-2">
                    <p className="text-xs font-bold tracking-wider text-gray-400 uppercase py-2 px-2">
                      Kết quả tìm kiếm
                    </p>
                    {searchResults.map((user: User) => (
                      <SearchResultItem
                        key={user.id}
                        user={user}
                        onSendRequest={handleSendRequest}
                        isSending={isSendingRequest}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              // History Section
              <div className="space-y-6 pt-2 pb-6">
                
                {searchHistory.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2">
                      <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                        Tìm kiếm gần đây
                      </p>
                      <button 
                        onClick={() => deleteSearchHistory()}
                        disabled={isDeletingSearch}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition hover:underline disabled:opacity-50"
                      >
                        Xóa lịch sử
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {searchHistory.map((history) => (
                        <button
                          key={history._id || history.id}
                          className="flex items-center gap-3 p-3 text-left transition-all bg-gray-50/50 hover:bg-gray-100 rounded-xl border border-gray-100/80 group"
                          onClick={() => {
                            if (history.query) setSearchQuery(history.query);
                            if (history.city) setCityFilter(history.city);
                            if (history.school) setSchoolFilter(history.school);
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-500 group-hover:bg-blue-100 transition-colors shrink-0">
                            <History className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {history.query || history.city || history.school || "Tìm kiếm"}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5 max-w-[140px]">
                              {[
                                history.city && `TP. ${history.city}`,
                                history.school && `Trường: ${history.school}`
                              ].filter(Boolean).join(" • ")}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {profileVisits.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between px-2">
                      <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                        Đã xem gần đây
                      </p>
                      <button 
                        onClick={() => deleteVisitHistory()}
                        disabled={isDeletingVisit}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition hover:underline disabled:opacity-50"
                      >
                        Xóa tất cả
                      </button>
                    </div>
                    <div className="space-y-1">
                      {profileVisits.map((visit) => {
                        const user = visit.visitedUser;
                        if (!user) return null;
                        return (
                          <div 
                            key={visit._id || visit.id}
                            className="flex items-center justify-between p-3 transition-all duration-200 border border-transparent rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-gray-200 group"
                            onClick={() => {
                              onOpenChange(false);
                              router.push(`/profile?userId=${user.id || user._id}`);
                            }}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <PresignedAvatar
                                avatarKey={user.avatar}
                                displayName={user.displayName}
                                className="w-11 h-11 ring-2 ring-transparent transition-all group-hover:ring-blue-100"
                              />
                              <div className="min-w-0 flex flex-col justify-center">
                                <p className="text-sm font-bold text-gray-900 transition-colors group-hover:text-blue-600 truncate">
                                  {user.displayName}
                                </p>
                                <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  <span>Truy cập gần đây</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {searchHistory.length === 0 && profileVisits.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center opacity-80">
                    <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gray-50 border border-gray-100">
                      <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="mb-1 text-base font-semibold text-gray-800">Bắt đầu tìm kiếm</h3>
                    <p className="max-w-[250px] text-xs text-gray-500 leading-relaxed">
                      Lịch sử tìm kiếm và các profile bạn đã ghé thăm sẽ xuất hiện tại đây.
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
