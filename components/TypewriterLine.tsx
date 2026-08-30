"use client";

import { useEffect, useState } from "react";

const PHRASES = ["Java & Spring Boot", "Microservice Architecture", "MySQL · Redis · Kafka", "AI-Assisted Engineering"] as const;

export function TypewriterLine() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visibleLength, setVisibleLength] = useState(PHRASES[0].length);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const phrase = PHRASES[phraseIndex];
    const isComplete = visibleLength === phrase.length;
    const isEmpty = visibleLength === 0;
    const delay = deleting ? 42 : isComplete ? 1500 : 72;
    const timer = window.setTimeout(() => {
      if (!deleting && isComplete) {
        setDeleting(true);
        return;
      }
      if (deleting && isEmpty) {
        setDeleting(false);
        setPhraseIndex((current) => (current + 1) % PHRASES.length);
        return;
      }
      setVisibleLength((current) => current + (deleting ? -1 : 1));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [deleting, phraseIndex, visibleLength]);

  return (
    <span className="hero-typewriter">
      <span className="visually-hidden">Java、Spring Boot、微服务架构、MySQL、Redis、Kafka 与 AI 辅助研发。</span>
      <span aria-hidden="true"><strong>{PHRASES[phraseIndex].slice(0, visibleLength)}</strong><i /></span>
    </span>
  );
}
