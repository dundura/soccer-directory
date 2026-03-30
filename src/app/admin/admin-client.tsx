"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { ListingForm } from "@/components/listing-form";
import { FoodTracker } from "@/components/food-tracker";
import { AdminCRM } from "@/components/admin-crm";
import { AdminTodos } from "@/components/admin-todos";
import { AdminResources } from "@/components/admin-resources";
import { AdminContacts } from "@/components/admin-contacts";
import { AdminUpload } from "@/components/admin-upload";
import type { ListingType } from "@/lib/types";

type User = { id: string; name: string; email: string; role: string; createdAt: string };
type Listing = { id: string; slug: string; name: string; status: string; featured: boolean; userId: string; createdAt: string; type: string };
type ReviewComment = { id: string; reviewId: string; clubName: string; userId: string; userName: string; userEmail: string; accountName: string; body: string; createdAt: string };

const TYPE_LABELS: Record<string, string> = {
  club: "Club", team: "Team", trainer: "Trainer", camp: "Camp",
  guest: "Guest Play", tournament: "Tournament", futsal: "Futsal", trip: "Trip",
  marketplace: "Equipment", equipment: "Equipment", books: "Equipment", showcase: "College Showcase",
  player: "Player Profile",
  service: "Product / Service",
  podcast: "Podcast",
  fbgroup: "Facebook Group",
  tryout: "Tryout",
  specialevent: "Special Event",
  recruiter: "College Recruiting Advisor",
  trainingapp: "Training App",
  ebook: "Ebook",
  giveaway: "Free Giveaway",
  blog: "Blog",
  youtube: "YouTube Channel",
  soccerbook: "Book & Author",
  photovideo: "Photo/Video Service",
  scrimmage: "Scrimmage",
  fundraiser: "Fundraiser",
  instagrampage: "Instagram Page",
  tiktokpage: "TikTok Page",
};

const TYPE_PATHS: Record<string, string> = {
  club: "clubs", team: "teams", trainer: "trainers", camp: "camps",
  guest: "guest-play", tournament: "tournaments", futsal: "futsal", trip: "international-trips",
  marketplace: "shop", equipment: "shop", books: "shop", showcase: "camps",
  player: "players", service: "services",
  podcast: "podcasts", fbgroup: "facebook-groups", instagrampage: "instagram-pages", tiktokpage: "tiktok-pages",
  tryout: "tryouts", specialevent: "special-events", recruiter: "college-recruiting",
  trainingapp: "training-apps", ebook: "ebooks", giveaway: "giveaways",
  blog: "blogs",
  youtube: "youtube-channels",
  soccerbook: "books-and-authors",
  photovideo: "photo-video-services",
  scrimmage: "scrimmages",
  fundraiser: "fundraiser",
  instagrampage: "instagram-pages",
  tiktokpage: "tiktok-pages",
};

