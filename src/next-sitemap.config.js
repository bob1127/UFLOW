/** @type {import('next-sitemap').IConfig} */

module.exports = {
  // 1. 你的正式網域
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.uflow.space',
  
  // 2. 自動產生 robots.txt
  generateRobotsTxt: true, 
  
  // 3. 排除不需要被搜尋引擎收錄的頁面 (例如結帳頁、會員中心)
  exclude: ['/cart', '/checkout', '/account/*'],

  // 4. 動態抓取 WooCommerce 產品，塞進實體 sitemap.xml 裡
  additionalPaths: async (config) => {
    const paths = [];
    try {
      // ⚠️ 替換成你的 WordPress 網址與 WooCommerce 金鑰
      const wpUrl = process.env.NEXT_PUBLIC_WP_URL || "https://你的wordpress網址.com";
      const consumerKey = process.env.WC_CONSUMER_KEY || "ck_你的金鑰";
      const consumerSecret = process.env.WC_CONSUMER_SECRET || "cs_你的密碼";
      
      const authString = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

      const res = await fetch(`${wpUrl}/wp-json/wc/v3/products?per_page=100&status=publish`, {
        headers: { Authorization: `Basic ${authString}` },
      });

      if (res.ok) {
        const products = await res.json();
        
        // 將每個產品轉換為 sitemap 格式
        for (const product of products) {
          paths.push({
            loc: `/products/${product.slug}`,
            lastmod: new Date(product.date_modified || new Date()).toISOString(),
            changefreq: 'weekly',
            priority: 0.9,
          });
        }
      } else {
        console.error("next-sitemap 抓取商品失敗，狀態碼:", res.status);
      }
    } catch (error) {
      console.error("next-sitemap 執行發生錯誤:", error);
    }
    
    return paths;
  },
}