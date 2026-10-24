"use client";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Compass,
  Plus,
  Layers,
  UserRound,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Search,
  ChevronDown,
  ShieldCheck,
  PanelLeftClose,
  Leaf,
  RotateCcw,
  Route,
  Building2,
  X,
} from "lucide-react";
import { freshState, State } from "@/lib/data";
import {
  Feed,
  Discover,
  ProfilePage,
  Onboarding,
  MyInitiatives,
} from "./Community";
import { CreateFlow, Blueprint, Detail } from "./Initiative";
import { Workspace, Execution, PartnerPortal, Verified } from "./Workspace";
import { Modal } from "./ui";
type AppContextType = {
  state: State;
  update: (patch: Partial<State> | ((s: State) => Partial<State>)) => void;
  go: (path: string) => void;
  toast: (text: string) => void;
};
const Context = createContext<AppContextType>(null!);
export function useApp() {
  return useContext(Context);
}
const STORAGE = "actionos-demo-v1";
export default function ActionApp({ basePath = "" }: { basePath?: string }) {
  const [state, setState] = useState<State>(freshState);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  const [guide, setGuide] = useState(false);
  const [reset, setReset] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [storageError, setStorageError] = useState(false);
  const actualPathname = usePathname();
  const pathname =
    basePath && actualPathname.startsWith(basePath)
      ? actualPathname.slice(basePath.length) || "/demo"
      : actualPathname;
  const router = useRouter();
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed.version === 1 &&
          parsed.profile?.causes &&
          parsed.partners &&
          parsed.permissions
        )
          setState({ ...freshState(), ...parsed });
      }
    } catch {
      setStorageError(true);
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded)
      try {
        localStorage.setItem(STORAGE, JSON.stringify(state));
      } catch {
        setStorageError(true);
      }
  }, [state, loaded]);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 4500);
      return () => clearTimeout(t);
    }
  }, [notice]);
  const update = useCallback(
    (patch: Partial<State> | ((s: State) => Partial<State>)) =>
      setState((s) => ({
        ...s,
        ...(typeof patch === "function" ? patch(s) : patch),
      })),
    [],
  );
  const go = useCallback(
    (path: string) => {
      router.push(`${basePath}${basePath && path === "/demo" ? "" : path}`);
      setMobile(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    },
    [router, basePath],
  );
  const closeReset = useCallback(() => setReset(false), []);
  const active =
    pathname === "/"
      ? state.onboarded
        ? "feed"
        : "onboarding"
      : pathname.split("/")[1];
  const nav = [
    { label: "Home", path: "/feed", icon: Home, key: "feed" },
    { label: "Discover", path: "/discover", icon: Compass, key: "discover" },
    { label: "Create initiative", path: "/create", icon: Plus, key: "create" },
    {
      label: "My Initiatives",
      path: "/my-initiatives",
      icon: Layers,
      key: "my-initiatives",
    },
    {
      label: "Impact Profile",
      path: "/profile",
      icon: UserRound,
      key: "profile",
    },
  ];
  if (!loaded)
    return (
      <div className="loading">
        <span className="brand-mark">a</span>
        <h2>ACTIONOS</h2>
        <p>Making room for meaningful action.</p>
      </div>
    );
  let content: React.ReactNode;
  switch (active) {
    case "demo":
    case "feed":
      content = <Feed />;
      break;
    case "discover":
      content = <Discover key={pathname} initialSearch={search} />;
      break;
    case "profile":
      content = <ProfilePage />;
      break;
    case "onboarding":
      content = <Onboarding />;
      break;
    case "create":
      content = <CreateFlow />;
      break;
    case "blueprint":
      content = <Blueprint />;
      break;
    case "initiative":
      content = <Detail id={pathname.split("/")[2]} />;
      break;
    case "my-initiatives":
      content = <MyInitiatives />;
      break;
    case "workspace":
      content = <Workspace />;
      break;
    case "execution":
      content = <Execution />;
      break;
    case "partner":
      content = <PartnerPortal />;
      break;
    case "verified":
      content = <Verified />;
      break;
    default:
      content = (
        <div className="empty">
          <h1>Let’s find your next step.</h1>
          <button className="primary" onClick={() => go("/feed")}>
            Back to your feed
          </button>
        </div>
      );
  }
  return (
    <Context.Provider value={{ state, update, go, toast: setNotice }}>
      <div className="app-shell">
        <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
          <button
            className="brand"
            onClick={() => go("/feed")}
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
                key={n.key}
                onClick={() => go(n.path)}
                className={`nav-item ${n.key === "create" ? "nav-create" : ""} ${active === n.key || (active === "demo" && n.key === "feed") ? "active" : ""}`}
              >
                <n.icon size={19} />
                <span>{n.label}</span>
                {n.key === "my-initiatives" && (
                  <span className="nav-count">
                    {new Set(["ripple", ...Object.keys(state.joined)]).size}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-divider" />
          <button
            className={`nav-item ${active === "partner" ? "active" : ""}`}
            onClick={() => {
              update({ account: "Partner" });
              go("/partner");
            }}
          >
            <Building2 size={19} />
            <span>Partner portal</span>
            <ArrowUpRight size={14} />
          </button>
          <div className="sidebar-story">
            <span className="mini-line" />
            <h3>
              Intention is the start.
              <br />
              Action is the difference.
            </h3>
            <p>The infrastructure we wished we had when we started.</p>
            <a
              href="https://unmutedofficial.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn about UNMUTED <ArrowUpRight size={13} />
            </a>
          </div>
          <div className="sidebar-bottom">
            <div className="philosophy">
              HUMAN-LED.
              <br />
              AI-ASSISTED.
              <br />
              PARTNER-VERIFIED.
            </div>
            <button className="guide-button" onClick={() => setGuide(!guide)}>
              <Route size={16} /> Demo guide <ArrowRight size={14} />
            </button>
            <span className="local-label">LOCAL PROTOTYPE · DEMO DATA</span>
          </div>
        </aside>
        <div className="app-main">
          <header className="topbar">
            <button
              className="mobile-toggle icon-button"
              aria-label="Toggle navigation"
              onClick={() => setMobile(!mobile)}
            >
              <PanelLeftClose />
            </button>
            <div className="top-breadcrumb">
              Your intention. <span>Our next step.</span>
            </div>
            <form
              className="top-search"
              onSubmit={(e) => {
                e.preventDefault();
                go("/discover");
              }}
            >
              <Search size={16} />
              <input
                aria-label="Search all initiatives"
                placeholder="Find a way to make a difference"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <div className="account-switch">
              <span>Viewing as</span>
              <select
                aria-label="Viewing as"
                value={state.account}
                onChange={(e) => {
                  const account = e.target.value as State["account"];
                  update({ account });
                  go(account === "Partner" ? "/partner" : "/feed");
                }}
              >
                <option>Student</option>
                <option>Contributor</option>
                <option>Partner</option>
              </select>
              <ChevronDown size={13} />
            </div>
            <button
              className="avatar"
              onClick={() => go("/profile")}
              aria-label="Open Aarav's profile"
            >
              AM
            </button>
          </header>
          {storageError && (
            <div className="storage-warning">
              Browser storage is unavailable. This session works, but changes
              may not survive a refresh.
            </div>
          )}
          <main id="main-content">{content}</main>
          <footer className="app-footer">
            <span>
              ACTIONOS <span className="muted">by UNMUTED</span>
            </span>
            <span>Discover. Act. Prove.</span>
            <button onClick={() => setReset(true)}>
              <RotateCcw size={12} /> Reset demo
            </button>
          </footer>
        </div>
      </div>
      {notice && (
        <div className="toast" role="status">
          <ShieldCheck size={18} />
          {notice}
        </div>
      )}
      {guide && (
        <aside className="demo-guide">
          <div className="row between">
            <h3>Your 3-minute demo</h3>
            <button
              className="icon-button"
              aria-label="Close demo guide"
              onClick={() => setGuide(false)}
            >
              <X size={17} />
            </button>
          </div>
          <p>One idea. A team. A verified outcome.</p>
          {[
            ["01", "Discover your match", "/feed"],
            ["02", "Map your interests & skills", "/profile"],
            ["03", "Observe → validate → build", "/create"],
            ["04", "Join a meaningful role", "/initiative/ripple"],
            ["05", "Check project readiness", "/workspace"],
            ["06", "Document the pilot", "/execution"],
            ["07", "Partner verifies the outcome", "/partner"],
            ["08", "See your impact portfolio", "/profile"],
          ].map(([n, t, p]) => (
            <button
              key={n}
              onClick={() => {
                if (p === "/partner") update({ account: "Partner" });
                go(p);
                setGuide(false);
              }}
            >
              <span>{n}</span>
              {t}
              <ArrowRight size={14} />
            </button>
          ))}
          <small>
            All partner responses and evidence are seeded for this local
            demonstration.
          </small>
        </aside>
      )}
      {reset && (
        <Modal title="Reset your demo?" onClose={closeReset}>
          <p>
            This removes your local rehearsal changes, joins, posts and
            verification decisions, and restores the original sample data.
          </p>
          <div className="modal-actions">
            <button className="secondary" onClick={closeReset}>
              Keep my changes
            </button>
            <button
              className="primary"
              onClick={() => {
                setState(freshState());
                setReset(false);
                go("/demo");
                setNotice("Demo reset. You’re ready for another run.");
              }}
            >
              Reset demo
            </button>
          </div>
        </Modal>
      )}
    </Context.Provider>
  );
}
