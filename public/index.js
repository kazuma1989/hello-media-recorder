import {
  html,
  render,
  useState,
  useEffect,
  useRef,
} from "https://unpkg.com/htm/preact/standalone.module.js";
import AudioRecorder from "https://cdn.jsdelivr.net/npm/audio-recorder-polyfill/index.js";

if (!window.MediaRecorder) {
  window.MediaRecorder = AudioRecorder;
}

function App() {
  const recorder = useAudioRecorder();
  const start = () => {
    recorder?.start(100);
    setSrc(null);
  };
  const stop = () => {
    recorder?.stop();
  };

  const chunks$ = useRef([]);
  useEffect(() => {
    if (!recorder) return;

    const onDataAvailable = (e) => {
      console.count(onDataAvailable.name);

      chunks$.current.push(e.data);
    };
    recorder.addEventListener("dataavailable", onDataAvailable);

    const onStop = () => {
      console.count(onStop.name);

      setSrc(URL.createObjectURL(new Blob(chunks$.current)));
    };
    recorder.addEventListener("stop", onStop);

    return () => {
      recorder.removeEventListener("dataavailable", onDataAvailable);
      recorder.removeEventListener("stop", onStop);
    };
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
