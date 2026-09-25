"use client";

import { useRouter } from "next/navigation";
import BottomNav from "../../components/bottomNav";

export default function ProfilePage() {
  const router = useRouter();

  function logout() {
    localStorage.removeItem("vestaLoggedIn");
    router.push("/login");
  }

  return (
    <main className="app-page">
      <header className="page-header">
        <p className="eyebrow">Account</p>
        <h1>Profile</h1>
      </header>

      <section className="profile-card">
        <div className="profile-avatar">V</div>

        <h2>Vesta Investor</h2>
        <p className="secondary-text">investor@example.com</p>
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

      <button className="logout-button" onClick={logout}>
        Log out
      </button>

      <BottomNav />
    </main>
  );
}