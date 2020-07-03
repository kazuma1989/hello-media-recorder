import {
  html,
  render,
  useState,
  useEffect,
} from "https://unpkg.com/htm/preact/standalone.module.js";
import AudioRecorder from "https://cdn.jsdelivr.net/npm/audio-recorder-polyfill/index.js";

if (!window.MediaRecorder) {
  window.MediaRecorder = AudioRecorder;
}

function App() {
  const recorder = useAudioRecorder();
  const start = () => {
    recorder?.start();
    setSrc(null);
  };
  const stop = () => {
    recorder?.stop();
  };

  useEffect(() => {
    if (!recorder) return;

    const onDataAvailable = (e) => {
      console.count(onDataAvailable.name);
      setSrc(URL.createObjectURL(e.data));
    };

    recorder.addEventListener("dataavailable", onDataAvailable);
    return () => recorder.removeEventListener("dataavailable", onDataAvailable);
  }, [recorder]);

  const [src, setSrc] = useState(null);

  return html`
    <h1>HELLO</h1>
    <p>MediaRecorder の実験</p>

    <button type="button" onClick=${start}>Start recording</button>
    <button type="button" onClick=${stop}>Stop recording</button>

    ${src &&
    html`
      <p>Recorded!</p>
      <audio src=${src} controls></audio>
    `}
  `;
}

function useAudioRecorder() {
  const [recorder, setRecorder] = useState(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(async (stream) => {
        setRecorder(new MediaRecorder(stream));
      });
  }, []);

  return recorder;
}

render(html`<${App} />`, document.getElementById("root"));
