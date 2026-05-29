"use client";

import { useEffect, useRef } from "react";

type TurnstileWidgetProps = {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (message: string) => void;
  resetSignal?: number;
  className?: string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_ID = "cloudflare-turnstile-script";
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function TurnstileWidget({
  siteKey,
  onVerify,
  onExpire,
  onError,
  resetSignal,
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let currentScript: HTMLScriptElement | null = null;

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onVerifyRef.current(token),
        "expired-callback": () => {
          onExpireRef.current?.();
        },
        "error-callback": () => {
          onErrorRef.current?.(
            "Xác thực Turnstile thất bại. Vui lòng thử lại.",
          );
        },
      });
    };

    const handleLoad = () => {
      renderWidget();
    };

    const handleError = () => {
      onErrorRef.current?.(
        "Không thể tải Cloudflare Turnstile. Vui lòng thử lại.",
      );
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const existingScript = document.getElementById(
        SCRIPT_ID,
      ) as HTMLScriptElement | null;

      if (existingScript) {
        currentScript = existingScript;
        existingScript.addEventListener("load", handleLoad);
        existingScript.addEventListener("error", handleError);
      } else {
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.addEventListener("load", handleLoad);
        script.addEventListener("error", handleError);
        document.head.appendChild(script);
        currentScript = script;
      }
    }

    return () => {
      if (currentScript) {
        currentScript.removeEventListener("load", handleLoad);
        currentScript.removeEventListener("error", handleError);
      }

      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [siteKey]);

  useEffect(() => {
    if (
      !window.turnstile ||
      !widgetIdRef.current ||
      resetSignal === undefined
    ) {
      return;
    }

    window.turnstile.reset(widgetIdRef.current);
  }, [resetSignal]);

  return <div ref={containerRef} className={className} />;
}
