"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  Bookmark,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { Title, Badge, Progress } from "../ui";
import { rows, mutate, upload, discover } from "@/lib/supabase";
import { intelligence } from "@/lib/intelligence";
import type { Row } from "@/lib/database.types";
import {
  useSession,
  useLoad,
  LoadState,
  Empty,
  LinkButton,
  Action,
  EditAction,
  Pagination,
  Fields,
  ErrorBox,
  FileLink,
  type Values,
  type Field,
  formOptions,
  modes,
} from "./shared";
export function ProjectCard({
  project,
  roles = [],
}: {
  project: Row<"initiatives">;
  roles?: Row<"initiative_roles">[];
}) {
  const { profile, preferences } = useSession();
  const router = useRouter();
  const relevant = roles.filter((r) => r.initiative_id === project.id);
  const match =
    profile && preferences
      ? intelligence.match(profile, preferences, project, relevant)
      : null;
  const required = relevant.reduce((n, r) => n + r.positions_required, 0),
    filled = relevant.reduce((n, r) => n + r.positions_filled, 0);
  return (
    <article className="v1-project">
      <button
        className={`v1-cover ${project.cause === "environment" ? "flowers" : project.cause === "animals" ? "animals" : "education"}`}
        onClick={() => router.push(`/initiatives/${project.slug}`)}
        aria-label={`View ${project.title}`}
      >
        <span className="v1-cover-label">{project.cause}</span>
        <ArrowUpRight />
      </button>
      <div className="v1-project-body">
        <div className="v1-between">
          <Badge
            tone={
              ["VERIFIED", "COMPLETED"].includes(project.status)
                ? "success"
                : "neutral"
            }
          >
            {project.status.replaceAll("_", " ")}
          </Badge>
          {project.is_demo && <Badge tone="warning">Development example</Badge>}
        </div>
        <button
          className="v1-title-link"
          onClick={() => router.push(`/initiatives/${project.slug}`)}
        >
          <h3>{project.title}</h3>
        </button>
        <p className="v1-clamp">{project.summary || project.observation}</p>
        <div className="v1-meta">
          <span>
            <MapPin size={14} />
            {project.city}
          </span>
          <span>
            <Clock size={14} />
            {project.mode}
          </span>
        </div>
        {required > 0 && (
          <>
            <div className="v1-between">
              <small>Team taking shape</small>
              <small>
                {filled} / {required} roles filled
              </small>
            </div>
            <Progress value={(filled / required) * 100} />
          </>
        )}
        {match && (
          <details className="v1-match">
            <summary>{match.score}% match · Why this fits</summary>
            <ul>
              {match.reasons.length ? (
                match.reasons.map((r) => <li key={r}>{r}</li>)
              ) : (
                <li>Try updating your profile to find a closer fit.</li>
              )}
            </ul>
          </details>
        )}
        <div className="v1-between">
          <LinkButton href={`/initiatives/${project.slug}`} secondary>
            Explore initiative
          </LinkButton>
          <Action
            operation="save.toggle"
            payload={{ initiative_id: project.id }}
          >
            <Bookmark size={15} />
            <span className="sr-only">Save or unsave</span>
          </Action>
        </div>
      </div>
    </article>
  );
}
export function Post({ post }: { post: Row<"impact_posts"> }) {
  const { user } = useSession();
  const [comments, setComments] = useState(false);
  const q = useLoad(
    async () => ({
      author: (
        await rows("profiles", { eq: { id: post.author_id }, limit: 1 })
      )[0],
      comments: comments
        ? await rows("comments", { eq: { post_id: post.id } })
        : [],
      project: post.initiative_id
        ? (
            await rows("initiatives", {
              eq: { id: post.initiative_id },
              limit: 1,
            })
          )[0]
        : null,
    }),
    [post.id, comments],
  );
  return (
    <article className="v1-panel v1-post">
      <div className="v1-between">
        <a href={q.data?.author ? `/people/${q.data?.author.username}` : "#"}>
          <strong>{q.data?.author?.display_name ?? "Community member"}</strong>
        </a>
        <Badge>{post.kind}</Badge>
      </div>
      <small>
        {new Date(post.created_at).toLocaleDateString()}{" "}
        {post.role && `· ${post.role}`}
      </small>
      <p>{post.body}</p>
      {post.milestone && (
        <p>
          <strong>Milestone:</strong> {post.milestone}
        </p>
      )}
      {q.data?.project && (
        <a href={`/initiatives/${q.data?.project.slug}`}>
          {q.data?.project.title} →
        </a>
      )}
      {post.media_paths.map((path) => (
        <FileLink
          key={path}
          bucket="impact-post-media"
          path={path}
          label="View attached image"
        />
      ))}
      <div className="v1-actions">
        <button className="text-button" onClick={() => setComments(!comments)}>
          {comments ? "Hide comments" : "Comments"}
        </button>
        {user && (
          <EditAction
            label="Report"
            operation="report.create"
            initial={{ target_type: "post", target_id: post.id }}
            fields={reportFields}
          />
        )}
      </div>
      {comments && (
        <LoadState query={q}>
          {q.data?.comments.length === 0 && (
            <p>No comments yet. Add a thoughtful first response.</p>
          )}
          {q.data?.comments.map((c) => (
            <div className="v1-comment" key={c.id}>
              <p>{c.body}</p>
              {user?.id === c.author_id && (
                <Action
                  operation="comment.delete"
                  payload={{ id: c.id }}
                  confirm="Delete your comment?"
                >
                  Delete
                </Action>
              )}
            </div>
          ))}
          {user ? (
            <EditAction
              label="Add a comment"
              operation="comment.create"
              initial={{ post_id: post.id }}
              fields={[
                {
                  key: "body",
                  label: "Comment",
                  type: "textarea",
                  required: true,
                  max: 2000,
                },
              ]}
            />
          ) : (
            <LinkButton href="/login" secondary>
              Sign in to comment
            </LinkButton>
          )}
        </LoadState>
      )}
    </article>
  );
}
export const reportFields: Field[] = [
  {
    key: "reason",
    label: "Reason",
    type: "select",
    required: true,
    options: [
      "Spam",
      "Misleading",
      "Unsafe",
      "Harassment",
      "False impact claim",
      "Inappropriate content",
      "Other",
    ],
  },
  { key: "details", label: "Tell us more", type: "textarea", max: 2000 },
];
export function Discover({ home = false }: { home?: boolean }) {
  const { profile, preferences } = useSession();
  const [tab, setTab] = useState("Initiatives");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [cause, setCause] = useState("");
  const [mode, setMode] = useState("");
  const [status, setStatus] = useState("");
  const [city, setCity] = useState("");
  const [skill, setSkill] = useState("");
  const [beginner, setBeginner] = useState(false);
  const [availability, setAvailability] = useState(false);
  const q = useLoad(async () => {
    const projects = await discover({
      search_text: term,
      cause_filter: cause,
      mode_filter: mode,
      city_filter: city,
      stage_filter: status,
      skill_filter: skill,
      beginner_only: beginner,
      fits_hours: availability,
      recommended: home,
      page_number: page,
    });
    const roles = projects.length
      ? await rows("initiative_roles", {
          in: { initiative_id: projects.map((i) => i.id) },
          order: "title",
          limit: 1000,
        })
      : [];
    return {
      projects,
      roles,
      posts:
        home || tab === "Updates" ? await rows("impact_posts", { page }) : [],
      organisations:
        tab === "Organisations"
          ? await rows("organisations", {
              page,
              search: { column: "name", value: term },
            })
          : [],
      needs:
        home || tab === "Verified needs"
          ? await rows("organisation_needs", {
              page,
              search: { column: "title", value: term },
            })
          : [],
      causes: await rows("causes", { order: "name", limit: 100 }),
      skills: await rows("skills", { order: "name", limit: 100 }),
    };
  }, [
    page,
    term,
    cause,
    mode,
    status,
    city,
    tab,
    home,
    skill,
    beginner,
    availability,
  ]);
  let projects = q.data?.projects ?? [];
  if (skill || beginner || availability)
    projects = projects.filter((i) =>
      q.data?.roles.some(
        (r) =>
          r.initiative_id === i.id &&
          r.positions_filled < r.positions_required &&
          (!skill || r.skills.includes(skill)) &&
          (!beginner || r.experience_level === "Beginner") &&
          (!availability ||
            !preferences ||
            r.commitment_hours <= preferences.hours),
      ),
    );
  if (home && profile && preferences)
    projects = [...projects].sort(
      (a, b) =>
        intelligence.match(profile, preferences, b, q.data?.roles ?? []).score -
        intelligence.match(profile, preferences, a, q.data?.roles ?? []).score,
    );
  const tabs = home
    ? ["Initiatives", "Updates", "Verified needs"]
    : ["Initiatives", "Organisations", "Verified needs", "Open roles"];
  return (
    <>
      <Title
        eyebrow={home ? "YOUR NEXT CHAPTER" : "FIND YOUR PLACE"}
        title={
          home
            ? `Small actions. Real change.${profile ? ` Hi, ${profile.display_name.split(" ")[0]}.` : ""}`
            : "Something meaningful starts here."
        }
        description={
          home
            ? "A little time. A skill you already have. A community that needs you."
            : "Explore community-led initiatives and find a role that fits your life."
        }
        action={<LinkButton href="/create">Start something</LinkButton>}
      />
      {home && (
        <div className="v1-home-banner">
          <div>
            <span className="eyebrow">CARE IS A STARTING POINT.</span>
            <h2>Give it somewhere to go.</h2>
            <p>
              Find your people, build a plan, and turn a shared intention into
              measurable change.
            </p>
            <LinkButton href="/discover" secondary>
              Find your next contribution
            </LinkButton>
          </div>
          <div className="v1-banner-symbol">
            a<span>→</span>
          </div>
        </div>
      )}
      <div className="tabs">
        {tabs.map((t) => (
          <button
            className={t === tab ? "active" : ""}
            key={t}
            onClick={() => {
              setTab(t);
              setPage(0);
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {!home && (
        <form
          className="v1-filters"
          onSubmit={(e) => {
            e.preventDefault();
            setTerm(search);
            setPage(0);
          }}
        >
          <input
            aria-label="Search"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            aria-label="Cause"
            value={cause}
            onChange={(e) => {
              setCause(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All causes</option>
            {q.data?.causes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Mode"
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Any mode</option>
            {modes.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <select
            aria-label="Stage"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Any stage</option>
            {["BUILDING", "READY", "EXECUTING", "VERIFIED", "COMPLETED"].map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </select>
          <input
            aria-label="City"
            placeholder="City"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(0);
            }}
          />
          <select
            aria-label="Skill"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          >
            <option value="">Any skill</option>
            {q.data?.skills.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <label>
            <input
              type="checkbox"
              checked={beginner}
              onChange={(e) => setBeginner(e.target.checked)}
            />{" "}
            Beginner friendly
          </label>
          <label>
            <input
              type="checkbox"
              checked={availability}
              onChange={(e) => setAvailability(e.target.checked)}
            />{" "}
            Fits my hours
          </label>
          <button className="button primary">Search</button>
        </form>
      )}
      <LoadState query={q}>
        {tab === "Initiatives" && (
          <div className="v1-grid">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} roles={q.data?.roles} />
            ))}
          </div>
        )}
        {tab === "Initiatives" && !projects.length && (
          <Empty title="Room for the first spark">
            No initiatives match these filters yet. Create one or explore
            another cause.
          </Empty>
        )}
        {tab === "Updates" && (
          <>
            {q.data?.posts.map((p) => (
              <Post key={p.id} post={p} />
            ))}
            {!q.data?.posts.length && (
              <Empty>Updates from real teams will appear here.</Empty>
            )}
          </>
        )}
        {tab === "Organisations" && (
          <div className="v1-grid">
            {q.data?.organisations.map((o) => (
              <div className="v1-panel" key={o.id}>
                <Badge
                  tone={
                    o.verification_status === "Verified" ? "success" : "neutral"
                  }
                >
                  {o.verification_status}
                </Badge>
                <h3>{o.name}</h3>
                <p>{o.description}</p>
                <small>
                  {o.city} · {o.organisation_type}
                </small>
                <LinkButton href={`/organisations/${o.slug}`} secondary>
                  View organisation
                </LinkButton>
              </div>
            ))}
          </div>
        )}
        {tab === "Verified needs" && (
          <>
            {q.data?.needs.map((n) => (
              <div className="v1-panel" key={n.id}>
                <Badge tone="success">Verified organisation need</Badge>
                <h3>{n.title}</h3>
                <p>{n.description}</p>
                <p>
                  <strong>Desired outcome:</strong> {n.outcome}
                </p>
                <small>
                  {n.city} · {n.timeframe}
                </small>
                <LinkButton href={`/create?need=${n.id}`} secondary>
                  Build an initiative around this need
                </LinkButton>
              </div>
            ))}
            {!q.data?.needs.length && (
              <Empty>
                Verified organisations can share the needs they see in their
                communities.
              </Empty>
            )}
          </>
        )}
        {tab === "Open roles" &&
          q.data?.roles
            .filter(
              (r) =>
                r.positions_required > r.positions_filled &&
                (!skill || r.skills.includes(skill)),
            )
            .map((r) => (
              <div className="v1-panel" key={r.id}>
                <Badge>
                  {r.approval_required ? "Application required" : "Open join"}
                </Badge>
                <h3>{r.title}</h3>
                <p>{r.description}</p>
                <p>
                  {r.positions_required - r.positions_filled} places ·{" "}
                  {r.commitment_hours} h/week · {r.mode}
                </p>
                <LinkButton
                  href={`/initiatives/${q.data?.projects.find((p) => p.id === r.initiative_id)?.slug}`}
                  secondary
                >
                  Explore role
                </LinkButton>
              </div>
            ))}
        <Pagination
          page={page}
          setPage={setPage}
          count={
            tab === "Organisations"
              ? (q.data?.organisations.length ?? 0)
              : tab === "Verified needs"
                ? (q.data?.needs.length ?? 0)
                : tab === "Updates"
                  ? (q.data?.posts.length ?? 0)
                  : (q.data?.projects.length ?? 0)
          }
        />
      </LoadState>
    </>
  );
}
export function MyInitiatives() {
  const { user } = useSession();
  const [tab, setTab] = useState("Leading");
  const q = useLoad(async () => {
    const memberships = await rows("initiative_members", {
      eq: { user_id: user!.id },
      order: "joined_at",
      limit: 200,
    });
    const saved = await rows("saved_initiatives", {
      eq: { user_id: user!.id },
      limit: 200,
    });
    const applications = await rows("role_applications", {
      eq: { user_id: user!.id },
      limit: 100,
    });
    const leading = await rows("initiatives", {
      eq: { creator_id: user!.id },
      limit: 100,
    });
    const ids = [
      ...new Set([
        ...memberships.map((m) => m.initiative_id),
        ...saved.map((s) => s.initiative_id),
        ...applications.map((a) => a.initiative_id),
      ]),
    ];
    const other = ids.length
      ? await rows("initiatives", { in: { id: ids }, limit: 200 })
      : [];
    return { memberships, saved, applications, leading, other };
  }, [user?.id]);
  const projects =
    tab === "Leading"
      ? q.data?.leading
      : q.data?.other.filter((i) =>
          tab === "Saved"
            ? q.data?.saved.some((s) => s.initiative_id === i.id)
            : q.data?.memberships.some(
                (m) => m.initiative_id === i.id && m.status === "active",
              ),
        );
  return (
    <>
      <Title
        title="Your intention, in motion."
        eyebrow="MY INITIATIVES"
        description="Projects you lead, contributions you make, and possibilities you’re keeping close."
        action={<LinkButton href="/create">Create initiative</LinkButton>}
      />
      <div className="tabs">
        {["Leading", "Contributing", "Applications", "Saved"].map((t) => (
          <button
            key={t}
            className={t === tab ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <LoadState query={q}>
        {tab === "Applications" ? (
          <>
            {q.data?.applications.map((a) => (
              <div className="v1-panel" key={a.id}>
                <Badge>{a.status}</Badge>
                <h3>
                  {q.data?.other.find((i) => i.id === a.initiative_id)?.title ??
                    "Initiative"}
                </h3>
                <p>{a.motivation}</p>
                <p>{a.review_notes}</p>
              </div>
            ))}
            {!q.data?.applications.length && (
              <Empty>No role applications yet.</Empty>
            )}
          </>
        ) : (
          <>
            <div className="v1-grid">
              {projects?.map((i) => (
                <ProjectCard key={i.id} project={i} />
              ))}
            </div>
            {!projects?.length && (
              <Empty title="Your next step is out there">
                Explore initiatives or start with a need you’ve noticed.
              </Empty>
            )}
          </>
        )}
      </LoadState>
    </>
  );
}
export function Notifications() {
  const { user } = useSession();
  const q = useLoad(
    () => rows("notifications", { eq: { user_id: user!.id }, limit: 100 }),
    [user?.id],
  );
  return (
    <>
      <Title
        title="Your activity, together."
        eyebrow="NOTIFICATIONS"
        action={<Action operation="notification.read">Mark all as read</Action>}
      />
      <LoadState query={q}>
        {q.data?.map((n) => (
          <div className="v1-panel v1-between" key={n.id}>
            <div>
              <Badge>{n.read_at ? "Read" : "New"}</Badge>
              <h3>{n.type}</h3>
              <p>{n.body}</p>
              <a href={n.href}>Open →</a>
            </div>
            {!n.read_at && (
              <Action operation="notification.read" payload={{ id: n.id }}>
                Mark read
              </Action>
            )}
          </div>
        ))}
        {!q.data?.length && <Empty>You’re all caught up.</Empty>}
      </LoadState>
    </>
  );
}
export function Composer() {
  const { user, refresh } = useSession();
  const router = useRouter();
  const [values, setValues] = useState<Values>({ kind: "Project Update" });
  const [file, setFile] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const q = useLoad(async () => {
    const members = await rows("initiative_members", {
      eq: { user_id: user!.id, status: "active" },
      order: "joined_at",
      limit: 100,
    });
    return members.length
      ? rows("initiatives", {
          in: { id: members.map((m) => m.initiative_id) },
          limit: 100,
        })
      : [];
  }, [user?.id]);
  return (
    <>
      <Title
        title="Share the work behind the impact."
        eyebrow="CREATE AN UPDATE"
        description="Tell the story of a real contribution. Verified outcomes are awarded through the partner review flow."
      />
      <LoadState query={q}>
        <form
          className="v1-panel v1-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              const media_paths = file
                ? [await upload("impact-post-media", [user!.id], file)]
                : [];
              await mutate("post.create", { ...values, media_paths });
              refresh();
              router.push("/feed");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Unable to publish");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Fields
            values={values}
            setValues={setValues}
            fields={[
              {
                key: "initiative_id",
                label: "Related initiative",
                type: "select",
                required: true,
                options: q.data?.map((i) => ({ value: i.id, label: i.title })),
              },
              {
                key: "kind",
                label: "Update type",
                type: "select",
                required: true,
                options: [
                  "Project Update",
                  "Recruitment Update",
                  "Milestone Update",
                  "Execution Update",
                  "Impact Update",
                ],
              },
              {
                key: "body",
                label: "What happened?",
                type: "textarea",
                required: true,
                max: 5000,
              },
              { key: "role", label: "Your contribution or role" },
              { key: "milestone", label: "Milestone reached (optional)" },
            ]}
          />
          <label>
            Attach an image (up to 5 MB)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0])}
            />
          </label>
          {error && <ErrorBox error={error} />}
          <button className="button primary" disabled={busy}>
            {busy ? "Publishing…" : "Publish update"}
          </button>
        </form>
      </LoadState>
    </>
  );
}
