"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import LoginButton from "@/components/LoginButton";
import Notes from "@/components/Notes";
import Tasks from "@/components/Tasks";
import Contacts from "@/components/Contacts";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/context/AuthContext";

type View = "auth" | "dashboard" | "notes" | "tasks" | "contacts";

type AuthField = {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  inputMode?: "text" | "email" | "numeric" | "tel";
};

const heroImage =
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=80";

const authFields: AuthField[] = [
  {
    id: "name",
    label: "Name",
    type: "text",
    placeholder: "Your full name",
  },
  {
    id: "email",
    label: "Email address",
    type: "email",
    inputMode: "email",
    placeholder: "you@example.com",
  },
  {
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "Create a secure password",
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
    <main className="relative min-h-screen bg-gradient-to-br from-[#eef3ed] via-[#f5f7f2] to-[#e2ece3] text-[#102a1f]">
      {isAuthenticated && user && <UserProfile user={user} onSignOut={handleSignOut} />}

      <AnimatePresence mode="wait">
        {!isAuthenticated && view === "auth" ? (
          <motion.section
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,460px)_1fr]"
          >
            <div className="flex flex-col justify-between bg-white px-6 py-10 sm:px-12 lg:px-16">
              <div>
                <div className="flex items-center gap-3 text-emerald-700">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600/10 text-2xl">🌿</span>
                  <span className="text-lg font-semibold tracking-wide text-emerald-800">
                    Verdant PIM
                  </span>
                </div>
                <h1 className="mt-12 text-4xl font-semibold text-[#102a1f] sm:text-5xl">
                  Get started now
                </h1>
                <p className="mt-4 text-base text-slate-500">
                  Create a serene hub for your notes, tasks, and contacts. Everything stays
                  organised so you can stay inspired.
                </p>
              </div>

              <div className="mt-12 space-y-6">
                <div className="space-y-5">
                  {authFields.map((field) => (
                    <label key={field.id} htmlFor={field.id} className="block text-left">
                      <span className="text-sm font-medium text-slate-600">{field.label}</span>
                      <input
                        id={field.id}
                        type={field.type}
                        inputMode={field.inputMode}
                        placeholder={field.placeholder}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/60"
                      />
                    </label>
                  ))}
                  <p className="text-xs text-slate-400">
                    Personal sign up is coming soon. Use your Google account to access the full workspace today.
                  </p>
                </div>

                <LoginButton variant="solid" fullWidth>
                  Sign in with Google
                </LoginButton>

                <button
                  type="button"
                  onClick={() => setView("notes")}
                  className="w-full rounded-xl border border-transparent bg-transparent px-4 py-3 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700 focus-visible:outline focus-visible:outline-emerald-500"
                >
                  Preview the workspace
                </button>
              </div>
            </div>

            <div className="relative hidden overflow-hidden lg:block">
              <Image
                src={heroImage}
                alt="Lush monstera leaves"
                fill
                priority
                sizes="(min-width: 1024px) calc(100vw - 460px), 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/30" />
              <div className="absolute bottom-12 left-12 max-w-sm rounded-3xl bg-black/20 p-6 text-white backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Verdant focus</p>
                <p className="mt-4 text-lg font-medium text-white">
                  Flow through your day with clarity. Bring your ideas, plans, and people together in a calming space.
                </p>
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
            className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-8 lg:px-16"
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
                        icon: "🗒️",
                        title: "Notes",
                        description: "Capture ideas with structure and style",
                        accent: "from-emerald-100/80 via-transparent to-emerald-200/70",
                      },
                      {
                        key: "tasks",
                        icon: "✅",
                        title: "Tasks",
                        description: "Plan a focused, achievable to-do list",
                        accent: "from-teal-100/80 via-transparent to-teal-200/70",
                      },
                      {
                        key: "contacts",
                        icon: "📇",
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
                          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
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
                      <h2 className="text-2xl font-semibold text-emerald-800">🔒 Preview Mode</h2>
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
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 30px 60px -30px rgba(12, 62, 41, 0.45);
        }
      `}</style>
    </main>
  );
}
