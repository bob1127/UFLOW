import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // ezShip 選完店後會傳回來的欄位
    const storeName = formData.get("stName"); // 門市名稱
    const storeId = formData.get("stCode");   // 門市店號
    const storeAddr = formData.get("stAddr"); // 門市地址
    const storeType = formData.get("stType"); // 門市類別 (FM, OK, LY 或 7-11 相關標記)

    // 設定回傳導向網址 (回到購物車結帳頁 Step 2)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const redirectUrl = new URL("/cart", baseUrl); 
    
    // 將參數帶入 URL 讓前端 useEffect 接收
    redirectUrl.searchParams.set("step", "2");
    redirectUrl.searchParams.set("storeName", storeName as string);
    redirectUrl.searchParams.set("storeId", storeId as string);
    redirectUrl.searchParams.set("storeAddr", storeAddr as string);
    
    // 根據回傳的類型判斷顯示名稱
    let method = "CVS";
    if (storeType === "FM") method = "FAMI";
    if (storeType === "7") method = "UNIMART";

    redirectUrl.searchParams.set("shipMethod", method);

    // 回傳 303 Redirect 到結帳頁
    return NextResponse.redirect(redirectUrl.toString(), 303);
  } catch (error) {
    console.error("ezShip Callback Error:", error);
    return NextResponse.json({ error: "ezShip Map callback failed" }, { status: 500 });
  }
}