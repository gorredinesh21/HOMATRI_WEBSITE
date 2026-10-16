"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  ShieldCheck,
  Calculator,
  Camera,
  Clapperboard,
  Package,
  HeartHandshake,
  CheckCircle2,
  ChevronDown,
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const TRACKS = [
  {
    key: "food-safety",
    title: "Food Safety & Kitchen Hygiene",
    level: "Essential",
    minutes: 15,
    icon: ShieldCheck,
    intro:
      "The one course every kitchen must pass. Safe food is the promise behind every Homatri order.",
    lessons: [
      {
        title: "Your daily hygiene routine",
        points: [
          "Wash hands with soap for 20 seconds before cooking, after handling raw items, and after every break.",
          "Keep nails trimmed, hair tied, and wear a clean apron — customers see your photos and reels.",
          "Anyone with a cold, upset stomach, or a cut finger stays away from the cooking area.",
        ],
      },
      {
        title: "Cook, cool & hold food safely",
        points: [
          "Cook fully — no half-cooked rice or undercooked dal; heat destroys what eyes can't see.",
          "Never leave cooked food at room temperature for more than 2 hours before packing.",
          "Cool large batches quickly (shallow vessels), then refrigerate; reheat once, properly.",
        ],
      },
      {
        title: "Water, produce & surfaces",
        points: [
          "Use filtered/potable water for cooking and washing produce.",
          "Wash vegetables in running water; soak leafy greens in salt water for 10 minutes.",
          "Wipe slabs and the stove before and after every cooking session; separate cloth for the floor.",
        ],
      },
      {
        title: "FSSAI basics — what and why",
        points: [
          "FSSAI registration is your licence to sell food — it builds instant customer trust.",
          "It's a simple 14-digit number; Homatri helps you apply if you don't have one yet.",
          "Keep it visible in your kitchen and share it with us so your profile shows the trust badge.",
        ],
      },
    ],
  },
  {
    key: "pricing",
    title: "Smart Pricing for Your Thali",
    level: "Business",
    minutes: 20,
    icon: Calculator,
    intro:
      "Stop guessing prices. Learn to cost one dish properly and your kitchen never sells at a loss again.",
    lessons: [
      {
        title: "Cost one dish end-to-end",
        points: [
          "Ingredients: write down the exact quantity of everything in one paneer sabzi — paneer, oil, masala, gas.",
          "Add packaging (box + bag ≈ ₹10–15) and a little for water, gas cylinder and electricity.",
          "Pay yourself: even ₹20–30 per meal for your skill and time. Your labour is a real cost.",
        ],
      },
      {
        title: "The 30–35% food-cost rule",
        points: [
          "Aim for raw ingredients to be about one-third of the selling price.",
          "Example: ingredients ₹40 → price the dish ₹110–130 to cover packaging, delivery share and profit.",
          "If food cost crosses 40%, change the recipe portions or raise the price — never absorb it silently.",
        ],
      },
      {
        title: "Thalis, combos & weekends",
        points: [
          "Combos (sabzi + dal + roti + rice) earn more per order than single dishes.",
          "Price the thali for value (₹120 feels better than items totalling ₹150) but cost it first.",
          "Weekend specials can be priced 10–15% higher — families order together on weekends.",
        ],
      },
      {
        title: "When (and how) to raise prices",
        points: [
          "Review prices every 3 months or when a key ingredient jumps more than 15%.",
          "Raise on new dishes first; regulars forgive small changes on new items easily.",
          "Tell customers honestly: \"paneer prices went up, my sabzi is now ₹10 more\" — honesty retains.",
        ],
      },
    ],
  },
  {
    key: "photography",
    title: "Food Photography with Your Phone",
    level: "Creative",
    minutes: 20,
    icon: Camera,
    intro:
      "Your phone is a studio. Bright, honest food photos are why a customer picks your kitchen over another.",
    lessons: [
      {
        title: "The daylight window trick",
        points: [
          "Cook and shoot near a window in daytime — natural light makes food look fresh.",
          "Shoot with the light falling on the food from the side or front, never behind it.",
          "Never use flash — it flattens food and makes oil shine look greasy.",
        ],
      },
      {
        title: "Angle & framing",
        points: [
          "45° angle for a thali or a bowl of dal (how a customer seated at the table sees it).",
          "Straight top shot for a full spread laid out on a mat.",
          "Keep the background clean — one steel plate on a simple cot/chalky surface beats a busy kitchen.",
        ],
      },
      {
        title: "Make it look delicious",
        points: [
          "Garnish every photo: coriander, a spoon of ghee, a wedge of lemon.",
          "Shoot hot — steam rising off a fresh roti sells better than any caption.",
          "Wipe the plate edges before the shot; one messy rim ruins a great photo.",
        ],
      },
      {
        title: "The 5-photo pattern for every dish",
        points: [
          "One hero close-up, one full-plate top shot, one during-cooking shot, one being packed, one happy customer plate (with permission).",
          "Reuse these everywhere — menu items, reels, WhatsApp.",
          "Update photos every season; old photos quietly reduce orders.",
        ],
      },
    ],
  },
  {
    key: "reels",
    title: "Reels & Storytelling",
    level: "Creative",
    minutes: 25,
    icon: Clapperboard,
    intro:
      "Your story is your brand. Reels turn a home kitchen into a name families remember and recommend.",
    lessons: [
      {
        title: "Hook in the first 2 seconds",
        points: [
          "Start with action or a question: pouring dal, rolling roti, \"Ghar jaisa khaana banate hue dekhiye…\"",
          "Never start with a black screen or a long introduction — viewers scroll away.",
          "Show your face sometimes — people order from people, not logos.",
        ],
      },
      {
        title: "Show the process, not just the result",
        points: [
          "The 3-shot recipe: raw ingredients → hands cooking → final dish in 15–30 seconds.",
          "One reel = one dish or one story. Don't cram the whole menu into a reel.",
          "Use the phone's time-lapse for long steps (dal boiling, dough resting).",
        ],
      },
      {
        title: "Caption & audio formula",
        points: [
          "Caption = dish + hometown + feeling: \"Ghar ka chicken curry, Amchi Konkan style — jaise aai banati thi.\"",
          "Use trending audio at low volume under your natural kitchen sound.",
          "Post 3 reels a week — the 30-Day Reel Plan page in this portal plans it for you.",
        ],
      },
    ],
  },
  {
    key: "packaging",
    title: "Packaging & Delivery Quality",
    level: "Essential",
    minutes: 15,
    icon: Package,
    intro:
      "The last 30 minutes decide the review. Pack so food arrives exactly as it left your kitchen.",
    lessons: [
      {
        title: "Leak-proof packing",
        points: [
          "Use 3-compartment boxes so sabzi never meets the rice.",
          "For gravies: cling-wrap under the lid, then double-bag — one leak can lose a family customer.",
          "Fill boxes to the line, not the brim; overfilled boxes leak in the rider's bag.",
        ],
      },
      {
        title: "Label every order",
        points: [
          "Stick or write: customer name, dish, spice level, date, and \"best consumed within 2 hours\".",
          "Separate and mark Jain / no-onion-no-garlic orders visibly — mix-ups here hurt the most.",
          "Keep a small label sheet and marker at your packing station, always.",
        ],
      },
      {
        title: "Handover to the rider",
        points: [
          "Pack in cooking order so the first stop's box is on top.",
          "Do a 10-second visual check with the rider at pickup — count boxes against the manifest.",
          "Hand over sealed bags only; an open bag is where trust leaks.",
        ],
      },
    ],
  },
  {
    key: "customers",
    title: "Customer Love & Repeat Orders",
    level: "Business",
    minutes: 20,
    icon: HeartHandshake,
    intro:
      "A repeat customer costs nothing and orders weekly. This track turns one order into a habit.",
    lessons: [
      {
        title: "Handle dietary requests gracefully",
        points: [
          "Respond to every dietary request the same day — silence reads as \"no\".",
          "Use the counter-offer when you can't do exactly what's asked: \"no paneer, but I can add extra dal?\"",
          "All requests arrive in the Dietary Requests page of this portal — check it daily.",
        ],
      },
      {
        title: "The complaint recipe: apologise → fix → follow up",
        points: [
          "Apologise first, even before you check who was right.",
          "Fix fast: a replacement in the next slot or a small credit via the Homatri team.",
          "Follow up after 2 days: \"Did the next meal reach you well?\" — this single message saves most upset customers.",
        ],
      },
      {
        title: "Turn one order into a weekly habit",
        points: [
          "After a delivered order, send one message via Homatri: \"Same thali every Tuesday? Reply YES.\"",
          "Offer a small 6-meal weekly deal — families love locked plans and locked prices.",
          "Remember regulars' preferences (less oil, extra rice) — being remembered is why they don't switch apps.",
        ],
      },
    ],
  },
];

