"use client";

/* eslint-disable @next/next/no-img-element -- vinext's next/image shim breaks React hooks during hydration. */
import { useCallback, useEffect, useRef, useState } from "react";

export const PROFILE_IMAGES = [
  "/images/profile/542f2747a1c496e0825549c3d34bcd1f.jpg",
  "/images/profile/d821bc400e969f20c3fd54a58dfd2674.jpg",
] as const;

const AUTO_PLAY_INTERVAL = 3600;

export function ProfileCarousel({ variant = "hero" }: { variant?: "hero" | "about" }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = PROFILE_IMAGES.length;

  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_PLAY_INTERVAL);

    return () => window.clearInterval(timer);
  }, [paused, count]);

  return (
    <div
      className={`profile-carousel${variant === "about" ? " profile-carousel--about" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current;
        touchStartX.current = null;
        if (startX === null) return;
        const endX = event.changedTouches[0]?.clientX ?? startX;
        const delta = endX - startX;
        if (Math.abs(delta) < 40) return;
        goTo(index + (delta < 0 ? 1 : -1));
      }}
      role="region"
      aria-label="ylt 的个人照片轮播"
    >
      <div className="profile-carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {PROFILE_IMAGES.map((src, imageIndex) => (
          <img
            alt={`ylt 的个人照片 ${imageIndex + 1}`}
            aria-hidden={imageIndex !== index}
            className={imageIndex === index ? "is-active" : undefined}
            key={src}
            loading={imageIndex === 0 ? "eager" : "lazy"}
            src={src}
          />
        ))}
      </div>

      <div className="profile-carousel-dots" role="tablist" aria-label="切换照片">
        {PROFILE_IMAGES.map((src, imageIndex) => (
          <button
            aria-label={`查看第 ${imageIndex + 1} 张照片`}
            aria-selected={imageIndex === index}
            className={imageIndex === index ? "is-active" : undefined}
            key={src}
            onClick={() => goTo(imageIndex)}
            role="tab"
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
