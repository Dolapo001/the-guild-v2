"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * Drives a multi-step, self-playing animation that starts when the section
 * scrolls into view. Returns a ref to attach to the section, the current step
 * index, and whether it's in view. Use the step index to gate each beat of a
 * cinematic sequence (search → score → confidence → result, etc.).
 */
export function useInViewSequence(
  steps: number,
  { interval = 950, startDelay = 350, loop = false }: { interval?: number; startDelay?: number; loop?: boolean } = {},
) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: !loop, margin: "-25% 0px -25% 0px" });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStep(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    const advance = () => {
      i += 1;
      if (i < steps) {
        setStep(i);
        timers.push(setTimeout(advance, interval));
      } else if (loop) {
        i = 0;
        setStep(0);
        timers.push(setTimeout(advance, interval * 1.6));
      }
    };
    timers.push(setTimeout(advance, startDelay + interval));
    return () => timers.forEach(clearTimeout);
  }, [inView, steps, interval, startDelay, loop]);

  return { ref, step, inView, done: step >= steps - 1 };
}
