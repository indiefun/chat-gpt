import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum SubmitKey {
  Enter = "Enter",
  CtrlEnter = "Ctrl + Enter",
  ShiftEnter = "Shift + Enter",
  AltEnter = "Alt + Enter",
  MetaEnter = "Meta + Enter",
}

export enum Theme {
  Auto = "auto",
  Dark = "dark",
  Light = "light",
}

const DEFAULT_CONFIG = {
  historyMessageCount: 4,
  compressMessageLengthThreshold: 1000,
  sendBotMessages: true as boolean,
  submitKey: SubmitKey.CtrlEnter as SubmitKey,
  avatar: "1f603",
  fontSize: 14,
  theme: Theme.Auto as Theme,
  tightBorder: false,
  sendPreviewBubble: true,
  sidebarWidth: 300,

  disablePromptHint: false,

  modelConfig: {
    model: "gpt-3.5-turbo" as ModelType,
    temperature: 1,
    max_tokens: 2000,
    presence_penalty: 0,
  },
};

export type ChatConfig = typeof DEFAULT_CONFIG;

export type ChatConfigStore = ChatConfig & {
  reset: () => void;
  update: (updater: (config: ChatConfig) => void) => void;
};

export type ModelConfig = ChatConfig["modelConfig"];

const ENABLE_GPT4 = true;

export const ALL_MODELS = [
  {
    name: "gpt-4",
    available: ENABLE_GPT4,
  },
  {
    name: "gpt-4-0314",
    available: ENABLE_GPT4,
  },
  {
    name: "gpt-4-32k",
    available: ENABLE_GPT4,
  },
  {
    name: "gpt-4-32k-0314",
    available: ENABLE_GPT4,
  },
  {
    name: "gpt-3.5-turbo",
    available: true,
  },
  {
    name: "gpt-3.5-turbo-0301",
    available: true,
  },
] as const;

export type DiffusionOptions = {
  negative_prompt?: string;
  seed?: number;
  steps?: number; // [1, 150] step: 1
  cfg_scale?: number; // [1, 30] step: 0.5
  width?: number; // 256 | 512 | 768 | 1024
  height?: number; // 256 | 512 | 768 | 1024
  sampler_index?: string; // "Euler a" | "Euler" | "LMS" | "Heun" | "DPM2" | "DPM2 a" | "DPM++ 2S a" | "DPM++ 2M" | "DPM++ SDE" | "DPM fast" | "DPM adaptive" | "LMS Karras" | "DPM2 Karras" | "DPM2 a Karras" | "DPM++ 2S a Karras" | "DPM++ 2M Karras" | "DPM++ SDE Karras" | "DDIM" | "PLMS"
  batch_size?: number; // [1, 8] step: 1
};

export const PAINTING_MODELS = [
  {
    name: "HuggingFace",
    available: true,
    features: {
      negative_prompt: true,
      seed: false,
      steps: true,
      cfg_scale: true,
      width: true,
      height: true,
      sampler_index: false,
      batch_size: false,
    },
  },
  {
    name: "StableDiffusion",
    available: true,
    features: {
      negative_prompt: true,
      seed: true,
      steps: true,
      cfg_scale: true,
      width: true,
      height: true,
      sampler_index: true,
      batch_size: true,
    },
  },
];

export type PaintingModel = (typeof PAINTING_MODELS)[number]["name"];

export type PaintingOptions = DiffusionOptions & {
  model: PaintingModel;
};

export type ModelType = (typeof ALL_MODELS)[number]["name"];

export function limitNumber(
  x: number,
  min: number,
  max: number,
  defaultValue: number,
) {
  if (typeof x !== "number" || isNaN(x)) {
    return defaultValue;
  }

  return Math.min(max, Math.max(min, x));
}

export function limitModel(name: string) {
  return ALL_MODELS.some((m) => m.name === name && m.available)
    ? name
    : ALL_MODELS[4].name;
}

export const ModalConfigValidator = {
  model(x: string) {
    return limitModel(x) as ModelType;
  },
  max_tokens(x: number) {
    return limitNumber(x, 0, 32000, 2000);
  },
  presence_penalty(x: number) {
    return limitNumber(x, -2, 2, 0);
  },
  temperature(x: number) {
    return limitNumber(x, 0, 2, 1);
  },
};

const CONFIG_KEY = "app-config";

export const useAppConfig = create<ChatConfigStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_CONFIG,

      reset() {
        set(() => ({ ...DEFAULT_CONFIG }));
      },

      update(updater) {
        const config = { ...get() };
        updater(config);
        set(() => config);
      },
    }),
    {
      name: CONFIG_KEY,
    },
  ),
);
