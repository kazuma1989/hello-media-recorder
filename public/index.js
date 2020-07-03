import {
  html,
  render,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "https://unpkg.com/htm/preact/standalone.module.js";
import AudioRecorder from "https://cdn.jsdelivr.net/npm/audio-recorder-polyfill/index.js";

if (!window.MediaRecorder) {
  window.MediaRecorder = AudioRecorder;
}

function App() {
  const [active, setActive] = useState(false);
  const init = () => {
    setActive(true);
  };
  const tearDown = () => {
    setActive(false);
  };

  return html`
    <h1>HELLO</h1>
    <p>MediaRecorder の実験</p>

    <p>
      <button type="button" onClick=${init}>Init</button>
      <button type="button" onClick=${tearDown}>Tear down</button>
    </p>

    ${active && html`<${Recorder} />`}
  `;
}

function Recorder() {
  const [src, setSrc] = useState(null);

  const [recorder, init] = useAudioRecorder();
  const start = () => {
    setSrc(null);
    recorder?.start(100);
  };
  const stop = () => {
    recorder?.stop();
  };

  useEffect(() => init({ audio: true }), [init]);

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

  return html`
    <div>
      <h2>Recorder</h2>

      <p>
        <button type="button" onClick=${start}>Start recording</button>
        <button type="button" onClick=${stop}>Stop recording</button>
      </p>

      ${src &&
      html`
        <p>Recorded!</p>
        <audio src=${src} controls></audio>
      `}
    </div>
  `;
}

function useAudioRecorder() {
  const [recorder, setRecorder] = useState(null);

  const getUserMedia = useCallback((constraints) => {
    const recorder$ = navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => new MediaRecorder(stream));

    recorder$.then(setRecorder);

    return async () => {
      (await recorder$)?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return [recorder, getUserMedia];
}

render(html`<${App} />`, document.getElementById("root"));
