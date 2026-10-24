"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Title, Badge, Progress } from "../ui";
import { client, rows, mutate, upload } from "@/lib/supabase";
import { intelligence, type Observation } from "@/lib/intelligence";
import type { Row, Json } from "@/lib/database.types";
import {
  useSession,
  useLoad,
  LoadState,
  Empty,
  Fields,
  ErrorBox,
  Action,
  EditAction,
  LinkButton,
  FileLink,
  formOptions,
  modes,
  experience,
  type Field,
  type Values,
} from "./shared";
import { Post, reportFields } from "./Community";
export function Create() {
  const router = useRouter();
  const params = useSearchParams();
  const [kind, setKind] = useState(params.get("need") ? "initiative" : "");
  const [values, setValues] = useState<Values>({
    mode: "In-person",
    cause: "environment",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { refresh } = useSession();
  const q = useLoad(
    async () => ({
      causes: await rows("causes", { order: "name", limit: 100 }),
      need: params.get("need")
        ? (
            await rows("organisation_needs", {
              eq: { id: params.get("need")! },
              limit: 1,
            })
          )[0]
        : null,
    }),
    [params.get("need")],
  );
  if (!kind)
    return (
      <>
        <Title
          title="What will you set in motion?"
          eyebrow="CREATE"
          description="A need you noticed. A contribution worth sharing. A place for others to help."
        />
        <div className="v1-grid">
          {[
            {
              title: "Start an initiative",
              body: "Begin with an observation. Validate the need, build your team, and measure the outcome.",
              go: () => setKind("initiative"),
            },
            {
              title: "Share an impact update",
              body: "Share a real contribution, milestone, or moment from your initiative.",
              go: () => router.push("/create/update"),
            },
            {
              title: "Post an organisation need",
              body: "Help a verified organisation connect a real community need with people ready to help.",
              go: () => router.push("/partner"),
            },
          ].map((c, n) => (
            <button className="v1-panel v1-choice" key={c.title} onClick={c.go}>
              <span className="eyebrow">0{n + 1}</span>
              <h2>{c.title}</h2>
              <p>{c.body}</p>
              <span>Get started →</span>
            </button>
          ))}
        </div>
      </>
    );
  const fields: Field[] = [
    { key: "title", label: "Working title", required: true, max: 150 },
    {
      key: "cause",
      label: "Cause",
      type: "select",
      required: true,
      options: formOptions(q.data?.causes ?? []),
    },
    {
      key: "observation",
      label: "1. What have you observed?",
      type: "textarea",
      required: true,
      min: 10,
    },
    { key: "affected", label: "2. Who is affected?", required: true },
    { key: "city", label: "3. Which city?", required: true },
    {
      key: "frequency",
      label: "4. How often does this happen?",
      required: true,
    },
    {
      key: "existing",
      label: "5. What is already being done?",
      type: "textarea",
      required: true,
    },
    {
      key: "assumptions",
      label: "6. What are you assuming?",
      type: "textarea",
      required: true,
    },
    {
      key: "unknowns",
      label: "7. What do you still need to learn?",
      type: "textarea",
      required: true,
    },
    {
      key: "outcome",
      label: "8. What change do you hope to see?",
      type: "textarea",
      required: true,
    },
    {
      key: "works_with_minors",
      label: "9. Will this involve minors?",
      type: "checkbox",
    },
    {
      key: "mode",
      label: "How will the work happen?",
      type: "select",
      options: modes,
      required: true,
    },
  ];
  return (
    <>
      <Title
        title="Start with what you’ve noticed."
        eyebrow="OBSERVE → VALIDATE → BUILD"
        description="An observation is a starting point. A community partner will help you understand the real need."
      />
      <LoadState query={q}>
        {q.data?.need && (
          <div className="v1-panel">
            <Badge tone="success">Linked organisation need</Badge>
            <h3>{q.data.need.title}</h3>
            <p>{q.data.need.description}</p>
            <p>Desired outcome: {q.data.need.outcome}</p>
            <button
              className="button secondary"
              onClick={() =>
                setValues({
                  ...values,
                  title: q.data!.need!.title,
                  observation: q.data!.need!.description,
                  affected: q.data!.need!.affected,
                  city: q.data!.need!.city,
                  cause: q.data!.need!.cause ?? "community",
                  outcome: q.data!.need!.outcome,
                })
              }
            >
              Use as a starting point
            </button>
          </div>
        )}
        <form
          className="v1-panel v1-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              const context = Object.fromEntries(
                [
                  "affected",
                  "frequency",
                  "existing",
                  "assumptions",
                  "unknowns",
                  "outcome",
                ].map((k) => [k, values[k] ?? ""]),
              );
              const result = await mutate("initiative.create", {
                ...values,
                context,
                need_id: params.get("need"),
              });
              refresh();
              router.push(`/initiatives/${result.slug}/workspace`);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Unable to save draft");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Fields fields={fields} values={values} setValues={setValues} />
          {error && <ErrorBox error={error} />}
          <button disabled={busy} className="button primary">
            {busy ? "Saving…" : "Save draft & shape the problem"}
          </button>
          <small>Your draft is private until you publish it.</small>
        </form>
      </LoadState>
    </>
  );
}
type Ready = {
  score: number;
  ready: boolean;
  blockers: string[];
  parts: Record<string, number>;
};
export function Project({
  slug,
  workspace = false,
}: {
  slug: string;
  workspace?: boolean;
}) {
  const { user } = useSession();
  const [tab, setTab] = useState("Overview");
  const q = useLoad(async () => {
    const project = (await rows("initiatives", { eq: { slug }, limit: 1 }))[0];
    if (!project)
      throw new Error(
        "This initiative is private, unavailable, or does not exist.",
      );
    const eq = { initiative_id: project.id };
    const [
      roles,
      members,
      partners,
      metrics,
      decisions,
      posts,
      organisations,
      readiness,
      skills,
      sdgs,
    ] = await Promise.all([
      rows("initiative_roles", { eq, order: "title", limit: 200 }),
      rows("initiative_members", { eq, order: "joined_at", limit: 200 }),
      rows("initiative_partners", { eq, limit: 200 }),
      rows("initiative_metrics", { eq, limit: 200 }),
      rows("impact_verifications", { eq, order: "verified_at", limit: 100 }),
      rows("impact_posts", { eq }),
      rows("organisations", { limit: 200 }),
      client().rpc("actionos_readiness", { initiative_id: project.id }),
      rows("skills", { order: "name", limit: 100 }),
      rows("sdgs", { order: "id", ascending: true, limit: 17 }),
    ]);
    if (readiness.error) throw new Error(readiness.error.message);
    const ownOrgs = user
      ? await rows("organisation_members", {
          eq: { user_id: user.id, status: "active" },
          order: "organisation_id",
          limit: 100,
        })
      : [];
    const access =
      project.creator_id === user?.id ||
      members.some((m) => m.user_id === user?.id && m.status === "active") ||
      partners.some(
        (p) =>
          p.status === "Confirmed" &&
          ownOrgs.some((o) => o.organisation_id === p.organisation_id),
      );
    const profiles = members.length
      ? await rows("profiles", {
          in: { id: [...new Set(members.map((m) => m.user_id))] },
          limit: 200,
        })
      : [];
    const [
      tasks,
      permissions,
      resources,
      stakeholders,
      evidence,
      applications,
      validations,
      requests,
    ] = await Promise.all([
      access ? rows("initiative_tasks", { eq, limit: 200 }) : [],
      access
        ? rows("initiative_permissions", { eq, order: "name", limit: 100 })
        : [],
      access
        ? rows("initiative_resources", { eq, order: "name", limit: 100 })
        : [],
      access
        ? rows("initiative_stakeholders", { eq, order: "type", limit: 100 })
        : [],
      rows("initiative_evidence", { eq, limit: 100 }),
      access ? rows("role_applications", { eq, limit: 100 }) : [],
      access ? rows("initiative_validations", { eq, limit: 100 }) : [],
      access ? rows("impact_verification_requests", { eq, limit: 100 }) : [],
    ]);
    return {
      project,
      roles,
      members,
      partners,
      metrics,
      decisions,
      posts,
      organisations,
      ready: readiness.data as unknown as Ready,
      access,
      profiles,
      tasks,
      permissions,
      resources,
      stakeholders,
      evidence,
      applications,
      validations,
      requests,
      skills,
      sdgs,
    };
  }, [slug, user?.id]);
  return (
    <LoadState query={q}>
      {q.data && (
        <ProjectContent
          data={q.data}
          tab={tab}
          setTab={setTab}
          workspace={workspace}
        />
      )}
    </LoadState>
  );
}
type ProjectData = Parameters<typeof ProjectContent>[0]["data"];
// Explicit workspace data keeps every component tied to persisted records.
type Data = {
  project: Row<"initiatives">;
  roles: Row<"initiative_roles">[];
  members: Row<"initiative_members">[];
  partners: Row<"initiative_partners">[];
  metrics: Row<"initiative_metrics">[];
  decisions: Row<"impact_verifications">[];
  posts: Row<"impact_posts">[];
  organisations: Row<"organisations">[];
  ready: Ready;
  access: boolean;
  profiles: Row<"profiles">[];
  tasks: Row<"initiative_tasks">[];
  permissions: Row<"initiative_permissions">[];
  resources: Row<"initiative_resources">[];
  stakeholders: Row<"initiative_stakeholders">[];
  evidence: Row<"initiative_evidence">[];
  applications: Row<"role_applications">[];
  validations: Row<"initiative_validations">[];
  requests: Row<"impact_verification_requests">[];
  skills: Row<"skills">[];
  sdgs: Row<"sdgs">[];
};
function ProjectContent({
  data: d,
  tab,
  setTab,
  workspace,
}: {
  data: Data;
  tab: string;
  setTab: (t: string) => void;
  workspace: boolean;
}) {
  const { user, toast } = useSession();
  const i = d.project;
  const lead = i.creator_id === user?.id;
  const privateView = workspace && d.access;
  const editing =
    lead && ["DRAFT", "VALIDATING", "BUILDING", "PAUSED"].includes(i.status);
  const orgOptions = d.organisations.map((o) => ({
    value: o.id,
    label: `${o.name} · ${o.verification_status}`,
  }));
  const base = { initiative_id: i.id };
  const tabs = privateView
    ? [
        "Overview",
        "Team",
        "Partners",
        "Tasks",
        "Permissions",
        "Resources",
        "Evidence",
        "Impact",
        "Updates",
      ]
    : ["Overview", "Roles", "Partners", "Impact", "Updates"];
  const isFinal = ["VERIFYING", "VERIFIED", "COMPLETED", "CANCELLED"].includes(
    i.status,
  );
  if (workspace && !d.access)
    return (
      <Empty title="This workspace belongs to the team">
        Join an open role or become an accepted partner to access internal
        planning.
      </Empty>
    );
  return (
    <>
      <div className="v1-actions">
        <a href="/discover">← Discover</a>
        <Badge>{i.status}</Badge>
        <Badge>{i.visibility}</Badge>
        {i.is_demo && <Badge tone="warning">Development example</Badge>}
      </div>
      <Title
        eyebrow={`${i.cause.toUpperCase()} / ${i.city}`}
        title={i.title}
        description={i.summary || i.observation}
        action={
          <div className="v1-actions">
            {d.access && !workspace && (
              <LinkButton href={`/initiatives/${i.slug}/workspace`}>
                Open workspace
              </LinkButton>
            )}
            {workspace && (
              <LinkButton secondary href={`/initiatives/${i.slug}`}>
                Public view
              </LinkButton>
            )}
            <button
              className="button secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    `${location.origin}/initiatives/${i.slug}`,
                  );
                  toast("Link copied");
                } catch {
                  toast("Copy the address from your browser to share.");
                }
              }}
            >
              Share
            </button>
          </div>
        }
      />
      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Overview" && (
        <div className="v1-workspace-grid">
          <div>
            <section className="v1-panel">
              <h2>
                {i.is_need_validated ? "The validated need" : "The observation"}
              </h2>
              <p>{i.validated_problem || i.observation}</p>
              <Badge tone={i.is_need_validated ? "success" : "warning"}>
                {i.is_need_validated
                  ? "Human-validated"
                  : "Awaiting community validation"}
              </Badge>
              <h3>The change we’re working toward</h3>
              <p>{i.goal || "The lead is still shaping the goal."}</p>
              <p>
                <strong>Timeline:</strong> {i.timeline || "In planning"}
              </p>
              <p>
                <strong>Mode:</strong> {i.mode} · <strong>SDG:</strong>{" "}
                {d.sdgs.find((s) => s.id === i.sdg_primary_id)?.name ??
                  "Not selected"}
              </p>
              {editing && (
                <EditAction
                  label="Edit blueprint"
                  operation="initiative.update"
                  initial={{ ...i, initiative_id: i.id }}
                  fields={[
                    { key: "title", label: "Title", required: true, max: 150 },
                    {
                      key: "summary",
                      label: "Summary",
                      type: "textarea",
                      required: true,
                    },
                    {
                      key: "goal",
                      label: "Measurable goal",
                      type: "textarea",
                      required: true,
                    },
                    {
                      key: "timeline",
                      label: "Timeline and delivery plan",
                      type: "textarea",
                      required: true,
                    },
                    {
                      key: "sdg_primary_id",
                      label: "Primary SDG",
                      type: "select",
                      options: formOptions(d.sdgs),
                      required: true,
                    },
                    {
                      key: "urgent",
                      label: "Urgent recruitment",
                      type: "checkbox",
                    },
                  ]}
                />
              )}
            </section>
            {privateView && (
              <>
                <Structure project={i} editable={editing} />
                <section className="v1-panel">
                  <h2>Human validation</h2>
                  <p>
                    Ask an independent verified organisation to review the need
                    before publishing.
                  </p>
                  {editing && (
                    <EditAction
                      label="Request validation"
                      operation="validation.request"
                      initial={base}
                      fields={[
                        {
                          key: "organisation_id",
                          label: "Verified organisation",
                          type: "select",
                          required: true,
                          options: orgOptions.filter(
                            (o) =>
                              d.organisations.find((x) => x.id === o.value)
                                ?.verification_status === "Verified",
                          ),
                        },
                        {
                          key: "assumptions",
                          label: "Assumptions to check",
                          type: "textarea",
                          required: true,
                        },
                        {
                          key: "questions",
                          label: "Questions for the partner",
                          type: "textarea",
                          required: true,
                        },
                      ]}
                    />
                  )}{" "}
                  {d.validations.map((v) => (
                    <div className="v1-row" key={v.id}>
                      <Badge>{v.status}</Badge>
                      <strong>
                        {
                          d.organisations.find(
                            (o) => o.id === v.organisation_id,
                          )?.name
                        }
                      </strong>
                      <p>
                        {v.refined_problem || "Waiting for a partner response."}
                      </p>
                      <p>{v.inaccuracies}</p>
                      <p>{v.changes}</p>
                      {lead && v.status === "Responded" && (
                        <div className="v1-actions">
                          <Action
                            operation="validation.accept"
                            payload={{ id: v.id }}
                          >
                            Accept refined need
                          </Action>
                          <EditAction
                            label="Request revision"
                            operation="validation.revise"
                            initial={{ id: v.id }}
                            fields={[
                              {
                                key: "questions",
                                label: "What needs clarification?",
                                type: "textarea",
                                required: true,
                              },
                            ]}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              </>
            )}
          </div>
          <aside>
            <section className="v1-panel">
              <span className="eyebrow">READINESS TO ACT</span>
              <div className="v1-score">
                {d.ready.score}
                <small>/ 100</small>
              </div>
              <Progress value={d.ready.score} />
              <p>
                {d.ready.ready
                  ? "The requirements for execution are in place."
                  : "Good intentions need a solid foundation."}
              </p>
              {Object.entries(d.ready.parts).map(([name, value]) => (
                <div className="v1-between" key={name}>
                  <small>{name}</small>
                  <small>{value}%</small>
                </div>
              ))}
              <ul>
                {d.ready.blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              {lead && privateView && (
                <div className="v1-stack">
                  {editing && (
                    <EditAction
                      label={
                        i.visibility === "Private Draft"
                          ? "Publish initiative"
                          : "Update visibility"
                      }
                      operation="initiative.publish"
                      initial={{ ...base, visibility: "Public" }}
                      fields={[
                        {
                          key: "visibility",
                          label: "Visibility",
                          type: "select",
                          options: ["Public", "Unlisted"],
                          required: true,
                        },
                      ]}
                      description="Publishing requires an accepted human validation, a goal, a timeline, and a contributor role."
                    />
                  )}
                  {["BUILDING", "PAUSED"].includes(i.status) && (
                    <Action
                      operation="initiative.transition"
                      payload={{ ...base, status: "READY" }}
                    >
                      Mark ready
                    </Action>
                  )}
                  {i.status === "READY" && (
                    <Action
                      operation="initiative.transition"
                      payload={{ ...base, status: "EXECUTING" }}
                      confirm="Start execution? The database will check readiness again."
                    >
                      Start execution
                    </Action>
                  )}
                  {["BUILDING", "READY", "EXECUTING"].includes(i.status) && (
                    <Action
                      operation="initiative.transition"
                      payload={{ ...base, status: "PAUSED" }}
                    >
                      Pause project
                    </Action>
                  )}
                  {i.status === "PAUSED" && (
                    <Action
                      operation="initiative.transition"
                      payload={{ ...base, status: "BUILDING" }}
                    >
                      Resume planning
                    </Action>
                  )}
                  {i.status === "VERIFIED" && (
                    <Action
                      operation="initiative.transition"
                      payload={{ ...base, status: "COMPLETED" }}
                    >
                      Complete initiative
                    </Action>
                  )}
                  {!isFinal && (
                    <Action
                      operation="initiative.transition"
                      payload={{ ...base, status: "CANCELLED" }}
                      confirm="Cancel this initiative? This cannot be undone in the app."
                    >
                      Cancel initiative
                    </Action>
                  )}
                </div>
              )}
            </section>
            <section className="v1-panel">
              <h3>A contribution is a beginning.</h3>
              <p>
                Hours and attendance describe activity. An outcome describes
                what changed. Verification needs independent evidence.
              </p>
              <Action operation="save.toggle" payload={base}>
                Save / unsave initiative
              </Action>
              <EditAction
                label="Report initiative"
                operation="report.create"
                initial={{ target_type: "initiative", target_id: i.id }}
                fields={reportFields}
              />
            </section>
          </aside>
        </div>
      )}
      {(tab === "Team" || tab === "Roles") && (
        <>
          <Title
            title={
              privateView ? "Build the team." : "Find your part in the change."
            }
            description="Every position is a real place on the team. Restricted roles are reviewed by the project lead."
          />
          {editing && privateView && (
            <>
              <Staffing />
              <EditAction
                label="Add a role"
                operation="role.save"
                initial={{
                  ...base,
                  positions_required: 1,
                  minimum_required: 1,
                  commitment_hours: 3,
                  mode: i.mode,
                  schedule: "Weekends",
                  experience_level: "Beginner",
                }}
                fields={roleFields(d.skills)}
              />
            </>
          )}
          <div className="v1-grid">
            {d.roles.map((r) => (
              <div className="v1-panel" key={r.id}>
                <Badge>
                  {r.approval_required || i.works_with_minors
                    ? "Application required"
                    : "Open join"}
                </Badge>
                <h3>{r.title}</h3>
                <p>{r.description}</p>
                <p>{r.responsibilities}</p>
                <p>
                  {r.positions_filled} / {r.positions_required} filled · Minimum{" "}
                  {r.minimum_required}
                </p>
                <Progress
                  value={(r.positions_filled / r.positions_required) * 100}
                />
                <p>
                  {r.commitment_hours} h/week · {r.schedule} · {r.mode}
                </p>
                <small>
                  {r.skills.join(", ")} · {r.experience_level}
                </small>
                {r.reasoning && <p className="v1-note">{r.reasoning}</p>}
                {r.title !== "Project Lead" && editing && privateView && (
                  <EditAction
                    label="Edit role"
                    operation="role.save"
                    initial={{ ...r }}
                    fields={roleFields(d.skills)}
                  />
                )}{" "}
                {!lead &&
                  ["BUILDING", "READY"].includes(i.status) &&
                  r.positions_filled < r.positions_required &&
                  (d.members.some(
                    (m) =>
                      m.role_id === r.id &&
                      m.user_id === user?.id &&
                      m.status === "active",
                  ) ? (
                    <Badge tone="success">You’re on the team</Badge>
                  ) : !user ? (
                    <LinkButton href="/login" secondary>
                      Sign in to contribute
                    </LinkButton>
                  ) : r.approval_required || i.works_with_minors ? (
                    <EditAction
                      label="Apply for role"
                      operation="role.apply"
                      initial={{ role_id: r.id }}
                      fields={[
                        {
                          key: "motivation",
                          label: "Why would you like to join?",
                          type: "textarea",
                          required: true,
                          min: 10,
                        },
                        {
                          key: "experience",
                          label: "Relevant experience",
                          type: "textarea",
                          required: true,
                        },
                        {
                          key: "availability",
                          label: "Your availability",
                          required: true,
                        },
                      ]}
                    />
                  ) : (
                    <Action operation="role.join" payload={{ role_id: r.id }}>
                      Join this role
                    </Action>
                  ))}
              </div>
            ))}
          </div>
          {privateView && (
            <>
              <h2>Contributors</h2>
              {d.members
                .filter((m) => m.status === "active")
                .map((m) => (
                  <div className="v1-panel v1-between" key={m.id}>
                    <div>
                      <strong>
                        {d.profiles.find((p) => p.id === m.user_id)
                          ?.display_name ?? "Team member"}
                      </strong>
                      <p>{d.roles.find((r) => r.id === m.role_id)?.title}</p>
                    </div>
                    {lead && i.status === "EXECUTING" && (
                      <Action
                        operation="attendance.record"
                        payload={{ ...base, user_id: m.user_id }}
                      >
                        Record attendance today
                      </Action>
                    )}
                  </div>
                ))}
              {lead && (
                <>
                  <h2>Applications</h2>
                  {d.applications.map((a) => (
                    <div className="v1-panel" key={a.id}>
                      <Badge>{a.status}</Badge>
                      <h3>{d.roles.find((r) => r.id === a.role_id)?.title}</h3>
                      <p>{a.motivation}</p>
                      <p>
                        {a.experience} · {a.availability}
                      </p>
                      {a.status === "Pending" && (
                        <EditAction
                          label="Review application"
                          operation="application.review"
                          initial={{ id: a.id }}
                          fields={[
                            {
                              key: "status",
                              label: "Decision",
                              type: "select",
                              required: true,
                              options: [
                                "Approved",
                                "Rejected",
                                "Changes Requested",
                              ],
                            },
                            {
                              key: "notes",
                              label: "Feedback",
                              type: "textarea",
                              required: true,
                            },
                          ]}
                        />
                      )}
                    </div>
                  ))}
                  {!d.applications.length && (
                    <Empty>No applications to review.</Empty>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
      {tab === "Partners" && (
        <>
          <Title
            title="Built with the community."
            description="Partnerships count when the organisation accepts. Validation and outcome verification are separate responsibilities."
          />
          {lead && privateView && !isFinal && (
            <EditAction
              label="Request a partner"
              operation="partner.request"
              initial={{ ...base, required: true }}
              fields={[
                {
                  key: "organisation_id",
                  label: "Organisation",
                  type: "select",
                  options: orgOptions,
                  required: true,
                },
                {
                  key: "role",
                  label: "Partner role",
                  type: "select",
                  required: true,
                  options: [
                    "Need Validator",
                    "Community Partner",
                    "Venue Partner",
                    "Technical Partner",
                    "Implementation Partner",
                    "Verification Partner",
                    "Other",
                  ],
                },
                {
                  key: "required",
                  label: "Required before execution",
                  type: "checkbox",
                },
              ]}
            />
          )}
          <div className="v1-grid">
            {d.partners.map((p) => (
              <div className="v1-panel" key={p.id}>
                <Badge tone={p.status === "Confirmed" ? "success" : "neutral"}>
                  {p.status}
                </Badge>
                <h3>
                  {d.organisations.find((o) => o.id === p.organisation_id)
                    ?.name ?? "Organisation"}
                </h3>
                <p>
                  {p.role} · {p.required ? "Required" : "Optional"}
                </p>
              </div>
            ))}
          </div>
          {!d.partners.length && <Empty>No partnerships yet.</Empty>}
          {privateView && (
            <>
              <h2>Stakeholder requirements</h2>
              {lead && !isFinal && (
                <EditAction
                  label="Add stakeholder"
                  operation="stakeholder.save"
                  initial={{ ...base, required: true, status: "Missing" }}
                  fields={stakeholderFields}
                />
              )}{" "}
              {d.stakeholders.map((s) => (
                <div className="v1-panel" key={s.id}>
                  <Badge>{s.status}</Badge>
                  <h3>{s.type}</h3>
                  <p>{s.purpose}</p>
                  {lead && !isFinal && (
                    <EditAction
                      label="Update stakeholder"
                      operation="stakeholder.save"
                      initial={{ ...s }}
                      fields={stakeholderFields}
                    />
                  )}
                </div>
              ))}
            </>
          )}
        </>
      )}
      {tab === "Tasks" && (
        <>
          <Title title="Make the next step clear." />
          {lead && !isFinal && (
            <EditAction
              label="Add task"
              operation="task.save"
              initial={{ ...base, priority: "Normal", status: "To Do" }}
              fields={taskFields(d)}
            />
          )}
          <div className="v1-grid">
            {["To Do", "In Progress", "Done"].map((status) => (
              <div key={status}>
                <h3>{status}</h3>
                {d.tasks
                  .filter((t) => t.status === status)
                  .map((t) => (
                    <div className="v1-panel" key={t.id}>
                      <Badge>{t.priority}</Badge>
                      <h3>{t.title}</h3>
                      <p>{t.description}</p>
                      <p>
                        {d.profiles.find((p) => p.id === t.assigned_user)
                          ?.display_name ?? "Unassigned"}{" "}
                        · {t.due_date ?? "No due date"}
                      </p>
                      {!isFinal &&
                        (lead ? (
                          <EditAction
                            label="Edit task"
                            operation="task.save"
                            initial={{ ...t }}
                            fields={taskFields(d)}
                          />
                        ) : (
                          user?.id === t.assigned_user && (
                            <EditAction
                              label="Update status"
                              operation="task.status"
                              initial={{ id: t.id, status: t.status }}
                              fields={[
                                {
                                  key: "status",
                                  label: "Status",
                                  type: "select",
                                  options: ["To Do", "In Progress", "Done"],
                                  required: true,
                                },
                              ]}
                            />
                          )
                        ))}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </>
      )}
      {tab === "Permissions" && (
        <>
          <Title
            title="Permission before action."
            description="Record who approved what, and keep the reference. Required critical permissions block execution."
          />
          {lead && !isFinal && (
            <EditAction
              label="Add permission"
              operation="permission.save"
              initial={{
                ...base,
                required: true,
                critical: true,
                status: "Pending",
              }}
              fields={permissionFields}
            />
          )}{" "}
          {d.permissions.map((p) => (
            <div className="v1-panel" key={p.id}>
              <Badge tone={p.status === "Approved" ? "success" : "warning"}>
                {p.status}
              </Badge>
              <h3>{p.name}</h3>
              <p>{p.reference}</p>
              <p>{p.notes}</p>
              {lead && !isFinal && (
                <EditAction
                  label="Update permission"
                  operation="permission.save"
                  initial={{ ...p }}
                  fields={permissionFields}
                />
              )}
            </div>
          ))}
          {!d.permissions.length && (
            <Empty>
              No permissions have been recorded. Confirm your requirements with
              the partner.
            </Empty>
          )}
        </>
      )}
      {tab === "Resources" && (
        <>
          <Title
            title="Know what it takes."
            description="Track materials, venues, and other needs. Required quantities must be secured before execution."
          />
          {lead && !isFinal && (
            <EditAction
              label="Add resource"
              operation="resource.save"
              initial={{
                ...base,
                category: "Materials",
                required_quantity: 1,
                secured_quantity: 0,
                unit: "items",
              }}
              fields={resourceFields}
            />
          )}{" "}
          {d.resources.map((r) => (
            <div className="v1-panel" key={r.id}>
              <Badge>{r.category}</Badge>
              <h3>{r.name}</h3>
              <p>
                {r.secured_quantity} / {r.required_quantity} {r.unit} secured
              </p>
              <Progress
                value={(r.secured_quantity / r.required_quantity) * 100}
              />
              <p>{r.notes}</p>
              {lead && !isFinal && (
                <EditAction
                  label="Update resource"
                  operation="resource.save"
                  initial={{ ...r }}
                  fields={resourceFields}
                />
              )}
            </div>
          ))}
          {!d.resources.length && (
            <Empty>No resources have been recorded.</Empty>
          )}
        </>
      )}
      {tab === "Evidence" && (
        <>
          <Title
            title="Give the outcome something to stand on."
            description="Files stay private unless the lead explicitly shares them. Photos and attendance alone do not prove an outcome."
          />
          {!isFinal && (
            <EvidenceForm project={i} metrics={d.metrics} lead={lead} />
          )}{" "}
          {d.evidence.map((e) => (
            <div className="v1-panel" key={e.id}>
              <Badge>{e.type}</Badge>
              <Badge>{e.visibility}</Badge>
              <p>{e.caption}</p>
              <p>
                Metric:{" "}
                {d.metrics.find((m) => m.id === e.related_metric_id)?.name ??
                  "General documentation"}
              </p>
              <FileLink bucket="initiative-evidence" path={e.storage_path} />
            </div>
          ))}
          {!d.evidence.length && <Empty>No evidence uploaded yet.</Empty>}
        </>
      )}
      {tab === "Impact" && (
        <>
          <Title
            title="Measure the change, not just the effort."
            description="Define the outcome before execution. Record actual results, then request independent partner verification."
          />
          {editing && privateView && (
            <EditAction
              label="Define a metric"
              operation="metric.save"
              initial={{ ...base, metric_type: "Outcome", target_value: 1 }}
              fields={metricFields}
            />
          )}
          <div className="v1-grid">
            {d.metrics.map((m) => (
              <div className="v1-panel" key={m.id}>
                <Badge tone={m.status === "Verified" ? "success" : "neutral"}>
                  {m.status}
                </Badge>
                <Badge>{m.metric_type}</Badge>
                <h3>{m.name}</h3>
                <div className="v1-score">
                  {m.actual_value}
                  <small>
                    {" "}
                    / {m.target_value} {m.unit}
                  </small>
                </div>
                <p>{m.description}</p>
                <p>
                  <strong>Measurement:</strong> {m.measurement_method}
                </p>
                <p>
                  <strong>Verification source:</strong> {m.verification_source}
                </p>
                {editing && privateView && (
                  <EditAction
                    label="Edit metric"
                    operation="metric.save"
                    initial={{ ...m }}
                    fields={metricFields}
                  />
                )}{" "}
                {lead &&
                  privateView &&
                  i.status === "EXECUTING" &&
                  m.status !== "Verified" && (
                    <EditAction
                      label="Record actual result"
                      operation="metric.record"
                      initial={{ id: m.id, actual_value: m.actual_value }}
                      fields={[
                        {
                          key: "actual_value",
                          label: `Actual (${m.unit})`,
                          type: "number",
                          min: 0,
                          required: true,
                        },
                      ]}
                    />
                  )}{" "}
                {lead &&
                  privateView &&
                  ["EXECUTING", "VERIFYING"].includes(i.status) &&
                  m.metric_type === "Outcome" &&
                  m.status === "Recorded" && (
                    <EditAction
                      label="Request verification"
                      operation="verification.request"
                      initial={{ metric_id: m.id }}
                      fields={[
                        {
                          key: "organisation_id",
                          label: "Accepted verification partner",
                          type: "select",
                          required: true,
                          options: orgOptions.filter(
                            (o) =>
                              d.partners.some(
                                (p) =>
                                  p.organisation_id === o.value &&
                                  p.role === "Verification Partner" &&
                                  p.status === "Confirmed",
                              ) &&
                              d.organisations.find((x) => x.id === o.value)
                                ?.verification_status === "Verified",
                          ),
                        },
                        {
                          key: "summary",
                          label: "Explain the result and evidence",
                          type: "textarea",
                          required: true,
                        },
                      ]}
                      description="Attach substantive evidence to this metric first. The reported and target values are frozen in the request."
                    />
                  )}
              </div>
            ))}
          </div>
          {!d.metrics.length && (
            <Empty>
              Define an outcome metric before the team begins execution.
            </Empty>
          )}
          <h2>Partner decisions</h2>
          {d.decisions.map((v) => (
            <div className="v1-panel" key={v.id}>
              <Badge tone={v.decision === "Verified" ? "success" : "warning"}>
                {v.decision}
              </Badge>
              <h3>{d.metrics.find((m) => m.id === v.metric_id)?.name}</h3>
              <p>
                {d.organisations.find((o) => o.id === v.organisation_id)?.name}{" "}
                · {new Date(v.verified_at).toLocaleDateString()}
              </p>
              <p>Confirmed value: {v.confirmed_value ?? "Not confirmed"}</p>
              <p>{v.notes}</p>
            </div>
          ))}
          {!d.decisions.length && (
            <Empty title="No verified outcome yet">
              An independent verified partner must review the evidence.
            </Empty>
          )}
        </>
      )}
      {tab === "Updates" && (
        <>
          {d.access && (
            <LinkButton href="/create/update">Share an update</LinkButton>
          )}
          {d.posts.map((p) => (
            <Post key={p.id} post={p} />
          ))}
          {!d.posts.length && <Empty>No updates from the team yet.</Empty>}
        </>
      )}
    </>
  );
}
function Structure({
  project: i,
  editable,
}: {
  project: Row<"initiatives">;
  editable: boolean;
}) {
  const { refresh } = useSession();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const context = (i.context ?? {}) as Record<string, Json>;
  const structured = (i.structured ?? {}) as Record<string, Json>;
  const suggestions = intelligence.structure({
    observation: i.observation,
    city: i.city,
    cause: i.cause,
    affected: String(context.affected ?? ""),
    frequency: String(context.frequency ?? ""),
    existing: String(context.existing ?? ""),
    assumptions: String(context.assumptions ?? ""),
    unknowns: String(context.unknowns ?? ""),
    outcome: String(context.outcome ?? ""),
  });
  const [values, setValues] = useState<Values>(
    Object.fromEntries(
      ["known", "assumptions", "questions", "stakeholders"].map((k) => [
        k,
        Array.isArray(structured[k])
          ? (structured[k] as Json[]).join("\n")
          : suggestions[k as "known"].join("\n"),
      ]),
    ),
  );
  return (
    <section className="v1-panel">
      <Badge>ActionOS suggests</Badge>
      <h2>Shape the problem.</h2>
      <p>{suggestions.reasoning}</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await mutate("initiative.update", {
              initiative_id: i.id,
              structured: Object.fromEntries(
                Object.entries(values).map(([k, v]) => [
                  k,
                  String(v ?? "")
                    .split("\n")
                    .filter(Boolean),
                ]),
              ),
              sdg_primary_id: i.sdg_primary_id ?? suggestions.sdg,
            });
            refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Unable to save");
          } finally {
            setBusy(false);
          }
        }}
      >
        <fieldset disabled={!editable || busy}>
          <Fields
            fields={[
              {
                key: "known",
                label: "What is known (reported observations)",
                type: "textarea",
              },
              {
                key: "assumptions",
                label: "Assumptions to validate",
                type: "textarea",
              },
              { key: "questions", label: "Questions to ask", type: "textarea" },
              {
                key: "stakeholders",
                label: "People and organisations to involve",
                type: "textarea",
              },
            ]}
            values={values}
            setValues={setValues}
          />
          {editable && (
            <button className="button secondary">Save edited structure</button>
          )}
        </fieldset>
        {error && <ErrorBox error={error} />}
      </form>
    </section>
  );
}
function Staffing() {
  const [target, setTarget] = useState(30);
  const [capacity, setCapacity] = useState(5);
  const [sessions, setSessions] = useState(2);
  const result = intelligence.staffing(target, capacity, sessions);
  return (
    <details className="v1-panel">
      <summary>ActionOS suggests · Staffing calculator</summary>
      <div className="v1-filters">
        <label>
          Participants
          <input
            type="number"
            min="1"
            value={target}
            onChange={(e) => setTarget(Math.max(1, Number(e.target.value)))}
          />
        </label>
        <label>
          Per volunteer per session
          <input
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(Math.max(1, Number(e.target.value)))}
          />
        </label>
        <label>
          Sessions
          <input
            type="number"
            min="1"
            value={sessions}
            onChange={(e) => setSessions(Math.max(1, Number(e.target.value)))}
          />
        </label>
      </div>
      <p>{result.explanation}</p>
      <p>
        Use the estimate when adding a role. No positions are created
        automatically.
      </p>
    </details>
  );
}
function EvidenceForm({
  project,
  metrics,
  lead,
}: {
  project: Row<"initiatives">;
  metrics: Row<"initiative_metrics">[];
  lead: boolean;
}) {
  const { user, refresh } = useSession();
  const [values, setValues] = useState<Values>({
    type: "Document",
    visibility: "Private",
  });
  const [file, setFile] = useState<File>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="v1-panel v1-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          if (!file) throw new Error("Choose an evidence file.");
          const storage_path = await upload(
            "initiative-evidence",
            [project.id, user!.id],
            file,
          );
          await mutate("evidence.create", {
            ...values,
            storage_path,
            initiative_id: project.id,
          });
          refresh();
          setFile(undefined);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Unable to upload");
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
            key: "type",
            label: "Evidence type",
            type: "select",
            required: true,
            options: [
              "Photo",
              "Attendance",
              "Receipt",
              "Survey",
              "Metric Record",
              "Partner Confirmation",
              "Document",
            ],
          },
          {
            key: "related_metric_id",
            label: "Related metric",
            type: "select",
            options: metrics.map((m) => ({ value: m.id, label: m.name })),
          },
          {
            key: "caption",
            label: "What does this evidence show?",
            type: "textarea",
            required: true,
          },
          ...(lead
            ? [
                {
                  key: "visibility",
                  label: "Visibility",
                  type: "select" as const,
                  options: ["Private", "Public"],
                  required: true,
                },
              ]
            : []),
        ]}
      />
      <label>
        Evidence file (JPG, PNG, WebP, PDF, CSV · 10 MB)
        <input
          required
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf,text/csv"
          onChange={(e) => setFile(e.target.files?.[0])}
        />
      </label>
      {error && <ErrorBox error={error} />}
      <button disabled={busy} className="button primary">
        {busy ? "Uploading…" : "Upload evidence"}
      </button>
    </form>
  );
}
const roleFields = (skills: Row<"skills">[]): Field[] => [
  { key: "title", label: "Role title", required: true },
  {
    key: "description",
    label: "What this role is for",
    type: "textarea",
    required: true,
  },
  {
    key: "responsibilities",
    label: "Responsibilities",
    type: "textarea",
    required: true,
  },
  {
    key: "skills",
    label: "Required skills",
    type: "multi",
    options: formOptions(skills),
  },
  {
    key: "positions_required",
    label: "Total positions",
    type: "number",
    min: 1,
    max: 10000,
    required: true,
  },
  {
    key: "minimum_required",
    label: "Minimum for execution",
    type: "number",
    min: 0,
    required: true,
  },
  {
    key: "commitment_hours",
    label: "Hours per week",
    type: "number",
    min: 1,
    max: 40,
    required: true,
  },
  {
    key: "schedule",
    label: "Schedule",
    type: "select",
    options: ["Weekdays", "Weekends", "Flexible"],
    required: true,
  },
  {
    key: "mode",
    label: "Mode",
    type: "select",
    options: modes,
    required: true,
  },
  {
    key: "experience_level",
    label: "Experience",
    type: "select",
    options: experience,
    required: true,
  },
  {
    key: "approval_required",
    label: "Require application approval",
    type: "checkbox",
  },
  { key: "critical", label: "Critical role", type: "checkbox" },
  { key: "reasoning", label: "Why this many positions?", type: "textarea" },
];
const stakeholderFields: Field[] = [
  { key: "type", label: "Stakeholder", required: true },
  {
    key: "purpose",
    label: "Why they are needed",
    type: "textarea",
    required: true,
  },
  { key: "required", label: "Required", type: "checkbox" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["Missing", "Requested", "Confirmed", "Rejected", "Not Required"],
    required: true,
  },
];
const taskFields = (d: Data): Field[] => [
  { key: "title", label: "Task", required: true },
  { key: "description", label: "Details", type: "textarea" },
  {
    key: "assigned_user",
    label: "Assign to",
    type: "select",
    options: d.profiles.map((p) => ({ value: p.id, label: p.display_name })),
  },
  { key: "due_date", label: "Due date", type: "date" },
  {
    key: "priority",
    label: "Priority",
    type: "select",
    options: ["Low", "Normal", "High"],
    required: true,
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["To Do", "In Progress", "Done"],
    required: true,
  },
];
const permissionFields: Field[] = [
  { key: "name", label: "Permission", required: true },
  { key: "required", label: "Required", type: "checkbox" },
  { key: "critical", label: "Critical blocker", type: "checkbox" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["Pending", "Approved", "Rejected", "Not Required"],
    required: true,
  },
  { key: "reference", label: "Approving authority / reference" },
  { key: "notes", label: "Notes", type: "textarea" },
];
const resourceFields: Field[] = [
  { key: "name", label: "Resource", required: true },
  {
    key: "category",
    label: "Category",
    type: "select",
    options: ["Materials", "Venue", "Equipment", "Transport", "Other"],
    required: true,
  },
  {
    key: "required_quantity",
    label: "Required quantity",
    type: "number",
    min: 1,
    required: true,
  },
  {
    key: "secured_quantity",
    label: "Secured quantity",
    type: "number",
    min: 0,
    required: true,
  },
  { key: "unit", label: "Unit", required: true },
  { key: "notes", label: "Notes", type: "textarea" },
];
const metricFields: Field[] = [
  { key: "name", label: "Metric name", required: true },
  {
    key: "description",
    label: "What change does this measure?",
    type: "textarea",
    required: true,
  },
  {
    key: "metric_type",
    label: "Type",
    type: "select",
    options: ["Activity", "Outcome"],
    required: true,
  },
  { key: "unit", label: "Unit", required: true },
  {
    key: "target_value",
    label: "Target",
    type: "number",
    min: 1,
    required: true,
  },
  { key: "baseline", label: "Baseline (if known)", type: "number", min: 0 },
  {
    key: "measurement_method",
    label: "How will you measure this?",
    type: "textarea",
    required: true,
  },
  {
    key: "verification_source",
    label: "How can a partner verify it?",
    type: "textarea",
    required: true,
  },
];
