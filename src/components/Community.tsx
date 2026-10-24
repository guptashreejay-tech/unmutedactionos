"use client";
import { useState, useCallback, useEffect } from "react";
import {
  ArrowUpRight,
  MapPin,
  ArrowRight,
  SlidersHorizontal,
  Search,
  Plus,
  ShieldCheck,
  Clock,
  Leaf,
  Users,
  Target,
  Check,
  Upload,
  BookOpen,
  Bookmark,
} from "lucide-react";
import { causes, skills, initiatives, Profile, Initiative } from "@/lib/data";
import { match } from "@/lib/logic";
import { useApp } from "./ActionApp";
import { Title, Badge, InitiativeCard, Cover, CheckLine, Modal } from "./ui";
export function Feed() {
  const { state, update, go } = useApp();
  const [filter, setFilter] = useState("For you");
  let list = [...initiatives].sort(
    (a, b) => match(state.profile, b).score - match(state.profile, a).score,
  );
  if (filter === "Saved") list = list.filter((p) => state.saved.includes(p.id));
  if (filter === "Near you")
    list = list.filter((p) => p.location === state.profile.location);
  return (
    <>
      <Title
        eyebrow="A LITTLE INTENTION. A REAL DIFFERENCE."
        title="Your Impact Feed"
        description="Initiatives where your interests, skills and availability could be useful."
        action={
          <span className="location-label">
            <MapPin size={15} />
            {state.profile.location}
          </span>
        }
      />
      <div className="feed-layout">
        <section>
          <div className="hero">
            <div className="hero-content">
              <div className="eyebrow">DISCOVER. ACT. PROVE.</div>
              <h2>
                Good intentions.
                <br />
                Meet real possibilities.
              </h2>
              <p>
                Have an idea? Build it.
                <br />
                Want to help? Find your people.
              </p>
              <button className="hero-button" onClick={() => go("/discover")}>
                Find your next step <ArrowRight size={17} />
              </button>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="orbit orbit-three" />
              <div className="orbit-center">
                <span>↗</span>
              </div>
              <span className="orbit-label label-one">PEOPLE</span>
              <span className="orbit-label label-two">PURPOSE</span>
              <span className="orbit-label label-three">POSSIBILITY</span>
              <div className="orbit-dot dot-one" />
              <div className="orbit-dot dot-two" />
            </div>
          </div>
          <div className="feed-tabs">
            <div className="tabs">
              {["For you", "Near you", "Saved"].map((t) => (
                <button
                  key={t}
                  className={filter === t ? "selected" : ""}
                  onClick={() => setFilter(t)}
                >
                  {t}
                  {t === "Saved" &&
                    state.saved.length > 0 &&
                    ` (${state.saved.length})`}
                </button>
              ))}
            </div>
            <span>{list.length} opportunities to act</span>
          </div>
          <div className="card-grid">
            {list.map((p) => (
              <InitiativeCard
                key={p.id}
                project={p}
                state={state}
                onOpen={() => go(`/initiative/${p.id}`)}
                onSave={() =>
                  update({
                    saved: state.saved.includes(p.id)
                      ? state.saved.filter((x) => x !== p.id)
                      : [...state.saved, p.id],
                  })
                }
              />
            ))}
          </div>
          {!list.length && (
            <div className="empty">
              <Bookmark />
              <h3>Your next step, saved for later.</h3>
              <p>Tap the bookmark on an initiative to keep it here.</p>
              <button
                className="secondary"
                onClick={() => setFilter("For you")}
              >
                Explore initiatives
              </button>
            </div>
          )}
          {state.needs.length > 0 && (
            <section className="panel section-gap">
              <h3>Needs from the community</h3>
              {state.needs.map((n) => (
                <div className="need-feed" key={n.id}>
                  <Badge tone="success">Verified need · demo partner</Badge>
                  <h3>{n.need}</h3>
                  <p>
                    {n.organisation} · {n.roles}
                  </p>
                  <button
                    className="text-button"
                    onClick={() => go("/discover")}
                  >
                    Explore partner needs <ArrowRight size={15} />
                  </button>
                </div>
              ))}
            </section>
          )}
        </section>
        <aside className="feed-aside">
          <section className="panel profile-summary">
            <div className="row">
              <div className="avatar large-avatar">AM</div>
              <div>
                <h3>Aarav Mehta</h3>
                <span className="muted">Your change starts here.</span>
              </div>
            </div>
            <div className="mini-stats">
              <div>
                <strong>{2 + Number(state.verification === "verified")}</strong>
                <span>Verified projects</span>
              </div>
              <div>
                <strong>{4 + Number(!!state.joined.ripple)}</strong>
                <span>Contributions</span>
              </div>
            </div>
            <div className="label">YOUR IMPACT PROFILE</div>
            <div className="chips">
              {state.profile.causes.map((c) => (
                <span key={c}>{c.replace("Children & ", "")}</span>
              ))}
            </div>
            <p className="small">{state.profile.skills.join(" · ")}</p>
            <div className="availability">
              <Clock size={14} />
              {state.profile.days} ·{" "}
              {state.profile.hours.replace("hours/week", "hrs/wk")}
            </div>
            <button className="text-button full" onClick={() => go("/profile")}>
              View your Impact Profile <ArrowRight size={15} />
            </button>
          </section>
          <section className="panel next-step">
            <div className="row between">
              <span className="label">YOUR NEXT SMALL STEP</span>
              <span className="step-dot" />
            </div>
            <h3>
              Someone needs
              <br />
              exactly what you bring.
            </h3>
            <p>
              Project Ripple needs outreach volunteers. Your voice could help
              get the right people involved.
            </p>
            <button
              className="text-button"
              onClick={() => go("/initiative/ripple")}
            >
              Meet Project Ripple <ArrowUpRight size={15} />
            </button>
          </section>
          <section className="trust-note">
            <ShieldCheck size={22} />
            <h3>
              Real needs.
              <br />
              Accountable action.
            </h3>
            <p>
              People understand the problem. Partners validate the need and
              verify what changed.
            </p>
            <span>AI structures. Humans decide.</span>
          </section>
        </aside>
      </div>
    </>
  );
}
export function Discover({ initialSearch = "" }: { initialSearch?: string }) {
  const { state, update, go } = useApp();
  const [query, setQuery] = useState(initialSearch),
    [tab, setTab] = useState("For You"),
    [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  useEffect(() => setQuery(initialSearch), [initialSearch]);
  const set = (k: string, v: string) => setFilters({ ...filters, [k]: v });
  const list = initiatives
    .filter((p) => {
      const text = [p.title, p.cause, p.description, ...p.roles, ...p.skills]
        .join(" ")
        .toLowerCase();
      return (
        text.includes(query.toLowerCase()) &&
        Object.entries(filters).every(
          ([k, v]) =>
            !v ||
            (k === "role"
              ? p.roles.includes(v)
              : k === "skill"
                ? p.skills.includes(v)
                : String(p[k as keyof Initiative]).includes(v)),
        ) &&
        (tab !== "Nearby" || p.location === state.profile.location) &&
        (tab !== "Urgently Needed" || p.urgent) &&
        (tab !== "New" || p.fresh) &&
        (tab !== "Verified Partners" || p.verified)
      );
    })
    .sort(
      (a, b) => match(state.profile, b).score - match(state.profile, a).score,
    );
  return (
    <>
      <Title
        eyebrow="FIND YOUR PEOPLE. FIND YOUR PURPOSE."
        title="Small steps. Shared purpose."
        description="There’s more than one way to make a difference. Find yours."
      />
      <div className="discover-search">
        <Search size={21} />
        <input
          aria-label="Search initiatives"
          placeholder="Search a cause, a skill, or an initiative…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="secondary" onClick={() => setExpanded(!expanded)}>
          <SlidersHorizontal size={16} />
          Filters{" "}
          {Object.values(filters).filter(Boolean).length > 0 &&
            `(${Object.values(filters).filter(Boolean).length})`}
        </button>
      </div>
      <div className="tabs discover-tabs">
        {[
          "For You",
          "Nearby",
          "Urgently Needed",
          "New",
          "Verified Partners",
        ].map((t) => (
          <button
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {expanded && (
        <div className="panel filter-grid">
          {[
            ["cause", "Cause", causes],
            ["sdg", "SDG", ["4", "6", "10", "11", "12", "15"]],
            ["location", "Location", ["Bengaluru", "Mysuru"]],
            ["mode", "Mode", ["In-person", "Online", "Hybrid"]],
            [
              "hours",
              "Time commitment",
              ["1–2 hours/week", "3–5 hours/week", "5+ hours/week"],
            ],
            ["skill", "Skills needed", skills],
            [
              "stage",
              "Project stage",
              ["Validation", "Recruiting", "Building team", "Executing"],
            ],
            [
              "role",
              "Role required",
              Array.from(new Set(initiatives.flatMap((p) => p.roles))),
            ],
          ].map(([key, label, options]) => (
            <label key={key as string}>
              {label as string}
              <select
                aria-label={label as string}
                value={filters[key as string] || ""}
                onChange={(e) => set(key as string, e.target.value)}
              >
                <option value="">All</option>
                {(options as string[]).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          ))}
          <button
            className="text-button"
            onClick={() => {
              setFilters({});
              setQuery("");
              setTab("For You");
            }}
          >
            Clear all filters
          </button>
        </div>
      )}
      <div className="section-heading">
        <h3>{list.length} ways to get involved</h3>
        <span className="muted">Matched to your interests & skills</span>
      </div>
      <div className="card-grid discover-grid">
        {list.map((p) => (
          <InitiativeCard
            key={p.id}
            project={p}
            state={state}
            onOpen={() => go(`/initiative/${p.id}`)}
            onSave={() =>
              update({
                saved: state.saved.includes(p.id)
                  ? state.saved.filter((x) => x !== p.id)
                  : [...state.saved, p.id],
              })
            }
          />
        ))}
      </div>
      {!list.length && (
        <div className="empty">
          <Search />
          <h3>No initiatives match just yet.</h3>
          <p>Try a different skill or broaden your filters.</p>
          <button
            className="secondary"
            onClick={() => {
              setFilters({});
              setQuery("");
              setTab("For You");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      {state.needs.map((n) => (
        <article key={n.id} className="panel section-gap">
          <Badge tone="success">Verified need · partner-posted demo</Badge>
          <h2>{n.need}</h2>
          <p>{n.organisation}</p>
          <div className="two-columns">
            <div>
              <span className="label">DESIRED OUTCOME</span>
              <p>{n.outcome}</p>
            </div>
            <div>
              <span className="label">SUPPORT AVAILABLE</span>
              <p>{n.support}</p>
              <span className="label">PEOPLE NEEDED</span>
              <p>{n.roles}</p>
            </div>
          </div>
          <button
            className="primary"
            onClick={() => {
              update({ observation: n.need, createStep: 0 });
              go("/create");
            }}
          >
            Build an initiative around this need <ArrowRight size={15} />
          </button>
        </article>
      ))}
    </>
  );
}
export function Onboarding() {
  const { state, update, go } = useApp();
  const [step, setStep] = useState(0),
    [profile, setProfile] = useState<Profile>(state.profile);
  const toggle = (key: "causes" | "skills" | "contributions", value: string) =>
    setProfile({
      ...profile,
      [key]: profile[key].includes(value)
        ? profile[key].filter((x) => x !== value)
        : [...profile[key], value],
    });
  const titles = [
    "What do you care about?",
    "What do you bring to the table?",
    "How would you like to contribute?",
    "Make it fit your life.",
    "Your Impact Profile",
  ];
  const options =
    step === 0
      ? causes
      : step === 1
        ? skills
        : [
            "On-ground volunteering",
            "Organising",
            "Teaching",
            "Creative work",
            "Research",
            "Outreach",
            "Leadership",
            "Technical work",
          ];
  const key = step === 0 ? "causes" : step === 1 ? "skills" : "contributions";
  return (
    <div className="onboarding">
      <div className="eyebrow">INTEREST & SKILLS MAPPING</div>
      <div className="onboard-progress">
        {titles.map((_, i) => (
          <span className={i <= step ? "complete" : ""} key={i} />
        ))}
      </div>
      <span className="muted">Step {step + 1} of 5</span>
      <h1>{titles[step]}</h1>
      <p>
        {step < 3
          ? "Choose everything that feels like you. There’s no perfect answer."
          : step === 3
            ? "Meaningful contribution should work with your schedule."
            : "A starting point for action, built around you."}
      </p>
      {step < 3 ? (
        <div className="option-grid">
          {options.map((o) => (
            <button
              aria-pressed={profile[key].includes(o)}
              className={profile[key].includes(o) ? "chosen" : ""}
              key={o}
              onClick={() => toggle(key, o)}
            >
              {o}
              <span>
                {profile[key].includes(o) ? (
                  <Check size={16} />
                ) : (
                  <Plus size={16} />
                )}
              </span>
            </button>
          ))}
        </div>
      ) : step === 3 ? (
        <div className="form-grid">
          {[
            [
              "hours",
              "Availability",
              ["1–2 hours/week", "3–5 hours/week", "5+ hours/week"],
            ],
            ["days", "Preferred days", ["Weekdays", "Weekends", "Flexible"]],
            ["mode", "Preferred mode", ["In-person", "Online", "Hybrid"]],
          ].map(([k, l, opts]) => (
            <label key={k as string}>
              {l as string}
              <select
                value={profile[k as "hours"]}
                onChange={(e) =>
                  setProfile({ ...profile, [k as string]: e.target.value })
                }
              >
                {(opts as string[]).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          ))}
          <label>
            Location
            <input
              value={profile.location}
              onChange={(e) =>
                setProfile({ ...profile, location: e.target.value })
              }
              required
            />
          </label>
        </div>
      ) : (
        <div className="panel">
          <div className="row">
            <div className="avatar large-avatar">AM</div>
            <h2>Aarav Mehta</h2>
          </div>
          <div className="summary-pair">
            <span>Top causes</span>
            <strong>{profile.causes.join(" · ")}</strong>
          </div>
          <div className="summary-pair">
            <span>Strongest skills</span>
            <strong>{profile.skills.join(" · ")}</strong>
          </div>
          <div className="summary-pair">
            <span>Contribution style</span>
            <strong>{profile.contributions.join(" · ")}</strong>
          </div>
          <div className="summary-pair">
            <span>Availability</span>
            <strong>
              {profile.days} · {profile.hours}
            </strong>
          </div>
          <div className="summary-pair">
            <span>Location & mode</span>
            <strong>
              {profile.location} · {profile.mode}
            </strong>
          </div>
        </div>
      )}
      <div className="form-actions">
        <button
          className="secondary"
          onClick={() => (step ? setStep(step - 1) : go("/feed"))}
        >
          {step ? "Back" : "Explore demo first"}
        </button>
        <button
          className="primary"
          disabled={
            (step < 3 && !profile[key].length) ||
            (step === 3 && !profile.location.trim())
          }
          onClick={() => {
            if (step === 4) {
              update({ profile, onboarded: true });
              go("/feed");
            } else setStep(step + 1);
          }}
        >
          {step === 4 ? "Find my next step" : "Continue"}
          <ArrowRight size={16} />
        </button>
      </div>
      <div className="onboard-note">
        Your interests guide recommendations. You always choose how to act.
      </div>
    </div>
  );
}
export function MyInitiatives() {
  const { state, go } = useApp();
  const section = (title: string, list: Initiative[], started = false) => (
    <section className="section-gap">
      <div className="section-heading">
        <h3>{title}</h3>
        <span className="muted">{list.length} initiatives</span>
      </div>
      {list.map((p) => (
        <article className="panel my-card" key={p.id}>
          <div className="my-cover">
            <Cover project={p} />
          </div>
          <div>
            <Badge>
              {p.id === "ripple" && state.verification === "verified"
                ? "Verified impact"
                : p.stage}
            </Badge>
            <h2>{p.title}</h2>
            <p>
              {started ? "Project Lead" : state.joined[p.id]} · {p.location}
            </p>
            <span className="small">
              <strong>Next action:</strong>{" "}
              {p.id === "ripple"
                ? "Review your project readiness"
                : "Prepare the week 5 learning session"}
            </span>
          </div>
          <div className="my-card-end">
            <span className="verified-text">
              {p.id === "ripple"
                ? state.verification === "verified"
                  ? "Impact verified"
                  : "74% ready · blockers remain"
                : "Executing · assessment upcoming"}
            </span>
            <button
              className="primary"
              onClick={() =>
                go(p.id === "ripple" ? "/workspace" : `/initiative/${p.id}`)
              }
            >
              {p.id === "ripple" ? "Open Workspace" : "View Initiative"}
              <ArrowRight size={15} />
            </button>
          </div>
        </article>
      ))}
    </section>
  );
  return (
    <>
      <Title
        eyebrow="YOUR IDEAS. YOUR CONTRIBUTIONS."
        title="My Initiatives"
        description="Keep your commitments clear and your next steps close."
        action={
          <button className="primary" onClick={() => go("/create")}>
            <Plus size={16} />
            Create initiative
          </button>
        }
      />
      {section("Initiatives I started", [initiatives[0]], true)}
      {section(
        "Initiatives I joined",
        initiatives.filter((p) => state.joined[p.id]),
      )}
    </>
  );
}
export function ProfilePage() {
  const { state, update, go, toast } = useApp();
  const [posting, setPosting] = useState(false);
  const close = useCallback(() => setPosting(false), []);
  const [form, setForm] = useState({
    initiative: "ripple",
    text: "Pilot day completed across 5 collection points.",
    role: "Outreach Volunteer",
    outcome: "87 kg of floral waste recorded at the processing partner.",
    photo: "",
  });
  const [photoError, setPhotoError] = useState("");
  const verified = state.verification === "verified";
  return (
    <>
      <Title
        eyebrow="MORE THAN INTENTION. A RECORD OF ACTION."
        title="Your Impact Profile"
        description="The causes you care about. The change you contribute to."
        action={
          <button className="secondary" onClick={() => go("/onboarding")}>
            Edit interests & skills <ArrowUpRight size={15} />
          </button>
        }
      />
      <section className="panel profile-hero">
        <div className="avatar profile-avatar">AM</div>
        <div>
          <h2>Aarav Mehta</h2>
          <p>
            <MapPin size={14} /> {state.profile.location} <span>·</span>{" "}
            {state.profile.days} <span>·</span> {state.profile.hours}
          </p>
          <div className="chips">
            {state.profile.causes.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
        <div className="profile-hero-skills">
          <span className="label">WHAT I BRING</span>
          <p>{state.profile.skills.join(" · ")}</p>
          <span className="small muted">
            {state.profile.mode} · {state.profile.contributions.join(", ")}
          </span>
        </div>
      </section>
      <div className="section-heading">
        <h2>Impact portfolio</h2>
        <span className="muted">Contribution over popularity.</span>
      </div>
      <div className="portfolio-stats">
        <div>
          <LayersIcon />
          <strong>2</strong>
          <span>Projects started</span>
        </div>
        <div>
          <Users />
          <strong>{4 + Number(!!state.joined.ripple)}</strong>
          <span>Projects joined</span>
        </div>
        <div>
          <ShieldCheck />
          <strong>{2 + Number(verified)}</strong>
          <span>Verified projects</span>
        </div>
        <div className="roles-stat">
          <span className="label">ROLES PERFORMED</span>
          <p>
            Project Lead
            <br />
            Outreach Volunteer
            <br />
            Workshop Facilitator
          </p>
        </div>
      </div>
      <div className="section-heading">
        <h2>Stories of action</h2>
        <button className="primary" onClick={() => setPosting(true)}>
          <Plus size={15} />
          Post impact update
        </button>
      </div>
      <div className="impact-posts">
        {state.updates.map((u) => {
          const p = initiatives.find((x) => x.id === u.initiative)!;
          return (
            <article className="panel impact-post" key={u.id}>
              <div className="post-meta">
                <span className="avatar">AM</span>
                <div>
                  <strong>Aarav Mehta</strong>
                  <small>{p.title} · Just now</small>
                </div>
                <Badge
                  tone={
                    u.initiative === "ripple" && verified
                      ? "success"
                      : "neutral"
                  }
                >
                  {u.initiative === "ripple" && verified
                    ? "Verified project"
                    : "Project update"}
                </Badge>
              </div>
              {u.photo ? (
                <div
                  className="uploaded-photo"
                  style={{ backgroundImage: `url("${u.photo}")` }}
                  role="img"
                  aria-label="Your impact update photo"
                />
              ) : (
                <Cover project={p} />
              )}
              <h3>{u.text}</h3>
              <p>{u.outcome}</p>
              <div className="post-outcome">
                <span>YOUR ROLE</span>
                <strong>{u.role}</strong>
              </div>
            </article>
          );
        })}
        <article className="panel impact-post">
          <div className="post-meta">
            <span className="avatar">AM</span>
            <div>
              <strong>Aarav Mehta</strong>
              <small>Project Ripple · Pilot day</small>
            </div>
            <Badge tone={verified ? "success" : "neutral"}>
              {verified ? "Verified outcome" : "Project update"}
            </Badge>
          </div>
          <Cover project={initiatives[0]} />
          <h3>Pilot day completed across 5 collection points.</h3>
          <p>
            A small team, a shared plan, and a better destination for
            yesterday’s flowers.
          </p>
          <div className="post-outcome">
            <div>
              <span>RECORDED OUTCOME</span>
              <strong>
                {verified
                  ? "87 kg diverted"
                  : "87 kg submitted for confirmation"}
              </strong>
            </div>
            <div>
              <span>YOUR ROLE</span>
              <strong>{state.joined.ripple || "Project Lead"}</strong>
            </div>
          </div>
          <div className={verified ? "verified-text" : "muted"}>
            <ShieldCheck size={15} />
            {verified
              ? "Verified by Circular Bengaluru · Processing partner"
              : `Partner verification ${state.verification === "unsubmitted" ? "not yet submitted" : state.verification}`}
          </div>
        </article>
        <article className="panel impact-post">
          <div className="post-meta">
            <span className="avatar">AM</span>
            <div>
              <strong>Aarav Mehta</strong>
              <small>Digital Skills Saturdays · Week 4</small>
            </div>
            <Badge tone="success">Partner confirmed activity</Badge>
          </div>
          <Cover project={initiatives[1]} />
          <h3>Week 4 completed. Confidence is growing.</h3>
          <p>
            Helped 18 learners practise safe browsing and create their first
            document. Final skills assessment is still ahead.
          </p>
          <div className="post-outcome">
            <div>
              <span>CONTRIBUTION</span>
              <strong>4 workshops facilitated</strong>
            </div>
            <div>
              <span>YOUR ROLE</span>
              <strong>Workshop Facilitator</strong>
            </div>
          </div>
          <span className="small muted">
            Session delivery confirmed by Stand N Stride. Final outcome not yet
            verified.
          </span>
        </article>
      </div>
      {posting && (
        <Modal title="Post an impact update" onClose={close}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              update({
                updates: [
                  { ...form, id: crypto.randomUUID() },
                  ...state.updates,
                ],
              });
              setPosting(false);
              toast("Your impact update is now in your portfolio.");
            }}
          >
            <label>
              Choose initiative
              <select
                value={form.initiative}
                onChange={(e) =>
                  setForm({ ...form, initiative: e.target.value })
                }
              >
                {initiatives
                  .filter((p) => p.id === "ripple" || state.joined[p.id])
                  .map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.title}
                    </option>
                  ))}
              </select>
            </label>
            <Badge
              tone={
                form.initiative === "ripple" && verified ? "success" : "neutral"
              }
            >
              {form.initiative === "ripple" && verified
                ? "Verified project"
                : "Project update"}
            </Badge>
            <label>
              Add a photo (optional)
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 1500000) {
                    setPhotoError(
                      "Choose an image smaller than 1.5 MB for local storage.",
                    );
                    return;
                  }
                  setPhotoError("");
                  const r = new FileReader();
                  r.onload = () =>
                    setForm({ ...form, photo: r.result as string });
                  r.readAsDataURL(f);
                }}
              />
            </label>
            {photoError && <p className="warning-text">{photoError}</p>}
            <label>
              What happened?
              <textarea
                required
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />
            </label>
            <label>
              Your role
              <input
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </label>
            <label>
              What was achieved?
              <input
                required
                value={form.outcome}
                onChange={(e) => setForm({ ...form, outcome: e.target.value })}
              />
            </label>
            <p className="small muted">
              Your update documents your contribution. Only the project partner
              verifies its outcome.
            </p>
            <button className="primary full">
              Post impact update <ArrowRight size={16} />
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
function LayersIcon() {
  return <BookOpen />;
}
