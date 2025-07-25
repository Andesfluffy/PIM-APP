import { motion } from "framer-motion";
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
    <div className="absolute top-6 right-6 z-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 glass-card p-3 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 group"
        >
          {/* Avatar */}
          <div className="relative">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>

          {/* User Info */}
          <div className="hidden md:block text-left">
            <p className="text-white font-medium text-sm leading-tight max-w-32 truncate">
              {displayName}
            </p>
            <p className="text-white/60 text-xs leading-tight max-w-32 truncate">
              {displayEmail}
            </p>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white/60 ml-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{
            opacity: isOpen ? 1 : 0,
            scale: isOpen ? 1 : 0.95,
            y: isOpen ? 0 : -10,
          }}
          transition={{ duration: 0.2 }}
          className={`absolute top-full right-0 mt-2 w-64 glass-card rounded-2xl border border-white/20 shadow-2xl ${
            isOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold ring-2 ring-white/20">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{displayName}</p>
                <p className="text-white/60 text-sm truncate">{displayEmail}</p>
                {user?.id && (
                  <p className="text-white/40 text-xs truncate">
                    ID: {user.id.slice(0, 8)}...
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-2">
            {/* Account Section */}
            <div className="px-3 py-2">
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider">
                Account
              </p>
            </div>

            {/* Profile Stats or Info */}
            <div className="px-3 py-2 text-xs text-white/60">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-green-400">Active</span>
              </div>
              {user?.metadata?.creationTime && (
                <div className="flex justify-between mt-1">
                  <span>Member since:</span>
                  <span>
                    {new Date(user.metadata.creationTime).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="my-2 border-t border-white/10"></div>

            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                {isLoggingOut ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"
                  />
                ) : (
                  <svg
                    className="w-4 h-4 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
                <p className="text-white text-sm font-medium">
                  {isLoggingOut ? "Signing out..." : "Sign Out"}
                </p>
                <p className="text-white/50 text-xs">End your session</p>
              </div>
            </button>
          </div>
        </motion.div>
      </motion.div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
