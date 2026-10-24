"use client";
import {
  ArrowRight,
  Check,
  X,
  ShieldCheck,
  MapPin,
  Clock,
  Bookmark,
  Flower2,
  BookOpen,
  PawPrint,
  Route,
} from "lucide-react";
import { useEffect, useRef } from "react";
import type { Initiative, State } from "@/lib/data";
import { match, teamCount } from "@/lib/logic";
export const Arrow = () => <ArrowRight size={17} />;
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <span className={`badge ${tone}`}>
      {tone === "success" && <ShieldCheck size={13} />} {children}
    </span>
  );
}
export function Title({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Progress({ value }: { value: number }) {
  return (
    <div className="progress">
      <span style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}
export function CheckLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="check-line">
      <Check size={15} />
      <span>{children}</span>
    </div>
  );
}
export function Cover({
  project,
  large = false,
}: {
  project: Initiative;
  large?: boolean;
}) {
  const Icon =
    project.id === "ripple"
      ? Flower2
      : project.id === "animals"
        ? PawPrint
        : project.id === "access"
          ? Route
          : BookOpen;
  return (
    <div className={`cover cover-${project.image} ${large ? "large" : ""}`}>
      <div className="cover-grain" />
      <span className="cover-caption">
        {project.id === "ripple"
          ? "SMALL ACTIONS. RIPPLE EFFECTS."
          : project.id === "digital"
            ? "CONFIDENCE STARTS WITH CONNECTION."
            : project.id === "animals"
              ? "CARE BEYOND OURSELVES."
              : project.id === "access"
                ? "A CITY THAT INCLUDES EVERYONE."
                : "A NEW CHAPTER, TOGETHER."}
      </span>
      <Icon className="cover-symbol" strokeWidth={0.8} />
      <span className="cover-bottom">
        {project.cause}
        <span>01 — ACTION IN MOTION</span>
      </span>
    </div>
  );
}
export function InitiativeCard({
  project,
  state,
  onOpen,
  onSave,
}: {
  project: Initiative;
  state: State;
  onOpen: () => void;
  onSave: () => void;
}) {
  const m = match(state.profile, project),
    filled = teamCount(state, project);
  return (
    <article className="initiative-card">
      <div className="card-cover">
        <Cover project={project} />
        <button
          className={`save-button ${state.saved.includes(project.id) ? "saved" : ""}`}
          onClick={onSave}
          aria-label={`${state.saved.includes(project.id) ? "Unsave" : "Save"} ${project.title}`}
        >
          <Bookmark
            size={17}
            fill={state.saved.includes(project.id) ? "currentColor" : "none"}
          />
        </button>
        <span className="match-badge">{m.score}% match for you</span>
      </div>
      <div className="card-body">
        <div className="row between">
          <span className="eyebrow">{project.cause}</span>
          <span className="sdg">SDG {project.sdg}</span>
        </div>
        <h2>
          <button onClick={onOpen}>{project.title}</button>
        </h2>
        <p>{project.description}</p>
        <div className="metadata">
          <span>
            <MapPin size={13} />
            {project.location}
          </span>
          <span>
            <Clock size={13} />
            {project.hours.replace("hours/week", "hrs/wk")}
          </span>
        </div>
        <div className="team-line">
          <span>
            <strong>{filled}</strong> / {project.total} roles filled
          </span>
          <span>{project.stage}</span>
        </div>
        <Progress value={(filled / project.total) * 100} />
        <div className="roles-preview">
          <span className="label">CURRENTLY NEEDED</span>
          <div className="chips">
            {project.roles.map((r, i) => (
              <span key={r}>
                {project.id === "ripple"
                  ? [8, state.joined.ripple ? 1 : 2, 1][i]
                  : ""}{" "}
                {r}
              </span>
            ))}
          </div>
        </div>
        <div className="card-footer">
          <span className={project.verified ? "verified-text" : "muted"}>
            {project.verified ? <ShieldCheck size={14} /> : <Clock size={14} />}{" "}
            {project.verified ? "Partner validated" : "Validation in progress"}
          </span>
          <button className="text-button" onClick={onOpen}>
            View initiative <Arrow />
          </button>
        </div>
      </div>
    </article>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    const el = ref.current;
    el?.querySelector<HTMLElement>("button,input,select,textarea")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const items = el?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input,select,textarea,a[href]",
        );
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = "";
      before?.focus();
    };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="row between">
          <h2>{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
