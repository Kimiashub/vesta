"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    localStorage.setItem("vestaLoggedIn", "true");

    router.push("/dashboard");
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="logo">VESTA</div>

        <h1>Welcome back</h1>
        <p className="auth-subtitle">
          Log in to your investment dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            placeholder="name@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button className="primary-button" type="submit">
            Log in
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link href="/signup">Create account</Link>
        </p>
      </div>
    </main>
  );
}
