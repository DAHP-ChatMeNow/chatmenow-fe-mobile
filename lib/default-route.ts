const MOBILE_UA_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

export const DESKTOP_DEFAULT_ROUTE = "/messages";
export const MOBILE_DEFAULT_ROUTE = "/blog";

export const getDefaultRouteForUserAgent = (userAgent?: string) => {
  if (!userAgent) {
    return DESKTOP_DEFAULT_ROUTE;
  }

  return MOBILE_UA_REGEX.test(userAgent)
    ? MOBILE_DEFAULT_ROUTE
    : DESKTOP_DEFAULT_ROUTE;
};

export const getDefaultRouteForClient = () => {
  if (typeof window === "undefined") {
    return DESKTOP_DEFAULT_ROUTE;
  }

  const isSmallScreen = window.matchMedia("(max-width: 767px)").matches;
  if (isSmallScreen) {
    return MOBILE_DEFAULT_ROUTE;
  }

  return getDefaultRouteForUserAgent(window.navigator.userAgent);
};
