"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    // Validation
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const { error } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,

          options: {
            data: {
              name: name.trim(),
            },
          },
        });

      if (error) {
        throw error;
      }

      router.push("/login");
    } catch (error) {
      setError(
        error.message ||
          "Could not create your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="logo">VESTA</div>

        <h1>Create account</h1>

        <p className="auth-subtitle">
          Start building your portfolio.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">
            Name
          </label>

          <input
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            required
          />

          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="name@email.com"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Choose a password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
            minLength={6}
          />

          {error && (
            <p className="negative">
              {error}
            </p>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link href="/login">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}