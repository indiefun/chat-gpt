import { useMemo, ReactElement } from "react";
import { PAINTING_MODELS, PaintingModel, PaintingOptions } from "../store";
import styles from "./painting-settings.module.scss";

function SettingList(props: {
  title: string;
  children: ReactElement[] | ReactElement;
}) {
  return <div className={styles["setting-container"]}>{props.children}</div>;
}

function SettingItem(props: {
  title: string;
  value?: string | number;
  className?: string;
  children: ReactElement[] | ReactElement;
}) {
  return (
    <div className={styles["setting-item"] + ` ${props.className}`}>
      <div className={styles["setting-item-title"]}>
        <span>{props.title}</span>
        <span>{props.value}</span>
      </div>
      {props.children}
    </div>
  );
}

function buildDict(list: any[], key: string) {
  const dict = {} as { [key: string]: any };
  for (const item of list) {
    dict[item[key]] = item;
  }
  return dict;
}

export const PaintingSettings = (props: {
  options: PaintingOptions;
  setOptions: (config: PaintingOptions) => void;
}) => {
  const { options, setOptions } = props;
  const modelList = useMemo(
    () => PAINTING_MODELS.filter((m) => m.available).map((m) => m.name),
    [],
  );
  const modelDict = useMemo(() => buildDict(PAINTING_MODELS, "name"), []);
  const defaultModel = modelList[0];
  const modelFeatures = modelDict[options.model ?? defaultModel]?.features;
  // TODO: get sampler from server
  const samplerList = useMemo(
    () => [
      "Euler a",
      "Euler",
      "LMS",
      "Heun",
      "DPM2",
      "DPM2 a",
      "DPM++ 2S a",
      "DPM++ 2M",
      "DPM++ SDE",
      "DPM fast",
      "DPM adaptive",
      "LMS Karras",
      "DPM2 Karras",
      "DPM2 a Karras",
      "DPM++ 2S a Karras",
      "DPM++ 2M Karras",
      "DPM++ SDE Karras",
      "DDIM",
      "PLMS",
    ],
    [],
  );
  const defaultSampler = samplerList[0];
  // TODO: default value
  return (
    <SettingList title={"Painting Config"}>
      <SettingItem title={"Model"}>
        <select
          value={options.model ?? defaultModel}
          onChange={(e) =>
            setOptions({
              ...options,
              model: e.currentTarget.value as PaintingModel,
            })
          }
        >
          {modelList.map((model) => (
            <option value={model} key={model}>
              {model}
            </option>
          ))}
        </select>
      </SettingItem>
      <SettingItem title={"Sampler"}>
        <select
          value={options.sampler_index ?? defaultSampler}
          disabled={!modelFeatures?.sampler_index}
          onChange={(e) =>
            setOptions({
              ...options,
              sampler_index: e.currentTarget.value,
            })
          }
        >
          {samplerList.map((sampler) => (
            <option value={sampler} key={sampler}>
              {sampler}
            </option>
          ))}
        </select>
      </SettingItem>
      <SettingItem title={"Width"} value={options.width ?? 512}>
        <input
          type="range"
          value={options.width ?? 512}
          disabled={!modelFeatures?.width}
          min={256}
          max={1024}
          step={256}
          onChange={(e) =>
            setOptions({
              ...options,
              width: e.currentTarget.valueAsNumber,
            })
          }
        />
      </SettingItem>
      <SettingItem title={"Height"} value={options.height ?? 512}>
        <input
          type="range"
          value={options.height ?? 512}
          disabled={!modelFeatures?.height}
          min={256}
          max={1024}
          step={256}
          onChange={(e) =>
            setOptions({
              ...options,
              height: e.currentTarget.valueAsNumber,
            })
          }
        />
      </SettingItem>
      <SettingItem title={"Step"} value={options.steps ?? 20}>
        <input
          type="range"
          value={options.steps ?? 20}
          disabled={!modelFeatures?.steps}
          min={1}
          max={150}
          step={1}
          onChange={(e) =>
            setOptions({
              ...options,
              steps: e.currentTarget.valueAsNumber,
            })
          }
        />
      </SettingItem>
      <SettingItem
        title={"Scale"}
        value={(options.cfg_scale ?? 7.5).toFixed(1)}
      >
        <input
          type="range"
          value={options.cfg_scale ?? 7.5}
          disabled={!modelFeatures?.cfg_scale}
          min={1}
          max={30}
          step={0.5}
          onChange={(e) =>
            setOptions({
              ...options,
              cfg_scale: e.currentTarget.valueAsNumber,
            })
          }
        />
      </SettingItem>
      <SettingItem title={"Seed"}>
        <input
          type="number"
          value={options.seed ?? -1}
          disabled={!modelFeatures?.seed}
          onChange={(e) =>
            setOptions({
              ...options,
              seed: e.currentTarget.valueAsNumber,
            })
          }
        />
      </SettingItem>
      <SettingItem title={"Count"} value={options.batch_size ?? 1}>
        <input
          type="range"
          value={options.batch_size ?? 1}
          disabled={!modelFeatures?.batch_size}
          min={1}
          max={8}
          step={1}
          onChange={(e) =>
            setOptions({
              ...options,
              batch_size: e.currentTarget.valueAsNumber,
            })
          }
        />
      </SettingItem>
      <SettingItem title={"Negative"} className={styles["full-width"]}>
        <input
          type="text"
          value={options.negative_prompt ?? ""}
          disabled={!modelFeatures?.negative_prompt}
          onInput={(e) =>
            setOptions({
              ...options,
              negative_prompt: e.currentTarget.value,
            })
          }
        />
      </SettingItem>
    </SettingList>
  );
};
