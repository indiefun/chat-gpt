import { NextRequest, NextResponse } from "next/server";

import { getServerSideConfig } from "../../config/server";

const serverConfig = getServerSideConfig();

// Danger! Don not write any secret value here!
// 警告！不要在这里写入任何敏感信息！
const DANGER_CONFIG = {
  needCode: serverConfig.needCode,
};

declare global {
  type DangerConfig = typeof DANGER_CONFIG;
}

export async function POST(req: NextRequest) {
  return NextResponse.json({
    needCode: serverConfig.needCode,
  });
}

export const config = {
  runtime: "experimental-edge",
  regions: ["sin1", "iad1", "cle1", "pdx1", "sfo1", "lhr1", "cdg1", "arn1"],
};
