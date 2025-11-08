// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
// 有 @/ 別名用這行：
import { authOptions } from "@/lib/auth-options";
// 沒有別名就用相對路徑（請依你的實際層級調整）：
// import { authOptions } from "../../../lib/auth-options";

// 使用 Node runtime（因 callbacks 內有 Buffer）
export const runtime = "nodejs";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