const LEVEL_STYLES = {
  Essential: "bg-homatri-orange-light text-homatri-orange-dark",
  Business: "bg-emerald-50 text-emerald-700",
  Creative: "bg-violet-50 text-violet-700",
};

function storageKey(phone) {
  return `homatri_chef_upskilling_${phone || "guest"}`;
}

export default function ChefUpskillingPage() {
  const { customerPhone } = useAuth();
  const [completed, setCompleted] = useState({});
  const [openTrack, setOpenTrack] = useState("food-safety");
  const [openLesson, setOpenLesson] = useState("food-safety-0");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(customerPhone));
      setCompleted(raw ? JSON.parse(raw) : {});
    } catch {
      setCompleted({});
    }
    setHydrated(true);
  }, [customerPhone]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey(customerPhone), JSON.stringify(completed));
    } catch {
      /* private mode — progress just won't persist */
    }
  }, [completed, customerPhone, hydrated]);

  const doneCount = useMemo(
    () => TRACKS.filter((t) => completed[t.key]).length,
    [completed]
  );

  function toggleTrack(key) {
    setCompleted((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-widest text-homatri-orange">
          Homatri Academy
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-homatri-dark mt-1">
          Upskilling for your kitchen
        </h1>
        <p className="text-sm text-homatri-muted max-w-2xl leading-relaxed">
          Short, practical courses made for homemaker chefs — food safety, pricing, photos, reels,
          packaging and customer love. Each track takes 15–25 minutes and ends with habits you can
          use in tomorrow&apos;s cooking.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex-1 min-w-[220px] max-w-md">
            <div className="flex items-center justify-between text-xs font-semibold text-homatri-muted mb-1">
              <span>
                {doneCount} of {TRACKS.length} tracks complete
              </span>
              <span>{Math.round((doneCount / TRACKS.length) * 100)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-homatri-orange-light overflow-hidden">
              <div
                className="h-full rounded-full bg-homatri-orange transition-all"
                style={{ width: `${(doneCount / TRACKS.length) * 100}%` }}
              />
            </div>
          </div>
          {doneCount < TRACKS.length ? (
            <p className="text-xs text-homatri-muted flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-homatri-orange" />
              New here? Start with <strong>Food Safety</strong> — it&apos;s the essential one.
            </p>
          ) : (
            <p className="text-xs font-semibold text-homatri-green flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> All tracks complete — wah! Your kitchen runs like
              a pro&apos;s.
            </p>
          )}
        </div>
      </header>

      <div className="space-y-4">
        {TRACKS.map((track) => {
          const Icon = track.icon;
          const isOpen = openTrack === track.key;
          const isDone = Boolean(completed[track.key]);
          return (
            <article
              key={track.key}
              className={`bg-white border rounded-3xl overflow-hidden transition-shadow ${
                isDone ? "border-homatri-green/40" : "border-homatri-border"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenTrack(isOpen ? null : track.key)}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                <span
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isDone ? "bg-homatri-green/10 text-homatri-green" : "bg-homatri-orange-light text-homatri-orange"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-homatri-dark">{track.title}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        LEVEL_STYLES[track.level] || "bg-homatri-orange-light text-homatri-orange"
                      }`}
                    >
                      {track.level}
                    </span>
                    <span className="text-[11px] text-homatri-muted">{track.minutes} min</span>
                  </span>
                  <span className="block text-xs text-homatri-muted mt-0.5 truncate">
                    {track.intro}
                  </span>
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-homatri-muted shrink-0 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen ? (
                <div className="px-5 pb-5 space-y-3">
                  {track.lessons.map((lesson, index) => {
                    const lessonKey = `${track.key}-${index}`;
                    const lessonOpen = openLesson === lessonKey;
                    return (
                      <div
                        key={lessonKey}
                        className="border border-homatri-border rounded-2xl overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenLesson(lessonOpen ? null : lessonKey)}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                        >
                          <span className="text-sm font-medium text-homatri-dark">
                            {index + 1}. {lesson.title}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-homatri-muted shrink-0 transition-transform ${
                              lessonOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {lessonOpen ? (
                          <ul className="px-4 pb-4 space-y-2">
                            {lesson.points.map((point) => (
                              <li
                                key={point}
                                className="text-sm text-homatri-dark/90 leading-relaxed flex gap-2"
                              >
                                <span className="text-homatri-orange mt-0.5">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    );
                  })}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-homatri-muted">
                      {track.lessons.length} lessons · ~{track.minutes} min
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleTrack(track.key)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                        isDone
                          ? "bg-homatri-green text-white border-homatri-green"
                          : "bg-white text-homatri-dark border-homatri-border hover:border-homatri-orange"
                      }`}
                    >
                      {isDone ? "✓ Track completed" : "Mark track complete"}
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <section className="bg-white border border-dashed border-homatri-border rounded-3xl p-6 flex items-start gap-4">
        <span className="w-10 h-10 rounded-2xl bg-homatri-orange-light text-homatri-orange flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5" />
        </span>
        <div>
          <p className="font-medium text-homatri-dark text-sm">More coming every month</p>
          <p className="text-sm text-homatri-muted mt-1 leading-relaxed">
            Video lessons in Hindi &amp; Marathi, live weekend classes with senior Homatri chefs,
            and a certificate when you finish all tracks. Want a specific topic? Tell the Homatri
            team on WhatsApp.
          </p>
        </div>
      </section>
    </div>
  );
}
