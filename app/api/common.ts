import { NextRequest } from "next/server";

const OPENAI_URL = process.env.OPENAI_URL ?? "https://api.openai.com";
const HUGGING_FACE_URL =
  process.env.HUGGING_FACE_URL ?? "https://api-inference.huggingface.co/";

async function request(
  req: NextRequest,
  urlBase: string,
  headers?: { [key: string]: string },
) {
  const apiKey = req.headers.get("token");
  const urlPath = req.headers.get("path");

  console.log("[Request] base: ", urlBase);
  console.log("[Request] path: ", urlPath);

  return fetch(`${urlBase}/${urlPath}`, {
    headers: {
      "Content-Type": req.headers.get("Content-Type") ?? "application/json",
      Authorization: `Bearer ${apiKey}`,
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
  return request(req, OPENAI_URL, {
    ...(orgId && {
      "OpenAI-Organization": orgId,
    }),
  });
}

export async function requestHuggingFace(req: NextRequest) {
  return request(req, HUGGING_FACE_URL);
}
