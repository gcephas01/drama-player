"use client";

import { useEffect, useRef, useState } from "react";
import { tracks } from "./tracks";

type Version = "reference" | "instrumental";

export default function Home() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [version, setVersion] = useState<Version>("reference");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  const audioRef = useRef<HTMLAudioElement>(null);
  const savedPositionRef = useRef(0);

  const selectedTrack = tracks[selectedIndex];

  const audioSource =
    version === "instrumental" && selectedTrack.instrumental
      ? selectedTrack.instrumental
      : selectedTrack.reference;

  function formatTime(seconds: number) {
    if (!Number.isFinite(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function chooseTrack(index: number) {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
    }

    setSelectedIndex(index);
    setVersion("reference");
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    savedPositionRef.current = 0;
  }

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.error("Audio could not play:", error);
      }
    } else {
      audio.pause();
    }
  }

  function skip(seconds: number) {
    const audio = audioRef.current;
    if (!audio) return;

    const nextTime = Math.min(
      Math.max(audio.currentTime + seconds, 0),
      audio.duration || 0
    );

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = value;
    setCurrentTime(value);
  }

  function changeSpeed(newSpeed: number) {
    setSpeed(newSpeed);

    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  }

  function changeVersion(newVersion: Version) {
    if (newVersion === "instrumental" && !selectedTrack.instrumental) {
      return;
    }

    const audio = audioRef.current;

    if (audio) {
      savedPositionRef.current = audio.currentTime;
      audio.pause();
    }

    setVersion(newVersion);
  }

  function playPrevious() {
    if (selectedIndex === 0) return;
    chooseTrack(selectedIndex - 1);
  }

  function playNext() {
    if (selectedIndex >= tracks.length - 1) {
      setIsPlaying(false);
      return;
    }

    setSelectedIndex((current) => current + 1);
    setVersion("reference");
    setCurrentTime(0);
    setDuration(0);
    savedPositionRef.current = 0;
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = speed;
  }, [speed]);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">

        {/* HEADER */}
        <header className="mb-8 border-b border-zinc-800 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
            Drama Department
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
            Rehearsal Room
          </h1>

          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            Christmas Production • Official Rehearsal Tracks
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">

          {/* SONG LIBRARY */}
          <section className="order-2 lg:order-1">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Show Order
              </h2>

              <span className="text-xs text-zinc-600">
                {tracks.length} songs
              </span>
            </div>

            <div className="space-y-2">
              {tracks.map((track, index) => {
                const active = index === selectedIndex;

                return (
                  <button
                    key={track.id}
                    onClick={() => chooseTrack(index)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-white bg-white text-black"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-sm font-semibold ${
                          active ? "text-zinc-500" : "text-zinc-600"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {track.title}
                        </p>

                        <p
                          className={`mt-1 text-xs ${
                            active ? "text-zinc-500" : "text-zinc-600"
                          }`}
                        >
                          {track.act}
                        </p>
                      </div>

                      {active && (
                        <span className="ml-auto text-xs font-bold">
                          NOW
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* PLAYER */}
          <section className="order-1 lg:order-2">
            <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">

              {/* NOW PLAYING */}
              <div className="p-6 sm:p-10">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
                    Now Rehearsing
                  </p>

                  <p className="text-xs text-zinc-600">
                    {String(selectedIndex + 1).padStart(2, "0")} /{" "}
                    {String(tracks.length).padStart(2, "0")}
                  </p>
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">
                  {selectedTrack.title}
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  {selectedTrack.act}
                </p>

                {/* VERSION */}
                <div className="mt-8 grid grid-cols-2 gap-2 rounded-2xl bg-black p-1.5">
                  <button
                    onClick={() => changeVersion("reference")}
                    className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                      version === "reference"
                        ? "bg-white text-black"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    Reference
                  </button>

                  <button
                    onClick={() => changeVersion("instrumental")}
                    disabled={!selectedTrack.instrumental}
                    className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                      version === "instrumental"
                        ? "bg-white text-black"
                        : selectedTrack.instrumental
                        ? "text-zinc-500 hover:text-white"
                        : "cursor-not-allowed text-zinc-800"
                    }`}
                  >
                    {selectedTrack.instrumental
                      ? "Instrumental"
                      : "Coming Soon"}
                  </button>
                </div>

                {/* THE ONLY AUDIO ELEMENT */}
                <audio
                  ref={audioRef}
                  key={audioSource}
                  src={audioSource}
                  preload="metadata"
                  onLoadedMetadata={(event) => {
                    const audio = event.currentTarget;

                    setDuration(audio.duration);
                    audio.playbackRate = speed;

                    if (savedPositionRef.current > 0) {
                      const restoredTime = Math.min(
                        savedPositionRef.current,
                        audio.duration
                      );

                      audio.currentTime = restoredTime;
                      setCurrentTime(restoredTime);
                      savedPositionRef.current = 0;
                    }
                  }}
                  onTimeUpdate={(event) =>
                    setCurrentTime(event.currentTarget.currentTime)
                  }
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={playNext}
                />

                {/* PROGRESS */}
                <div className="mt-10">
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={Math.min(currentTime, duration || 0)}
                    onChange={(event) =>
                      seek(Number(event.target.value))
                    }
                    className="w-full cursor-pointer accent-white"
                  />

                  <div className="mt-2 flex justify-between text-xs font-medium text-zinc-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* MAIN CONTROLS */}
                <div className="mt-8 flex items-center justify-center gap-3 sm:gap-6">

                  <button
                    onClick={playPrevious}
                    disabled={selectedIndex === 0}
                    aria-label="Previous song"
                    className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-zinc-400 transition hover:bg-zinc-900 hover:text-white disabled:opacity-20"
                  >
                    ◀◀
                  </button>

                  <button
                    onClick={() => skip(-10)}
                    aria-label="Go back 10 seconds"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 text-sm font-bold text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900"
                  >
                    -10
                  </button>

                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-2xl text-black transition hover:scale-105 active:scale-95 sm:h-24 sm:w-24 sm:text-3xl"
                  >
                    {isPlaying ? "❚❚" : "▶"}
                  </button>

                  <button
                    onClick={() => skip(10)}
                    aria-label="Go forward 10 seconds"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 text-sm font-bold text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900"
                  >
                    +10
                  </button>

                  <button
                    onClick={playNext}
                    disabled={selectedIndex === tracks.length - 1}
                    aria-label="Next song"
                    className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-zinc-400 transition hover:bg-zinc-900 hover:text-white disabled:opacity-20"
                  >
                    ▶▶
                  </button>
                </div>

                {/* SPEED */}
                <div className="mt-10 border-t border-zinc-800 pt-6">
                  <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                    Rehearsal Speed
                  </p>

                  <div className="flex flex-wrap justify-center gap-2">
                    {[0.75, 0.9, 1, 1.1].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => changeSpeed(rate)}
                        className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                          speed === rate
                            ? "bg-white text-black"
                            : "bg-zinc-900 text-zinc-500 hover:text-white"
                        }`}
                      >
                        {rate}×
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CURRENT MODE */}
              <div className="border-t border-zinc-800 bg-black px-6 py-4 text-center">
                <p className="text-xs text-zinc-600">
                  Playing{" "}
                  <span className="font-semibold text-zinc-400">
                    {version === "reference"
                      ? "Reference Track"
                      : "Instrumental Track"}
                  </span>
                </p>
              </div>

            </div>
          </section>
        </div>
      </div>
    </main>
  );
}