import { NextRequest, NextResponse } from "next/server";
import { requestDiffusion } from "../common";

async function makeRequest(req: NextRequest) {
  try {
    const api = await requestDiffusion(req);
    const res = new NextResponse(api.body);
    res.headers.set("Cache-Control", "no-cache");
    return res;
  } catch (e) {
    console.error("[Diffusion] ", req.body, e);
    return NextResponse.json(
      {
        error: true,
        msg: JSON.stringify(e),
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(req: NextRequest) {
  return makeRequest(req);
}

export async function GET(req: NextRequest) {
  return makeRequest(req);
}

export const config = {
  runtime: "experimental-edge",
  regions: ["sin1", "iad1", "cle1", "pdx1", "sfo1", "lhr1", "cdg1", "arn1"],
};
