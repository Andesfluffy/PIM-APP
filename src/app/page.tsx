"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import LoginButton from "@/components/LoginButton";
import Notes from "@/components/Notes";
import Tasks from "@/components/Tasks";
import Contacts from "@/components/Contacts";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/context/AuthContext";

type View = "auth" | "dashboard" | "notes" | "tasks" | "contacts";

const heroImage =
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=80";

const featureTiles = [
  {
    key: "notes",
    title: "Notes atelier",
    description:
      "Compose and structure ideas inside layered cards with poised typography and soft accents.",
    icon: "🪶",
    accent: "from-emerald-100/80 via-transparent to-emerald-200/60",
  },
  {
    key: "tasks",
    title: "Task board",
    description:
      "Track progress with elegant priority chips, clean timelines, and contextual nudges.",
    icon: "📅",
    accent: "from-teal-100/80 via-transparent to-teal-200/60",
  },
  {
    key: "contacts",
    title: "Contact ledger",
    description:
      "Maintain polished relationship cards with intelligent search and refined details.",
    icon: "🤝",
    accent: "from-lime-100/70 via-transparent to-lime-200/60",
  },
];

const quickMetrics = [
  { label: "Unified records", value: "3 suites" },
  { label: "Sync cadence", value: "Real time" },
  { label: "Design language", value: "Verdant" },
];

