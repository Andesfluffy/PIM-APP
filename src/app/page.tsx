"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../components/AuthProvider";
import Notes from "@/components/Notes";
import Tasks from "@/components/Tasks";
import Contacts from "@/components/Contacts";
import UserProfile from "@/components/UserProfile";
import { handleSignIn, handleSignOut } from "./actions/auth";

type View = "auth" | "dashboard" | "notes" | "tasks" | "contacts";

const ProtectedRoute = ({
  children,
  isAuthenticated,
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
}) => {
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center">
        <div className="glass-card p-8 rounded-3xl border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">
            🔒 Access Restricted
          </h2>
          <p className="text-white/70">
            Please sign in to access your personal data.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

export default function HomePage() {
  const [view, setView] = useState<View>("auth");
  const { user, logout, isLoading } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    if (isAuthenticated) {
      setView("dashboard");
    } else {
      setView("auth");
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </main>
    );
  }

  const toggleNotes = () => {
    console.log("Notes");

    setView("notes");
  };

  const toggleTasks = () => {
    console.log("Tasks");

    setView("tasks");
  };

  const toggleContacts = () => {
    console.log("Contacts");

    setView("contacts");
  };

  console.log(view);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {isAuthenticated && user && (
        <UserProfile user={user} onSignOut={handleSignOut} />
      )}

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            // animate={{
            //   x: [0, Math.random() * 100 - 50],
            //   y: [0, Math.random() * 100 - 50],
            // }}
            transition={{
              // duration: 10 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            // style={{
            //   left: `${Math.random() * 100}%`,
            //   top: `${Math.random() * 100}%`,
            // }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-6xl"
          >
            {!isAuthenticated && (
              <>
                {view === "auth" && (
                  <div className="text-center space-y-8">
                    <motion.div
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-fuchsia-200 mb-4">
                        NEXUS PIM
                      </h1>

                      <p className="text-xl md:text-2xl text-white/70 mb-8">
                        Your Personal Information Manager
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-col md:flex-row gap-6 justify-center items-center"
                    >
                      <button
                        onClick={() => handleSignIn()}
                        className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          <span className="text-2xl">🔐</span>
                          Sign In
                        </span>

                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      </button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
                    >
                      <div
                        className="glass-card p-6 rounded-2xl border border-white/10 hover:cursor-pointer"
                        onClick={toggleNotes}
                      >
                        <div className="text-4xl mb-4">📝</div>

                        <h3 className="text-white font-bold text-lg mb-2">
                          Notes
                        </h3>

                        <p className="text-white/60 text-sm">
                          Create, edit, and organize your thoughts with
                          full-text search
                        </p>
                      </div>

                      <div
                        className="glass-card p-6 rounded-2xl border border-white/10 hover:cursor-pointer"
                        onClick={toggleTasks}
                      >
                        <div className="text-4xl mb-4">✅</div>

                        <h3 className="text-white font-bold text-lg mb-2">
                          Tasks
                        </h3>

                        <p className="text-white/60 text-sm">
                          Manage tasks with priorities, due dates, and status
                          tracking
                        </p>
                      </div>

                      <div
                        className="glass-card p-6 rounded-2xl border border-white/10 hover:cursor-pointer"
                        onClick={toggleContacts}
                      >
                        <div className="text-4xl mb-4">📇</div>

                        <h3 className="text-white font-bold text-lg mb-2">
                          Contacts
                        </h3>

                        <p className="text-white/60 text-sm">
                          Store and manage contact information with search
                          functionality
                        </p>
                      </div>
                    </motion.div>
                  </div>
                )}
              </>
            )}

            {/* PROTECTED DASHBOARD + FEATURES */}
            {isAuthenticated && user && (
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                {view === "dashboard" && (
                  <div className="text-center">
                    <motion.div
                      initial={{ y: -30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-fuchsia-200 mb-4">
                        Welcome back, {user.name.split(" ")[0]}!
                      </h1>
                      <h2 className="text-xl md:text-2xl text-white/80 mb-12 font-light">
                        What would you like to manage today?
                      </h2>
                    </motion.div>

                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                      <button
                        onClick={() => setView("notes")}
                        className="group relative overflow-hidden glass-card p-8 rounded-3xl border border-white/20 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105"
                      >
                        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                          📝
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">
                          Notes
                        </h3>
                        <p className="text-white/60">
                          Capture and organize your thoughts
                        </p>
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>

                      <button
                        onClick={() => setView("tasks")}
                        className="group relative overflow-hidden glass-card p-8 rounded-3xl border border-white/20 hover:border-indigo-500/50 transition-all duration-500 transform hover:scale-105"
                      >
                        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                          ✅
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">
                          Tasks
                        </h3>
                        <p className="text-white/60">Manage your to-do list</p>
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>

                      <button
                        onClick={() => setView("contacts")}
                        className="group relative overflow-hidden glass-card p-8 rounded-3xl border border-white/20 hover:border-fuchsia-500/50 transition-all duration-500 transform hover:scale-105"
                      >
                        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                          📇
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">
                          Contacts
                        </h3>
                        <p className="text-white/60">Organize your network</p>
                        <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </motion.div>
                  </div>
                )}

                {view !== "dashboard" && view !== "auth" && (
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-6"
                  >
                    <button
                      onClick={() => setView("dashboard")}
                      className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
                    >
                      <span className="group-hover:-translate-x-1 transition-transform">
                        ←
                      </span>
                      Back to Dashboard
                    </button>

                    {/* <div className="">
                      {view === "notes" && <Notes />}
                      {view === "tasks" && <Tasks userId={user.id} />}
                      {view === "contacts" && <Contacts userId={user.id} />}
                    </div> */}
                  </motion.div>
                )}
              </ProtectedRoute>
            )}

            <div className="">
              {view === "notes" && <Notes />}
              {view === "tasks" && <Tasks />}
              {view === "contacts" && <Contacts />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </main>
  );
}
