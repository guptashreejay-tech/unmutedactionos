"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { ArrowRight, Inbox, LoaderCircle } from "lucide-react";
import { Modal } from "../ui";
import { mutate, fileUrl } from "@/lib/supabase";
import type { Json, Row } from "@/lib/database.types";
export type SessionState = {
  user: User | null;
  profile: Row<"profiles"> | null;
  preferences: Row<"profile_preferences"> | null;
  admin: boolean;
  revision: number;
  refresh: () => void;
  toast: (s: string) => void;
};
export const SessionContext = createContext<SessionState>(null!);
export const useSession = () => useContext(SessionContext);
export function useLoad<T>(load: () => Promise<T>, keys: unknown[] = []) {
  const { revision } = useSession();
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([...keys, revision, attempt]);
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    setData(undefined);
    load()
      .then((d) => {
        if (live) setData(d);
      })
      .catch((e) => {
        if (live) setError(e.message ?? "Unable to load this page.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [key]); // Query key explicitly declares the load dependencies.
  return { data, error, loading, retry: () => setAttempt((x) => x + 1) };
}
export function Loading() {
  return (
    <div className="v1-state" role="status">
      <LoaderCircle className="spin" />
      <p>Loading your space…</p>
    </div>
  );
}
export function Empty({
  title = "Nothing here yet",
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className="v1-state">
      <Inbox size={30} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function ErrorBox({
  error,
  retry,
}: {
  error: string;
  retry?: () => void;
}) {
  return (
    <div role="alert" className="v1-error">
      <strong>We couldn’t complete that.</strong>
      <p>{error}</p>
      {retry && (
        <button className="button secondary" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function LoadState({
  query,
  children,
}: {
  query: { loading: boolean; error: string; retry: () => void };
  children: ReactNode;
}) {
  return query.loading ? (
    <Loading />
  ) : query.error ? (
    <ErrorBox error={query.error} retry={query.retry} />
  ) : (
    <>{children}</>
  );
}
export function LinkButton({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  const router = useRouter();
  return (
    <button
      className={`button ${secondary ? "secondary" : "primary"}`}
      onClick={() => router.push(href)}
    >
      {children}
      <ArrowRight size={16} />
    </button>
  );
}
export function Action({
  operation,
  payload = {},
  children,
  secondary = true,
  onDone,
  confirm,
}: {
  operation: string;
  payload?: Record<string, Json | undefined>;
  children: ReactNode;
  secondary?: boolean;
  onDone?: () => void;
  confirm?: string;
}) {
  const { refresh, toast, user } = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <span className="v1-action">
      <button
        disabled={busy}
        className={`button ${secondary ? "secondary" : "primary"}`}
        onClick={async () => {
          if (!user) {
            router.push("/login");
            return;
          }
          if (confirm && !window.confirm(confirm)) return;
          setBusy(true);
          setError("");
          try {
            await mutate(operation, payload);
            refresh();
            toast("Saved");
            onDone?.();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Unable to save");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Saving…" : children}
      </button>
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
export type Field = {
  key: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "checkbox"
    | "email"
    | "password"
    | "date"
    | "multi";
  options?: string[] | { value: string; label: string }[];
  required?: boolean;
  min?: number;
  max?: number;
  help?: string;
  placeholder?: string;
};
export type Values = Record<string, Json | undefined>;
export function Fields({
  fields,
  values,
  setValues,
}: {
  fields: Field[];
  values: Values;
  setValues: (v: Values) => void;
}) {
  return (
    <div className="v1-fields">
      {fields.map((f) => {
        const value = values[f.key];
        const options = (f.options ?? []).map((o) =>
          typeof o === "string" ? { value: o, label: o } : o,
        );
        return (
          <label
            className={`v1-field ${f.type === "textarea" || f.type === "multi" ? "wide" : ""}`}
            key={f.key}
          >
            <span>
              {f.label}
              {f.required ? " *" : ""}
            </span>
            {f.type === "checkbox" ? (
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) =>
                  setValues({ ...values, [f.key]: e.target.checked })
                }
              />
            ) : f.type === "multi" ? (
              <select
                multiple
                value={Array.isArray(value) ? value.map(String) : []}
                onChange={(e) =>
                  setValues({
                    ...values,
                    [f.key]: Array.from(e.target.selectedOptions).map(
                      (o) => o.value,
                    ),
                  })
                }
              >
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === "select" ? (
              <select
                required={f.required}
                value={String(value ?? "")}
                onChange={(e) =>
                  setValues({ ...values, [f.key]: e.target.value })
                }
              >
                <option value="">Choose…</option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === "textarea" ? (
              <textarea
                required={f.required}
                minLength={f.min}
                maxLength={f.max ?? 5000}
                placeholder={f.placeholder}
                value={String(value ?? "")}
                onChange={(e) =>
                  setValues({ ...values, [f.key]: e.target.value })
                }
              />
            ) : (
              <input
                required={f.required}
                type={f.type ?? "text"}
                min={f.min}
                max={f.max}
                maxLength={f.type === "number" ? undefined : (f.max ?? 500)}
                placeholder={f.placeholder}
                value={String(value ?? "")}
                onChange={(e) =>
                  setValues({
                    ...values,
                    [f.key]:
                      f.type === "number"
                        ? e.target.value === ""
                          ? ""
                          : Number(e.target.value)
                        : e.target.value,
                  })
                }
              />
            )}{" "}
            {f.help && <small>{f.help}</small>}
          </label>
        );
      })}
    </div>
  );
}
export function Editor({
  title,
  fields,
  initial = {},
  save,
  onClose,
  description,
}: {
  title: string;
  fields: Field[];
  initial?: Values;
  save: (values: Values) => Promise<unknown>;
  onClose: () => void;
  description?: string;
}) {
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Modal title={title} onClose={onClose}>
      <form
        className="v1-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await save(values);
            onClose();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Unable to save");
          } finally {
            setBusy(false);
          }
        }}
      >
        {description && <p>{description}</p>}
        <Fields fields={fields} values={values} setValues={setValues} />
        {error && <ErrorBox error={error} />}
        <button className="button primary" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </Modal>
  );
}
export function EditAction({
  label,
  title,
  operation,
  fields,
  initial = {},
  description,
  onDone,
}: {
  label: string;
  title?: string;
  operation: string;
  fields: Field[];
  initial?: Values;
  description?: string;
  onDone?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { refresh, toast } = useSession();
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <button className="button secondary" onClick={() => setOpen(true)}>
        {label}
      </button>
      {open && (
        <Editor
          title={title ?? label}
          fields={fields}
          initial={initial}
          description={description}
          onClose={close}
          save={async (v) => {
            const result = await mutate(operation, v);
            refresh();
            toast("Saved");
            onDone?.(result.id);
          }}
        />
      )}
    </>
  );
}
export function FileLink({
  bucket,
  path,
  label = "Open file",
}: {
  bucket: string;
  path: string;
  label?: string;
}) {
  const [error, setError] = useState("");
  return (
    <>
      <button
        className="text-button"
        onClick={async () => {
          setError("");
          try {
            const url = await fileUrl(bucket, path);
            window.open(url, "_blank", "noopener,noreferrer");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Unable to open file");
          }
        }}
      >
        {label} ↗
      </button>
      {error && <span role="alert">{error}</span>}
    </>
  );
}
export const modes = ["In-person", "Online", "Hybrid"];
export const experience = ["Beginner", "Some experience", "Experienced"];
export const formOptions = (list: { id: string | number; name: string }[]) =>
  list.map((r) => ({ value: String(r.id), label: r.name }));
export function Pagination({
  page,
  setPage,
  count,
}: {
  page: number;
  setPage: (p: number) => void;
  count: number;
}) {
  return (
    <div className="v1-actions">
      <button
        className="button secondary"
        disabled={page === 0}
        onClick={() => setPage(page - 1)}
      >
        Previous
      </button>
      <span>Page {page + 1}</span>
      <button
        className="button secondary"
        disabled={count < 24}
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
