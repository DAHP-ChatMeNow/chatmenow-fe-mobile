import { MessageAttachment } from "@/types/message";
import {
  decodeFriendCardPayload,
  FRIEND_CARD_ATTACHMENT_TYPE,
  type FriendCardPayload,
} from "@/lib/friend-card";
import {
  decodeGroupCardPayload,
  GROUP_CARD_ATTACHMENT_TYPE,
  type GroupCardPayload,
} from "@/lib/group-card";

const FRIEND_CARD_PREFIX = "friend-card:";
const GROUP_CARD_PREFIX = "group-card:";

export type ParsedShareCard =
  | { kind: "friend"; payload: FriendCardPayload }
  | { kind: "group"; payload: GroupCardPayload };

export const isShareCardSource = (value?: string): boolean => {
  if (!value) return false;
  return (
    value.startsWith(FRIEND_CARD_PREFIX) || value.startsWith(GROUP_CARD_PREFIX)
  );
};

export const parseShareCardAttachment = (
  attachment?: MessageAttachment,
): ParsedShareCard | null => {
  if (!attachment) return null;

  const sources = [attachment.url, attachment.key].filter(
    (value): value is string => Boolean(value),
  );

  for (const source of sources) {
    const friendPayload = decodeFriendCardPayload(source);
    if (friendPayload) {
      return {
        kind: "friend",
        payload: friendPayload,
      };
    }

    const groupPayload = decodeGroupCardPayload(source);
    if (groupPayload) {
      return {
        kind: "group",
        payload: groupPayload,
      };
    }
  }

  const fileType = String(attachment.fileType || "").toLowerCase();
  if (
    fileType === FRIEND_CARD_ATTACHMENT_TYPE.toLowerCase() ||
    fileType === GROUP_CARD_ATTACHMENT_TYPE.toLowerCase()
  ) {
    return null;
  }

  return null;
};

export const isShareCardAttachment = (attachment?: MessageAttachment): boolean => {
  if (!attachment) return false;

  const fileType = String(attachment.fileType || "").toLowerCase();
  if (
    fileType === FRIEND_CARD_ATTACHMENT_TYPE.toLowerCase() ||
    fileType === GROUP_CARD_ATTACHMENT_TYPE.toLowerCase()
  ) {
    return true;
  }

  return isShareCardSource(attachment.url) || isShareCardSource(attachment.key);
};

export const normalizeSharedProfilePath = (value?: string): string => {
  if (!value) return "/messages";

  let normalized = value.trim();

  if (/^https?:\/\//i.test(normalized)) {
    try {
      const parsed = new URL(normalized);
      normalized = `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
    } catch {
      normalized = "/messages";
    }
  }

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  const messageMatch = normalized.match(/^\/messages\/([^/?#]+)/i);
  if (messageMatch?.[1]) {
    return `/messages?conversationId=${encodeURIComponent(messageMatch[1])}`;
  }

  const profileMatch = normalized.match(/^\/profile\/([^/?#]+)/i);
  if (profileMatch?.[1]) {
    return `/profile?userId=${encodeURIComponent(profileMatch[1])}`;
  }

  return normalized;
};
