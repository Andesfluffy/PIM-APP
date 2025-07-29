// "use client";
// import { signInWithPopup } from "firebase/auth";
// import { auth, googleProvider } from "@/services/firebase";

// export default function LoginButton() {
//   const signInWithGoogle = async () => {
//     try {
//       await signInWithPopup(auth, googleProvider);
//     } catch (error) {
//       console.error("Error signing in with Google:", error);
//     }
//   };

//   return (
//     <button
//       onClick={signInWithGoogle}
//       className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
//     >
//       <span className="relative z-10 flex items-center gap-3">
//         <span className="text-2xl">🔐</span>
//         Sign In with Google
//       </span>
//       <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
//     </button>
//   );
// }

"use client";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/services/firebase";

export default function LoginButton() {
  const signInWithGoogle = async () => {
    try {
      if (!auth) {
        console.error("Firebase Auth is not initialized.");
        return;
      }

      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <button
      onClick={signInWithGoogle}
      className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
    >
      <span className="relative z-10 flex items-center gap-3">
        <span className="text-2xl">🔐</span>
        Sign In with Google
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
    </button>
  );
}

