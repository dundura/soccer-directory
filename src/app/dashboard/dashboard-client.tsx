"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ListingForm } from "@/components/listing-form";
import type { ListingType } from "@/lib/types";

const TYPE_PATHS: Record<string, string> = {
  club: "clubs",
  team: "teams",
  trainer: "trainers",
  camp: "camps",
  guest: "guest-play",
  tournament: "tournaments",
  futsal: "futsal",
  marketplace: "shop",
  equipment: "shop",
  books: "shop",
  showcase: "camps",
  player: "guest-play/players",
  podcast: "podcasts",
  fbgroup: "facebook-groups",
  service: "services",
};

const TYPE_LABELS: Record<string, string> = {
  club: "Club",
  team: "Team",
  trainer: "Trainer",
  camp: "Camp",
  guest: "Guest Play",
  tournament: "Tournament",
  futsal: "Futsal",
  marketplace: "Equipment",
  equipment: "Equipment",
  books: "Equipment",
  showcase: "College Showcase",
  player: "Player Profile",
  podcast: "Podcast",
  fbgroup: "Facebook Group",
  service: "Product / Service",
};

type Listing = { id: string; slug: string; name: string; status: string; type: string };

function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Invalid email or password");
    }
    setLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      // Auto-login after signup
      await signIn("credentials", { email, password, redirect: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-border p-8 md:p-10 text-center mb-8">
        <div className="text-5xl mb-4">{mode === "login" ? "👋" : "🚀"}</div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-3">
          {mode === "login" ? "Sign in to your account" : "Create your free account"}
        </h2>
        <p className="text-muted mb-6">
          {mode === "login"
            ? "Manage your listings on Soccer Near Me"
            : "Start listing your club, team, camp, or training services"}
        </p>

        <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-3 mb-6 text-left">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
          <input
            type="password"
            placeholder={mode === "signup" ? "Password (min. 6 characters)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === "signup" ? 6 : undefined}
            className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />

          {error && <p className="text-accent text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-muted">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button onClick={() => { setMode("signup"); setError(""); }} className="text-accent-hover font-semibold hover:underline">
                Sign up free
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => { setMode("login"); setError(""); }} className="text-accent-hover font-semibold hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>

      {/* What you can do */}
      <div className="bg-surface rounded-2xl p-6 md:p-8">
        <h3 className="font-[family-name:var(--font-display)] font-bold mb-4">With a free account you can:</h3>
        <div className="space-y-3 text-sm text-muted">
          {[
            "Create listings for your club, teams, camps, or training services",
            "Edit your information anytime — changes go live instantly",
            "Post guest player opportunities for tournaments",
            "Get discovered by thousands of soccer families",
            "Access Anytime Soccer Training team plans at a special rate",
          ].map((text) => (
            <div key={text} className="flex items-start gap-3">
              <span className="text-accent text-lg mt-0.5">✓</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AccountSettings() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await update({ name, email });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/user/profile", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      signOut({ callbackUrl: "/" });
    } catch {
      setError("Failed to delete account");
      setDeleting(false);
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h3 className="font-[family-name:var(--font-display)] text-xl font-bold mb-6">Account Settings</h3>
      <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
        <form onSubmit={handleSave} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Screen Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>
          {error && <p className="text-[#DC373E] text-sm">{error}</p>}
          {saved && <p className="text-green-600 text-sm">Profile updated successfully!</p>}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors text-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <hr className="border-border my-6" />

        <div>
          <h4 className="text-sm font-bold text-[#DC373E] mb-2">Danger Zone</h4>
          <p className="text-muted text-sm mb-3">Permanently delete your account and all your listings. This cannot be undone.</p>
          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="px-6 py-2.5 rounded-xl border-2 border-red-200 text-[#DC373E] font-semibold text-sm hover:bg-red-50 transition-colors"
            >
              Delete Account
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-2.5 rounded-xl bg-[#DC373E] text-white font-semibold text-sm hover:bg-[#C42F36] transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, delete my account"}
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-surface transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formDefaultType, setFormDefaultType] = useState<ListingType | undefined>(undefined);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [archiving, setArchiving] = useState<string | null>(null);

  // Edit state
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editData, setEditData] = useState<Record<string, string> | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    setLoading(true);
    try {
      const res = await fetch("/api/listings");
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function handleEdit(listing: Listing) {
    setEditLoading(true);
    try {
      const res = await fetch(`/api/listings?type=${listing.type}&id=${listing.id}`);
      if (res.ok) {
        const data = await res.json();
        setEditData(data);
        setEditingListing(listing);
      }
    } catch { /* ignore */ }
    setEditLoading(false);
  }

  async function handleArchive(listing: Listing) {
    if (!confirm(`Archive "${listing.name}"? This will hide it from public view.`)) return;
    setArchiving(listing.id);
    try {
      const res = await fetch("/api/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: listing.type, id: listing.id }),
      });
      if (res.ok) {
        setListings((prev) => prev.map((l) => l.id === listing.id ? { ...l, status: "archived" } : l));
      }
    } catch { /* ignore */ }
    setArchiving(null);
  }

  async function handleDelete(listing: Listing) {
    if (!confirm(`Permanently delete "${listing.name}"? This cannot be undone.`)) return;
    setDeleting(listing.id);
    try {
      const res = await fetch("/api/listings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: listing.type, id: listing.id }),
      });
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== listing.id));
      }
    } catch { /* ignore */ }
    setDeleting(null);
  }

  // Edit form
  if (editingListing && editData) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-6">
            Edit {TYPE_LABELS[editingListing.type] || editingListing.type}: {editingListing.name}
          </h2>
          <ListingForm
            mode="edit"
            editType={editingListing.type as ListingType}
            editId={editingListing.id}
            initialData={editData}
            onSuccess={() => {
              const path = `/${TYPE_PATHS[editingListing.type] || editingListing.type}/${editingListing.slug}`;
              setEditingListing(null); setEditData(null);
              router.push(path);
            }}
            onCancel={() => { setEditingListing(null); setEditData(null); }}
          />
        </div>
      </div>
    );
  }

  // Create form
  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-6">
            {formDefaultType === "player" ? "Create Guest Player Profile" : "Create New Listing"}
          </h2>
          <ListingForm
            defaultType={formDefaultType}
            onSuccess={() => { setShowForm(false); setFormDefaultType(undefined); fetchListings(); }}
            onCancel={() => { setShowForm(false); setFormDefaultType(undefined); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome + Actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            Welcome, {session?.user?.name || "User"}
          </h2>
          <p className="text-muted mt-1">Manage your listings below</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => { setFormDefaultType(undefined); setShowForm(true); }}
            className="px-6 py-2.5 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors text-sm"
          >
            + New Listing
          </button>
          <button
            onClick={() => { setFormDefaultType("player"); setShowForm(true); }}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors text-sm"
          >
            + Guest Player Profile
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-6 py-2.5 rounded-xl border border-border font-semibold text-muted hover:bg-surface transition-colors text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <p className="text-muted">Loading your listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="font-[family-name:var(--font-display)] text-xl font-bold mb-2">No listings yet</h3>
          <p className="text-muted mb-6">Create your first listing to get discovered by soccer families in your area.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => { setFormDefaultType(undefined); setShowForm(true); }}
              className="px-8 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors"
            >
              Create Your First Listing
            </button>
            <button
              onClick={() => { setFormDefaultType("player"); setShowForm(true); }}
              className="px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors"
            >
              + Guest Player Profile
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-2xl border border-border p-6 flex items-center justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold bg-surface text-primary px-2 py-0.5 rounded-full">
                    {TYPE_LABELS[listing.type] || listing.type}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    listing.status === "approved"
                      ? "bg-green-50 text-green-700"
                      : listing.status === "pending"
                      ? "bg-yellow-50 text-yellow-700"
                      : listing.status === "archived"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-red-50 text-red-700"
                  }`}>
                    {listing.status}
                  </span>
                </div>
                <h3 className="font-[family-name:var(--font-display)] font-bold text-lg truncate">{listing.name}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                {listing.status !== "archived" ? (
                  <>
                    <button
                      onClick={() => handleEdit(listing)}
                      disabled={editLoading}
                      className="px-4 py-2 rounded-xl bg-accent/10 text-accent-hover text-sm font-medium hover:bg-accent/20 transition-colors disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <a
                      href={`/${TYPE_PATHS[listing.type] || listing.type}/${listing.slug}`}
                      className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-surface transition-colors"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleArchive(listing)}
                      disabled={archiving === listing.id}
                      className="px-4 py-2 rounded-xl border border-amber-200 text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                    >
                      {archiving === listing.id ? "..." : "Archive"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleDelete(listing)}
                    disabled={deleting === listing.id}
                    className="px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deleting === listing.id ? "..." : "Delete"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AccountSettings />
    </div>
  );
}

export default function DashboardClient() {
  const { status, data: session } = useSession();

  if (status === "loading") {
    return (
      <>
        <div className="bg-primary text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">Dashboard</h1>
            <p className="text-white/70 text-lg">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            {status === "authenticated" ? `Welcome, ${session?.user?.name || "User"}` : "Dashboard"}
          </h1>
          <p className="text-white/70 text-lg">
            {status === "authenticated" ? "Create and manage your listings" : "Sign in to manage your listings"}
          </p>
        </div>
      </div>
      <div className="bg-white min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {status === "authenticated" ? <DashboardContent /> : <AuthForm />}
        </div>
      </div>
    </>
  );
}
