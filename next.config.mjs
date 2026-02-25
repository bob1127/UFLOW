/** @type {import('next').NextConfig} */
const nextConfig = {
  // 如果你有用 View Transitions 或其他實驗性功能，保留這裡
  // experimental: { ... }, 

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'inf.fjg.mybluehost.me', // 你的 WP 主機
      },
      {
        protocol: 'https',
        hostname: 'd2w53g1q050m78.cloudfront.net',
        port: '',
        pathname: '/**', // 允許該網域下的所有圖片路徑
      },
      // 如果你還有其他外部圖片來源（例如 coralclub.ru），也可以一併加進來：
      {
        protocol: 'https',
        hostname: 'coralclub.ru',
        port: '',
        pathname: '/**',
      },
      // 👇 新增以下這三行來支援 WordPress CDN (Jetpack)
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'i1.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'i2.wp.com',
      },
      // 👇 原本的其他網域設定保留
      {
        protocol: 'https',
        hostname: 'takidanifudouson.or.jp',
      },
      {
         protocol: 'https',
         hostname: 'shiroyamakumano-jinja.jp',
      },
      {
         protocol: 'https',
         hostname: 'coralclub.ru',
      },
       {
         protocol: 'https',
         hostname: 'ru.coral.club',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      }
    ],
  },
};

export default nextConfig;