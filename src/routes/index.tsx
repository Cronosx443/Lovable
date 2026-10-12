import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CHANNEL, formatTime, type TimerMsg } from "@/lib/timer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cronômetro para Eventos — Painel do Operador" },
      { name: "description", content: "Controle um cronômetro regressivo e projete-o em tela cheia para palestras e eventos." },
      { property: "og:title", content: "Cronômetro para Eventos" },
      { property: "og:description", content: "Painel de controle com tela de projeção sincronizada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Panel,
});

const DEFAULT = 600;

function Panel() {
  const [seconds, setSeconds] = useState(DEFAULT);
  const [initial, setInitial] = useState(DEFAULT);
  const [running, setRunning] = useState(false);
  const [msgInput, setMsgInput] = useState("");
  const [currentMsg, setCurrentMsg] = useState("");
  const chRef = useRef<BroadcastChannel | null>(null);
  const secRef = useRef(seconds);
  secRef.current = seconds;

  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL);
    chRef.current = ch;
    ch.onmessage = (e: MessageEvent<TimerMsg>) => {
      if (e.data.type === "REQUEST_SYNC") {
        ch.postMessage({ type: "SYNC", seconds: secRef.current });
        if (currentMsg) {
          ch.postMessage({ type: "MESSAGE", text: currentMsg });
        }
      }
    };
    return () => ch.close();
  }, [currentMsg]);

  useEffect(() => {
    chRef.current?.postMessage({ type: "TICK", seconds });
    if (seconds === 0) setRunning(false);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running]);

  const adjust = (min: number) => {
    setSeconds((s) => Math.max(0, s + min * 60));
    if (!running) setInitial((i) => Math.max(0, i + min * 60));
  };

  const sendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    const text = msgInput.trim();
    setCurrentMsg(text);
    chRef.current?.postMessage({ type: "MESSAGE", text });
    setMsgInput("");
  };

  const clearMsg = () => {
    setCurrentMsg("");
    chRef.current?.postMessage({ type: "CLEAR_MESSAGE" });
  };

  const btn = "rounded-lg px-5 py-3 font-semibold transition-colors";
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-card p-8 shadow-2xl max-w-xl w-full">
        <h1 className="text-sm uppercase tracking-widest text-muted-foreground">Cronômetro para Eventos</h1>
        <div className={`text-7xl font-bold tabular-nums tracking-tight sm:text-8xl ${seconds === 0 ? "text-destructive" : "text-primary"}`}>
          {formatTime(seconds)}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button className={`${btn} bg-success text-primary-foreground hover:opacity-90`} onClick={() => seconds > 0 && setRunning(true)}>Iniciar</button>
          <button className={`${btn} bg-warn text-primary-foreground hover:opacity-90`} onClick={() => setRunning(false)}>Pausar</button>
          <button className={`${btn} bg-destructive text-primary-foreground hover:opacity-90`} onClick={() => { setRunning(false); setSeconds(initial); }}>Resetar</button>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {[-5, -1, 1, 5].map((m) => (
            <button key={m} className={`${btn} bg-secondary text-secondary-foreground hover:bg-accent`} onClick={() => adjust(m)}>
              {m > 0 ? `+${m}` : m} min
            </button>
          ))}
        </div>

        <div className="w-full border-t border-border pt-4 flex flex-col gap-3">
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Enviar mensagem para o palestrante</label>
          <form onSubmit={sendMsg} className="flex gap-2">
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Ex: Por favor, encerre em 5 minutos..."
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Enviar
            </button>
          </form>
          {currentMsg && (
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 text-sm">
              <span className="truncate text-muted-foreground"><strong className="text-foreground">Ativa:</strong> {currentMsg}</span>
              <button onClick={clearMsg} className="text-xs text-destructive hover:underline ml-2 whitespace-nowrap">Remover</button>
            </div>
          )}
        </div>

        <button className={`${btn} bg-project text-primary-foreground hover:opacity-90 w-full`} onClick={() => window.open("/projetor", "projector", "width=1280,height=720")}>
          Abrir Tela de Projeção
        </button>
      </div>
    </main>
  );
}
