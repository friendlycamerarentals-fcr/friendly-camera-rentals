"use client";

import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

export default function Counter({ end, suffix = "", label }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  return (
    <div ref={ref} className="text-center">
      <h3 className="text-3xl font-bold text-amber-400 md:text-4xl">
        {inView && (
          <CountUp
            start={0}
            end={end}
            duration={2.5}
            separator=","
          />
        )}
        {suffix}
      </h3>

      <p className="mt-2 text-sm text-zinc-400">{label}</p>
    </div>
  );
}