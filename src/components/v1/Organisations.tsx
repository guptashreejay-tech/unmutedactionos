"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Title, Badge } from "../ui";
import { rows, mutate, upload } from "@/lib/supabase";
import {
  useSession,
  useLoad,
  LoadState,
  Empty,
  LinkButton,
  Action,
  EditAction,
  FileLink,
  Fields,
  ErrorBox,
  formOptions,
  type Values,
  type Field,
} from "./shared";
import type { Row } from "@/lib/database.types";
import { reportFields, Post } from "./Community";
export function Partner() {
  const { user } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState("Organisations");
  const q = useLoad(async () => {
    const membership = await rows("organisation_members", {
      eq: { user_id: user!.id },
      order: "organisation_id",
      limit: 100,
    });
    const ids = membership.map((m) => m.organisation_id);
    if (!ids.length)
      return {
        organisations: [],
        membership,
        partners: [],
        validations: [],
        requests: [],
        needs: [],
      };
    const filter = { in: { organisation_id: ids }, limit: 100 };
    const [organisations, partners, validations, requests, needs] =
      await Promise.all([
        rows("organisations", { in: { id: ids }, limit: 100 }),
        rows("initiative_partners", filter),
        rows("initiative_validations", filter),
        rows("impact_verification_requests", filter),
        rows("organisation_needs", filter),
      ]);
    return {
      organisations,
      membership,
      partners,
      validations,
      requests,
      needs,
    };
  }, [user?.id]);
  const orgName = (id: string) =>
    q.data?.organisations.find((o) => o.id === id)?.name ?? "Organisation";
  return (
    <>
      <Title
        title="Local knowledge. Lasting change."
        eyebrow="PARTNER PORTAL"
        description="Connect community needs with people who care, and bring an independent perspective to their outcomes."
        action={
          <EditAction
            label="Create organisation"
            operation="organisation.create"
            fields={orgFields}
            onDone={() => router.push("/partner")}
          />
        }
      />
      <div className="tabs">
        {[
          "Organisations",
          "Partnerships",
          "Need validation",
          "Outcome reviews",
          "Posted needs",
        ].map((t) => (
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
        {q.data?.membership
          .filter((m) => m.status === "invited")
          .map((m) => (
            <div className="v1-panel" key={m.organisation_id}>
              <Badge>Invitation</Badge>
              <h3>{orgName(m.organisation_id)}</h3>
              <p>
                You have been invited as a {m.role}. Accept to join this
                organisation.
              </p>
              <div className="v1-actions">
                <Action
                  operation="organisation.member.accept"
                  payload={{ organisation_id: m.organisation_id }}
                >
                  Accept invitation
                </Action>
                <Action
                  operation="organisation.member.decline"
                  payload={{ organisation_id: m.organisation_id }}
                >
                  Decline
                </Action>
              </div>
            </div>
          ))}
        {!q.data?.organisations.length && (
          <Empty title="Bring your organisation into the work">
            Create an organisation profile to start. An administrator reviews
            verification requests.
          </Empty>
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
                <LinkButton href={`/organisations/${o.slug}`} secondary>
                  Manage organisation
                </LinkButton>
              </div>
            ))}
          </div>
        )}
        {tab === "Partnerships" && (
          <>
            {q.data?.partners.map((p) => (
              <div className="v1-panel" key={p.id}>
                <Badge>{p.status}</Badge>
                <h3>
                  {orgName(p.organisation_id)} · {p.role}
                </h3>
                <p>
                  {p.required ? "Required partnership" : "Optional partnership"}
                </p>
                {q.data?.membership.some(
                  (m) =>
                    m.organisation_id === p.organisation_id &&
                    ["owner", "manager"].includes(m.role),
                ) &&
                  p.status === "Requested" && (
                    <div className="v1-actions">
                      <Action
                        operation="partner.respond"
                        payload={{ id: p.id, status: "Confirmed" }}
                      >
                        Accept partnership
                      </Action>
                      <Action
                        operation="partner.respond"
                        payload={{ id: p.id, status: "Rejected" }}
                      >
                        Decline
                      </Action>
                    </div>
                  )}
                {p.status === "Confirmed" && (
                  <ProjectReference id={p.initiative_id} />
                )}
              </div>
            ))}
            {!q.data?.partners.length && (
              <Empty>No partnership requests.</Empty>
            )}
          </>
        )}
        {tab === "Need validation" && (
          <>
            {q.data?.validations.map((v) => (
              <div className="v1-panel" key={v.id}>
                <Badge>{v.status}</Badge>
                <h3>{orgName(v.organisation_id)}</h3>
                <h4>Reported observation</h4>
                <p>{v.observation}</p>
                <h4>Assumptions</h4>
                <p>{v.assumptions}</p>
                <h4>Questions from the lead</h4>
                <p>{v.questions}</p>
                {v.refined_problem && (
                  <p>
                    <strong>Refined problem:</strong> {v.refined_problem}
                  </p>
                )}
                {["Pending", "Needs Revision"].includes(v.status) && (
                  <EditAction
                    label="Review the need"
                    operation="validation.respond"
                    initial={{ id: v.id }}
                    fields={[
                      {
                        key: "verdict",
                        label: "Is this a real community need?",
                        type: "select",
                        options: ["Yes", "Partially", "No"],
                        required: true,
                      },
                      {
                        key: "inaccuracies",
                        label: "What is inaccurate or missing?",
                        type: "textarea",
                        required: true,
                      },
                      {
                        key: "changes",
                        label: "What should change in the approach?",
                        type: "textarea",
                        required: true,
                      },
                      {
                        key: "refined_problem",
                        label: "Refined problem statement",
                        type: "textarea",
                        required: true,
                        min: 10,
                      },
                      {
                        key: "support",
                        label: "We may be able to support this initiative",
                        type: "checkbox",
                      },
                    ]}
                    description="Use your organisation’s knowledge of the community. The project lead will review your response."
                  />
                )}
              </div>
            ))}
            {!q.data?.validations.length && (
              <Empty>No needs awaiting validation.</Empty>
            )}
          </>
        )}
        {tab === "Outcome reviews" && (
          <>
            {q.data?.requests.map((r) => (
              <div className="v1-panel" key={r.id}>
                <Badge>{r.status}</Badge>
                <h3>{orgName(r.organisation_id)}</h3>
                <p>
                  <strong>Frozen target:</strong> {r.target_snapshot} ·{" "}
                  <strong>Reported actual:</strong> {r.actual_snapshot}
                </p>
                <p>{r.summary}</p>
                <ProjectReference id={r.initiative_id} />
                <ReviewEvidence
                  initiative={r.initiative_id}
                  metric={r.metric_id}
                />
                {r.status === "Pending" && (
                  <EditAction
                    label="Record independent decision"
                    operation="verification.decide"
                    initial={{ id: r.id }}
                    fields={[
                      {
                        key: "decision",
                        label: "Decision",
                        type: "select",
                        options: [
                          "Verified",
                          "Partially Verified",
                          "Clarification Requested",
                          "Unable to Verify",
                        ],
                        required: true,
                      },
                      {
                        key: "confirmed_value",
                        label:
                          "Confirmed value (required for partial verification)",
                        type: "number",
                        min: 0,
                        max: r.actual_snapshot,
                      },
                      {
                        key: "notes",
                        label: "Decision and supporting explanation",
                        type: "textarea",
                        required: true,
                        min: 5,
                      },
                    ]}
                    description="This decision becomes an immutable record. You cannot verify a project you participate in."
                  />
                )}
              </div>
            ))}
            {!q.data?.requests.length && (
              <Empty>No outcomes awaiting review.</Empty>
            )}
          </>
        )}
        {tab === "Posted needs" &&
          q.data?.needs.map((n) => (
            <div className="v1-panel" key={n.id}>
              <Badge tone="success">Verified organisation need</Badge>
              <h3>{n.title}</h3>
              <p>{n.description}</p>
              <p>{n.outcome}</p>
            </div>
          ))}
      </LoadState>
    </>
  );
}
function ProjectReference({ id }: { id: string }) {
  const q = useLoad(() => rows("initiatives", { eq: { id }, limit: 1 }), [id]);
  return q.data?.[0] ? (
    <LinkButton href={`/initiatives/${q.data[0].slug}/workspace`} secondary>
      Review workspace
    </LinkButton>
  ) : (
    <p className="v1-note">
      The workspace becomes available after partnership acceptance.
    </p>
  );
}
function ReviewEvidence({
  initiative,
  metric,
}: {
  initiative: string;
  metric: string;
}) {
  const q = useLoad(
    () =>
      rows("initiative_evidence", {
        eq: { initiative_id: initiative, related_metric_id: metric },
        limit: 100,
      }),
    [initiative, metric],
  );
  return (
    <LoadState query={q}>
      {q.data?.map((e) => (
        <div className="v1-row" key={e.id}>
          <Badge>{e.type}</Badge>
          <p>{e.caption}</p>
          <FileLink bucket="initiative-evidence" path={e.storage_path} />
        </div>
      ))}
    </LoadState>
  );
}
const orgFields: Field[] = [
  { key: "name", label: "Organisation name", required: true, max: 150 },
  {
    key: "organisation_type",
    label: "Type",
    type: "select",
    required: true,
    options: [
      "NGO",
      "Community group",
      "School or college",
      "Local business",
      "Public institution",
      "Other",
    ],
  },
  { key: "city", label: "City", required: true },
  {
    key: "description",
    label: "What do you do?",
    type: "textarea",
    required: true,
  },
  { key: "website", label: "Website (https://…)" },
];
export function Organisation({ slug }: { slug: string }) {
  const { user } = useSession();
  const q = useLoad(async () => {
    const org = (await rows("organisations", { eq: { slug }, limit: 1 }))[0];
    if (!org) throw new Error("Organisation not found.");
    const [members, needs, posts, requests, causes, sdgs] = await Promise.all([
      rows("organisation_members", {
        eq: { organisation_id: org.id },
        order: "user_id",
        limit: 100,
      }),
      rows("organisation_needs", { eq: { organisation_id: org.id } }),
      rows("impact_posts", { eq: { organisation_id: org.id } }),
      rows("organisation_verification_requests", {
        eq: { organisation_id: org.id },
      }),
      rows("causes", { order: "name", limit: 100 }),
      rows("sdgs", { order: "id", limit: 17 }),
    ]);
    return { org, members, needs, posts, requests, causes, sdgs };
  }, [slug, user?.id]);
  const o = q.data?.org;
  const manager = q.data?.members.some(
    (m) =>
      m.user_id === user?.id &&
      ["owner", "manager"].includes(m.role) &&
      m.status === "active",
  );
  return (
    <LoadState query={q}>
      {o && (
        <>
          <Title
            eyebrow={o.organisation_type.toUpperCase()}
            title={o.name}
            description={o.city}
            action={
              <Badge
                tone={
                  o.verification_status === "Verified" ? "success" : "neutral"
                }
              >
                {o.verification_status} organisation
              </Badge>
            }
          />
          <div className="v1-panel">
            <p>{o.description}</p>
            {/^https?:\/\//.test(o.website) && (
              <a href={o.website} target="_blank" rel="noopener noreferrer">
                Visit website ↗
              </a>
            )}
            {o.logo_path && (
              <FileLink
                bucket="organisation-logos"
                path={o.logo_path}
                label="View organisation logo"
              />
            )}
            <div className="v1-actions">
              <Action
                operation="follow.toggle"
                payload={{ organisation_id: o.id }}
              >
                Follow / unfollow organisation
              </Action>
              <EditAction
                label="Report"
                operation="report.create"
                initial={{ target_type: "organisation", target_id: o.id }}
                fields={reportFields}
              />
              {manager && (
                <EditAction
                  label="Edit profile"
                  operation="organisation.update"
                  initial={{ ...o, organisation_id: o.id }}
                  fields={orgFields}
                />
              )}
            </div>
          </div>
          {manager && (
            <>
              <OrganisationUpload org={o} />
              <OrganisationTeam
                organisationId={o.id}
                members={q.data?.members ?? []}
              />
              {o.verification_status !== "Verified" && (
                <VerificationForm org={o} />
              )}{" "}
              {q.data?.requests.map((r) => (
                <div className="v1-panel" key={r.id}>
                  <Badge>{r.status}</Badge>
                  <p>
                    Verification request ·{" "}
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  <p>
                    {r.notes ||
                      "An administrator will review your submitted details."}
                  </p>
                </div>
              ))}
              {o.verification_status === "Verified" && (
                <EditAction
                  label="Post a verified community need"
                  operation="need.create"
                  initial={{ organisation_id: o.id, city: o.city }}
                  fields={[
                    { key: "title", label: "Need title", required: true },
                    {
                      key: "description",
                      label: "Describe the need",
                      type: "textarea",
                      required: true,
                    },
                    {
                      key: "affected",
                      label: "Who is affected?",
                      required: true,
                    },
                    { key: "city", label: "City", required: true },
                    {
                      key: "outcome",
                      label: "Desired outcome",
                      type: "textarea",
                      required: true,
                    },
                    {
                      key: "support",
                      label: "Support your organisation can provide",
                      type: "textarea",
                      required: true,
                    },
                    { key: "timeframe", label: "Timeframe", required: true },
                    {
                      key: "cause",
                      label: "Cause",
                      type: "select",
                      options: formOptions(q.data?.causes ?? []),
                      required: true,
                    },
                    {
                      key: "sdg_id",
                      label: "Related SDG",
                      type: "select",
                      options: formOptions(q.data?.sdgs ?? []),
                    },
                  ]}
                />
              )}
              <EditAction
                label="Share an organisation update"
                operation="post.create"
                initial={{ organisation_id: o.id, kind: "Project Update" }}
                fields={[
                  {
                    key: "body",
                    label: "Update",
                    type: "textarea",
                    required: true,
                    max: 5000,
                  },
                ]}
              />
            </>
          )}
          <h2>Community needs</h2>
          {q.data?.needs.map((n) => (
            <div className="v1-panel" key={n.id}>
              <h3>{n.title}</h3>
              <p>{n.description}</p>
              <p>
                <strong>Desired outcome:</strong> {n.outcome}
              </p>
              <p>
                <strong>Available support:</strong> {n.support}
              </p>
              <LinkButton href={`/create?need=${n.id}`} secondary>
                Start from this need
              </LinkButton>
            </div>
          ))}
          {!q.data?.needs.length && <Empty>No needs posted yet.</Empty>}
          <h2>Organisation updates</h2>
          {q.data?.posts.map((p) => (
            <Post key={p.id} post={p} />
          ))}
        </>
      )}
    </LoadState>
  );
}
function VerificationForm({ org }: { org: Row<"organisations"> }) {
  const { user, refresh } = useSession();
  const [values, setValues] = useState<Values>({});
  const [file, setFile] = useState<File>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (org.verification_status === "Pending")
    return (
      <div className="v1-panel">
        <h3>Verification in review</h3>
        <p>Your organisation’s request is waiting for an administrator.</p>
      </div>
    );
  return (
    <form
      className="v1-panel v1-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          const document_path = file
            ? await upload(
                "organisation-verification",
                [org.id, user!.id],
                file,
              )
            : null;
          await mutate("organisation.request-verification", {
            ...values,
            document_path,
            organisation_id: org.id,
          });
          refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Unable to submit");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>Request organisation verification</h2>
      <p>
        Your contact details and documents are private to your organisation’s
        managers and platform administrators.
      </p>
      <Fields
        values={values}
        setValues={setValues}
        fields={[
          {
            key: "contact_email",
            label: "Official contact email",
            type: "email",
            required: true,
          },
          {
            key: "reference",
            label: "Registration or public reference",
            type: "textarea",
            required: true,
          },
        ]}
      />
      <label>
        Supporting document (optional, up to 10 MB)
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0])}
        />
      </label>
      {error && <ErrorBox error={error} />}
      <button className="button primary" disabled={busy}>
        {busy ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
function OrganisationTeam({
  organisationId,
  members,
}: {
  organisationId: string;
  members: Row<"organisation_members">[];
}) {
  const { user } = useSession();
  const q = useLoad(
    () =>
      members.length
        ? rows("profiles", {
            in: { id: members.map((m) => m.user_id) },
            limit: 200,
          })
        : Promise.resolve([]),
    [organisationId, members.map((m) => m.user_id).join(",")],
  );
  const owner = members.some(
    (m) =>
      m.user_id === user?.id && m.role === "owner" && m.status === "active",
  );
  return (
    <section className="v1-panel">
      <h2>Organisation team</h2>
      <EditAction
        label="Invite a teammate"
        operation="organisation.member.invite"
        initial={{ organisation_id: organisationId, role: "member" }}
        fields={[
          {
            key: "username",
            label: "Existing ActionOS username",
            required: true,
          },
          {
            key: "role",
            label: "Access",
            type: "select",
            options: owner ? ["member", "manager"] : ["member"],
            required: true,
          },
        ]}
        description="They must accept the invitation in their partner portal before receiving access."
      />
      {members
        .filter((m) => m.status !== "removed")
        .map((m) => (
          <div className="v1-row v1-between" key={m.user_id}>
            <div>
              <strong>
                {q.data?.find((p) => p.id === m.user_id)?.display_name ??
                  "Member"}
              </strong>
              <small>
                {m.role} · {m.status}
              </small>
            </div>
            {m.role !== "owner" && (owner || m.role === "member") && (
              <Action
                operation="organisation.member.remove"
                payload={{
                  organisation_id: organisationId,
                  user_id: m.user_id,
                }}
                confirm="Remove this person's organisation access?"
              >
                Remove
              </Action>
            )}
          </div>
        ))}
    </section>
  );
}
function OrganisationUpload({ org }: { org: Row<"organisations"> }) {
  const { user, refresh } = useSession();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="v1-panel">
      <label>
        Update organisation logo (up to 2 MB)
        <input
          type="file"
          disabled={busy}
          accept="image/jpeg,image/png,image/webp"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setError("");
            try {
              const logo_path = await upload(
                "organisation-logos",
                [org.id, user!.id],
                file,
              );
              await mutate("organisation.update", {
                organisation_id: org.id,
                logo_path,
              });
              refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Unable to upload");
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {error && <ErrorBox error={error} />}
    </div>
  );
}
export function Admin() {
  const { admin } = useSession();
  const [tab, setTab] = useState("Overview");
  const q = useLoad(async () => {
    if (!admin) throw new Error("Administrator access is required.");
    const [
      orgRequests,
      reports,
      audit,
      profiles,
      initiatives,
      orgs,
      causes,
      skills,
    ] = await Promise.all([
      rows("organisation_verification_requests", { limit: 100 }),
      rows("reports", { limit: 100 }),
      rows("moderation_actions", { limit: 100 }),
      rows("profiles", { limit: 1000 }),
      rows("initiatives", { limit: 1000 }),
      rows("organisations", { limit: 1000 }),
      rows("causes", { order: "name", limit: 100 }),
      rows("skills", { order: "name", limit: 100 }),
    ]);
    return {
      orgRequests,
      reports,
      audit,
      profiles,
      initiatives,
      orgs,
      causes,
      skills,
    };
  }, [admin]);
  if (!admin)
    return (
      <Empty title="Administrator access required">
        This area is restricted to platform administrators.
      </Empty>
    );
  return (
    <>
      <Title
        title="Keep the community accountable."
        eyebrow="ADMINISTRATION"
        description="Review evidence, explain decisions, and protect the integrity of shared outcomes."
      />
      <div className="tabs">
        {[
          "Overview",
          "Organisation verification",
          "Reports",
          "Audit",
          "Categories",
        ].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <LoadState query={q}>
        {tab === "Overview" && (
          <div className="v1-grid">
            {[
              ["Profiles", q.data?.profiles.length],
              ["Initiatives", q.data?.initiatives.length],
              ["Organisations", q.data?.orgs.length],
            ].map(([name, count]) => (
              <div className="v1-panel" key={name}>
                <span className="eyebrow">{name}</span>
                <div className="v1-score">{count}</div>
                <small>Up to 1,000 most recent records</small>
              </div>
            ))}
          </div>
        )}
        {tab === "Organisation verification" &&
          q.data?.orgRequests.map((r) => (
            <div className="v1-panel" key={r.id}>
              <Badge>{r.status}</Badge>
              <h3>
                {q.data?.orgs.find((o) => o.id === r.organisation_id)?.name}
              </h3>
              <p>{r.contact_email}</p>
              <p>{r.reference}</p>
              {r.document_path && (
                <FileLink
                  bucket="organisation-verification"
                  path={r.document_path}
                />
              )}
              <p>{r.notes}</p>
              {r.status === "Pending" && (
                <EditAction
                  label="Review organisation"
                  operation="organisation.review"
                  initial={{ id: r.id }}
                  fields={[
                    {
                      key: "status",
                      label: "Decision",
                      type: "select",
                      required: true,
                      options: ["Verified", "Rejected"],
                    },
                    {
                      key: "notes",
                      label: "Review notes",
                      type: "textarea",
                      required: true,
                      min: 5,
                    },
                  ]}
                />
              )}
            </div>
          ))}
        {tab === "Reports" &&
          q.data?.reports.map((r) => (
            <div className="v1-panel" key={r.id}>
              <Badge>{r.status}</Badge>
              <h3>
                {r.reason} · {r.target_type}
              </h3>
              <p>{r.details}</p>
              <small>Target: {r.target_id}</small>
              <ReportedContent type={r.target_type} id={r.target_id} />
              <EditAction
                label="Review report"
                operation="report.moderate"
                initial={{ id: r.id }}
                fields={[
                  {
                    key: "action",
                    label: "Action",
                    type: "select",
                    required: true,
                    options: [
                      "Dismiss",
                      "Hide Content",
                      "Request Clarification",
                      ...(r.target_type === "initiative"
                        ? ["Suspend Initiative"]
                        : []),
                      ...(r.target_type === "profile"
                        ? ["Suspend Account"]
                        : []),
                    ],
                  },
                  {
                    key: "notes",
                    label: "Explain your decision",
                    type: "textarea",
                    required: true,
                    min: 5,
                  },
                ]}
              />
            </div>
          ))}
        {tab === "Audit" &&
          q.data?.audit.map((a) => (
            <div className="v1-panel" key={a.id}>
              <h3>{a.action}</h3>
              <p>{a.notes}</p>
              <small>
                {new Date(a.created_at).toLocaleString()} · Admin {a.admin_id}
              </small>
            </div>
          ))}
        {tab === "Categories" && (
          <>
            {(["cause", "skill"] as const).map((type) => (
              <section className="v1-panel" key={type}>
                <h2>{type === "cause" ? "Causes" : "Skills"}</h2>
                <EditAction
                  label={`Add ${type}`}
                  operation="category.save"
                  initial={{ category_type: type, active: true }}
                  fields={categoryFields}
                />
                {(type === "cause" ? q.data?.causes : q.data?.skills)?.map(
                  (c) => (
                    <div className="v1-row v1-between" key={c.id}>
                      <span>
                        {c.name} {c.active ? "" : "(inactive)"}
                      </span>
                      <EditAction
                        label="Edit"
                        operation="category.save"
                        initial={{
                          key: c.id,
                          name: c.name,
                          active: c.active,
                          category_type: type,
                        }}
                        fields={categoryFields}
                      />
                    </div>
                  ),
                )}
              </section>
            ))}
          </>
        )}
      </LoadState>
    </>
  );
}
const categoryFields: Field[] = [
  { key: "key", label: "Stable identifier", required: true },
  { key: "name", label: "Display name", required: true },
  { key: "active", label: "Active", type: "checkbox" },
];
function ReportedContent({ type, id }: { type: string; id: string }) {
  const q = useLoad(async () => {
    if (type === "post")
      return (await rows("impact_posts", { eq: { id }, limit: 1 }))[0]?.body;
    if (type === "comment")
      return (await rows("comments", { eq: { id }, limit: 1 }))[0]?.body;
    if (type === "initiative")
      return (await rows("initiatives", { eq: { id }, limit: 1 }))[0]
        ?.observation;
    if (type === "organisation")
      return (await rows("organisations", { eq: { id }, limit: 1 }))[0]
        ?.description;
    return (await rows("profiles", { eq: { id }, limit: 1 }))[0]?.bio;
  }, [type, id]);
  return (
    <LoadState query={q}>
      <blockquote>{q.data ?? "Record no longer available."}</blockquote>
    </LoadState>
  );
}
