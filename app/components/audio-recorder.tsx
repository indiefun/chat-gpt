import { useState, useEffect, useRef } from "react";
import { AudioAnalyser } from "./audio-analyser";
import styles from "./audio-recorder.module.scss";

async function polyfill() {
  return {
    MediaRecorder: (await import("audio-recorder-polyfill")).default,
    mpegEncoder: (await import("audio-recorder-polyfill/mpeg-encoder")).default,
  };
}

function doNothing() {}

export function AudioRecorder(props: {
  isRecording: boolean;
  onAudioRecorded: (blob: Blob, duration: number) => void;
  onErrorOccurred?: (message: string) => void;
  className?: string;
}) {
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

  function awaitAudioStream(
    doWithAudioStream: (MediaStream: MediaStream) => void,
  ) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        doWithAudioStream(stream);
      })
      .catch(() => onErrorOccurred("无法获取麦克风使用权限"));
  }

  function startRecording() {
    awaitPolyfill((MediaRecorder) => {
      awaitAudioStream((stream) => {
        setMediaStream(stream);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        const timestamp = Date.now().valueOf();
        const recordedChunks = [] as Blob[];
        mediaRecorder.addEventListener("start", () => {
          console.log("recording start");
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
          console.log("recording stop", blob, duration);
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

  useEffect(() => {
    if (props.isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [props.isRecording]);

  return (
    <div className={`${props.className ?? ""} ${styles["container"]}`}>
      {!props.isRecording && (
        <div className={`${styles["prompt"]}`}>长按录音</div>
      )}
      {mediaStream && (
        <AudioAnalyser
          className={`${styles["analyser"]}`}
          audioStream={mediaStream}
        />
      )}
    </div>
  );
}
