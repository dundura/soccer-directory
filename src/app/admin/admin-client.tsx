"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

type User = { id: string; name: string; email: string; role: string; createdAt: string };
type Listing = { id: string; slug: string; name: string; status: string; featured: boolean; userId: string; createdAt: string; type: string };

const TYPE_LABELS: Record<string, string> = {
  club: "Club", team: "Team", trainer: "Trainer", camp: "Camp",
  guest: "Guest Play", tournament: "Tournament", futsal: "Futsal", trip: "Trip",
};

const TYPE_PATHS: Record<string, string> = {
  club: "clubs", team: "teams", trainer: "trainers", camp: "camps",
  guest: "guest-play", tournament: "tournaments", futsal: "futsal", trip: "international-trips",
};

export default function AdminClient() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<"users" | "listings">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter state
  const [listingTypeFilter, setListingTypeFilter] = useState("all");
  const [listingStatusFilter, setListingStatusFilter] = useState("all");

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status]);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin");
      if (res.status === 403) { setError("access_denied"); setLoading(false); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users);
      setListings(data.listings);
    } catch {
      setError("Failed to load admin data");
    }
    setLoading(false);
  }

  async function adminAction(body: Record<string, unknown>) {
    const key = JSON.stringify(body);
    setActionLoading(key);
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) await fetchData();
    } catch { /* ignore */ }
    setActionLoading(null);
  }

  if (status === "loading" || loading) {
    return (
      <>
        <div className="bg-primary text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">Admin</h1>
            <p className="text-white/60 mt-1">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (status !== "authenticated" || error === "access_denied") {
    return (
      <>
        <div className="bg-primary text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">Access Denied</h1>
          </div>
        </div>
        <div className="bg-white min-h-[60vh]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div className="text-5xl mb-4">&#128274;</div>
            <p className="text-muted">You do not have permission to view this page.</p>
            <a href="/dashboard" className="inline-block mt-6 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors">
              Go to Dashboard
            </a>
          </div>
        </div>
      </>
    );
  }

  const filteredListings = listings.filter((l) => {
    if (listingTypeFilter !== "all" && l.type !== listingTypeFilter) return false;
    if (listingStatusFilter !== "all" && l.status !== listingStatusFilter) return false;
    return true;
  });

  // Build a user lookup map
  const userMap = new Map(users.map((u) => [u.id, u]));

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-white/60">Manage users, listings, and site content</p>
          <div className="flex gap-4 mt-4">
            <span className="bg-white/10 px-3 py-1 rounded-lg text-sm">{users.length} users</span>
            <span className="bg-white/10 px-3 py-1 rounded-lg text-sm">{listings.length} listings</span>
            <span className="bg-white/10 px-3 py-1 rounded-lg text-sm">{listings.filter((l) => l.status === "approved").length} approved</span>
            <span className="bg-white/10 px-3 py-1 rounded-lg text-sm">{listings.filter((l) => l.featured).length} featured</span>
          </div>
        </div>
      </div>

      <div className="bg-white min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab("users")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "users" ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setTab("listings")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "listings" ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}
            >
              Listings ({listings.length})
            </button>
          </div>

          {/* Users Tab */}
          {tab === "users" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-border text-left">
                    <th className="py-3 px-3 font-bold text-primary">Name</th>
                    <th className="py-3 px-3 font-bold text-primary">Email</th>
                    <th className="py-3 px-3 font-bold text-primary">Role</th>
                    <th className="py-3 px-3 font-bold text-primary">Listings</th>
                    <th className="py-3 px-3 font-bold text-primary">Joined</th>
                    <th className="py-3 px-3 font-bold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const userListings = listings.filter((l) => l.userId === user.id).length;
                    const isCurrentUser = session?.user?.id === user.id;
                    return (
                      <tr key={user.id} className="border-b border-border hover:bg-surface/50">
                        <td className="py-3 px-3 font-medium">{user.name}</td>
                        <td className="py-3 px-3 text-muted">{user.email}</td>
                        <td className="py-3 px-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">{userListings}</td>
                        <td className="py-3 px-3 text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            {!isCurrentUser && (
                              <>
                                <button
                                  onClick={() => adminAction({ action: "updateRole", userId: user.id, role: user.role === "admin" ? "user" : "admin" })}
                                  disabled={actionLoading !== null}
                                  className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-surface transition-colors disabled:opacity-50"
                                >
                                  {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                                </button>
                                <button
                                  onClick={() => { if (confirm(`Delete user "${user.name}" and all their listings?`)) adminAction({ action: "deleteUser", userId: user.id }); }}
                                  disabled={actionLoading !== null}
                                  className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-[#DC373E] hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                            {isCurrentUser && <span className="text-xs text-muted">(you)</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Listings Tab */}
          {tab === "listings" && (
            <>
              {/* Filters */}
              <div className="flex gap-3 mb-4 flex-wrap">
                <select
                  value={listingTypeFilter}
                  onChange={(e) => setListingTypeFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-border text-sm bg-white"
                >
                  <option value="all">All Types</option>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select
                  value={listingStatusFilter}
                  onChange={(e) => setListingStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-border text-sm bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <span className="text-sm text-muted self-center">{filteredListings.length} results</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-border text-left">
                      <th className="py-3 px-3 font-bold text-primary">Name</th>
                      <th className="py-3 px-3 font-bold text-primary">Type</th>
                      <th className="py-3 px-3 font-bold text-primary">Status</th>
                      <th className="py-3 px-3 font-bold text-primary">Featured</th>
                      <th className="py-3 px-3 font-bold text-primary">Owner</th>
                      <th className="py-3 px-3 font-bold text-primary">Created</th>
                      <th className="py-3 px-3 font-bold text-primary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map((listing) => {
                      const owner = userMap.get(listing.userId);
                      return (
                        <tr key={`${listing.type}-${listing.id}`} className="border-b border-border hover:bg-surface/50">
                          <td className="py-3 px-3">
                            <a href={`/${TYPE_PATHS[listing.type] || listing.type}/${listing.slug}`} className="font-medium text-primary hover:underline">
                              {listing.name}
                            </a>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-xs font-semibold bg-surface px-2 py-1 rounded-full">
                              {TYPE_LABELS[listing.type] || listing.type}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              listing.status === "approved" ? "bg-green-100 text-green-700" :
                              listing.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {listing.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {listing.featured ? (
                              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Featured</span>
                            ) : (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-muted">{owner?.name || "—"}</td>
                          <td className="py-3 px-3 text-muted">{new Date(listing.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-3">
                            <div className="flex gap-2">
                              {listing.status !== "approved" && (
                                <button
                                  onClick={() => adminAction({ action: "updateStatus", type: listing.type, id: listing.id, status: "approved" })}
                                  disabled={actionLoading !== null}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50"
                                >
                                  Approve
                                </button>
                              )}
                              {listing.status === "approved" && (
                                <button
                                  onClick={() => adminAction({ action: "updateStatus", type: listing.type, id: listing.id, status: "rejected" })}
                                  disabled={actionLoading !== null}
                                  className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-[#DC373E] hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              )}
                              <button
                                onClick={() => adminAction({ action: "updateFeatured", type: listing.type, id: listing.id, featured: !listing.featured })}
                                disabled={actionLoading !== null}
                                className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-surface transition-colors disabled:opacity-50"
                              >
                                {listing.featured ? "Unfeature" : "Feature"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
