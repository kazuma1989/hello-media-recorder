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

function App() {
  return html`
    <main>
      <p>
        <a href="https://github.com/ai/audio-recorder-polyfill"
          >Audio Recorder Polyfill</a
        >
        is a MediaRecorder polyfill to&nbsp;record audio in Edge and Safari. See
        <a href="https://ai.github.io/audio-recorder-polyfill/api">API</a>.
      </p>

      <div id="controls">
        <button id="record" disabled autocomplete="off" title="Record">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46"></circle>
          </svg>
        </button>

        <button id="sec" disabled autocomplete="off" title="Record by 1 second">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46"></circle>
            <text x="26" y="64" font-size="45">1s</text>
          </svg>
        </button>

        <button id="pause" disabled autocomplete="off" title="Pause">
          <svg viewBox="0 0 100 100">
            <rect x="14" y="10" width="25" height="80"></rect>
            <rect x="62" y="10" width="25" height="80"></rect>
          </svg>
        </button>

        <button id="resume" disabled autocomplete="off" title="Resume">
          <svg viewBox="0 0 100 100">
            <polygon points="10,10 90,50 10,90"></polygon>
          </svg>
        </button>

        <button id="stop" autocomplete="off" disabled title="Stop">
          <svg viewBox="0 0 100 100">
            <rect x="12" y="12" width="76" height="76"></rect>
          </svg>
        </button>

        <button id="request" autocomplete="off" disabled title="Request data">
          <svg viewBox="0 0 100 100">
            <polygon points="10,10 90,10 50,90"></polygon>
          </svg>
        </button>
      </div>

      <div id="mode">
        Native support, <a href="?polyfill">force polyfill</a>
      </div>

      <div id="formats"></div>

      <div id="support">
        Your browser doesn’t support MediaRecorder or WebRTC to be able to
        polyfill MediaRecorder.
      </div>

      <ul id="list"></ul>
    </main>
  `;
}

render(html`<${App} />`, document.body);
