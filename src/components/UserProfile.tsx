/* eslint-disable @next/next/no-img-element */
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function UserProfile({ user, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await onSignOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.name || user?.email || "User";
  const displayEmail = user?.email || "";
  const initials = getInitials(displayName);

  return (
    <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-50">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2 rounded-2xl border border-rose-200/60 bg-white/70 px-3 py-2 shadow-md shadow-rose-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="relative">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-rose-200 group-hover:ring-rose-300 transition-all"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-300 to-pink-200 text-sm font-semibold text-rose-700 ring-2 ring-rose-200 group-hover:ring-rose-300 transition-all">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
          </div>

          <div className="hidden text-left md:block">
            <p className="max-w-32 truncate text-sm font-semibold text-rose-600">{displayName}</p>
            <p className="max-w-32 truncate text-xs text-rose-400">{displayEmail}</p>
          </div>

          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-rose-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-72 rounded-3xl border border-rose-200/60 bg-white/90 p-4 shadow-xl shadow-rose-100"
            >
              <div className="mb-4 flex items-center gap-3">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-rose-200"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-300 to-pink-200 text-base font-semibold text-rose-700 ring-2 ring-rose-200">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-rose-600">{displayName}</p>
                  <p className="truncate text-xs text-rose-400">{displayEmail}</p>
                  {user?.id && (
                    <p className="truncate text-xs text-rose-300">ID: {user.id.slice(0, 8)}...</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-rose-50/70 p-3 text-xs text-rose-400">
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-semibold text-emerald-500">Active</span>
                </div>
                {user?.metadata?.creationTime && (
                  <div className="mt-1 flex justify-between">
                    <span>Member since</span>
                    <span>{new Date(user.metadata.creationTime).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-left text-sm font-semibold text-rose-500 transition-all hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
                  {isLoggingOut ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 rounded-full border-2 border-rose-400 border-t-transparent"
                    />
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p>{isLoggingOut ? "Signing out..." : "Sign out"}</p>
                  <p className="text-xs font-normal text-rose-300">End your session</p>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 -z-10 bg-black/10 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
