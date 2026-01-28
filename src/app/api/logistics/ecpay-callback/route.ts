import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        // 1. 讀取綠界回傳的表單資料
        const formData = await req.formData();

        // [Debug] 在終端機印出綠界傳回來的資料，方便除錯
        // 如果終端機沒印出東西，代表綠界根本沒連到這隻 API (網址設錯)
        console.log("🏪 ECPay 7-11 Callback Data:", Object.fromEntries(formData));

        const storeId = formData.get("CVSStoreID")?.toString();
        const storeName = formData.get("CVSStoreName")?.toString();
        const storeAddr = formData.get("CVSAddress")?.toString();
        const logisticsSubType = formData.get("LogisticsSubType")?.toString();

        // 2. 自動取得當前網站的網域 (比 process.env 更穩，避免 localhost vs 127.0.0.1 的問題)
        const origin = new URL(req.url).origin;
        const redirectUrl = new URL("/cart", origin);

        // 3. 設定回傳給前端的參數
        if (storeId) {
            redirectUrl.searchParams.set("step", "2"); // 強制回到第二步

            // 確保有值才設定，避免出現 "null" 字串
            if (storeName) redirectUrl.searchParams.set("storeName", storeName);
            if (storeId) redirectUrl.searchParams.set("storeId", storeId);
            if (storeAddr) redirectUrl.searchParams.set("storeAddr", storeAddr);

            // 判斷物流商 (包含 UNIMART 或 UNIMARTC2C 都是 7-11)
            if (logisticsSubType && logisticsSubType.includes("UNIMART")) {
                redirectUrl.searchParams.set("provider", "711");
            } else {
                redirectUrl.searchParams.set("provider", "ecpay_cvs"); // 全家/萊爾富
            }
        }

        // 4. 執行轉址 (303 See Other 是處理 POST 後轉址的標準狀態碼)
        return NextResponse.redirect(redirectUrl.toString(), 303);

    } catch (error) {
        console.error("❌ ECPay Callback Error:", error);
        // 發生錯誤時，轉回購物車並帶上錯誤參數
        return NextResponse.redirect(new URL("/cart?error=callback_failed", req.url));
    }
}