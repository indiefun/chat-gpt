import { NextRequest } from "next/server";
import { getServerSideConfig } from "../config/server";

const serverConfig = getServerSideConfig();

async function request(
  req: NextRequest,
  urlBase: string,
  headers?: { [key: string]: string },
) {
  const urlPath = req.headers.get("path");
  const contentType = req.headers.get("Content-Type") ?? "application/json";

  console.log("[Request] base: ", urlBase);
  console.log("[Request] path: ", urlPath);

  return fetch(`${urlBase}/${urlPath}`, {
    headers: {
      "Content-Type": contentType,
      ...headers,
    },
    method: req.method,
    body: req.body,
  });
}

export async function requestOpenai(req: NextRequest) {
  const orgId = process.env.OPENAI_ORG_ID;
  if (orgId) {
    console.log("[Org ID] ", orgId);
  }
  return request(req, serverConfig.openAiUrl, {
    Authorization: `Bearer ${serverConfig.openAiKey}`,
    ...(orgId && {
      "OpenAI-Organization": orgId,
    }),
  });
}

export async function requestHuggingFace(req: NextRequest) {
  return request(req, serverConfig.huggingFaceUrl, {
    Authorization: `Bearer ${serverConfig.huggingFaceToken}`,
  });
}

export async function requestDiffusion(req: NextRequest) {
  return request(req, serverConfig.diffusionUrl, {
    Authorization: `Basic ${serverConfig.huggingFaceToken}`,
  });
}
