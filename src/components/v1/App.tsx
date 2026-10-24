"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  Home,
  Compass,
  Plus,
  Layers,
  UserRound,
  Building2,
  Bell,
  ShieldCheck,
  LogOut,
  PanelLeftClose,
  Settings,
} from "lucide-react";
import { configured, client, rows } from "@/lib/supabase";
import type { Row } from "@/lib/database.types";
import {
  SessionContext,
  Loading,
  ErrorBox,
  Empty,
  LinkButton,
  useLoad,
  LoadState,
} from "./shared";
import { Connection, Auth, ProfileEditor, PublicProfile } from "./Account";
import {
  Discover,
  MyInitiatives,
  Notifications,
  Composer,
  Post,
} from "./Community";
import { Create, Project } from "./Projects";
import { Partner, Organisation, Admin } from "./Organisations";
export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <ConnectedApp />
    </Suspense>
  );
}
function ConnectedApp() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Row<"profiles"> | null>(null);
  const [preferences, setPreferences] =
    useState<Row<"profile_preferences"> | null>(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState("");
  const [mobile, setMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const refresh = useCallback(() => setRevision((v) => v + 1), []);
  const toast = useCallback((s: string) => setNotice(s), []);
  useEffect(() => {
    if (!configured) return;
    let active = true;
    client()
      .auth.getUser()
      .then(({ data, error }) => {
        if (!active) return;
        setUser(data.user);
        if (error && error.name !== "AuthSessionMissingError")
          setError(error.message);
        if (!data.user) setLoading(false);
      });
    const {
      data: { subscription },
    } = client().auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      if (event === "PASSWORD_RECOVERY") router.replace("/reset-password");
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setPreferences(null);
        setAdmin(false);
        setLoading(false);
      }
      if (event === "SIGNED_IN") setRevision((v) => v + 1);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);
  useEffect(() => {
    if (!user) return;
    let active = true;
    setError("");
    Promise.all([
      rows("profiles", { eq: { id: user.id }, limit: 1 }),
      rows("profile_preferences", {
        eq: { user_id: user.id },
        order: "user_id",
        limit: 1,
      }),
      rows("admin_users", { eq: { user_id: user.id }, limit: 1 }),
    ])
      .then(([p, pref, a]) => {
        if (!active) return;
        setProfile(p[0] ?? null);
        setPreferences(pref[0] ?? null);
        setAdmin(a.length > 0);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, revision]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    setMobile(false);
  }, [pathname]);
  const segment = pathname.split("/")[1];
  const authRoutes = ["login", "signup", "forgot-password", "reset-password"];
  const protectedRoute =
    [
      "onboarding",
      "profile",
      "settings",
      "create",
      "partner",
      "admin",
      "notifications",
      "my-initiatives",
      "my-impact",
    ].includes(segment) || pathname.endsWith("/workspace");
  let content: React.ReactNode;
  if (!configured) content = <Connection />;
  else if (loading) content = <Loading />;
  else if (error) content = <ErrorBox error={error} retry={refresh} />;
  else if (authRoutes.includes(segment))
    content = (
      <Auth
        key={segment}
        mode={
          segment as "login" | "signup" | "forgot-password" | "reset-password"
        }
      />
    );
  else if (protectedRoute && !user)
    content = (
      <div className="v1-intro">
        <h1>Good work starts with a connection.</h1>
        <p>Sign in to contribute, create, and keep track of your impact.</p>
        <LinkButton href="/login">Sign in</LinkButton>
        <LinkButton secondary href="/signup">
          Create an account
        </LinkButton>
      </div>
    );
  else if (user && !profile?.onboarding_completed)
    content = <ProfileEditor key={user.id} />;
  else if (
    segment === "profile" ||
    segment === "settings" ||
    segment === "onboarding"
  )
    content = <ProfileEditor key={user?.id} />;
  else if (segment === "people")
    content = (
      <PublicProfile
        username={decodeURIComponent(pathname.split("/")[2] ?? "")}
      />
    );
  else if (segment === "discover") content = <Discover />;
  else if (segment === "my-initiatives" || segment === "my-impact")
    content = <MyInitiatives />;
  else if (segment === "notifications") content = <Notifications />;
  else if (segment === "create")
    content = pathname === "/create/update" ? <Composer /> : <Create />;
  else if (segment === "initiatives")
    content = (
      <Project
        key={pathname}
        slug={pathname.split("/")[2]}
        workspace={pathname.endsWith("/workspace")}
      />
    );
  else if (segment === "organisations")
    content = <Organisation slug={pathname.split("/")[2]} />;
  else if (segment === "partner") content = <Partner />;
  else if (segment === "admin") content = <Admin />;
  else if (segment === "posts")
    content = <SinglePost id={pathname.split("/")[2]} />;
  else if (["", "feed"].includes(segment)) content = <Discover home />;
  else
    content = (
      <Empty title="This page isn’t here">
        <a href="/feed">Return home →</a>
      </Empty>
    );
  const nav = [
    { label: "Home", path: "/feed", icon: Home },
    { label: "Discover", path: "/discover", icon: Compass },
    { label: "Create", path: "/create", icon: Plus },
    { label: "My initiatives", path: "/my-initiatives", icon: Layers },
    { label: "Impact profile", path: "/profile", icon: UserRound },
  ];
  return (
    <SessionContext.Provider
      value={{ user, profile, preferences, admin, revision, refresh, toast }}
    >
      <div className="app-shell v1-app">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
          <button
            className="brand"
            onClick={() => router.push("/feed")}
            aria-label="ActionOS home"
          >
            <span className="brand-mark">
              a<span />
            </span>
            <span>
              ACTIONOS<small>by UNMUTED</small>
            </span>
          </button>
          <div className="sidebar-label">YOUR SPACE</div>
          <nav>
            {nav.map((n) => (
              <button
                key={n.path}
                className={`nav-item ${pathname === n.path ? "active" : ""} ${n.path === "/create" ? "nav-create" : ""}`}
                onClick={() => router.push(n.path)}
              >
                <n.icon size={19} />
                <span>{n.label}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-divider" />
          <button
            className={`nav-item ${segment === "partner" ? "active" : ""}`}
            onClick={() => router.push("/partner")}
          >
            <Building2 size={19} />
            Partner portal
          </button>
          {admin && (
            <button className="nav-item" onClick={() => router.push("/admin")}>
              <ShieldCheck size={19} />
              Administration
            </button>
          )}
          <div className="sidebar-story">
            <span className="mini-line" />
            <h3>
              Intention is the start.
              <br />
              Action is the difference.
            </h3>
            <p>The infrastructure we wished we had when we started.</p>
          </div>
          <div className="sidebar-bottom">
            <div className="philosophy">
              HUMAN-LED.
              <br />
              ACTION-ORIENTED.
              <br />
              PARTNER-VERIFIED.
            </div>
            {user && (
              <>
                <button
                  className="nav-item"
                  onClick={() => router.push("/settings")}
                >
                  <Settings size={17} />
                  Settings
                </button>
                <button
                  className="nav-item"
                  onClick={async () => {
                    const { error } = await client().auth.signOut();
                    if (error) toast(error.message);
                    else {
                      router.push("/login");
                      refresh();
                    }
                  }}
                >
                  <LogOut size={17} />
                  Sign out
                </button>
              </>
            )}
          </div>
        </aside>
        <div className="app-main">
          <header className="topbar">
            <button
              className="mobile-toggle icon-button"
              aria-label="Toggle navigation"
              aria-expanded={mobile}
              onClick={() => setMobile(!mobile)}
            >
              <PanelLeftClose />
            </button>
            <div className="top-breadcrumb">
              Your intention. <span>Our next step.</span>
            </div>
            <div className="v1-actions">
              {user ? (
                <>
                  <button
                    className="icon-button"
                    aria-label="Notifications"
                    onClick={() => router.push("/notifications")}
                  >
                    <Bell size={20} />
                  </button>
                  <button
                    className="avatar"
                    aria-label="Your profile"
                    onClick={() => router.push("/profile")}
                  >
                    {profile?.display_name.slice(0, 2).toUpperCase() ?? "ME"}
                  </button>
                </>
              ) : (
                configured && (
                  <>
                    <LinkButton secondary href="/login">
                      Sign in
                    </LinkButton>
                    <LinkButton href="/signup">Join the community</LinkButton>
                  </>
                )
              )}
            </div>
          </header>
          <main id="main-content">{content}</main>
          <footer className="v1-footer">
            Built for people who care enough to act.{" "}
            <span>ACTIONOS / UNMUTED</span>
          </footer>
        </div>
        <nav className="v1-mobile-nav" aria-label="Quick navigation">
          {nav.slice(0, 4).map((n) => (
            <button
              key={n.path}
              aria-label={n.label}
              onClick={() => router.push(n.path)}
              className={pathname === n.path ? "active" : ""}
            >
              <n.icon size={20} />
              <small>{n.label}</small>
            </button>
          ))}
        </nav>
        {notice && (
          <div role="status" className="toast">
            {notice}
          </div>
        )}
      </div>
    </SessionContext.Provider>
  );
}
function SinglePost({ id }: { id: string }) {
  const q = useLoad(() => rows("impact_posts", { eq: { id }, limit: 1 }), [id]);
  return (
    <LoadState query={q}>
      {q.data?.[0] ? <Post post={q.data[0]} /> : <Empty>Post not found.</Empty>}
    </LoadState>
  );
}
