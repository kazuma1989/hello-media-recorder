// @ts-check
/// <reference path="./typings.d.ts" />

import {
  html,
  render,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "https://unpkg.com/htm/preact/standalone.module.js";

const EVENTS = ["start", "stop", "pause", "resume"];
const TYPES = ["audio/webm", "audio/ogg", "audio/wav"];

const KB = 1 << 10;
const MB = 1 << 20;

setTimeout(() => {
  render(
    html`<${App} notSupported=${MediaRecorder.notSupported} />`,
    document.body
  );
}, 0);

function App({ notSupported }) {
  const recordFull$ = useRef();
  const recordParts$ = useRef();
  const stop$ = useRef();
  const pause$ = useRef();

  const [recorder, getUserMedia] = useAudioRecorder();
  useEffect(() => getUserMedia({ audio: true }), [getUserMedia]);

  const [events, setEvents] = useState([]);
  const addEvent = (e) => {
    setEvents((events) => [...events, e]);
  };
  useEffect(() => {
    if (!recorder) return;

    recorder.addEventListener("start", (e) => {
      addEvent({
        eventName: "start",
        state: recorder.state,
        mimeType: recorder.mimeType,
      });
    });

    recorder.addEventListener("stop", (e) => {
      addEvent({
        eventName: "stop",
        state: recorder.state,
      });
    });

    recorder.addEventListener("pause", (e) => {
      addEvent({
        eventName: "pause",
        state: recorder.state,
      });
    });

    recorder.addEventListener("resume", (e) => {
      addEvent({
        eventName: "resume",
        state: recorder.state,
      });
    });
  }, [recorder]);

  if (notSupported) {
    return html`
      <main>
        <p>Not supported</p>
      </main>
    `;
  }

  const polyfillEnabled = notSupported !== undefined;

  let recordPartsDisabled = true;
  let recordFullDisabled = true;
  let requestDisabled = true;
  let resumeDisabled = true;
  let pauseDisabled = true;
  let stopDisabled = true;
  if (!recorder) {
  } else if (recorder.state === "recording") {
    recordPartsDisabled = true;
    recordFullDisabled = true;
    requestDisabled = false;
    resumeDisabled = true;
    pauseDisabled = false;
    stopDisabled = false;
  } else if (recorder.state === "paused") {
    recordPartsDisabled = true;
    recordFullDisabled = true;
    requestDisabled = false;
    resumeDisabled = false;
    pauseDisabled = true;
    stopDisabled = false;
  } else if (recorder.state === "inactive") {
    recordPartsDisabled = false;
    recordFullDisabled = false;
    requestDisabled = true;
    resumeDisabled = true;
    pauseDisabled = true;
    stopDisabled = true;
  }

  return html`
    <main>
      <p>
        <a href="https://github.com/ai/audio-recorder-polyfill"
          >Audio Recorder Polyfill</a
        >${" "} is a MediaRecorder polyfill to record audio in Edge and Safari.
        See${" "}
        <a href="https://ai.github.io/audio-recorder-polyfill/api">API</a>.
      </p>

      <div id="controls">
        <button
          ref=${recordFull$}
          id="record"
          disabled=${recordFullDisabled}
          autocomplete="off"
          title="Record"
          onClick=${() => {
            setEvents([]);
            recorder?.start();
            recordFull$.current?.blur();
          }}
        >
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46"></circle>
          </svg>
        </button>

        <button
          ref=${recordParts$}
          id="sec"
          disabled=${recordPartsDisabled}
          autocomplete="off"
          title="Record by 1 second"
          onClick=${() => {
            setEvents([]);
            recorder?.start(1_000);
            recordParts$.current?.blur();
          }}
        >
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46"></circle>
            <text x="26" y="64" font-size="45">1s</text>
          </svg>
        </button>

        <button
          ref=${pause$}
          id="pause"
          disabled=${pauseDisabled}
          autocomplete="off"
          title="Pause"
          onClick=${() => {
            recorder.pause();
            pause$.current?.blur();
          }}
        >
          <svg viewBox="0 0 100 100">
            <rect x="14" y="10" width="25" height="80"></rect>
            <rect x="62" y="10" width="25" height="80"></rect>
          </svg>
        </button>

        <button
          id="resume"
          disabled=${resumeDisabled}
          autocomplete="off"
          title="Resume"
        >
          <svg viewBox="0 0 100 100">
            <polygon points="10,10 90,50 10,90"></polygon>
          </svg>
        </button>

        <button
          ref=${stop$}
          id="stop"
          autocomplete="off"
          disabled=${stopDisabled}
          title="Stop"
          onClick=${() => {
            recorder.stop();
            recorder.stream.getTracks()[0]?.stop();
            stop$.current?.blur();
          }}
        >
          <svg viewBox="0 0 100 100">
            <rect x="12" y="12" width="76" height="76"></rect>
          </svg>
        </button>

        <button
          id="request"
          autocomplete="off"
          disabled=${requestDisabled}
          title="Request data"
        >
          <svg viewBox="0 0 100 100">
            <polygon points="10,10 90,10 50,90"></polygon>
          </svg>
        </button>
      </div>

      <div id="mode">
        ${polyfillEnabled
          ? html`Polyfill is enabled`
          : html`Native support, <a href="?polyfill">force polyfill</a>`}
      </div>

      <div id="formats">
        Format:${" "}
        ${TYPES.filter((i) => MediaRecorder.isTypeSupported?.(i)).join(", ")}
      </div>

      <div id="support">
        Your browser doesn’t support MediaRecorder or WebRTC to be able to
        polyfill MediaRecorder.
      </div>

      <ul id="list">
        ${events.map(({ eventName, state, mimeType }) => {
          return html`
            <li>
              <strong>${eventName}</strong>: ${state}
              ${mimeType && `, ${mimeType}`}
            </li>
          `;
        })}
      </ul>
    </main>
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
