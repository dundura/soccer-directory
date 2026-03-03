"use client";

import { useState, useEffect } from "react";

const WORDS = ["team", "club", "coach", "camp", "trainer"];

export function RotatingText() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % WORDS.length);
        setFade(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`text-accent inline-block transition-all duration-300 ${fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      {" "}{WORDS[index]}
    </span>
  );
}
