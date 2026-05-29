/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export" chỉ dùng khi build cho Capacitor mobile (npx cap build)
  // Bật dòng dưới khi cần xuất file tĩnh, tắt khi dev hoặc deploy lên server
  ...(process.env.NEXT_EXPORT === "true" ? { output: "export" } : {}),
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
