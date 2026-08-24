/** @type {import('next').NextConfig} */

const WP_MEDIA_BASE =
  process.env.WC_API_BASE ||
  "https://inf.fjg.mybluehost.me/website_4ad5d5f2";

const nextConfig = {
  // 商品圖對外走 uflow.space/wp-content/uploads/*，由 Next 代理到 WordPress 媒體庫
  async rewrites() {
    return [
      {
        source: "/wp-content/uploads/:path*",
        destination: `${WP_MEDIA_BASE.replace(/\/$/, "")}/wp-content/uploads/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.uflow.space",
      },
      {
        protocol: "https",
        hostname: "uflow.space",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
      },
      {
        protocol: "https",
        hostname: "inf.fjg.mybluehost.me",
      },
      {
        protocol: "https",
        hostname: "d2w53g1q050m78.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "coralclub.ru",
      },
      {
        protocol: "https",
        hostname: "ru.coral.club",
      },
      {
        protocol: "https",
        hostname: "i0.wp.com", // WordPress Jetpack CDN
      },
      {
        protocol: "https",
        hostname: "i1.wp.com", // WordPress Jetpack CDN
      },
      {
        protocol: "https",
        hostname: "i2.wp.com", // WordPress Jetpack CDN
      },
      {
        protocol: "https",
        hostname: "takidanifudouson.or.jp",
      },
      {
        protocol: "https",
        hostname: "shiroyamakumano-jinja.jp",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "gcm.org.tw",
      },
    ],
  },
};

export default nextConfig;
