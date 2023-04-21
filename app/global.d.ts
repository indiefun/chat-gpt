declare module "*.jpg";
declare module "*.png";
declare module "*.woff2";
declare module "*.woff";
declare module "*.ttf";
declare module "*.scss" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.svg";

declare module "audio-recorder-polyfill/mpeg-encoder" {
  const mpegEncoder: () => void;
  export default mpegEncoder;
}
