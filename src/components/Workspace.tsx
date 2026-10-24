"use client";
import { useState, useCallback } from "react";
import {
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Check,
  ShieldCheck,
  FileText,
  ImageIcon,
  Users,
  Target,
  Clock,
  Plus,
  Building2,
  ExternalLink,
  Leaf,
  Download,
} from "lucide-react";
import {
  initiatives,
  timeline,
  permissionNames,
  resourceNames,
  partnerNames,
} from "@/lib/data";
import { readiness } from "@/lib/logic";
import { useApp } from "./ActionApp";
import { Roles } from "./Initiative";
import { Title, Badge, Progress, CheckLine, Modal } from "./ui";
const records = [
  ["Temple 01 · Basavanagudi", "18 kg"],
  ["Temple 02 · Jayanagar", "21 kg"],
  ["Temple 03 · Malleshwaram", "16 kg"],
  ["Temple 04 · Indiranagar", "15 kg"],
  ["Temple 05 · Banashankari", "17 kg"],
];
function Evidence() {
  const [selected, setSelected] = useState("");
  const close = useCallback(() => setSelected(""), []);
  return (
    <>
      <div className="evidence-list">
        {[
          [
            "5 collection records",
            "Recorded across all five pilot sites",
            "records",
          ],
          [
            "Processing receipt",
            "87 kg received · Circular Bengaluru",
            "receipt",
          ],
          [
            "Field photographs",
            "5 consent-cleared site placeholders",
            "photos",
          ],
          [
            "Volunteer attendance",
            "19 youth contributors checked in",
            "attendance",
          ],
        ].map(([n, d, k]) => (
          <button
            key={k}
            className="evidence-file"
            onClick={() => setSelected(k)}
          >
            <span className="file-icon">
              {k === "photos" ? <ImageIcon /> : <FileText />}
            </span>
            <span>
              <strong>{n}</strong>
              <small>{d}</small>
            </span>
            <ExternalLink size={16} />
          </button>
        ))}
      </div>
      <p className="small muted">
        Sample records for this demo. Photos and attendance document activity;
        the processing receipt supports the outcome claim.
      </p>
      {selected && (
        <Modal
          title={
            selected === "records"
              ? "Pilot collection records"
              : selected === "receipt"
                ? "Processing receipt"
                : selected === "photos"
                  ? "Field photo records"
                  : "Volunteer attendance"
          }
          onClose={close}
        >
          <Badge>Seeded demo evidence</Badge>
          {selected === "records" ? (
            <>
              <div className="record-table">
                {records.map(([n, w]) => (
                  <div key={n}>
                    <span>{n}</span>
                    <strong>{w}</strong>
                  </div>
                ))}
                <div>
                  <strong>Total received</strong>
                  <strong>87 kg</strong>
                </div>
              </div>
              <p className="small muted">
                Each entry records segregated floral waste received by the
                processing partner.
              </p>
            </>
          ) : selected === "receipt" ? (
            <div className="receipt">
              <span className="label">CIRCULAR BENGALURU · SAMPLE RECEIPT</span>
              <h2>Floral waste intake</h2>
              <p>Receipt # CB-RIPPLE-001</p>
              <div className="summary-pair">
                <span>Material</span>
                <strong>Segregated floral waste</strong>
              </div>
              <div className="summary-pair">
                <span>Net received weight</span>
                <strong>87 kg</strong>
              </div>
              <div className="summary-pair">
                <span>Destination</span>
                <strong>Verified processing facility</strong>
              </div>
              <p>
                Receipt recorded. Final partner confirmation is handled
                separately in the partner portal.
              </p>
            </div>
          ) : selected === "photos" ? (
            <div className="photo-placeholders">
              {records.map(([n]) => (
                <div key={n}>
                  <ImageIcon size={32} />
                  <span>{n}</span>
                  <small>Site photo placeholder · consent recorded</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="record-table">
              {[
                "Point 1 · 4 contributors",
                "Point 2 · 4 contributors",
                "Point 3 · 4 contributors",
                "Point 4 · 4 contributors",
                "Point 5 · 3 contributors",
              ].map((n) => (
                <div key={n}>
                  <span>{n}</span>
                  <Badge tone="success">Checked in</Badge>
                </div>
              ))}
              <p>19 attendees recorded across five sites.</p>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
export function Workspace() {
  const { state, update, go, toast } = useApp();
  const [tab, setTab] = useState("Overview");
  const r = readiness(state);
  const tabs = [
    "Overview",
    "Team",
    "Partners",
    "Tasks",
    "Permissions",
    "Resources",
    "Evidence",
    "Impact",
  ];
  const toggle = (key: "permissions" | "resources" | "partners", i: number) =>
    update({ [key]: state[key].map((v, j) => (j === i ? !v : v)) });
  return (
    <>
      <button className="back-link" onClick={() => go("/my-initiatives")}>
        <ArrowLeft size={15} />
        My Initiatives
      </button>
      <Title
        eyebrow="PROJECT WORKSPACE"
        title="Project Ripple"
        description="A shared plan. Clear responsibilities. A measurable outcome."
        action={
          <div className="row">
            <Badge>
              {state.verification === "verified"
                ? "Verified impact"
                : "Building team"}
            </Badge>
            <button className="primary" onClick={() => go("/execution")}>
              Execution Mode <ArrowRight size={15} />
            </button>
          </div>
        }
      />
      <div className="tabs section-tabs">
        {tabs.map((t) => (
          <button
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Overview" ? (
        <>
          <div className="workspace-overview">
            <section className="panel readiness-panel">
              <div className="row between">
                <h3>Project readiness</h3>
                <span className="small muted">Planning snapshot</span>
              </div>
              <div className="readiness-top">
                <div
                  className="readiness-ring"
                  style={{
                    background: `conic-gradient(var(--navy) ${r.score}%, #e9edf1 0)`,
                  }}
                >
                  <div>
                    <strong>{r.score}%</strong>
                    <span>READY</span>
                  </div>
                </div>
                <div>
                  <Badge tone={r.ready ? "success" : "warning"}>
                    {r.ready
                      ? "Ready for execution"
                      : "Not ready for execution"}
                  </Badge>
                  <h3>
                    {r.ready
                      ? "Your plan is ready for action."
                      : "A good idea needs a ready team."}
                  </h3>
                  <p>
                    Readiness keeps the practical gaps visible before people go
                    on ground.
                  </p>
                </div>
              </div>
              {r.parts.map((p) => (
                <div className="readiness-bar" key={p.name}>
                  <div>
                    <span>{p.name}</span>
                    <strong>{p.value}%</strong>
                  </div>
                  <Progress value={p.value} />
                </div>
              ))}
              <details className="logic-details">
                <summary>How is readiness calculated?</summary>
                <p>
                  Weighted preparation: {r.preparation}%. Need 20%, partners
                  20%, team 20%, permissions 15%, resources 10%, plan 15%.
                </p>
                <p>
                  Readiness is capped at 74% while a critical need, partner,
                  permission or metric is missing. Execution also requires at
                  least 24 team members and all resources.
                </p>
              </details>
            </section>
            <section>
              <div className="blocker-panel">
                <div className="row">
                  <AlertTriangle size={20} />
                  <h3>What’s still needed</h3>
                </div>
                <p>Resolve these before the pilot begins.</p>
                {r.blockers.map((b) => (
                  <div className="blocker" key={b}>
                    <span />
                    {b}
                  </div>
                ))}
                <button
                  className="secondary full"
                  onClick={() => setTab("Partners")}
                >
                  Review requirements <ArrowRight size={15} />
                </button>
              </div>
              <div className="target-summary panel section-gap">
                <Target size={22} />
                <span className="label">OUR DEFINITION OF SUCCESS</span>
                <h2>100 kg</h2>
                <p>Floral waste diverted to verified processing.</p>
                <span className="small muted">
                  Measured with collection records and a processing receipt.
                </span>
              </div>
            </section>
          </div>
          <section className="panel section-gap">
            <div className="row between">
              <h3>The road to verified impact</h3>
              <button className="text-button" onClick={() => go("/blueprint")}>
                View blueprint <ArrowRight size={15} />
              </button>
            </div>
            <div className="timeline">
              {timeline.map((t, i) => (
                <div key={t}>
                  <span
                    className={i < 2 ? "complete" : i === 2 ? "current" : ""}
                  >
                    {i < 2 ? <Check size={14} /> : i + 1}
                  </span>
                  <p>{t}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : tab === "Team" ? (
        <section className="panel">
          <div className="section-heading">
            <h2>A team built for the work.</h2>
            <Badge>
              {19 + Number(!!state.joined.ripple)} / 30 roles filled
            </Badge>
          </div>
          <Roles />
          <div className="member-strip">
            <span className="avatar">AM</span>
            <span className="avatar">AS</span>
            <span className="avatar">RK</span>
            <p>
              Aarav Mehta · Ananya Sharma · Rohan Kumar
              <br />
              <small className="muted">Project coordination team</small>
            </p>
          </div>
          {state.suggestion !== "pending" &&
            state.suggestion !== "dismissed" && (
              <div className="info-box">
                Operations plan: {state.suggestion}
              </div>
            )}
        </section>
      ) : tab === "Partners" || tab === "Permissions" || tab === "Resources" ? (
        <section className="panel">
          <h2>
            {tab === "Partners"
              ? "People who make this possible."
              : tab === "Permissions"
                ? "Permission before participation."
                : "The practical pieces of the plan."}
          </h2>
          <p>
            {tab === "Partners"
              ? "Record confirmed commitments from the people accountable for the work."
              : "Update the planning checklist as requirements are secured."}
          </p>
          {(tab === "Partners"
            ? partnerNames
            : tab === "Permissions"
              ? permissionNames
              : resourceNames
          ).map((name, i) => {
            const key =
              tab === "Partners"
                ? "partners"
                : tab === "Permissions"
                  ? "permissions"
                  : "resources";
            const checked = state[key][i];
            return (
              <div className="requirement-row" key={name}>
                <div>
                  <h3>{name}</h3>
                  <span className="small muted">
                    {tab === "Partners"
                      ? [
                          "Access and segregation at five temples",
                          "Processing records and outcome confirmation",
                          "Community support and coordination",
                        ][i]
                      : tab === "Permissions"
                        ? "Confirmation recorded by project lead"
                        : "Resource tracked by operations team"}
                  </span>
                </div>
                <Badge tone={checked ? "success" : "warning"}>
                  {checked
                    ? tab === "Resources"
                      ? "Secured"
                      : "Confirmed"
                    : tab === "Resources"
                      ? "Missing"
                      : "Pending"}
                </Badge>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      toggle(key, i);
                      toast("Requirement updated. Readiness recalculated.");
                    }}
                  />
                  <span>{checked ? "Mark pending" : "Mark confirmed"}</span>
                </label>
              </div>
            );
          })}
        </section>
      ) : tab === "Tasks" ? (
        <section className="panel">
          <h2>Every next step has an owner.</h2>
          <div className="task-board">
            {["To do", "In progress", "Complete"].map((stage, s) => (
              <div key={stage}>
                <h3>
                  {stage}{" "}
                  <span>{state.tasks.filter((n) => n === s).length}</span>
                </h3>
                {[
                  "Confirm all temple access",
                  "Brief field volunteers",
                  "Secure transport permission",
                  "Print collection record sheets",
                ].map(
                  (t, i) =>
                    state.tasks[i] === s && (
                      <article key={t}>
                        <span className="label">
                          {
                            [
                              "PARTNERSHIPS",
                              "OPERATIONS",
                              "LOGISTICS",
                              "DOCUMENTATION",
                            ][i]
                          }
                        </span>
                        <h4>{t}</h4>
                        <p>
                          {["Aarav", "Ananya", "Rohan", "Meera"][i]} · Before
                          pilot
                        </p>
                        <label className="small">
                          Move task
                          <select
                            aria-label={`Status of ${t}`}
                            value={s}
                            onChange={(e) =>
                              update({
                                tasks: state.tasks.map((v, j) =>
                                  i === j ? Number(e.target.value) : v,
                                ),
                              })
                            }
                          >
                            {["To do", "In progress", "Complete"].map(
                              (v, j) => (
                                <option value={j} key={v}>
                                  {v}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                      </article>
                    ),
                )}
              </div>
            ))}
          </div>
        </section>
      ) : tab === "Evidence" ? (
        <section className="panel">
          <h2>A record of what happened.</h2>
          <p>
            Evidence belongs to the project. Verification belongs to the
            partner.
          </p>
          <Evidence />
        </section>
      ) : (
        <section className="panel">
          <div className="section-heading">
            <h2>Activity is the start. Outcome is the measure.</h2>
            <Badge
              tone={state.verification === "verified" ? "success" : "neutral"}
            >
              {state.verification === "verified"
                ? "Verified impact"
                : state.verification === "unsubmitted"
                  ? "Not submitted"
                  : state.verification}
            </Badge>
          </div>
          <div className="impact-comparison">
            <div>
              <span className="label">PREDEFINED TARGET</span>
              <strong>
                100 <small>kg</small>
              </strong>
              <p>Diverted to verified processing</p>
            </div>
            <div>
              <span className="label">RECORDED OUTCOME</span>
              <strong>
                87 <small>kg</small>
              </strong>
              <p>
                {state.verification === "verified"
                  ? "Confirmed by project partner"
                  : "Pilot sample · awaiting confirmation"}
              </p>
            </div>
            <div>
              <span className="label">ACTIVITY</span>
              <strong>19</strong>
              <p>Youth contributors participated</p>
            </div>
          </div>
          <p>{state.metric}</p>
          <button
            className="primary"
            onClick={() =>
              go(state.verification === "verified" ? "/verified" : "/execution")
            }
          >
            {state.verification === "verified"
              ? "View verified impact"
              : "Review pilot evidence"}
            <ArrowRight size={16} />
          </button>
        </section>
      )}
    </>
  );
}
export function Execution() {
  const { state, update, go, toast } = useApp();
  const complete = state.checks.every(Boolean);
  return (
    <>
      <button className="back-link" onClick={() => go("/workspace")}>
        <ArrowLeft size={15} />
        Back to workspace
      </button>
      <Title
        eyebrow="PROJECT RIPPLE / EXECUTION"
        title="Pilot day. Purpose in motion."
        description="Five collection points. One shared responsibility."
        action={<Badge>Pilot-day sample</Badge>}
      />
      <div className="info-box">
        <Clock size={19} />
        <p>
          This is the later pilot-day demo snapshot. The planning workspace
          keeps its earlier blockers so you can present both stages.
        </p>
      </div>
      <div className="execution-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>Today’s checklist</h2>
            <Badge tone={complete ? "success" : "neutral"}>
              {state.checks.filter(Boolean).length} / 5 completed
            </Badge>
          </div>
          {records.map(([n, w], i) => (
            <label className="execution-check" key={n}>
              <input
                type="checkbox"
                checked={state.checks[i]}
                onChange={() =>
                  update({
                    checks: state.checks.map((c, j) => (i === j ? !c : c)),
                  })
                }
              />
              <div>
                <strong>Collection Point {i + 1}</strong>
                <span>{n.split(" · ")[1]}</span>
              </div>
              <strong>{w}</strong>
              <Badge tone={state.checks[i] ? "success" : "neutral"}>
                {state.checks[i] ? "Completed" : "Pending"}
              </Badge>
            </label>
          ))}
          <div className="attendance">
            <Users size={21} />
            <div>
              <strong>19 volunteers checked in</strong>
              <span>Attendance recorded by site leads</span>
            </div>
          </div>
        </section>
        <section className="outcome-panel">
          <span className="label">RECORDED OUTCOME</span>
          <div className="outcome-number">
            87 <span>kg</span>
          </div>
          <h3>
            Floral waste received
            <br />
            for responsible processing.
          </h3>
          <Progress value={87} />
          <p>87% of the predefined 100 kg target</p>
          <div className="outcome-note">
            <ShieldCheck size={19} />
            <span>
              {state.verification === "verified"
                ? "Confirmed by processing partner"
                : "Awaiting partner confirmation"}
            </span>
          </div>
        </section>
      </div>
      <section className="panel section-gap">
        <h2>Evidence, with context.</h2>
        <Evidence />
      </section>
      <div className="three-columns activity-strip">
        <div>
          <span className="label">01 / ACTIVITY</span>
          <h3>19 volunteers participated.</h3>
          <p>What the team did.</p>
        </div>
        <div>
          <span className="label">02 / OUTCOME CLAIM</span>
          <h3>87 kg reached processing.</h3>
          <p>What the records show.</p>
        </div>
        <div>
          <span className="label">03 / VERIFICATION</span>
          <h3>
            {state.verification === "verified"
              ? "Partner confirmed."
              : "Awaiting partner confirmation."}
          </h3>
          <p>Who can independently confirm it.</p>
        </div>
      </div>
      <div className="form-actions">
        <span className="small muted">
          Photographs and attendance alone do not prove impact.
        </span>
        <button
          className="primary"
          disabled={
            !complete ||
            state.verification === "pending" ||
            state.verification === "verified"
          }
          onClick={() => {
            update({ verification: "pending", verificationNote: "" });
            toast("Evidence submitted. A partner can now review the outcome.");
          }}
        >
          {state.verification === "pending"
            ? "Submitted for verification"
            : state.verification === "verified"
              ? "Impact verified"
              : "Submit for verification"}
          <ArrowRight size={16} />
        </button>
      </div>
      {state.verification === "pending" && (
        <div className="success-banner">
          <ShieldCheck size={22} />
          <div>
            <h3>Evidence is ready for partner review.</h3>
            <p>The project is now in the verifying stage.</p>
          </div>
          <button
            className="secondary"
            onClick={() => {
              update({ account: "Partner" });
              go("/partner");
            }}
          >
            Switch to Partner <ArrowRight size={15} />
          </button>
        </div>
      )}
    </>
  );
}
export function PartnerPortal() {
  const { state, update, go, toast } = useApp();
  const [tab, setTab] = useState("Impact verification");
  const [modal, setModal] = useState("");
  const close = useCallback(() => setModal(""), []);
  const [note, setNote] = useState(
    "Please confirm the receiving signature on the processing receipt.",
  );
  const [kg, setKg] = useState(70);
  const [need, setNeed] = useState({
    organisation: "Stand N Stride Foundation",
    need: "We work with 80 children and need a structured six-week spoken-English programme.",
    outcome:
      "Students can confidently complete a 2-minute spoken presentation.",
    support: "Venue, coordinator, student group",
    roles: "Youth facilitators, curriculum, project lead",
  });
  const canReview =
    state.account === "Partner" &&
    ["pending", "partial", "clarification"].includes(state.verification);
  return (
    <>
      <Title
        eyebrow="PARTNER PORTAL / CIRCULAR BENGALURU"
        title="Closer to the community."
        description="Validate the need. Support the people. Verify what changed."
        action={
          <button
            className="primary"
            disabled={state.account !== "Partner"}
            onClick={() => setModal("need")}
          >
            <Plus size={16} />
            Post a Need
          </button>
        }
      />
      <div className="partner-stats">
        <div>
          <MessageIcon />
          <strong>{state.validated ? 0 : 1}</strong>
          <span>Needs awaiting validation</span>
        </div>
        <div>
          <ShieldCheck />
          <strong>
            {["pending", "partial", "clarification"].includes(
              state.verification,
            )
              ? 1
              : 0}
          </strong>
          <span>Claims awaiting verification</span>
        </div>
        <div>
          <Building2 />
          <strong>3</strong>
          <span>Initiatives supported</span>
        </div>
      </div>
      <div className="tabs section-tabs">
        {[
          "Impact verification",
          "Needs to validate",
          "Initiatives supported",
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
      {state.account !== "Partner" && (
        <div className="info-box">
          <p>Only the project partner can record a verification decision.</p>
          <button
            className="primary"
            onClick={() => update({ account: "Partner" })}
          >
            View as Partner
          </button>
        </div>
      )}
      {tab === "Impact verification" ? (
        <section className="panel verification-request">
          <div className="section-heading">
            <div>
              <span className="label">IMPACT VERIFICATION REQUEST</span>
              <h2>Project Ripple</h2>
            </div>
            <Badge
              tone={
                state.verification === "verified"
                  ? "success"
                  : state.verification === "partial"
                    ? "warning"
                    : "neutral"
              }
            >
              {state.verification === "verified"
                ? "Verified impact"
                : state.verification === "unsubmitted"
                  ? "Awaiting submission"
                  : state.verification === "pending"
                    ? "Ready for your review"
                    : state.verification === "partial"
                      ? "Partially verified"
                      : "Clarification requested"}
            </Badge>
          </div>
          <div className="verification-layout">
            <div>
              <div className="impact-comparison">
                <div>
                  <span className="label">PREDEFINED TARGET</span>
                  <strong>
                    100 <small>kg</small>
                  </strong>
                </div>
                <div>
                  <span className="label">ACTUAL RECORDED</span>
                  <strong>
                    87 <small>kg</small>
                  </strong>
                </div>
              </div>
              <p>
                Floral waste diverted to verified processing across five
                collection points.
              </p>
              <div className="review-note">
                <ShieldCheck size={20} />
                <p>
                  Verify the measured outcome, even when it falls short of the
                  target. A verified 87 kg is more meaningful than an unproven
                  100 kg.
                </p>
              </div>
              {state.verificationNote && (
                <div className="info-box">
                  <p>
                    <strong>Partner note:</strong> {state.verificationNote}
                    {state.verification === "partial" &&
                      ` Confirmed portion: ${state.verifiedKg} kg of 87 kg.`}
                  </p>
                </div>
              )}
            </div>
            <div>
              <span className="label">SUPPORTING EVIDENCE</span>
              <Evidence />
            </div>
          </div>
          <div className="verification-actions">
            <span className="small muted">
              Decision recorded by Circular Bengaluru · Demo partner
            </span>
            <div className="row">
              {state.verification === "verified" ? (
                <button className="primary" onClick={() => go("/verified")}>
                  View verified impact <ArrowRight size={16} />
                </button>
              ) : state.verification === "unsubmitted" ? (
                <button className="primary" onClick={() => go("/execution")}>
                  Review & submit pilot evidence <ArrowRight size={16} />
                </button>
              ) : (
                <>
                  <button
                    className="secondary"
                    disabled={!canReview}
                    onClick={() => setModal("clarification")}
                  >
                    Request clarification
                  </button>
                  <button
                    className="secondary"
                    disabled={!canReview}
                    onClick={() => setModal("partial")}
                  >
                    Partially verify
                  </button>
                  <button
                    className="primary"
                    disabled={!canReview}
                    onClick={() => {
                      if (!canReview) return;
                      update({
                        verification: "verified",
                        verifiedKg: 87,
                        verificationNote:
                          "Collection records and processing receipt reviewed. 87 kg confirmed.",
                      });
                      go("/verified");
                    }}
                  >
                    <ShieldCheck size={16} />
                    Verify Impact
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      ) : tab === "Needs to validate" ? (
        <section className="panel">
          <Badge tone={state.validated ? "success" : "neutral"}>
            {state.validated ? "Need validated" : "Awaiting validation"}
          </Badge>
          <h2>Project Ripple · Flower-waste management</h2>
          <p>{state.observation}</p>
          <div className="refinement">
            <div>
              <span className="label">COMMUNITY-REFINED NEED</span>
              <h3>{state.refined}</h3>
            </div>
          </div>
          <button
            className="secondary"
            onClick={() => {
              update({ createStep: 2 });
              go("/create");
            }}
          >
            Review validation conversation <ArrowRight size={15} />
          </button>
          {state.needs.map((n) => (
            <div className="need-feed" key={n.id}>
              <Badge tone="success">Verified need</Badge>
              <h3>{n.need}</h3>
              <p>{n.organisation}</p>
            </div>
          ))}
        </section>
      ) : (
        <div className="panel">
          {initiatives
            .filter((p) => ["ripple", "digital", "books"].includes(p.id))
            .map((p) => (
              <div className="role-row" key={p.id}>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.goal}</p>
                </div>
                <button
                  className="secondary"
                  onClick={() => go(`/initiative/${p.id}`)}
                >
                  View initiative <ArrowRight size={14} />
                </button>
              </div>
            ))}
        </div>
      )}
      {modal && (
        <Modal
          title={
            modal === "need"
              ? "Post a verified need"
              : modal === "partial"
                ? "Verify part of the outcome"
                : "Request clarification"
          }
          onClose={close}
        >
          {modal === "need" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                update({
                  needs: [{ ...need, id: crypto.randomUUID() }, ...state.needs],
                });
                close();
                toast("Your verified need is now visible in Discover.");
              }}
            >
              <p className="small muted">
                Posted by a seeded partner account. Share a community need, not
                a pre-decided solution.
              </p>
              {Object.entries(need).map(([k, v], i) => (
                <label key={k}>
                  {
                    [
                      "Organisation",
                      "What does the community need?",
                      "Desired outcome",
                      "Support available",
                      "People / skills needed",
                    ][i]
                  }
                  <textarea
                    required
                    value={v}
                    onChange={(e) => setNeed({ ...need, [k]: e.target.value })}
                  />
                </label>
              ))}
              <button className="primary full">
                Post verified need <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!canReview) return;
                update({
                  verification:
                    modal === "partial" ? "partial" : "clarification",
                  verificationNote: note,
                  ...(modal === "partial" ? { verifiedKg: kg } : {}),
                });
                close();
                toast("Your partner decision has been recorded.");
              }}
            >
              {modal === "partial" && (
                <label>
                  Confirmed weight (kg)
                  <input
                    type="number"
                    min="0"
                    max="86.9"
                    step="0.1"
                    required
                    value={kg}
                    onChange={(e) => setKg(Number(e.target.value))}
                  />
                </label>
              )}
              <label>
                {modal === "partial"
                  ? "What can you confirm, and what remains unverified?"
                  : "What needs to be clarified?"}
                <textarea
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <p className="small muted">
                The project will remain unverified until the outstanding
                evidence is resolved.
              </p>
              <button className="primary full">
                Record decision <ArrowRight size={15} />
              </button>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
function MessageIcon() {
  return <FileText />;
}
export function Verified() {
  const { state, update, go } = useApp();
  if (state.verification !== "verified")
    return (
      <div className="empty">
        <ShieldCheck size={42} />
        <h1>This outcome is awaiting verification.</h1>
        <p>A project partner needs to review and confirm the evidence first.</p>
        <button
          className="primary"
          onClick={() => {
            update({ account: "Partner" });
            go("/partner");
          }}
        >
          Open partner portal
        </button>
      </div>
    );
  return (
    <div className="verified-page">
      <span className="verified-seal">
        <ShieldCheck size={42} strokeWidth={1.3} />
      </span>
      <div className="eyebrow">PROJECT RIPPLE</div>
      <h1>Intention became impact.</h1>
      <Badge tone="success">Verified impact</Badge>
      <div className="verified-number">
        87 <span>kg</span>
      </div>
      <h2>
        Floral waste diverted
        <br />
        to verified processing.
      </h2>
      <p>Not just an event organised. A measurable outcome, confirmed.</p>
      <div className="verified-stats">
        <div>
          <strong>19</strong>
          <span>Youth contributors</span>
        </div>
        <div>
          <strong>3</strong>
          <span>Partner organisations</span>
        </div>
        <div>
          <strong>5</strong>
          <span>Collection points</span>
        </div>
      </div>
      <div className="verified-by">
        <span className="partner-avatar">
          <Building2 size={20} />
        </span>
        <div>
          <span className="label">VERIFIED BY</span>
          <strong>Circular Bengaluru</strong>
          <small>
            Processing partner · Receipt and collection records reviewed
          </small>
        </div>
        <ShieldCheck size={22} />
      </div>
      <div className="row centered">
        <button
          className="primary"
          onClick={() => {
            update({ account: "Student" });
            go("/profile");
          }}
        >
          View my Impact Portfolio <ArrowRight size={16} />
        </button>
        <button className="secondary" onClick={() => go("/workspace")}>
          Back to workspace
        </button>
      </div>
      <span className="small muted">
        100 kg target · 87 kg confirmed · 87% achieved · Seeded demo outcome
      </span>
    </div>
  );
}
