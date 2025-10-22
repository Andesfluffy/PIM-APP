"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginButton from "@/components/LoginButton";
import Notes from "@/components/Notes";
import Tasks from "@/components/Tasks";
import Contacts from "@/components/Contacts";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/context/AuthContext";

type View = "auth" | "dashboard" | "notes" | "tasks" | "contacts";

export default function HomePage() {
  const [view, setView] = useState<View>("auth");
  const { user, logout, loading } = useAuth();
  const isAuthenticated = !!user;

  const petals = useMemo(
    () =>
      Array.from({ length: 18 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 8 + Math.random() * 4,
        delay: Math.random() * 4,
        drift: Math.random() * 20 + 10,
        rotation: Math.random() * 12,
      })),
    []
  );

  useEffect(() => {
    if (isAuthenticated) {
      setView("dashboard");
    } else {
      setView("auth");
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-pink-100 to-amber-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 rounded-full border-4 border-rose-400 border-t-transparent"
        />
      </main>
    );
  }

  const handleSignOut = async () => {
    await logout();
    setView("auth");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-pink-100 to-amber-50">
      {isAuthenticated && user && (
        <UserProfile user={user} onSignOut={handleSignOut} />
      )}

      {/* Background petals */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-rose-300/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-10 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-56 w-56 rounded-full bg-rose-200/40 blur-3xl" />

        {petals.map((petal, index) => (
          <motion.div
            key={`petal-${index}`}
            className="absolute h-3 w-3 rounded-full bg-rose-300/70 shadow-[0_0_12px_rgba(251,113,133,0.45)]"
            animate={{
              y: [0, -petal.drift, 0],
              rotate: [0, petal.rotation, -petal.rotation / 2, 0],
            }}
            transition={{
              duration: petal.duration,
              repeat: Infinity,
              delay: petal.delay,
              ease: "easeInOut",
            }}
            style={{
              left: `${petal.left}%`,
              top: `${petal.top}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full max-w-6xl"
          >
            {/* AUTH VIEW */}
            {!isAuthenticated && view === "auth" && (
              <div className="space-y-12 text-center">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-300 text-3xl shadow-lg shadow-rose-200">
                    🌸
                  </div>
                  <h1 className="text-4xl font-black text-rose-600 sm:text-5xl md:text-6xl">
                    BlushBloom PIM
                  </h1>
                  <p className="mt-4 text-lg font-medium text-rose-500 md:text-xl">
                    The prettiest place to keep your notes, tasks, and contacts in perfect harmony.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                >
                  <LoginButton />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="grid grid-cols-1 gap-6 md:grid-cols-3"
                >
                  {[
                    {
                      icon: "📝",
                      title: "Dreamy Notes",
                      description:
                        "Capture sparks of inspiration with rich formatting and instant search.",
                    },
                    {
                      icon: "✅",
                      title: "Chic Tasks",
                      description:
                        "Plan your days with color-coded priorities and due-date reminders.",
                    },
                    {
                      icon: "📇",
                      title: "Sweet Contacts",
                      description:
                        "Keep every bestie and business bestie organized and easy to reach.",
                    },
                  ].map((feature) => (
                    <div
                      key={feature.title}
                      className="glass-card group rounded-3xl border border-rose-200/60 p-6 text-left shadow-lg shadow-rose-100 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-200"
                    >
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-200 to-pink-200 text-2xl">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-rose-600">{feature.title}</h3>
                      <p className="mt-2 text-sm text-rose-500">{feature.description}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* DASHBOARD VIEW */}
            {isAuthenticated && user && view === "dashboard" && (
              <div className="space-y-12 text-center">
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
                  <h1 className="text-4xl font-black text-rose-600 sm:text-5xl">
                    Welcome back, {user.name.split(" ")[0]}!
                  </h1>
                  <p className="mt-3 text-lg font-medium text-rose-500 md:text-xl">
                    Let&apos;s make something beautiful and productive today.
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
                      icon: "📝",
                      title: "Notes",
                      description: "Jot down and beautify your ideas",
                      accent: "from-rose-400/60 to-pink-300/40",
                    },
                    {
                      key: "tasks",
                      icon: "✅",
                      title: "Tasks",
                      description: "Curate your to-do runway",
                      accent: "from-pink-400/60 to-rose-300/40",
                    },
                    {
                      key: "contacts",
                      icon: "📇",
                      title: "Contacts",
                      description: "Celebrate your connections",
                      accent: "from-amber-300/60 to-pink-200/40",
                    },
                  ].map((card) => (
                    <button
                      key={card.key}
                      onClick={() => setView(card.key as View)}
                      className="group relative overflow-hidden rounded-3xl border border-rose-200/60 bg-white/60 p-8 text-left shadow-lg shadow-rose-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative z-10">
                        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 text-3xl">
                          {card.icon}
                        </div>
                        <h3 className="text-2xl font-semibold text-rose-600">{card.title}</h3>
                        <p className="mt-2 text-sm text-rose-500">{card.description}</p>
                      </div>
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                      />
                    </button>
                  ))}
                </motion.div>
              </div>
            )}

            {/* FEATURE VIEWS */}
            {isAuthenticated && view !== "dashboard" && view !== "auth" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <button
                  onClick={() => setView("dashboard")}
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-rose-500 transition-colors hover:text-rose-600"
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

            {/* Allow unauthenticated users to preview features */}
            {!isAuthenticated && view !== "auth" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <button
                  onClick={() => setView("auth")}
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-rose-500 transition-colors hover:text-rose-600"
                >
                  <span className="transition-transform group-hover:-translate-x-1">←</span>
                  Back to sign in
                </button>

                <div className="text-center">
                  <div className="glass-card mx-auto mb-8 max-w-2xl rounded-3xl border border-rose-200/60 p-8 shadow-lg shadow-rose-100">
                    <h2 className="text-2xl font-semibold text-rose-600">🔒 Preview Mode</h2>
                    <p className="mt-3 text-sm text-rose-500">
                      Sign in to keep your gorgeous workspace in sync across every device.
                    </p>
                    <div className="mt-6 flex justify-center">
                      <LoginButton />
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
          </motion.div>
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .glass-card {
          background: rgba(255, 245, 248, 0.82);
          backdrop-filter: blur(26px);
          -webkit-backdrop-filter: blur(26px);
          border: 1px solid rgba(244, 114, 182, 0.28);
          box-shadow: 0 20px 40px -24px rgba(244, 114, 182, 0.45);
        }

        .glass {
          background: rgba(255, 245, 248, 0.9);
          backdrop-filter: blur(26px);
          -webkit-backdrop-filter: blur(26px);
          border: 1px solid rgba(244, 114, 182, 0.28);
        }
      `}</style>
    </main>
  );
}