export default function AdminClient() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const TABS = ["users", "listings", "comments", "crm", "contacts", "todos", "resources", "food", "upload"] as const;
  type Tab = typeof TABS[number];
  const [tab, setTab] = useState<Tab>(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    return TABS.includes(hash as Tab) ? (hash as Tab) : (searchParams.get("tab") as Tab) || "users";
  });
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviewComments, setReviewComments] = useState<ReviewComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [autoEditDone, setAutoEditDone] = useState(false);

  function switchTab(t: Tab) {
    setTab(t);
    window.history.replaceState(null, "", `#${t}`);
  }

  // Filter state
  const [listingTypeFilter, setListingTypeFilter] = useState("all");
  const [listingStatusFilter, setListingStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedTypes, setCollapsedTypes] = useState<Set<string>>(new Set());

  // Hero tagline setting
  const [heroTagline, setHeroTagline] = useState("");
  const [taglineSaving, setTaglineSaving] = useState(false);
  const [taglineSaved, setTaglineSaved] = useState(false);

  // Edit state
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editData, setEditData] = useState<Record<string, string> | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Auto-open edit form from query params (?editType=...&editId=...)
  useEffect(() => {
    if (autoEditDone || loading || listings.length === 0) return;
    const editType = searchParams.get("editType");
    const editId = searchParams.get("editId");
    if (editType && editId) {
      setAutoEditDone(true);
      const listing = listings.find((l) => l.type === editType && (String(l.id) === editId || l.slug === editId));
      if (listing) handleEdit(listing);
    }
  }, [loading, listings, autoEditDone, searchParams]);

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
      setReviewComments(data.clubReviewComments || []);
      setHeroTagline(data.heroTagline || "");
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

  async function handleEdit(listing: Listing) {
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin?type=${listing.type}&id=${listing.id}`);
      if (res.ok) {
        const data = await res.json();
        setEditData(data);
        setEditingListing(listing);
      }
    } catch { /* ignore */ }
    setEditLoading(false);
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
    if (searchQuery && !l.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
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
          {/* Edit Form */}
          {editingListing && editData ? (
            <div className="max-w-2xl mx-auto">
              <a
                href={`/${TYPE_PATHS[editingListing.type] || editingListing.type}/${editingListing.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-hover hover:text-accent transition-colors mb-4"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Listing
              </a>
              <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-6">
                  Edit {TYPE_LABELS[editingListing.type] || editingListing.type}: {editingListing.name}
                </h2>
                <ListingForm
                  mode="edit"
                  editType={editingListing.type as ListingType}
                  editId={editingListing.id}
                  initialData={editData}
                  isAdmin
                  onSuccess={() => {
                    const path = `/${TYPE_PATHS[editingListing.type] || editingListing.type}/${editingListing.slug}`;
                    setEditingListing(null); setEditData(null);
                    router.push(path);
                  }}
                  onCancel={() => { setEditingListing(null); setEditData(null); }}
                />
              </div>
            </div>
          ) : (
          <>
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => switchTab("users")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "users" ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => switchTab("listings")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "listings" ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}
            >
              Listings ({listings.length})
            </button>
            <button
              onClick={() => switchTab("comments")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "comments" ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}
            >
              Comments ({reviewComments.length})
            </button>
            <button
              onClick={() => switchTab("crm")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "crm" ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}
            >
              CRM
            </button>
            <button
              onClick={() => switchTab("contacts")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "contacts" ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}
            >
              Contacts
            </button>
            <button
              onClick={() => switchTab("todos")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "todos" ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}
            >
              Todo List
            </button>
            <button
              onClick={() => switchTab("resources")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "resources" ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}
            >
              Resources
            </button>
            <button
              onClick={() => switchTab("food")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "food" ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}
            >
              Food Tracker
            </button>
            <button
              onClick={() => switchTab("upload")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "upload" ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}
            >
              File Upload
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
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search listings..."
                    className="w-full px-4 py-2 pl-9 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
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

              {/* Grouped by type */}
              <div className="space-y-3">
                {(() => {
                  const typeGroups = new Map<string, typeof filteredListings>();
                  for (const l of filteredListings) {
                    const key = l.type;
                    if (!typeGroups.has(key)) typeGroups.set(key, []);
                    typeGroups.get(key)!.push(l);
                  }
                  const sorted = Array.from(typeGroups.entries()).sort((a, b) => (TYPE_LABELS[a[0]] || a[0]).localeCompare(TYPE_LABELS[b[0]] || b[0]));
                  return sorted.map(([type, items]) => {
                    const isCollapsed = collapsedTypes.has(type);
                    return (
                      <div key={type} className="bg-white rounded-2xl border border-border overflow-hidden">
                        <button
                          onClick={() => setCollapsedTypes(prev => { const n = new Set(prev); n.has(type) ? n.delete(type) : n.add(type); return n; })}
                          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface/30 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <svg className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            <span className="font-bold text-sm text-primary">{TYPE_LABELS[type] || type}</span>
                            <span className="text-xs text-muted">({items.length})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{items.filter(l => l.status === "approved").length} approved</span>
                            {items.filter(l => l.status === "pending").length > 0 && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">{items.filter(l => l.status === "pending").length} pending</span>
                            )}
                          </div>
                        </button>
                        {!isCollapsed && (
                          <div className="border-t border-border overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-surface/50 text-left">
                                  <th className="py-2 px-3 font-semibold text-primary">Name</th>
                                  <th className="py-2 px-3 font-semibold text-primary">Status</th>
                                  <th className="py-2 px-3 font-semibold text-primary">Featured</th>
                                  <th className="py-2 px-3 font-semibold text-primary">Owner</th>
                                  <th className="py-2 px-3 font-semibold text-primary">Created</th>
                                  <th className="py-2 px-3 font-semibold text-primary">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {items.map((listing) => {
                                  const owner = userMap.get(listing.userId);
                                  return (
                                    <tr key={`${listing.type}-${listing.id}`} className="border-t border-border hover:bg-surface/30">
                                      <td className="py-2.5 px-3">
                                        <a href={`/${TYPE_PATHS[listing.type] || listing.type}/${listing.slug}`} className="font-medium text-primary hover:underline">
                                          {listing.name}
                                        </a>
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                          listing.status === "approved" ? "bg-green-100 text-green-700" :
                                          listing.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                          "bg-red-100 text-red-700"
                                        }`}>
                                          {listing.status}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-3">
                                        {listing.featured ? (
                                          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Featured</span>
                                        ) : (
                                          <span className="text-xs text-muted">&mdash;</span>
                                        )}
                                      </td>
                                      <td className="py-2.5 px-3 text-muted">{owner?.name || "&mdash;"}</td>
                                      <td className="py-2.5 px-3 text-muted">{new Date(listing.createdAt).toLocaleDateString()}</td>
                                      <td className="py-2.5 px-3">
                                        <div className="flex gap-2">
                                          {listing.status !== "approved" && (
                                            <button onClick={() => adminAction({ action: "updateStatus", type: listing.type, id: listing.id, status: "approved" })} disabled={actionLoading !== null} className="text-xs px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50">Approve</button>
                                          )}
                                          {listing.status === "approved" && (
                                            <button onClick={() => adminAction({ action: "updateStatus", type: listing.type, id: listing.id, status: "rejected" })} disabled={actionLoading !== null} className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-[#DC373E] hover:bg-red-50 transition-colors disabled:opacity-50">Reject</button>
                                          )}
                                          <button onClick={() => adminAction({ action: "updateFeatured", type: listing.type, id: listing.id, featured: !listing.featured, name: listing.name, slug: listing.slug })} disabled={actionLoading !== null} className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-surface transition-colors disabled:opacity-50">{listing.featured ? "Unfeature" : "Feature"}</button>
                                          <button onClick={() => handleEdit(listing)} disabled={editLoading} className="text-xs px-2.5 py-1 rounded-lg bg-accent/10 text-accent-hover border border-accent/20 hover:bg-accent/20 transition-colors disabled:opacity-50">Edit</button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          )}
          </>
          )}

          {/* Comments Tab */}
          {tab === "comments" && (
            <div className="overflow-x-auto">
              <p className="text-sm text-muted mb-4">All comments on club reviews, with account info for moderation.</p>
              {reviewComments.length === 0 ? (
                <p className="text-muted text-center py-8">No comments yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-border text-left">
                      <th className="py-3 px-3 font-bold text-primary">Club</th>
                      <th className="py-3 px-3 font-bold text-primary">Display Name</th>
                      <th className="py-3 px-3 font-bold text-primary">Account Name</th>
                      <th className="py-3 px-3 font-bold text-primary">Email</th>
                      <th className="py-3 px-3 font-bold text-primary">Comment</th>
                      <th className="py-3 px-3 font-bold text-primary">Date</th>
                      <th className="py-3 px-3 font-bold text-primary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewComments.map((c) => (
                      <tr key={c.id} className="border-b border-border hover:bg-surface/50">
                        <td className="py-3 px-3 font-medium">{c.clubName}</td>
                        <td className="py-3 px-3">{c.userName}</td>
                        <td className="py-3 px-3 text-muted">{c.accountName || "—"}</td>
                        <td className="py-3 px-3 text-muted">{c.userEmail || "—"}</td>
                        <td className="py-3 px-3 max-w-xs">
                          <p className="truncate" title={c.body}>{c.body}</p>
                        </td>
                        <td className="py-3 px-3 text-muted whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => { if (confirm(`Delete comment by ${c.userName}?`)) adminAction({ action: "deleteClubReviewComment", commentId: c.id }); }}
                            disabled={actionLoading !== null}
                            className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-[#DC373E] hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === "crm" && <AdminCRM />}
          {tab === "contacts" && <AdminContacts />}
          {tab === "todos" && <AdminTodos />}
          {tab === "resources" && <AdminResources />}
          {tab === "food" && <FoodTracker />}
          {tab === "upload" && <AdminUpload />}
        </div>
      </div>
    </>
  );
}
