// app/page.js
import HomeClient from "./ProjectListClient";

export const metadata = {
  title: '首頁 | UFLOW 健康生活',
  description: '探索保健知識與健康生活方式',
};

// 這是伺服器端抓取邏輯
async function getPosts() {
  const apiUrl = process.env.WORDPRESS_API_URL;
  
  // 1. 除錯：確認環境變數有沒有讀到
  if (!apiUrl) {
    console.error("❌ 錯誤：找不到環境變數 WORDPRESS_API_URL，請確認 .env.local 檔案存在且已重啟伺服器。");
    return [];
  }

  console.log(`🌐 正在嘗試抓取 API: ${apiUrl}/posts?_embed&per_page=10`);

  try {
    const res = await fetch(`${apiUrl}/posts?_embed&per_page=10`, {
      next: { revalidate: 3600 },
      // ✨ 關鍵修改：加入 Headers 偽裝成瀏覽器，繞過 Bluehost 防火牆
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      }
    });

    // 2. 除錯：確認 HTTP 狀態碼
    if (!res.ok) {
      console.error(`❌ Fetch 失敗，狀態碼: ${res.status} ${res.statusText}`);
      // 嘗試印出錯誤內容
      const errorText = await res.text(); 
      console.error("❌ 錯誤內容:", errorText);
      return [];
    }

    const posts = await res.json();
    
    // 3. 除錯：確認抓到的資料長度
    console.log(`✅ 成功抓取到 ${posts.length} 篇文章`);
    
    return posts;

  } catch (error) {
    console.error("❌ 抓取過程發生嚴重錯誤:", error);
    return [];
  }
}

export default async function Page() {
  const posts = await getPosts();

  return (
    <main>
      <HomeClient posts={posts} />
    </main>
  );
}