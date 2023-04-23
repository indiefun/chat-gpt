import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "./app/config/server";
import md5 from "spark-md5";

export const config = {
  matcher: ["/api/openai", "/api/chat-stream", "/api/hugging-face"],
};

const serverConfig = getServerSideConfig();

function getIP(req: NextRequest) {
  let ip = req.ip ?? req.headers.get("x-real-ip");
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }

  return ip;
}

export function middleware(req: NextRequest) {
  const accessCode = req.headers.get("access-code");
  const hashedCode = md5.hash(accessCode ?? "").trim();

  console.log("[Time] ", new Date().toLocaleString());
  console.log("[Auth] allowed hashed codes: ", [...serverConfig.codes]);
  console.log("[Auth] got access code: ", accessCode);
  console.log("[Auth] hashed access code: ", hashedCode);
  console.log("[User] ip: ", getIP(req));

  if (serverConfig.needCode && !serverConfig.codes.has(hashedCode)) {
    return NextResponse.json(
      {
        error: true,
        needAccessCode: true,
        msg: "Please go settings page and fill your access code.",
      },
      {
        status: 401,
      },
    );
  }

  const reqUrl = new URL(req.url);
  console.log("[Middleware] url path: ", reqUrl.pathname);

  const tokenName = reqUrl.pathname.startsWith("/api/hugging-face") ? "hugging-face" : "openai";
  const tokenKey = reqUrl.pathname.startsWith("/api/hugging-face") ? serverConfig.huggingFaceToken : serverConfig.openAiKey;

  if (tokenKey) {
    console.log("[Auth] set system token: ", tokenName);
    req.headers.set("token", tokenKey);
  } else {
    return NextResponse.json(
        {
          error: true,
          msg: `Empty Token For: ${tokenName}`,
        },
        {
          status: 401,
        },
    );
  }

  return NextResponse.next({
    request: {
      headers: req.headers,
    },
  });
}
