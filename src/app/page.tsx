"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import LoginButton from "@/components/LoginButton";
import Notes from "@/components/Notes";
import Tasks from "@/components/Tasks";
import Contacts from "@/components/Contacts";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/context/AuthContext";

type View = "auth" | "dashboard" | "notes" | "tasks" | "contacts";

const heroImage =
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=80";

const featureHighlights: { title: string; description: string; icon: ReactNode }[] = [
  {
    title: "Unified workspace",
    description: "Notes, tasks, and contacts stay in perfect rhythm together.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600" aria-hidden>
        <path
          d="M7 3h10a2 2 0 012 2v11.586a2 2 0 01-.586 1.414l-2.414 2.414A2 2 0 0114.586 21H7a2 2 0 01-2-2V5a2 2 0 012-2z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 9h6m-6 4h3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Calming productivity",
    description: "Gentle gradients, motion, and focus cues keep you energised.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600" aria-hidden>
        <path
          d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.364 7.364l-2.121-2.121M8.757 8.757L6.636 6.636m0 10.728l2.121-2.121m7.486-7.486l2.121-2.121"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Realtime sync",
    description: "Access your mindful hub instantly across every device.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600" aria-hidden>
        <path
          d="M4 7a4 4 0 014-4h8a4 4 0 014 4v10a4 4 0 01-4 4h-5l-3 3v-3H8a4 4 0 01-4-4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 9h6m-6 4h3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
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
      <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-[#e7f1ec] via-[#f2f7f4] to-[#e0f0e6]">
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
    <main className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-[#e7f1ec] via-[#f2f7f4] to-[#e0f0e6] text-[#103126]">
      {isAuthenticated && user && <UserProfile user={user} onSignOut={handleSignOut} />}

      <AnimatePresence mode="wait">
        {!isAuthenticated && view === "auth" ? (
          <motion.section
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative flex min-h-dvh items-center justify-center px-5 py-10 sm:px-8 lg:px-12"
          >
            <div className="relative grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
                className="relative flex h-full flex-col justify-between gap-8 rounded-4xl border border-emerald-200/70 bg-white/85 p-8 shadow-[0_45px_70px_-48px_rgba(15,63,42,0.55)] backdrop-blur"
              >
                <div className="flex items-center gap-3 text-emerald-700">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-200/80 via-emerald-100 to-emerald-300/70 text-2xl">
                    🌱
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700/80">
                    Verdant PIM
                  </span>
                </div>

                <div className="space-y-4">
                  <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="text-4xl font-semibold text-[#103126] sm:text-[2.8rem]"
                  >
                    Focus in full bloom
                  </motion.h1>
                  <p className="text-sm text-emerald-700/70 sm:text-base">
                    Slip into a serene command centre where organisation feels effortless and every detail lives in harmony.
                  </p>
                </div>

                <motion.ul
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
                    },
                  }}
                  className="grid gap-4 text-sm text-emerald-700/80"
                >
                  {featureHighlights.map((feature) => (
                    <motion.li
                      key={feature.title}
                      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                      className="flex items-start gap-3 rounded-3xl border border-emerald-100/60 bg-emerald-50/40 px-4 py-3 shadow-[0_16px_40px_-36px_rgba(18,69,49,0.6)]"
                    >
                      <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-2xl bg-white/80 shadow-inner shadow-emerald-100">
                        {feature.icon}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-[#0f392a]">{feature.title}</span>
                        <span className="mt-1 block text-xs text-emerald-700/70 sm:text-sm">{feature.description}</span>
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>

                <div className="space-y-3">
                  <LoginButton variant="solid" fullWidth>
                    Continue with Google
                  </LoginButton>
                  <button
                    type="button"
                    onClick={() => setView("notes")}
                    className="group w-full rounded-xl border border-emerald-200/70 bg-white/60 px-4 py-3 text-sm font-semibold text-emerald-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-[0_18px_38px_-28px_rgba(18,86,60,0.5)] focus-visible:outline focus-visible:outline-emerald-500"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="transition-transform group-hover:translate-x-1">Explore a live preview</span>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                  <p className="text-center text-xs text-emerald-700/60">
                    Sign in with Google to unlock syncing and save every mindful update instantly.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="relative hidden h-full min-h-[460px] overflow-hidden rounded-[40px] border border-emerald-200/60 bg-gradient-to-br from-emerald-600/70 via-emerald-500/60 to-teal-500/60 shadow-[0_60px_90px_-55px_rgba(12,58,40,0.7)] lg:block"
              >
                <div className="absolute inset-0">
                  <Image
                    src={heroImage}
                    alt="Lush monstera leaves"
                    fill
                    priority
                    sizes="(min-width: 1024px) calc(100vw - 420px), 100vw"
                    className="object-cover mix-blend-soft-light"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40" />
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="absolute bottom-12 left-10 right-10 rounded-3xl bg-white/12 p-6 text-white shadow-[0_32px_50px_-36px_rgba(0,0,0,0.5)] backdrop-blur-md"
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-white/70">Guided flow</p>
                  <p className="mt-3 text-lg font-medium text-white/95">
                    Breeze through your day with clarity—organise, plan, and nurture relationships from one tranquil space.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45, duration: 0.6 }}
                  className="pointer-events-none absolute -top-20 right-10 h-52 w-52 rounded-full bg-emerald-300/30 blur-3xl"
                />
              </motion.div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="workspace"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative flex min-h-dvh items-center justify-center px-4 py-12 sm:px-8 lg:px-16"
          >
            <div className="w-full max-w-6xl space-y-12">
              {isAuthenticated && user && view === "dashboard" && (
                <div className="space-y-12 text-center">
                  <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-4xl font-semibold text-emerald-800 sm:text-5xl">
                      Welcome back, {user.name.split(" ")[0]}!
                    </h1>
                    <p className="mt-3 text-lg text-emerald-600 md:text-xl">
                      Let&apos;s create a calm, intentional day.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 gap-6 md:grid-cols-3"
                  >
                    {[
                      {
                        key: "notes",
                        icon: (
                          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                            <path
                              d="M7 3h10a2 2 0 012 2v11.586a2 2 0 01-.586 1.414l-2.414 2.414A2 2 0 0114.586 21H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M9 9h6m-6 4h3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ),
                        title: "Notes",
                        description: "Capture ideas with structure and style",
                        accent: "from-emerald-100/80 via-transparent to-emerald-200/70",
                      },
                      {
                        key: "tasks",
                        icon: (
                          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                            <path
                              d="M9 12l2 2 4-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M4 7a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3z"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ),
                        title: "Tasks",
                        description: "Plan a focused, achievable to-do list",
                        accent: "from-teal-100/80 via-transparent to-teal-200/70",
                      },
                      {
                        key: "contacts",
                        icon: (
                          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                            <path
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M6 19a6 6 0 0112 0"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ),
                        title: "Contacts",
                        description: "Keep relationships thriving effortlessly",
                        accent: "from-lime-100/80 via-transparent to-lime-200/70",
                      },
                    ].map((card) => (
                      <button
                        key={card.key}
                        onClick={() => setView(card.key as View)}
                        className="group relative overflow-hidden rounded-3xl border border-emerald-100/70 bg-white/80 p-8 text-left shadow-[0_26px_55px_-28px_rgba(13,68,45,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_60px_-26px_rgba(13,68,45,0.45)] backdrop-blur"
                      >
                        <div className="relative z-10">
                          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                            {card.icon}
                          </div>
                          <h3 className="text-2xl font-semibold text-emerald-800">{card.title}</h3>
                          <p className="mt-2 text-sm text-emerald-600">{card.description}</p>
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
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
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
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
                  >
                    <span className="transition-transform group-hover:-translate-x-1">←</span>
                    Back to sign in
                  </button>

                  <div className="text-center">
                    <div className="surface-card mx-auto mb-8 max-w-2xl rounded-3xl border border-emerald-100/70 p-8 text-[#133327]">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                          <path d="M12 17a5 5 0 100-10 5 5 0 000 10z" />
                          <path d="M12 22c4.418 0 8-3.134 8-7 0-3.866-3.582-7-8-7s-8 3.134-8 7c0 3.866 3.582 7 8 7z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-semibold text-emerald-800">Preview Mode</h2>
                      <p className="mt-3 text-sm text-emerald-600">
                        Sign in with Google to keep your tranquil workspace synced across every device.
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
        .surface-card {
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          box-shadow: 0 36px 70px -38px rgba(12, 74, 48, 0.45);
        }
      `}</style>
    </main>
  );
}