export default function HomePage() {
  const [view, setView] = useState<View>("auth");
  const { user, logout, loading } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    if (isAuthenticated) {
      setView("dashboard");
    } else {
      setView("auth");
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f2f5f1]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          className="h-14 w-14 rounded-full border-4 border-emerald-500/60 border-t-transparent"
        />
      </main>
    );
  }

  const handleSignOut = async () => {
    await logout();
    setView("auth");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#eef3ed] via-[#f5f7f2] to-[#e2ece3] text-[#102a1f]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-teal-200/25 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-lime-200/20 blur-[120px]" />
      </div>

      {isAuthenticated && user && <UserProfile user={user} onSignOut={handleSignOut} />}

      <AnimatePresence mode="wait">
        {!isAuthenticated && view === "auth" ? (
          <motion.section
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-8"
          >
            <div className="relative flex h-[min(720px,92vh)] w-full max-w-6xl flex-col justify-center gap-10 rounded-[40px] border border-emerald-200/60 bg-white/80 px-8 py-10 shadow-[0_60px_120px_-70px_rgba(12,74,48,0.55)] backdrop-blur-xl lg:flex-row lg:items-center lg:px-14">
              <div className="flex w-full flex-col gap-10 lg:w-[52%]">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-3 rounded-full bg-emerald-100/80 px-4 py-2 text-sm font-semibold text-emerald-700">
                    <span className="text-xl">🌿</span>
                    Verdant workspace
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-4xl leading-tight text-[#0f2d22] sm:text-5xl lg:text-6xl">
                      A calmer command centre for your day.
                    </h1>
                    <p className="type-subtle text-base leading-relaxed text-emerald-600/80">
                      Seamlessly orchestrate notes, priorities, and relationships in an interface that feels curated and contemporary. Sign in once and every surface syncs in real time.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <LoginButton
                      variant="solid"
                      fullWidth
                      className="sm:max-w-xs"
                    >
                      <span className="text-base font-semibold">Sign in with Google</span>
                    </LoginButton>
                    <button
                      type="button"
                      onClick={() => setView("notes")}
                      className="type-subtle inline-flex items-center justify-center rounded-2xl border border-emerald-200/70 px-4 py-3 text-sm font-semibold text-emerald-600 transition-all duration-200 hover:border-emerald-400 hover:text-emerald-700"
                    >
                      Explore the live preview
                    </button>
                  </div>
                  <p className="type-subtle text-xs text-emerald-500/70">
                    Google sign-in unlocks the full workspace today. Personal email onboarding is on the way.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-emerald-600/80">
                  {quickMetrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-2xl border border-emerald-100/60 bg-emerald-50/50 p-4 text-center"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">{metric.label}</p>
                      <p className="mt-2 text-lg font-semibold text-emerald-700">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid w-full flex-1 gap-4">
                <div className="relative h-52 overflow-hidden rounded-[28px] border border-emerald-100/70">
                  <Image
                    src={heroImage}
                    alt="Verdant workspace preview"
                    fill
                    priority
                    sizes="(min-width: 1024px) 360px, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/80 p-4 text-[#123327] shadow-[0_25px_45px_-35px_rgba(12,74,48,0.65)] backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">Preview</p>
                    <p className="mt-2 text-sm font-semibold text-emerald-800">
                      Flow through notes, tasks, and contacts without losing your sense of calm.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {featureTiles.map((feature) => (
                    <div
                      key={feature.key}
                      className="group relative overflow-hidden rounded-3xl border border-emerald-100/70 bg-white/75 p-6 shadow-[0_32px_60px_-45px_rgba(12,74,48,0.55)] backdrop-blur-md"
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                      />
                      <div className="relative z-10 space-y-4">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 text-2xl shadow-sm shadow-emerald-100">
                          {feature.icon}
                        </span>
                        <h3 className="text-xl font-semibold text-emerald-800 capitalize">
                          {feature.title}
                        </h3>
                        <p className="type-subtle text-sm leading-relaxed text-emerald-600/80">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="workspace"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-8"
          >
            <div className="w-full max-w-6xl space-y-12 rounded-[40px] border border-emerald-200/60 bg-white/75 p-6 shadow-[0_60px_120px_-70px_rgba(12,74,48,0.55)] backdrop-blur-xl sm:p-10">
              {isAuthenticated && user && view === "dashboard" && (
                <div className="space-y-12">
                  <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <p className="type-subtle text-xs uppercase tracking-[0.4em] text-emerald-400">
                      Curated overview
                    </p>
                    <h1 className="mt-4 text-4xl leading-tight text-emerald-900 sm:text-5xl">
                      Welcome back, {user.name.split(" ")[0]}.
                    </h1>
                    <p className="type-subtle mt-3 text-base text-emerald-600/85 md:text-lg">
                      Shape an intentional rhythm for today across notes, tasks, and relationships.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 gap-6 md:grid-cols-3"
                  >
                    {featureTiles.map((card) => (
                      <button
                        key={card.key}
                        onClick={() => setView(card.key as View)}
                        className="group relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-white/80 p-8 text-left shadow-[0_30px_65px_-45px_rgba(12,74,48,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_36px_80px_-40px_rgba(12,74,48,0.6)]"
                      >
                        <div className="relative z-10 space-y-4">
                          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
                            {card.icon}
                          </span>
                          <div className="space-y-2">
                            <h3 className="text-2xl font-semibold text-emerald-800 capitalize">
                              {card.title}
                            </h3>
                            <p className="type-subtle text-sm text-emerald-600/90">
                              {card.description}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                        />
                      </button>
                    ))}
                  </motion.div>
                </div>
              )}

              {isAuthenticated && view !== "dashboard" && view !== "auth" && user && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <button
                    onClick={() => setView("dashboard")}
                    className="type-subtle group inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
                  >
                    <span className="transition-transform group-hover:-translate-x-1">←</span>
                    Back to dashboard
                  </button>

                  <div>
                    {view === "notes" && (
                      <Notes
                        userId={user.id}
                        onBackToDashboard={() => setView("dashboard")}
                      />
                    )}
                    {view === "tasks" && (
                      <Tasks
                        userId={user.id}
                        onBackToDashboard={() => setView("dashboard")}
                      />
                    )}
                    {view === "contacts" && (
                      <Contacts
                        userId={user.id}
                        onBackToDashboard={() => setView("dashboard")}
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {!isAuthenticated && view !== "auth" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <button
                    onClick={() => setView("auth")}
                    className="type-subtle group inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
                  >
                    <span className="transition-transform group-hover:-translate-x-1">←</span>
                    Back to sign in
                  </button>

                  <div className="text-center">
                    <div className="preview-card mx-auto mb-8 max-w-2xl rounded-3xl border border-emerald-100/70 p-8 text-[#133327]">
                      <h2 className="text-3xl text-emerald-800">Workspace preview</h2>
                      <p className="type-subtle mt-3 text-sm text-emerald-600">
                        Sign in with Google to keep your workspace perfectly synced across every device.
                      </p>
                      <div className="mt-6 flex justify-center">
                        <LoginButton variant="solid" />
                      </div>
                    </div>
                  </div>

                  <div>
                    {view === "notes" && (
                      <Notes onBackToDashboard={() => setView("auth")} />
                    )}
                    {view === "tasks" && (
                      <Tasks onBackToDashboard={() => setView("auth")} />
                    )}
                    {view === "contacts" && (
                      <Contacts onBackToDashboard={() => setView("auth")} />
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .preview-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(236, 247, 239, 0.9));
          box-shadow: 0 30px 60px -38px rgba(12, 74, 48, 0.45);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }
      `}</style>
    </main>
  );
}
