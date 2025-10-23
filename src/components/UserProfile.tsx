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
          className="group flex items-center gap-2 rounded-2xl border border-tea-green-700 bg-white/80 px-3 py-2 shadow-md shadow-charcoal-900/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="relative">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-tea-green-700 group-hover:ring-tea-green-600 transition-all"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-crayola-800 to-naples-yellow-800 text-sm font-semibold text-oxford-blue-500 ring-2 ring-tea-green-700 group-hover:ring-tea-green-600 transition-all">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-tea-green-400" />
          </div>

          <div className="hidden text-left md:block">
            <p className="max-w-32 truncate text-sm font-semibold text-oxford-blue-500">{displayName}</p>
            <p className="max-w-32 truncate text-xs text-charcoal-500">{displayEmail}</p>
          </div>

          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-charcoal-500"
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
              className="absolute right-0 mt-3 w-72 rounded-3xl border border-tea-green-700 bg-white/95 p-4 shadow-xl shadow-charcoal-900/30"
            >
              <div className="mb-4 flex items-center gap-3">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-tea-green-700"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-crayola-800 to-naples-yellow-800 text-base font-semibold text-oxford-blue-500 ring-2 ring-tea-green-700">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-oxford-blue-500">{displayName}</p>
                  <p className="truncate text-xs text-charcoal-500">{displayEmail}</p>
                  {user?.id && (
                    <p className="truncate text-xs text-charcoal-400">ID: {user.id.slice(0, 8)}...</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-tea-green-900 p-3 text-xs text-oxford-blue-400">
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-semibold text-oxford-blue-500">Active</span>
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
                className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-tea-green-700 bg-white px-4 py-3 text-left text-sm font-semibold text-oxford-blue-500 transition-all hover:border-red-crayola-400 hover:text-red-crayola-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-naples-yellow-900 text-oxford-blue-500">
                  {isLoggingOut ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 rounded-full border-2 border-red-crayola-400 border-t-transparent"
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
                  <p className="text-xs font-normal text-charcoal-400">End your session</p>
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
