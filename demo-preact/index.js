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

setTimeout(() => {
  render(
    html`<${App} notSupported=${MediaRecorder.notSupported} />`,
    document.body
  );
}, 0);

function App({ notSupported }) {
  const [recorder, getUserMedia] = useAudioRecorder();
  useEffect(() => getUserMedia({ audio: true }), [getUserMedia]);

  const [events, setEvents] = useState([]);
  const addEvent = (e) => {
    setEvents((events) => [...events, e]);
  };
  const clearEvents = () => {
    events.forEach(({ audioSrc }) => {
      URL.revokeObjectURL(audioSrc);
    });

    setEvents([]);
  };

  useEffect(
    () =>
      addEventListener(recorder, "dataavailable", (e) => {
        addEvent({
          eventName: "dataavailable",
          dataType: e.data.type,
          dataSize: e.data.size,
          audioSrc: URL.createObjectURL(e.data),
        });
      }),
    [recorder]
  );

  useEffect(
    () =>
      addEventListener(recorder, "start", (e) => {
        addEvent({
          eventName: "start",
          state: recorder.state,
          mimeType: recorder.mimeType,
        });
      }),
    [recorder]
  );

  useEffect(
    () =>
      addEventListener(recorder, "stop", (e) => {
        addEvent({
          eventName: "stop",
          state: recorder.state,
        });
      }),
    [recorder]
  );

  useEffect(
    () =>
      addEventListener(recorder, "pause", (e) => {
        addEvent({
          eventName: "pause",
          state: recorder.state,
        });
      }),
    [recorder]
  );

  useEffect(
    () =>
      addEventListener(recorder, "resume", (e) => {
        addEvent({
          eventName: "resume",
          state: recorder.state,
        });
      }),
    [recorder]
  );

  if (notSupported) {
    return html`
      <main>
        <div id="support">
          Your browser doesn’t support MediaRecorder or WebRTC to be able to
          polyfill MediaRecorder.
        </div>
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
          id="record"
          disabled=${recordFullDisabled}
          autocomplete="off"
          title="Record"
          onClick=${(e) => {
            e.currentTarget.blur();

            clearEvents();
            recorder?.start();
          }}
        >
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46"></circle>
          </svg>
        </button>

        <button
          id="sec"
          disabled=${recordPartsDisabled}
          autocomplete="off"
          title="Record by 1 second"
          onClick=${(e) => {
            e.currentTarget.blur();

            clearEvents();
            recorder?.start(1_000);
          }}
        >
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46"></circle>
            <text x="26" y="64" font-size="45">1s</text>
          </svg>
        </button>

        <button
          id="pause"
          disabled=${pauseDisabled}
          autocomplete="off"
          title="Pause"
          onClick=${(e) => {
            e.currentTarget.blur();

            recorder?.pause();
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
          onClick=${(e) => {
            e.currentTarget.blur();

            recorder?.resume();
          }}
        >
          <svg viewBox="0 0 100 100">
            <polygon points="10,10 90,50 10,90"></polygon>
          </svg>
        </button>

        <button
          id="stop"
          autocomplete="off"
          disabled=${stopDisabled}
          title="Stop"
          onClick=${(e) => {
            e.currentTarget.blur();

            recorder?.stop();
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
          onClick=${(e) => {
            e.currentTarget.blur();

            recorder?.requestData();
          }}
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
        ${["audio/webm", "audio/ogg", "audio/wav"]
          .filter((i) => MediaRecorder.isTypeSupported?.(i))
          .join(", ")}
      </div>

      <ul id="list">
        ${events.map(
          ({ eventName, state, mimeType, dataType, dataSize, audioSrc }) => {
            if (eventName === "dataavailable") {
              return html`
                <li>
                  <strong>${eventName}</strong>:${" "}
                  <span>${dataType}, ${bytes(dataSize)}</span>

                  <audio controls src=${audioSrc}></audio>
                </li>
              `;
            }

            return html`
              <li>
                <strong>${eventName}</strong>:${" "}
                <span>${state}${mimeType && `, ${mimeType}`}</span>
              </li>
            `;
          }
        )}
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

/**
 * @param {EventTarget | undefined} target
 * @param {*} type
 * @param {*} callback
 */
function addEventListener(target, type, callback) {
  target?.addEventListener(type, callback);

  return () => {
    target?.removeEventListener(type, callback);
  };
}

const KB = 1 << 10;
const MB = 1 << 20;

function bytes(value) {
  let mag = Math.abs(value);

  let unit;
  if (mag >= MB) {
    unit = "MB";
    value = value / MB;
  } else if (mag >= KB) {
    unit = "KB";
    value = value / KB;
  } else {
    unit = "B";
  }

  return value.toFixed(0).replace(/(?:\.0*|(\.[^0]+)0+)$/, "$1") + " " + unit;
}
