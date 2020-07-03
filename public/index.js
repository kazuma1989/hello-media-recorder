// @ts-check

import {
  html,
  render,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "https://unpkg.com/htm/preact/standalone.module.js";
import AudioRecorder from "https://cdn.jsdelivr.net/npm/audio-recorder-polyfill/index.js";

if (!window.MediaRecorder) {
  window.MediaRecorder = AudioRecorder;
}

function App() {
  const [recorder, _init] = useAudioRecorder();
  const resource = useMemo(() => new Resource(() => _init({ audio: true })), [
    _init,
  ]);
  useEffect(() => resource.close.bind(resource), [resource]);

  const [active, setActive] = useState(false);
  const init = () => {
    resource.open();
    setActive(true);
  };
  const tearDown = () => {
    resource.close();
    setActive(false);
  };

  return html`
    <h1>HELLO</h1>
    <p>MediaRecorder の実験</p>

    <p>
      <button type="button" onClick=${init}>Init</button>
      <button type="button" onClick=${tearDown}>Tear down</button>
    </p>

    <${Recorder} recorder=${recorder} active=${active} />
  `;
}

class Resource {
  constructor(_open) {
    this._open = _open;
  }

  open(...args) {
    this.close();
    this._close = this._open(...args);

    return this._close;
  }

  close() {
    this._close?.();
    this._close = undefined;
  }
}

function Recorder({ recorder, active }) {
  const [src, setSrc] = useState(null);
  const [status, setStatus] = useState("INITIAL");

  const start = () => {
    URL.revokeObjectURL(src);
    setSrc(null);
    setStatus("RECORDING");
    recorder?.start(100);
  };
  const stop = () => {
    setStatus("STOPPED");
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
      chunks$.current = [];
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
        <button
          type="button"
          disabled=${!active || status === "RECORDING"}
          onClick=${start}
        >
          Start recording
        </button>
        <button
          type="button"
          disabled=${!active || status !== "RECORDING"}
          onClick=${stop}
        >
          Stop recording
        </button>
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
