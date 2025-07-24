"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

const UserProfile = ({
  user,
  onSignOut,
}: {
  user: User;
  onSignOut: () => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="absolute top-6 right-6 z-50">
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2 hover:bg-white/20 transition-all duration-200"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
            {user.avatar}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-white font-semibold text-sm">{user.name}</p>
            <p className="text-white/60 text-xs">{user.email}</p>
          </div>
          <motion.div
            animate={{ rotate: showMenu ? 180 : 0 }}
            className="text-white/60"
          >
            ⌄
          </motion.div>
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2"
            >
              <div className="px-3 py-2 border-b border-white/10 mb-2">
                <p className="text-white font-semibold text-sm">{user.name}</p>
                <p className="text-white/60 text-xs">{user.email}</p>
              </div>
              <button
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors"
              >
                🔧 Profile Settings
              </button>
              <hr className="border-white/10 my-2" />
              <button
                onClick={() => {
                  setShowMenu(false);
                  onSignOut();
                }}
                className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-600/10 rounded-lg text-sm transition-colors"
              >
                🚪 Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserProfile;
