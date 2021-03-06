import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";
import Root from "../components/Root";

export default function Home() {
  let [view, setView] = useState("intro");
  return (
    <div className="main">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full md:max-w-screen-sm mx-auto my-4 px-4">
        <div className="flex items-center">
          <span className="relative inline-flex">
            <button
              className="inline-flex items-center transition ease-in-out duration-150"
              disabled=""
            >
              <img src="/musk.png" className="h-10" />
            </button>
            <span className="flex absolute h-10 w-10 top-0 right-0 -mt-1 -mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-200 opacity-75"></span>
            </span>
          </span>
          <h1 className="font-bold leading-tight break-words ml-4">
            Ultra Pulse!
          </h1>
        </div>
        {view === "intro" && (
          <div className="mt-4">
            <h3 className="font-bold mt-2"> How to use Ultra Pulse?</h3>
            <ul className="mt-1 text-sm">
              <li>1. Allow Camera access on the next screen</li>
              <li>2. Place your hand on the back camera</li>
              <li>3. Point your phone to a light sources</li>
              <li>4. Wait for the graph to stabilize</li>
            </ul>

            <img src="/intro.gif" className="mt-4 rounded-lg shadow" />
            <p className="text-gray-800 text-xs text-center my-4">
              Ensure that hand is in the right position.
            </p>
            <div className="w-full">
              <button
                onClick={() => setView("app")}
                className="flex flex-col btn w-full border-2 border-gray-800 bg-white hover:bg-gray-900 hover:text-white focus:text-white focus:bg-gray-900 button-xl mt-4 md:mt-5"
              >
                <span>Allow Camera Access</span>
              </button>
            </div>
          </div>
        )}
        {view === "app" && <Root />}
      </main>

      <footer className="w-full border-t border-gray-100 mt-auto py-2 text-center">
        <a
          href="./"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400"
        >
          Ultra Pulse
        </a>
        {/* <div className="text-gray-800">{bpm[questionNumber].}</div> */}
        <code className="text-gray-800 text-xs">
          {/* Values are computed based on the difference in the last 2 minutes */}
        </code>
      </footer>
    </div>
  );
}
