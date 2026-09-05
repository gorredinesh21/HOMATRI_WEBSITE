"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Circle, Copy, Clapperboard, Mic, Sparkles, Video } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchChefContentPlan, updateChefContentDay } from "@/lib/api";
import { CONTENT_PLAN } from "@/lib/contentPlan";

function SceneRow({ index, scene, shot, onToggle }) {
  return (
    <li className="flex items-start gap-3 py-2.5 border-b border-homatri-border/60 last:border-0">
      <button
        type="button"
        onClick={() => onToggle(index)}
        aria-label={shot ? `Scene ${index + 1} shot` : `Scene ${index + 1} not shot`}
        className="mt-0.5 shrink-0"
      >
        {shot ? (
          <CheckCircle2 className="w-5 h-5 text-homatri-forest" />
        ) : (
          <Circle className="w-5 h-5 text-homatri-border hover:text-homatri-forest transition-colors" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${shot ? "text-homatri-muted line-through" : "text-homatri-dark font-medium"}`}>
          <span className="font-bold text-homatri-orange mr-1">{index + 1}.</span>
          {scene.shot}
        </p>
        <p className="text-[11px] text-homatri-muted mt-0.5">
          🎥 {scene.how} · ⏱ {scene.secs}s
        </p>
      </div>
    </li>
  );
}

function DayCard({ day, state, onScenes, onComplete }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const scenes = state?.scenes || {};
  const done = state?.completed || false;
  const shotCount = Object.values(scenes).filter(Boolean).length;

  const copyVoice = async () => {
    const text = [
      `DAY ${day.day} — ${day.title}`,
      "",
      "HOOK (on-screen text):",
      day.hook,
      "",
      "VOICEOVER:",
      ...day.voice.map((line, i) => `${i + 1}. ${line}`),
      "",
      `CTA: ${day.cta}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article
      className={`bg-white rounded-2xl border overflow-hidden transition-colors ${
        done ? "border-homatri-forest/50" : "border-homatri-border"
      }`}
    >
      <button type="button" onClick={() => setOpen((prev) => !prev)} className="w-full text-left p-4 flex items-center gap-3">
        <span
          className={`w-9 h-9 shrink-0 rounded-full inline-flex items-center justify-center text-xs font-bold ${
            done ? "bg-homatri-forest text-white" : "bg-homatri-sand text-homatri-dark"
          }`}
        >
          {day.day}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-bold text-homatri-dark leading-snug">{day.title}</span>
          <span className="block text-[11px] text-homatri-muted mt-0.5">
            {day.scenes.length} clips {shotCount > 0 ? `· ${shotCount}/${day.scenes.length} shot` : ""} {day.voice.length > 0 ? "· voiceover" : "· no voice (ASMR)"}
          </span>
        </span>
        {done ? <span className="text-[10px] font-bold text-homatri-forest shrink-0">DONE ✓</span> : null}
        <ChevronDown className={`w-4 h-4 text-homatri-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="px-4 pb-4 space-y-4 border-t border-homatri-border/60 pt-4">
          <div className="bg-homatri-cream rounded-xl p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-homatri-forest">Hook (text on screen)</p>
            <p className="text-sm font-semibold text-homatri-dark mt-1 leading-snug">“{day.hook}”</p>
            <p className="text-[11px] text-homatri-muted mt-2">💡 {day.why}</p>
          </div>

          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold text-homatri-dark mb-1">
              <Clapperboard className="w-3.5 h-3.5 text-homatri-orange" /> Clips to shoot
              <span className="text-homatri-muted font-medium">(tap when shot)</span>
            </p>
            <ul>
              {day.scenes.map((scene, index) => (
                <SceneRow
                  key={index}
                  index={index}
                  scene={scene}
                  shot={Boolean(scenes[String(index)])}
                  onToggle={(i) => onScenes(day, i, !scenes[String(i)])}
                />
              ))}
            </ul>
          </div>

          {day.voice.length > 0 ? (
            <div className="bg-homatri-forest-mist rounded-xl p-3.5">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-homatri-forest">
                <Mic className="w-3.5 h-3.5" /> Voiceover (record as voice note)
              </p>
              <ol className="mt-2 space-y-1.5">
                {day.voice.map((line, index) => (
                  <li key={index} className="text-sm text-homatri-dark leading-snug">
                    <span className="font-bold text-homatri-forest mr-1">{index + 1}.</span>
                    {line}
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={copyVoice}
                className="mt-3 inline-flex items-center gap-1.5 bg-white border border-homatri-forest/30 hover:border-homatri-forest text-homatri-forest text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy full script"}
              </button>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-homatri-muted">📌 CTA: {day.cta}</p>
            <button
              type="button"
              onClick={() => onComplete(day, !done)}
              className={`shrink-0 text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                done
                  ? "bg-homatri-forest-mist text-homatri-forest hover:bg-homatri-forest/20"
                  : "bg-homatri-forest text-white hover:bg-homatri-forest-deep"
              }`}
            >
              {done ? "Mark not done" : "Mark day complete"}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function ChefContentPlanPage() {
  const { token, requireAuthentication } = useAuth();
  const [progress, setProgress] = useState({}); // {day: {completed, scenes}}
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchChefContentPlan(token)
      .then((response) => {
        const map = {};
        for (const row of response?.progress || []) {
          map[row.day] = { completed: row.completed, scenes: row.scenes || {} };
        }
        if (!cancelled) setProgress(map);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Could not load your content plan.");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const persist = useCallback(
    async (day, next) => {
      if (!token) return;
      try {
        // API takes scenes as an array of booleans (index = scene order).
        const scenes = day.scenes.map((_, index) => Boolean(next.scenes[String(index)]));
        await updateChefContentDay(day.day, { completed: next.completed, scenes }, token);
      } catch (err) {
        setError(err?.message || "Could not save progress.");
      }
    },
    [token]
  );

  const onScenes = useCallback(
    (day, sceneIndex, value) => {
      setProgress((prev) => {
        const current = prev[day.day] || { completed: false, scenes: {} };
        const scenes = { ...current.scenes, [String(sceneIndex)]: value };
        const next = { ...current, scenes };
        persist(day, next);
        return { ...prev, [day.day]: next };
      });
    },
    [persist]
  );

  const onComplete = useCallback(
    (day, value) => {
      setProgress((prev) => {
        const current = prev[day.day] || { completed: false, scenes: {} };
        const next = { ...current, completed: value };
        persist(day, next);
        return { ...prev, [day.day]: next };
      });
    },
    [persist]
  );

  const doneCount = useMemo(
    () => Object.values(progress).filter((entry) => entry.completed).length,
    [progress]
  );
  const percent = Math.round((doneCount / CONTENT_PLAN.length) * 100);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-widest text-homatri-orange">Content challenge</p>
        <h1 className="font-display text-3xl font-medium text-homatri-dark mt-1">30-Day Reel Plan</h1>
        <p className="text-sm text-homatri-muted mt-2 max-w-2xl leading-relaxed">
          You shoot, we edit and post. Every day has one reel: the exact clips to film, how to
          frame them, and the voiceover lines to record as a simple voice note. Send the clips +
          voice note to the Homatri team — the finished reel goes on our socials with your kitchen
          front and centre.
        </p>
      </header>

      <section className="bg-white border border-homatri-border rounded-2xl p-4">
        <div className="flex items-center justify-between text-sm">
          <p className="font-bold text-homatri-dark flex items-center gap-2">
            <Video className="w-4 h-4 text-homatri-orange" /> Your progress
          </p>
          <p className="text-homatri-muted text-xs font-semibold">
            {doneCount}/{CONTENT_PLAN.length} days · {percent}%
          </p>
        </div>
        <div className="mt-3 h-2.5 bg-homatri-sand rounded-full overflow-hidden">
          <div className="h-full bg-homatri-forest rounded-full transition-all" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-homatri-muted">
          <Sparkles className="w-3.5 h-3.5 text-homatri-forest shrink-0 mt-0.5" />
          Tip: shoot horizontal or vertical — vertical (9:16) is best for reels. Keep the phone
          steady, face the light, and don&apos;t worry about perfection. Raw &amp; real wins.
        </p>
      </section>

      {error ? <p className="text-xs text-red-600 font-medium">{error}</p> : null}

      {!token ? (
        <div className="bg-white border border-homatri-border rounded-2xl p-8 text-center">
          <p className="text-sm font-bold text-homatri-dark">Sign in to start your 30-day challenge</p>
          <button
            type="button"
            onClick={() => requireAuthentication(() => {})}
            className="mt-4 bg-homatri-orange hover:bg-homatri-orange-dark text-white text-sm font-bold px-5 py-2.5 rounded-xl"
          >
            Sign in to your kitchen
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {CONTENT_PLAN.map((day) => (
            <DayCard
              key={day.day}
              day={day}
              state={progress[day.day]}
              onScenes={onScenes}
              onComplete={onComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
