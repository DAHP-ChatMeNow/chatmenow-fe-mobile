/**
 * Generate or retrieve a consistent device ID for the current browser
 * Device ID is stored in localStorage to remain consistent across sessions
 */
export const getDeviceId = (): string => {
  if (typeof window === "undefined") {
    return `device-${Date.now()}`;
  }

  const storageKey = "chat_device_id";
  let deviceId = localStorage.getItem(storageKey);

  if (!deviceId) {
    // Generate new device ID if not exists
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(storageKey, deviceId);
  }

  return deviceId;
};

/**
 * Get device name from user agent
 */
export const getDeviceName = (): string => {
  if (typeof window === "undefined") {
    return "Unknown Device";
  }

  const userAgent = navigator.userAgent;

  // Extract browser name
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Edge")) return "Edge";
  if (userAgent.includes("Opera")) return "Opera";

  return userAgent.split(" ")[0] || "Unknown Device";
};

/**
 * Validate if avatar URL is valid and can be loaded
 */
export const isValidAvatarUrl = (url: string | undefined | null): boolean => {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    // Check if it's a valid URL
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
