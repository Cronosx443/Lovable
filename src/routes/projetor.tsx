import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CHANNEL, formatTime, type TimerMsg } from "@/lib/timer";

export const Route = createFileRoute("/projetor")({
  head: () => ({
    meta: [
      { title: "Tela de Projeção — Cronômetro para Eventos" },
      { name: "description", content: "Exibição em tela cheia do cronômetro sincronizado com o painel do operador." },
      { property: "og:title", content: "Tela de Projeção — Cronômetro" },
      { property: "og:description", content: "Cronômetro em tela cheia para projetores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Projector,
});

function Projector() {
  const [seconds, setSeconds] = useState<number | null>(null);
  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL);
    ch.onmessage = (e: MessageEvent<TimerMsg>) => {
      if (e.data.type === "TICK" || e.data.type === "SYNC") setSeconds(e.data.seconds);
    };
    ch.postMessage({ type: "REQUEST_SYNC" });
    return () => ch.close();
  }, []);
  const expired = seconds === 0;
  return (
    <main
      className="flex h-screen w-screen cursor-pointer items-center justify-center bg-projector"
      onDoubleClick={() => document.documentElement.requestFullscreen?.()}
      title="Clique duas vezes para tela cheia"
    >
      <div className={`font-bold tabular-nums leading-none tracking-tight text-[26vw] ${expired ? "animate-blink text-destructive" : "text-projector-foreground"}`}>
        {formatTime(seconds ?? 600)}
      </div>
    </main>
  );
}
