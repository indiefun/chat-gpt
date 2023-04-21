import { useState, useEffect, useRef } from "react";
import { AudioAnalyser } from "./audio-analyser";

async function polyfill() {
  return {
    MediaRecorder: (await import("audio-recorder-polyfill")).default,
    mpegEncoder: (await import("audio-recorder-polyfill/mpeg-encoder")).default,
  };
}

export function AudioRecorder(props: {
  isRecording: boolean;
  onAudioRecorded: (blob: Blob) => void;
  onErrorOccurred?: (message: string) => void;
  className?: string;
}) {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    polyfill()
      .then(({ MediaRecorder, mpegEncoder }) => {
        MediaRecorder.encoder = mpegEncoder;
        MediaRecorder.prototype.mimeType = "audio/mpeg";
        if (props.isRecording) {
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
              setMediaStream(stream);

              const mediaRecorder = new MediaRecorder(stream);
              mediaRecorderRef.current = mediaRecorder;

              const recordedChunks = [] as Blob[];
              mediaRecorder.addEventListener("dataavailable", (event: any) => {
                if (event.data.size > 0) {
                  recordedChunks.push(event.data);
                }
              });
              mediaRecorder.addEventListener("stop", () => {
                const blob = new Blob(recordedChunks, {
                  type: mediaRecorder.mimeType,
                });
                props.onAudioRecorded(blob);
              });
              mediaRecorder.start();
            })
            .catch(() => {
              if (props.onErrorOccurred) {
                props.onErrorOccurred("无法获取麦克风使用权限");
              }
            });
        } else {
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current = null;
          }
          if (mediaStream) {
            setMediaStream(null);
            mediaStream.getAudioTracks().forEach((track) => track.stop());
          }
        }
      })
      .catch(() => {
        if (props.onErrorOccurred) {
          props.onErrorOccurred(
            "该浏览器不支持MediaRecorder API，建议使用Chrome、Edge、Safari、Firefox等浏览器",
          );
        }
      });
  }, [props.isRecording, props.onAudioRecorded]);

  return (
    mediaStream && (
      <AudioAnalyser
        className={`${props.className ?? ""}`}
        audioStream={mediaStream}
      />
    )
  );
}
