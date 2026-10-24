"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Compass, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { Title, Badge } from "../ui";
import { client, mutate, rows, upload } from "@/lib/supabase";
import { saveProfileWithOptionalImage } from "@/lib/profile-save";
import {
  useSession,
  useLoad,
  LoadState,
  Fields,
  ErrorBox,
  LinkButton,
  formOptions,
  modes,
  experience,
  type Values,
  type Field,
  FileLink,
  EditAction,
  Action,
  Empty,
} from "./shared";
export function Connection() {
  return (
    <div className="v1-connection">
      <div className="v1-connection-art">
        <span className="eyebrow">ACTIONOS / BY UNMUTED</span>
        <h1>
          Turn care
          <br />
          into change.
        </h1>
        <p>
          A shared space to discover a need, build a team, and prove what
          changed.
        </p>
        <div className="v1-pill">Human-led · Partner-verified</div>
      </div>
      <div className="v1-connection-copy">
        <Badge tone="warning">Connection pending</Badge>
        <h2>Your ActionOS space is ready to connect.</h2>
        <p>
          The app needs the public connection settings for your “action os”
          Supabase project before accounts and initiatives can be saved.
        </p>
        <p>
          Open your project’s <strong>Connect</strong> dialog and share its
          project URL and publishable key in this chat.
        </p>
        <small>No sample accounts or results are shown as real activity.</small>
      </div>
    </div>
  );
}
export function Auth({
  mode,
}: {
  mode: "login" | "signup" | "forgot-password" | "reset-password";
}) {
  const router = useRouter();
  const { refresh } = useSession();
  const [values, setValues] = useState<Values>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [google, setGoogle] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) =>
        setGoogle(
          (d as { external?: { google?: boolean } }).external?.google === true,
        ),
      )
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const labels = {
    login: "Welcome back.",
    signup: "Make room for meaningful action.",
    "forgot-password": "Reset your password.",
    "reset-password": "Choose a new password.",
  };
  const fields: Field[] = [
    ...(mode !== "reset-password"
      ? [
          {
            key: "email",
            label: "Email",
            type: "email" as const,
            required: true,
          },
        ]
      : []),
    ...(mode !== "forgot-password"
      ? [
          {
            key: "password",
            label: mode === "reset-password" ? "New password" : "Password",
            type: "password" as const,
            required: true,
            help: mode === "signup" ? "Use at least 12 characters." : undefined,
          },
        ]
      : []),
  ];
  return (
    <div className="v1-auth">
      <div>
        <span className="eyebrow">INTENTION → ACTION → IMPACT</span>
        <h1>{labels[mode]}</h1>
        <p>Find your people. Build something that matters.</p>
        <div className="v1-auth-points">
          <p>
            <Compass /> Discover a need that matters to you.
          </p>
          <p>
            <Users /> Give your time and skills a purpose.
          </p>
          <p>
            <ShieldCheck /> Share outcomes a partner can stand behind.
          </p>
        </div>
      </div>
      <form
        className="v1-panel v1-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          setMessage("");
          try {
            const email = String(values.email ?? "");
            const password = String(values.password ?? "");
            if (
              (mode === "signup" || mode === "reset-password") &&
              password.length < 12
            )
              throw new Error("Use a password with at least 12 characters.");
            const callback = `${location.origin}/auth/callback`;
            if (mode === "login") {
              const { error } = await client().auth.signInWithPassword({
                email,
                password,
              });
              if (error) throw error;
              refresh();
              router.push("/feed");
            } else if (mode === "signup") {
              const { data, error } = await client().auth.signUp({
                email,
                password,
                options: { emailRedirectTo: callback },
              });
              if (error) throw error;
              if (data.session) {
                refresh();
                router.push("/onboarding");
              } else
                setMessage(
                  "Check your email to confirm your account, then return to complete your profile.",
                );
            } else if (mode === "forgot-password") {
              const { error } = await client().auth.resetPasswordForEmail(
                email,
                { redirectTo: `${callback}?next=/reset-password` },
              );
              if (error) throw error;
              setMessage(
                "If an account uses this email, you’ll receive a password reset link.",
              );
            } else {
              const { error } = await client().auth.updateUser({ password });
              if (error) throw error;
              setMessage("Your password has been updated.");
            }
          } catch (e) {
            setError(e instanceof Error ? e.message : "Unable to continue");
          } finally {
            setBusy(false);
          }
        }}
      >
        <h2>
          {mode === "signup"
            ? "Create your account"
            : mode === "login"
              ? "Sign in"
              : "Password recovery"}
        </h2>
        <Fields fields={fields} values={values} setValues={setValues} />
        {error && <ErrorBox error={error} />}{" "}
        {message && (
          <p role="status" className="v1-success">
            {message}
          </p>
        )}
        <button className="button primary" disabled={busy}>
          {busy
            ? "Please wait…"
            : mode === "login"
              ? "Sign in"
              : mode === "signup"
                ? "Create account"
                : mode === "forgot-password"
                  ? "Send reset link"
                  : "Update password"}
          <ArrowRight size={16} />
        </button>
        {google && (mode === "login" || mode === "signup") && (
          <button
            type="button"
            className="button secondary"
            onClick={async () => {
              const { error } = await client().auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: location.origin + "/auth/callback" },
              });
              if (error) setError(error.message);
            }}
          >
            Continue with Google
          </button>
        )}
        <div className="v1-actions">
          <button
            type="button"
            className="text-button"
            onClick={() =>
              router.push(mode === "signup" ? "/login" : "/signup")
            }
          >
            {mode === "signup"
              ? "Already have an account? Sign in"
              : "Create an account"}
          </button>
          <button
            type="button"
            className="text-button"
            onClick={() => router.push("/forgot-password")}
          >
            Forgot password?
          </button>
        </div>
      </form>
    </div>
  );
}
export function ProfileEditor() {
  const { profile, preferences, user, refresh, toast } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(profile?.onboarding_completed ? 3 : 0);
  const [values, setValues] = useState<Values>({
    ...profile,
    ...preferences,
    account_type: profile?.account_type ?? "individual",
    experience_level: profile?.experience_level ?? "Beginner",
    hours: preferences?.hours ?? 3,
    days: preferences?.days ?? "Weekends",
    mode: preferences?.mode ?? "Hybrid",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [avatar, setAvatar] = useState<File>();
  const [imageInputVersion, setImageInputVersion] = useState(0);
  const q = useLoad(
    async () => ({
      causes: await rows("causes", { order: "name", limit: 100 }),
      skills: await rows("skills", { order: "name", limit: 100 }),
    }),
    [],
  );
  const intro = [
    {
      title: "Discover where you can help.",
      body: "Find community needs and initiatives that fit your causes, skills, and time.",
      icon: Compass,
    },
    {
      title: "Turn intention into action.",
      body: "Join a clear role or build a team. Agree on permissions, resources, and a plan before getting started.",
      icon: Users,
    },
    {
      title: "Prove what changed.",
      body: "Record the outcome, share evidence, and ask an independent organisation to verify it. Participation and verified impact stay distinct.",
      icon: ShieldCheck,
    },
  ];
  if (step < 3) {
    const s = intro[step];
    return (
      <div className="v1-intro">
        <span className="eyebrow">A LITTLE ORIENTATION / {step + 1} OF 3</span>
        <s.icon size={64} strokeWidth={1} />
        <h1>{s.title}</h1>
        <p>{s.body}</p>
        <div className="v1-actions">
          <button className="button primary" onClick={() => setStep(step + 1)}>
            {step === 2 ? "Build my impact profile" : "Next"}{" "}
            <ArrowRight size={16} />
          </button>
          <button className="text-button" onClick={() => setStep(3)}>
            Skip introduction
          </button>
        </div>
      </div>
    );
  }
  const fields: Field[] = [
    { key: "display_name", label: "Display name", required: true, max: 100 },
    {
      key: "username",
      label: "Username",
      required: true,
      max: 40,
      help: "3–40 lowercase letters, numbers, underscores, or hyphens.",
    },
    {
      key: "account_type",
      label: "I am joining as",
      type: "select",
      options: [
        { value: "individual", label: "Individual" },
        { value: "organisation", label: "Organisation representative" },
      ],
      required: true,
    },
    {
      key: "city",
      label: "City",
      required: true,
      help: "Only your city is public. Never enter an exact address.",
    },
    { key: "bio", label: "A little about you", type: "textarea", max: 1000 },
    {
      key: "causes",
      label: "Causes you care about (up to 5)",
      type: "multi",
      options: formOptions(q.data?.causes ?? []),
    },
    {
      key: "skills",
      label: "Skills you can share",
      type: "multi",
      options: formOptions(q.data?.skills ?? []),
    },
    {
      key: "contributions",
      label: "Ways you want to contribute",
      type: "multi",
      options: [
        "Hands-on volunteering",
        "Planning",
        "Teaching",
        "Research",
        "Creative work",
        "Partner support",
      ],
    },
    {
      key: "hours",
      label: "Hours available each week",
      type: "number",
      min: 1,
      max: 40,
      required: true,
    },
    {
      key: "days",
      label: "Preferred days",
      type: "select",
      options: ["Weekdays", "Weekends", "Flexible"],
      required: true,
    },
    {
      key: "mode",
      label: "Preferred mode",
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
      key: "notifications_enabled",
      label: "Receive in-app notifications",
      type: "checkbox",
    },
  ];
  return (
    <>
      <Title
        eyebrow="YOUR IMPACT PROFILE"
        title={
          profile?.onboarding_completed
            ? "Make this space yours."
            : "Start with what you care about."
        }
        description="Your availability is private and helps match you with the right roles."
      />
      <LoadState query={q}>
        <form
          className="v1-panel v1-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              if (Array.isArray(values.causes) && values.causes.length > 5)
                throw new Error("Choose up to five causes.");
              const result = await saveProfileWithOptionalImage(values, avatar, {
                save: (payload) => mutate("profile.save", payload),
                uploadAvatar: (file) => upload("avatars", [user!.id], file),
              });
              refresh();
              toast(result.imageWarning ?? "Your profile is saved");
              router.push(
                values.account_type === "organisation" && !profile
                  ? "/partner"
                  : "/feed",
              );
            } catch (e) {
              setError(e instanceof Error ? e.message : "Unable to save");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Fields fields={fields} values={values} setValues={setValues} />
          <label className="v1-field">
            Profile image — optional (JPG, PNG, WebP · 2 MB)
            <input
              key={imageInputVersion}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setAvatar(e.target.files?.[0])}
            />
            <small>You can save your profile without an image and add one later.</small>
          </label>
          {avatar && (
            <button type="button" className="text-button" onClick={() => { setAvatar(undefined); setImageInputVersion(v => v + 1); }}>
              Remove selected image
            </button>
          )}
          {error && <ErrorBox error={error} />}
          <div className="v1-actions">
            <button className="button primary" disabled={busy}>
              {busy ? "Saving…" : "Save impact profile"}
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => setStep(0)}
            >
              Replay introduction
            </button>
          </div>
        </form>
      </LoadState>
    </>
  );
}
export function PublicProfile({ username }: { username: string }) {
  const { user } = useSession();
  const q = useLoad(async () => {
    const profile = (await rows("profiles", { eq: { username }, limit: 1 }))[0];
    if (!profile) throw new Error("Profile not found.");
    const initiatives = await rows("initiatives", {
      eq: { creator_id: profile.id },
    });
    const posts = await rows("impact_posts", { eq: { author_id: profile.id } });
    return { profile, initiatives, posts };
  }, [username]);
  return (
    <LoadState query={q}>
      {q.data && (
        <>
          <Title
            eyebrow="IMPACT PROFILE"
            title={q.data.profile.display_name}
            description={`${q.data.profile.city} · @${q.data.profile.username}`}
          />
          <div className="v1-panel">
            <p>{q.data.profile.bio}</p>
            <div className="v1-actions">
              {q.data.profile.causes.map((c) => (
                <Badge key={c}>{c}</Badge>
              ))}
            </div>
            <p>
              Skills: {q.data.profile.skills.join(", ") || "Not shared yet"}
            </p>
            {q.data.profile.avatar_path && (
              <FileLink
                bucket="avatars"
                path={q.data.profile.avatar_path}
                label="View profile image"
              />
            )}
            {user?.id !== q.data.profile.id && (
              <Action
                operation="follow.toggle"
                payload={{ user_id: q.data.profile.id }}
              >
                Follow / unfollow
              </Action>
            )}
            <EditAction
              label="Report profile"
              operation="report.create"
              initial={{ target_type: "profile", target_id: q.data.profile.id }}
              fields={[
                {
                  key: "reason",
                  label: "Reason",
                  type: "select",
                  options: [
                    "Spam",
                    "Misleading",
                    "Unsafe",
                    "Harassment",
                    "Other",
                  ],
                  required: true,
                },
                { key: "details", label: "Details", type: "textarea" },
              ]}
            />
          </div>
          <h2>Initiatives led</h2>
          {q.data.initiatives.length ? (
            q.data.initiatives.map((i) => (
              <div className="v1-panel" key={i.id}>
                <h3>{i.title}</h3>
                <Badge
                  tone={
                    ["VERIFIED", "COMPLETED"].includes(i.status)
                      ? "success"
                      : "neutral"
                  }
                >
                  {i.status}
                </Badge>
                <p>{i.summary}</p>
                <LinkButton href={`/initiatives/${i.slug}`}>
                  View initiative
                </LinkButton>
              </div>
            ))
          ) : (
            <Empty>No public initiatives yet.</Empty>
          )}
          <h2>Participation updates</h2>
          {q.data.posts.map((p) => (
            <div className="v1-panel" key={p.id}>
              <Badge>{p.kind}</Badge>
              <p>{p.body}</p>
            </div>
          ))}
        </>
      )}
    </LoadState>
  );
}
