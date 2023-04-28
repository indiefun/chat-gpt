import md5 from "spark-md5";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CODE?: string;
      PROXY_URL?: string;
      VERCEL?: string;

      OPENAI_API_KEY?: string;
      OPENAI_URL?: string;
      HUGGING_FACE_TOKEN?: string;
      HUGGING_FACE_URL?: string;
      STABLE_DIFFUSION_TOKEN?: string;
      STABLE_DIFFUSION_URL?: string;
    }
  }
}

const ACCESS_CODES = (function getAccessCodes(): Set<string> {
  const code = process.env.CODE;

  try {
    const codes = (code?.split(",") ?? [])
      .filter((v) => !!v)
      .map((v) => md5.hash(v.trim()));
    return new Set(codes);
  } catch (e) {
    return new Set();
  }
})();

export const getServerSideConfig = () => {
  if (typeof process === "undefined") {
    throw Error(
      "[Server Config] you are importing a nodejs-only module outside of nodejs",
    );
  }

  return {
    codes: ACCESS_CODES,
    needCode: ACCESS_CODES.size > 0,
    proxyUrl: process.env.PROXY_URL,
    isVercel: !!process.env.VERCEL,

    openAiKey: process.env.OPENAI_API_KEY,
    openAiUrl: process.env.OPENAI_URL ?? "https://api.openai.com",
    huggingFaceToken: process.env.HUGGING_FACE_TOKEN,
    huggingFaceUrl:
      process.env.HUGGING_FACE_URL ?? "https://api-inference.huggingface.co",
    stableDiffusionToken: process.env.STABLE_DIFFUSION_TOKEN,
    stableDiffusionUrl:
      process.env.STABLE_DIFFUSION_URL ?? "https://diffusion.luming.fun",
  };
};
