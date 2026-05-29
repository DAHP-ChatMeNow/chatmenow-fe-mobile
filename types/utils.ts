import { Capacitor } from "@capacitor/core";

const normalizeEnvUrl = (value?: string) => value?.replace(/\/+$/, "");

const getApiUrl = (): string => {
  const envApiUrl = normalizeEnvUrl(process.env.NEXT_PUBLIC_API_URL);
  if (Capacitor.isNativePlatform()) {
    if (envApiUrl && !envApiUrl.includes("localhost") && !envApiUrl.includes("127.0.0.1")) {
      return envApiUrl;
    }
    const isDev = process.env.NEXT_PUBLIC_ENV === "development" || process.env.NODE_ENV === "development";
    return isDev 
      ? "https://dev-api.chatmenow.cloud/api" 
      : "https://api.chatmenow.cloud/api";
  }
  return envApiUrl || "";
};

const apiUrlEnv = getApiUrl();
const webUrlEnv = normalizeEnvUrl(
	process.env.NEXT_PUBLIC_WEB_URL || process.env.NEXT_PUBLIC_APP_URL,
);

export const BASE_API_URL = apiUrlEnv;

export const BASE_SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export const buildPublicAppUrl = (path: string): string => {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const runtimeOrigin =
		typeof window !== "undefined" ? window.location.origin : undefined;
	const base = webUrlEnv || normalizeEnvUrl(runtimeOrigin);

	if (!base) {
		return normalizedPath;
	}

	return new URL(normalizedPath, `${base}/`).toString();
};
