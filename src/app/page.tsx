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
    icon: "N",
    accent: "from-red-crayola-100/70 via-transparent to-red-crayola-200/60",
  },
  {
    key: "tasks",
    title: "Task board",
    description:
      "Track progress with elegant priority chips, clean timelines, and contextual nudges.",
    icon: "T",
    accent: "from-naples-yellow-100/70 via-transparent to-naples-yellow-200/60",
  },
  {
    key: "contacts",
    title: "Contact ledger",
    description:
      "Maintain polished relationship cards with intelligent search and refined details.",
    icon: "C",
    accent: "from-tea-green-100/70 via-transparent to-tea-green-200/60",
  },
];

const quickMetrics = [
  { label: "Unified records", value: "3 suites" },
  { label: "Sync cadence", value: "Real time" },
  { label: "Design language", value: "Aurora" },
];

export default function HomePage() {
  const [view, setView] = useState<View>("auth");
  const { user, logout, loading } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    if (isAuthenticated) setView("dashboard");
    else setView("auth");
  }, [isAuthenticated]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-tea-green-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          className="h-14 w-14 rounded-full border-4 border-red-crayola-500/60 border-t-transparent"
        />
      </main>
    );
  }

  const handleSignOut = async () => {
    await logout();
    setView("auth");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-tea-green-900 via-naples-yellow-900 to-red-crayola-900 text-oxford-blue-500">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-red-crayola-200/35 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-naples-yellow-200/30 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-tea-green-200/30 blur-[120px]" />
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
            className="relative z-10 flex min-h-screen items-center justify-center px-4 py-20 sm:px-6 lg:px-8"
          >
            <div className="relative isolate w-full max-w-6xl overflow-hidden rounded-[40px] border border-charcoal-900/20 bg-white/90 shadow-[0_80px_140px_-90px_rgba(1,25,54,0.6)] backdrop-blur-2xl">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-red-crayola-400/20 blur-3xl" />
                <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-tea-green-400/25 blur-[120px]" />
              </div>

              <div className="relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="flex flex-col gap-12 p-8 sm:p-12 lg:p-16">
                  <div className="space-y-7">
                    <div className="inline-flex items-center gap-3 rounded-full border border-naples-yellow-700/50 bg-naples-yellow-900/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-oxford-blue-300 sm:text-sm">
                      <span className="text-lg sm:text-xl">*</span>
                      Aurora workspace
                    </div>
                    <div className="space-y-5">
                      <h1 className="text-4xl leading-tight text-oxford-blue-500 sm:text-5xl lg:text-6xl">
                        A composed command centre for your day.
                      </h1>
                      <p className="type-subtle text-base leading-relaxed text-charcoal-500/85">
                        Gather notes, tasks, and contacts in a single calm surface designed for focus.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <LoginButton variant="solid" fullWidth className="sm:max-w-xs">
                      <span className="text-base font-semibold">Sign in with Google</span>
                    </LoginButton>
                    <p className="type-subtle text-xs text-charcoal-600/80">
                      Sign in to access your workspace.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-sm text-charcoal-500/80 sm:grid-cols-3">
                    {quickMetrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-2xl border border-tea-green-700/50 bg-tea-green-900/70 p-4 text-center shadow-[0_18px_32px_-28px_rgba(1,25,54,0.6)]"
                      >
                        <p className="text-xs uppercase tracking-[0.26em] text-charcoal-500">{metric.label}</p>
                        <p className="mt-2 text-lg font-semibold text-oxford-blue-300">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-8 border-t border-charcoal-900/10 bg-oxford-blue-100/35 p-8 sm:p-12 lg:border-l lg:border-t-0">
                  <div className="relative h-56 overflow-hidden rounded-[30px] border border-charcoal-900/15 bg-oxford-blue-900/10 sm:h-64">
                    <Image
                      src={heroImage}
                      alt="Aurora workspace"
                      fill
                      priority
                      sizes="(min-width: 1024px) 360px, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-oxford-blue-900/60 via-oxford-blue-900/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/85 p-5 text-oxford-blue-500 shadow-[0_30px_60px_-40px_rgba(1,25,54,0.65)] backdrop-blur">
                      <p className="text-[11px] uppercase tracking-[0.36em] text-charcoal-500">Welcome</p>
                      <p className="mt-2 text-sm font-semibold text-oxford-blue-500">
                        Sign in to flow through notes, tasks, and contacts.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {featureTiles.map((feature) => (
                      <div
                        key={feature.key}
                        className="group relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-3xl border border-white/40 bg-white/85 p-6 shadow-[0_32px_60px_-45px_rgba(1,25,54,0.45)] backdrop-blur"
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                        />
                        <div className="relative z-10 space-y-4">
                          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-sm shadow-charcoal-900/60">
                            {feature.icon}
                          </span>
                          <h3 className="text-xl font-semibold text-oxford-blue-500 capitalize">
                            {feature.title}
                          </h3>
                          <p className="type-subtle text-sm leading-relaxed text-charcoal-500/85">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
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
            <div className="w-full max-w-6xl space-y-12 rounded-[40px] border border-tea-green-300/50 bg-white/80 p-6 shadow-[0_60px_120px_-70px_rgba(1,25,54,0.45)] backdrop-blur-xl sm:p-10">
              {isAuthenticated && user && view === "dashboard" && (
                <div className="space-y-12">
                  <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <p className="type-subtle text-xs uppercase tracking-[0.4em] text-charcoal-500">
                      Curated overview
                    </p>
                    <h1 className="mt-4 text-4xl leading-tight text-oxford-blue-500 sm:text-5xl">
                      Welcome back, {user.name.split(" ")[0]}.
                    </h1>
                    <p className="type-subtle mt-3 text-base text-charcoal-500/85 md:text-lg">
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
                        className="group relative overflow-hidden rounded-3xl border border-tea-green-700 bg-white/85 p-8 text-left shadow-[0_30px_65px_-45px_rgba(1,25,54,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_36px_80px_-40px_rgba(1,25,54,0.45)]"
                      >
                        <div className="relative z-10 space-y-4">
                          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-naples-yellow-900 text-3xl">
                            {card.icon}
                          </span>
                          <div className="space-y-2">
                            <h3 className="text-2xl font-semibold text-oxford-blue-500 capitalize">
                              {card.title}
                            </h3>
                            <p className="type-subtle text-sm text-charcoal-500/90">
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
                    type="button"
                    onClick={() => setView("dashboard")}
                    className="group inline-flex items-center gap-2 rounded-full border border-oxford-blue-200/60 bg-white/80 px-4 py-2 text-sm font-semibold text-oxford-blue-500 shadow-[0_18px_38px_-28px_rgba(1,25,54,0.45)] transition-all duration-300 hover:bg-white/95 hover:shadow-[0_24px_60px_-34px_rgba(1,25,54,0.48)] focus:outline-none focus-visible:ring-2 focus-visible:ring-oxford-blue-300/70 focus-visible:ring-offset-2"
                  >
                    <span
                      aria-hidden
                      className="text-base transition-transform duration-300 group-hover:-translate-x-1"
                    >
                      ←
                    </span>
                    Back to dashboard
                  </button>

                  <div>
                    {view === "notes" && <Notes userId={user.id} />}
                    {view === "tasks" && <Tasks userId={user.id} />}
                    {view === "contacts" && <Contacts userId={user.id} />}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}


