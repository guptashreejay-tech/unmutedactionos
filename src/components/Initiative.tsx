"use client";
import { useState, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShieldCheck,
  Users,
  MapPin,
  Clock,
  MessageSquare,
  Flower2,
  Target,
  FileCheck,
  Plus,
  Building2,
} from "lucide-react";
import {
  initiatives,
  roleData,
  timeline,
  resourceNames,
  permissionNames,
  refinedProblem,
} from "@/lib/data";
import { roleMatch, recommendedRole, teamCount } from "@/lib/logic";
import { useApp } from "./ActionApp";
import { Title, Badge, CheckLine, Cover, Progress, Modal } from "./ui";
export function CreateFlow() {
  const { state, update, go, toast } = useApp();
  const step = state.createStep;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(state.refined);
  const details = state.observationDetails;
  return (
    <div className="create-wrap">
      <button
        className="back-link"
        onClick={() => (step ? update({ createStep: step - 1 }) : go("/feed"))}
      >
        <ArrowLeft size={15} />
        {step ? "Back" : "Back to feed"}
      </button>
      <div className="flow-steps">
        {["Observe", "Understand", "Validate", "Build"].map((s, i) => (
          <div
            className={i === step ? "active" : i < step ? "done" : ""}
            key={s}
          >
            <span>{i < step ? <Check size={13} /> : i + 1}</span>
            {s}
            {i < 3 && <div className="step-line" />}
          </div>
        ))}
      </div>
      {step === 0 ? (
        <>
          <Title
            eyebrow="START A NEW INITIATIVE"
            title="What have you noticed?"
            description="Start with what you see. The solution can come later."
          />
          <form
            className="panel create-form"
            onSubmit={(e) => {
              e.preventDefault();
              update({ createStep: 1 });
            }}
          >
            <label className="observation-label">
              What have you observed or what do you care about?
              <textarea
                required
                minLength={15}
                value={state.observation}
                onChange={(e) => update({ observation: e.target.value })}
              />
            </label>
            <div className="form-grid">
              {Object.entries(details).map(([key, v], i) => (
                <label key={key}>
                  {
                    [
                      "Where have you observed this?",
                      "Who do you think is affected?",
                      "Have you spoken to anyone involved?",
                      "Know an organisation in this space?",
                      "How much time can you commit?",
                      "Do you already have a team?",
                      "What resources do you currently have?",
                    ][i]
                  }
                  <input
                    required
                    value={v}
                    onChange={(e) =>
                      update({
                        observationDetails: {
                          ...details,
                          [key]: e.target.value,
                        },
                      })
                    }
                  />
                </label>
              ))}
            </div>
            <div className="form-actions">
              <span className="small muted">AI structures. Humans decide.</span>
              <button className="primary">
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </>
      ) : step === 1 ? (
        <>
          <Title
            eyebrow="ACTIONOS HAS ORGANISED YOUR OBSERVATION"
            title="A clearer starting point."
            description="Separate what you know from what you still need to learn."
          />
          <div className="observation-quote">“{state.observation}”</div>
          <div className="three-columns formation">
            <section className="panel">
              <span className="number-label">01 / OBSERVATION</span>
              <h2>What you know</h2>
              <p>{state.observation}</p>
              <div className="note">
                <strong>{details.where}</strong>
                <br />
                {details.who}
                <br />
                Already spoken to: {details.spoken}
              </div>
            </section>
            <section className="panel">
              <span className="number-label">02 / ASSUMPTION</span>
              <h2>What you’re assuming</h2>
              <p>
                Collection is the main issue, and a new collection drive would
                solve it.
              </p>
              <div className="note">
                An assumption to test, not a conclusion.
              </div>
            </section>
            <section className="panel">
              <span className="number-label">03 / OPEN QUESTIONS</span>
              <h2>What needs validation</h2>
              <ul className="clean-list">
                <li>How are flowers currently disposed of?</li>
                <li>Is segregation available?</li>
                <li>Does a processing partner already exist?</li>
                <li>Would temples participate?</li>
              </ul>
            </section>
          </div>
          <div className="info-box">
            <MessageSquare size={20} />
            <p>
              ActionOS can help structure what you’ve observed, but the need
              must be validated by people closer to the problem.
            </p>
          </div>
          <div className="form-actions">
            <span className="small muted">
              Based on the flower-waste demo scenario.
            </span>
            <button
              className="primary"
              onClick={() => update({ createStep: 2 })}
            >
              Validate the need <ArrowRight size={16} />
            </button>
          </div>
        </>
      ) : (
        <>
          <Title
            eyebrow="PEOPLE CLOSEST TO THE PROBLEM COME FIRST"
            title="Validate before you build."
            description="The best next step starts with listening."
          />
          <div className="validation-grid">
            <section>
              <div className="panel">
                <span className="label">ORIGINAL OBSERVATION</span>
                <h3>“Flower waste needs to be collected.”</h3>
                <div className="partner-feedback">
                  <div className="row">
                    <span className="partner-avatar">
                      <Building2 size={20} />
                    </span>
                    <div>
                      <strong>Circular Bengaluru</strong>
                      <small>Environmental organisation · Demo response</small>
                    </div>
                    <Badge tone="success">Responded</Badge>
                  </div>
                  <blockquote>
                    “Flower waste disposal is a recurring issue, but collection
                    alone is not the main gap. The bigger challenge is
                    consistent segregation and access to verified processing.”
                  </blockquote>
                </div>
              </div>
              <div className="refinement">
                <div>
                  <span className="label">ORIGINAL ASSUMPTION</span>
                  <p className="old-assumption">
                    Flowers need to be collected.
                  </p>
                </div>
                <ArrowRight size={24} />
                <div>
                  <span className="label">PARTNER-REFINED PROBLEM</span>
                  {editing ? (
                    <label className="sr-label">
                      Refined problem
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                      />
                    </label>
                  ) : (
                    <h3>{state.refined}</h3>
                  )}
                </div>
              </div>
            </section>
            <aside className="panel">
              <span className="label">VALIDATION REQUESTED FROM</span>
              {[
                ["Temple representative", "Responded"],
                ["Environmental organisation", "Responded"],
                ["Processing partner", "Pending"],
              ].map(([n, s]) => (
                <div className="validation-person" key={n}>
                  <span className="partner-avatar">
                    <Users size={17} />
                  </span>
                  <div>
                    <strong>{n}</strong>
                    <span
                      className={s === "Responded" ? "verified-text" : "muted"}
                    >
                      {s === "Responded" ? (
                        <Check size={13} />
                      ) : (
                        <Clock size={13} />
                      )}{" "}
                      {s}
                    </span>
                  </div>
                </div>
              ))}
              <p className="small muted">
                Two community responses support the refined need. Processing
                confirmation is still an execution requirement.
              </p>
            </aside>
          </div>
          <div className="form-actions">
            <button
              className="secondary"
              onClick={() => {
                if (editing) {
                  if (!draft.trim()) return;
                  update({ refined: draft });
                  toast("Refined problem updated with the demo partner.");
                }
                setEditing(!editing);
              }}
            >
              {editing ? "Save refinement" : "Edit with partner"}
            </button>
            <button
              className="primary"
              disabled={editing}
              onClick={() => {
                update({ validated: true, created: true });
                toast("Need validated. Your initiative blueprint is ready.");
                go("/blueprint");
              }}
            >
              <Check size={16} />
              Accept refined problem
            </button>
          </div>
        </>
      )}
    </div>
  );
}
export function Roles({
  joinable = false,
  onJoin,
}: {
  joinable?: boolean;
  onJoin?: (role: string) => void;
}) {
  const { state } = useApp();
  return (
    <div className="role-list">
      {roleData.map((r) => {
        const filled = r.filled + (state.joined.ripple === r.name ? 1 : 0);
        return (
          <div className="role-row" key={r.name}>
            <div>
              <h3>{r.name}</h3>
              <p>{r.purpose}</p>
              <span className="small muted">
                {r.time} · {r.skills}
              </span>
              {r.name === "Field Volunteer" && (
                <details className="role-explainer">
                  <summary>Why are 20 field volunteers needed?</summary>
                  <div className="staffing-equation">
                    <span>
                      <strong>5</strong>collection points
                    </span>
                    <b>×</b>
                    <span>
                      <strong>2</strong>volunteers per point
                    </span>
                    <b>×</b>
                    <span>
                      <strong>2</strong>shifts
                    </span>
                    <b>=</b>
                    <span>
                      <strong>20</strong>volunteers
                    </span>
                  </div>
                </details>
              )}
            </div>
            <div className="role-status">
              <strong>
                {filled} / {r.total}
              </strong>
              <small>filled</small>
              {joinable && filled < r.total && !state.joined.ripple && (
                <button
                  className="text-button"
                  onClick={() => onJoin?.(r.name)}
                >
                  Join role <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
export function Blueprint() {
  const { state, update, go, toast } = useApp();
  const [tab, setTab] = useState("Blueprint");
  const [editSuggestion, setEditSuggestion] = useState(false),
    [suggestion, setSuggestion] = useState(
      "Add a logistics coordinator to move materials between five collection points.",
    );
  const [editMetric, setEditMetric] = useState(false),
    [metric, setMetric] = useState(state.metric);
  return (
    <>
      <button className="back-link" onClick={() => go("/create")}>
        <ArrowLeft size={15} />
        Back to validation
      </button>
      <Title
        eyebrow="FROM A VALIDATED NEED TO A SHARED PLAN"
        title="Project Ripple"
        description="Your initiative blueprint. Built around the problem, ready for people."
        action={<Badge tone="success">Need validated</Badge>}
      />
      <div className="tabs section-tabs">
        {["Blueprint", "Partners", "Team roles"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? "selected" : ""}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Blueprint" ? (
        <>
          <div className="blueprint-top">
            <section className="panel">
              <span className="label">THE PROBLEM</span>
              <h3>{state.refined}</h3>
              <hr />
              <span className="label">THE GOAL</span>
              <p>{initiatives[0].goal}</p>
              <div className="chips">
                <span>SDG 12 · Responsible consumption</span>
                <span>SDG 6 · Clean water</span>
              </div>
            </section>
            <section className="target-panel">
              <Target size={26} />
              <span className="label">PREDEFINED IMPACT TARGET</span>
              <strong>
                100 <small>kg</small>
              </strong>
              <p>Floral waste diverted to verified processing.</p>
              <span className="small">
                Set before execution. Verified after.
              </span>
            </section>
          </div>
          <div className="three-columns section-gap">
            <section className="panel">
              <h3>Resources needed</h3>
              {resourceNames.map((r) => (
                <CheckLine key={r}>{r}</CheckLine>
              ))}
            </section>
            <section className="panel">
              <h3>Permissions to secure</h3>
              {permissionNames.map((r) => (
                <CheckLine key={r}>{r}</CheckLine>
              ))}
            </section>
            <section className="panel">
              <h3>Risks to plan for</h3>
              <ul className="clean-list">
                {[
                  "Waste handling",
                  "Volunteer safety",
                  "Consent",
                  "Unverified processing",
                  "Overclaiming environmental impact",
                ].map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          </div>
          <section className="panel section-gap">
            <h3>A plan from start to proof</h3>
            <div className="timeline">
              {timeline.map((t, i) => (
                <div key={t}>
                  <span className={i === 0 ? "complete" : ""}>
                    {i === 0 ? <Check size={14} /> : i + 1}
                  </span>
                  <p>{t}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : tab === "Partners" ? (
        <div className="panel">
          <h2>The right people around the table.</h2>
          <p>Each partner has a real responsibility in the initiative.</p>
          {[
            [
              "Temple partner",
              "Verified",
              "Access, permissions and on-site coordination",
            ],
            [
              "Waste processing partner",
              "Verified",
              "Responsible processing and weight receipts",
            ],
            [
              "Community / NGO partner",
              "Needed",
              "Community accountability and local mobilisation",
            ],
            [
              "Youth team",
              "Recruiting",
              "Organising, outreach, collection and documentation",
            ],
          ].map(([n, s, r]) => (
            <div className="role-row" key={n}>
              <div>
                <h3>{n}</h3>
                <p>{r}</p>
              </div>
              <Badge tone={s === "Verified" ? "success" : "neutral"}>{s}</Badge>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel">
          <div className="section-heading">
            <h2>People make the plan possible.</h2>
            <Badge>30 roles · 6 responsibilities</Badge>
          </div>
          <Roles />
        </div>
      )}
      <div className="assistance section-gap">
        <div>
          <span className="label">ACTIONOS SUGGESTS</span>
          {editSuggestion ? (
            <input
              aria-label="Edit role suggestion"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
            />
          ) : (
            <p>{suggestion}</p>
          )}
        </div>
        <div className="row">
          {state.suggestion === "pending" ? (
            <>
              <button
                className="secondary"
                onClick={() => {
                  if (!suggestion.trim()) return;
                  update({ suggestion });
                  setEditSuggestion(false);
                  toast("Suggestion added to your operations plan.");
                }}
              >
                {editSuggestion ? "Save" : "Accept"}
              </button>
              <button
                className="text-button"
                onClick={() => setEditSuggestion(!editSuggestion)}
              >
                Edit
              </button>
              <button
                className="text-button"
                onClick={() => update({ suggestion: "dismissed" })}
              >
                Dismiss
              </button>
            </>
          ) : (
            <Badge
              tone={state.suggestion === "dismissed" ? "neutral" : "success"}
            >
              {state.suggestion === "dismissed" ? "Dismissed" : "Added to plan"}
            </Badge>
          )}
        </div>
      </div>
      <div className="assistance">
        <div>
          <span className="label">SUGGESTED SUCCESS METRIC</span>
          {editMetric ? (
            <input
              aria-label="Edit success metric"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
            />
          ) : (
            <p>{state.metric}</p>
          )}
        </div>
        <div className="row">
          <button
            className="secondary"
            onClick={() => {
              if (!metric.trim()) return;
              update({ metric });
              setEditMetric(false);
              toast("Success metric saved in your blueprint.");
            }}
          >
            {editMetric ? "Save metric" : "Use metric"}
          </button>
          <button
            className="text-button"
            onClick={() => setEditMetric(!editMetric)}
          >
            Edit
          </button>
        </div>
      </div>
      <div className="form-actions">
        <button className="secondary" onClick={() => go("/feed")}>
          Return to feed
        </button>
        <button className="primary" onClick={() => go("/workspace")}>
          Open Workspace <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
}
export function Detail({ id }: { id: string }) {
  const { state, update, go, toast } = useApp();
  const project = initiatives.find((p) => p.id === id);
  const [role, setRole] = useState(""),
    [joinedNow, setJoinedNow] = useState(false);
  const close = useCallback(() => setRole(""), []);
  if (!project)
    return (
      <div className="empty">
        <h1>Initiative not found.</h1>
        <button className="primary" onClick={() => go("/feed")}>
          Back to feed
        </button>
      </div>
    );
  const ripple = id === "ripple",
    recommended = recommendedRole(state.profile, project),
    m = roleMatch(state.profile, project, recommended),
    filled = teamCount(state, project);
  return (
    <>
      <button className="back-link" onClick={() => go("/feed")}>
        <ArrowLeft size={15} />
        Back to your feed
      </button>
      <div className="detail-heading">
        <div>
          <div className="row">
            <Badge>{project.cause}</Badge>
            <span className="sdg">SDG {project.sdg}</span>
            {project.verified && (
              <Badge tone="success">Partner validated</Badge>
            )}
          </div>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
          <div className="metadata">
            <span>
              <MapPin size={15} />
              {project.location}
            </span>
            <span>
              <Clock size={15} />
              {project.hours}
            </span>
            <span>
              <Users size={15} />
              {filled} / {project.total} roles filled
            </span>
          </div>
        </div>
        <div className="detail-cover">
          <Cover project={project} />
        </div>
      </div>
      {joinedNow && (
        <div className="success-banner">
          <ShieldCheck size={24} />
          <div>
            <h3>You’re now part of {project.title}.</h3>
            <p>
              {ripple
                ? `${state.joined.ripple}: place confirmed · Team: 19 / 30 → 20 / 30`
                : `Your role: ${state.joined[id]} · Team: ${filled} / ${project.total}`}
            </p>
          </div>
          <button
            className="secondary"
            onClick={() => go(ripple ? "/workspace" : "/my-initiatives")}
          >
            {ripple ? "Open Workspace" : "My Initiatives"}
          </button>
        </div>
      )}
      <div className="detail-layout">
        <section>
          <section className="panel">
            <span className="label">
              {ripple ? "VALIDATED PROBLEM" : "THE COMMUNITY NEED"}
            </span>
            <h3>{ripple ? state.refined : project.goal}</h3>
            <hr />
            <div className="two-columns">
              <div>
                <span className="label">IMPACT TARGET</span>
                <p>
                  {ripple
                    ? "100 kg of floral waste diverted to verified processing."
                    : project.metric}
                </p>
              </div>
              <div>
                <span className="label">PROJECT PARTNER</span>
                <p>{project.partner}</p>
                <Badge tone={project.verified ? "success" : "neutral"}>
                  {project.verified
                    ? "Need validated"
                    : "Validation in progress"}
                </Badge>
              </div>
            </div>
          </section>
          <section className="panel section-gap">
            <div className="section-heading">
              <h2>Room for your contribution.</h2>
              <Badge>{project.total - filled} open roles</Badge>
            </div>
            {ripple ? (
              <Roles joinable onJoin={setRole} />
            ) : (
              project.roles.map((r, i) => (
                <div className="role-row" key={r}>
                  <div>
                    <h3>{r}</h3>
                    <p>
                      {i === 0
                        ? "Support delivery and work directly with participants."
                        : "Help the team plan, communicate and document progress."}
                    </p>
                    <span className="small muted">
                      {project.hours} · {project.skills.join(" · ")}
                    </span>
                  </div>
                  <button
                    className="secondary"
                    disabled={!!state.joined[id]}
                    onClick={() => setRole(r)}
                  >
                    {state.joined[id] ? "Already joined" : "Join role"}
                  </button>
                </div>
              ))
            )}
          </section>
          <section className="panel section-gap">
            <span className="label">PROJECT JOURNEY</span>
            <div className="timeline">
              {timeline.map((t, i) => (
                <div key={t}>
                  <span className={i < 2 ? "complete" : ""}>
                    {i < 2 ? <Check size={13} /> : i + 1}
                  </span>
                  <p>{t}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
        <aside>
          <section className="recommended-role">
            <span className="label">RECOMMENDED ROLE FOR YOU</span>
            <div className="match-large">
              {m.score}
              <span>% match</span>
            </div>
            <h2>{recommended}</h2>
            <hr />
            <h4>Why this fits you</h4>
            {m.reasons.map((r) => (
              <CheckLine key={r}>{r}</CheckLine>
            ))}
            <button
              className="primary full"
              disabled={!!state.joined[id]}
              onClick={() => setRole(recommended)}
            >
              {state.joined[id] ? `Joined as ${state.joined[id]}` : "Join Role"}
              {!state.joined[id] && <ArrowRight size={16} />}
            </button>
            <small>Matched using your profile and this project’s needs.</small>
          </section>
          {ripple && (
            <section className="panel section-gap">
              <span className="label">OTHER WAYS TO CONTRIBUTE</span>
              <button
                className="alternative-role"
                onClick={() => setRole("Field Volunteer")}
                disabled={!!state.joined.ripple}
              >
                <span>Field Volunteer</span>
                <strong>
                  {roleMatch(state.profile, project, "Field Volunteer").score}%
                </strong>
              </button>
              <button
                className="alternative-role"
                onClick={() => setRole("Documentation Volunteer")}
                disabled={!!state.joined.ripple}
              >
                <span>Documentation</span>
                <strong>
                  {
                    roleMatch(state.profile, project, "Documentation Volunteer")
                      .score
                  }
                  %
                </strong>
              </button>
              <button
                className="secondary full"
                onClick={() => go("/workspace")}
              >
                View full project <ArrowUpIcon />
              </button>
            </section>
          )}
        </aside>
      </div>
      {role && (
        <Modal title={`Join ${project.title}`} onClose={close}>
          <div className="join-role-summary">
            <span className="label">YOU’RE JOINING AS</span>
            <h2>{role}</h2>
            <p>
              <Clock size={16} /> Expected commitment:{" "}
              {ripple ? "3 hrs/week" : project.hours}
            </p>
          </div>
          <h3>Your responsibilities</h3>
          {(role === "Outreach Volunteer"
            ? [
                "Volunteer outreach",
                "Community communication",
                "Promotion",
                "Stakeholder follow-up",
              ]
            : role === "Field Volunteer"
              ? [
                  "Collection support",
                  "Segregation",
                  "Basic recording",
                  "On-ground coordination",
                ]
              : [
                  "Support the project team",
                  "Attend orientation",
                  "Maintain accurate records",
                  "Coordinate with the project lead",
                ]
          ).map((r) => (
            <CheckLine key={r}>{r}</CheckLine>
          ))}
          <p className="small muted">
            You choose your commitment. Joining reserves your place in the team
            and adds the initiative to your profile.
          </p>
          <button
            className="primary full"
            onClick={() => {
              update({ joined: { ...state.joined, [id]: role } });
              setRole("");
              setJoinedNow(true);
              toast(`You joined ${project.title}. Welcome to the team.`);
            }}
          >
            Join initiative <ArrowRight size={16} />
          </button>
        </Modal>
      )}
    </>
  );
}
function ArrowUpIcon() {
  return <ArrowRight size={15} />;
}
