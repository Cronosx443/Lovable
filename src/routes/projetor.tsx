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
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL);
    ch.onmessage = (e: MessageEvent<TimerMsg>) => {
      if (e.data.type === "TICK" || e.data.type === "SYNC") {
        setSeconds(e.data.seconds);
      } else if (e.data.type === "MESSAGE") {
        setMessage(e.data.text);
      } else if (e.data.type === "CLEAR_MESSAGE") {
        setMessage(null);
      }
    };
    ch.postMessage({ type: "REQUEST_SYNC" });
    return () => ch.close();
  }, []);

  const expired = seconds === 0;
  return (
    <main
      className="relative flex h-screen w-screen cursor-pointer flex-col items-center justify-center bg-projector p-8"
      onDoubleClick={() => document.documentElement.requestFullscreen?.()}
      title="Clique duas vezes para tela cheia"
    >
      {message && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 max-w-4xl w-full px-6 py-4 rounded-2xl bg-black/80 border border-primary/40 text-projector-foreground text-center shadow-2xl animate-fade-in">
          <p className="text-3xl md:text-4xl font-medium tracking-wide drop-shadow-md">
            {message}
          </p>
        </div>
      )}
      <div className={`font-bold tabular-nums leading-none tracking-tight text-[22vw] ${expired ? "animate-blink text-destructive" : "text-projector-foreground"}`}>
        {formatTime(seconds ?? 600)}
      </div>
    </main>
  );
}
