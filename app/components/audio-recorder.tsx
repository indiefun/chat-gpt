import { useState, useRef } from "react";
import { AudioAnalyser } from "./audio-analyser";
import styles from "./audio-recorder.module.scss";

import LoadingIcon from "../icons/three-dots.svg";
import RecordIcon from "../icons/record.svg";

async function polyfill() {
  return {
    MediaRecorder: (await import("audio-recorder-polyfill")).default,
    mpegEncoder: (await import("audio-recorder-polyfill/mpeg-encoder")).default,
  };
}

function doNothing() {}

export function AudioRecorder(props: {
  onAudioRecorded: (blob: Blob, duration: number) => void;
  onErrorOccurred?: (message: string) => void;
  inTranscription?: boolean;
  className?: string;
}) {
  const [isGranted, setIsGranted] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const onErrorOccurred = props.onErrorOccurred ?? doNothing;

  function awaitPolyfill(doWithPolyfill: (MediaRecorder: any) => void) {
    polyfill()
      .then(({ MediaRecorder, mpegEncoder }) => {
        MediaRecorder.encoder = mpegEncoder;
        MediaRecorder.prototype.mimeType = "audio/mpeg";
        doWithPolyfill(MediaRecorder);
      })
      .catch((error) =>
        onErrorOccurred(
          "该浏览器不支持，建议使用Chrome、Edge、Safari、Firefox等浏览器",
        ),
      );
  }

  function awaitAudioStream(doWithStream: (MediaStream: MediaStream) => void) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        doWithStream(stream);
      })
      .catch(() => onErrorOccurred("无法获取麦克风使用权限"));
  }

  function grantPermission() {
    awaitAudioStream((stream) => {
      stream.getAudioTracks().forEach((track) => track.stop());
      setIsGranted(true);
    });
  }

  function startRecording() {
    awaitPolyfill((MediaRecorder) => {
      awaitAudioStream((stream) => {
        setMediaStream(stream);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        let timestamp = Date.now().valueOf();
        const recordedChunks = [] as Blob[];
        mediaRecorder.addEventListener("start", () => {
          timestamp = Date.now().valueOf();
        });
        mediaRecorder.addEventListener("dataavailable", (event: any) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        });
        mediaRecorder.addEventListener("stop", () => {
          const blob = new Blob(recordedChunks, {
            type: mediaRecorder.mimeType,
          });
          const duration = Date.now().valueOf() - timestamp;
          props.onAudioRecorded(blob, duration);
        });
        mediaRecorder.start();
      });
    });
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
  }

  function tryStartRecording(e: any) {
    if (isGranted) {
      startRecording();
    } else {
      grantPermission();
    }
  }

  function tryStopRecording(e: any) {
    if (isGranted) {
      stopRecording();
    }
  }

  function tryPreventContext(e: any) {
    e.preventDefault();
  }

  return (
    <div
      className={`${props.className ?? ""} ${styles["container"]}`}
      onMouseDown={tryStartRecording}
      onMouseUp={tryStopRecording}
      onTouchStart={tryStartRecording}
      onTouchEnd={tryStopRecording}
      onContextMenu={tryPreventContext}
    >
      {
        /* prettier-ignore */
        props.inTranscription ?
          (<LoadingIcon className={`${styles["transcription"]}`} />) :
          (!isGranted ?
              (<div className={`${styles["prompt"]}`}>点击授权</div>) :
              (!mediaStream ?
                  (<div className={`${styles["prompt"]}`}>长按录音</div>) :
                  (<AudioAnalyser className={`${styles["analyser"]}`} audioStream={mediaStream}/>)
              )
          )
      }
      <RecordIcon />
    </div>
  );
}
