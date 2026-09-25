"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "../../components/bottomNav";
import { supabase } from "../../lib/supabase";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getUser() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (!user) {
          router.push("/login");
          return;
        }

        setUser(user);
      } catch (error) {
        setError(
          error.message ||
            "Could not load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, [router]);

  async function logout() {
    try {
      setLogoutLoading(true);
      setError("");

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.push("/login");
    } catch (error) {
      setError(
        error.message ||
          "Could not log out."
      );
    } finally {
      setLogoutLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="app-page">
        <p className="secondary-text">
          Loading profile...
        </p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const name =
    user.user_metadata?.name || "Vesta Investor";

  const email = user.email || "";

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="app-page">
      <header className="page-header">
        <p className="eyebrow">Account</p>
        <h1>Profile</h1>
      </header>

      <section className="profile-card">
        <div className="profile-avatar">
          {initials}
        </div>

        <h2>{name}</h2>

        <p className="secondary-text">
          {email}
        </p>
      </section>

      <section className="settings-list">
        <div>
          <span>Currency</span>
          <strong>SEK</strong>
        </div>

        <div>
          <span>Risk preference</span>
          <strong>Balanced</strong>
        </div>

        <div>
          <span>Notifications</span>
          <strong>On</strong>
        </div>
      </section>

      {error && (
        <p className="negative">
          {error}
        </p>
      )}

      <button
        className="logout-button"
        onClick={logout}
        disabled={logoutLoading}
      >
        {logoutLoading
          ? "Logging out..."
          : "Log out"}
      </button>

      <BottomNav />
    </main>
  );
}