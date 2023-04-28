import * as React from "react";

import styles from "./button.module.scss";
import { useState } from "react";

export function IconButton(props: {
  onClick?: () => void;
  icon: JSX.Element;
  text?: string;
  bordered?: boolean;
  shadow?: boolean;
  noDark?: boolean;
  className?: string;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      className={
        styles["icon-button"] +
        ` ${props.bordered && styles.border} ${props.shadow && styles.shadow} ${
          props.className ?? ""
        } clickable`
      }
      onClick={props.onClick}
      title={props.title}
      disabled={props.disabled}
      role="button"
    >
      <div
        className={styles["icon-button-icon"] + ` ${props.noDark && "no-dark"}`}
      >
        {props.icon}
      </div>
      {props.text && (
        <div className={styles["icon-button-text"]}>{props.text}</div>
      )}
    </button>
  );
}

export function StateButton(props: {
  initState?: any;
  states: any[];
  icons?: JSX.Element[];
  onChange?: (state: any) => void;
  texts?: string[];
  bordered?: boolean;
  shadow?: boolean;
  noDark?: boolean;
  className?: string;
  titles?: string[];
  disabled?: boolean;
}) {
  const initStateIndex = props.states.indexOf(props.initState) ?? 0;
  const [stateIndex, setStateIndex] = useState(initStateIndex);
  const handleClick = () => {
    const nextStateIndex = (stateIndex + 1) % props.states.length;
    setStateIndex(nextStateIndex);
    props.onChange?.(props.states[nextStateIndex]);
  };

  const icon = props.icons?.[stateIndex];
  const text = props.texts?.[stateIndex];
  return (
    <button
      className={
        styles["icon-button"] +
        ` ${props.bordered && styles.border} ${props.shadow && styles.shadow} ${
          props.className ?? ""
        } clickable`
      }
      onClick={handleClick}
      title={props.titles?.[stateIndex]}
      disabled={props.disabled}
      role="button"
    >
      {icon && (
        <div
          className={
            styles["icon-button-icon"] + ` ${props.noDark && "no-dark"}`
          }
        >
          {icon}
        </div>
      )}
      {text && (
        <div className={styles["icon-button-text"] + ` ${icon || "n-m-l"}`}>
          {text}
        </div>
      )}
    </button>
  );
}
