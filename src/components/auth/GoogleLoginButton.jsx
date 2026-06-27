"use client";

import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/context/AuthContext";

export default function GoogleLoginButton() {
  const { login } = useAuth();

  return (
    <button
      onClick={login}
      className="flex items-center gap-3 rounded-2xl bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-100"
    >
      <FcGoogle size={22} />
      Continue with Google
    </button>
  );
}
