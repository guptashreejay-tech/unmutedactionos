import { test, expect } from "@playwright/test";
test("complete presentation journey, persistence, verification, and reset", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: "Your Impact Feed", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("92% match for you")).toBeVisible();
  await page.screenshot({ path: "screenshots/01-feed.png", fullPage: true });
  await expect(
    page.getByRole("link", { name: "Learn about UNMUTED" }),
  ).toHaveAttribute("href", "https://unmutedofficial.vercel.app/");
  await expect(
    page.getByRole("link", { name: "Learn about UNMUTED" }),
  ).toHaveAttribute("target", "_blank");
  await page
    .getByRole("button", { name: "View your Impact Profile", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your Impact Profile" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Create initiative", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "What have you noticed?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "What you’re assuming" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Validate the need" }).click();
  await expect(
    page.getByRole("heading", { name: "Validate before you build." }),
  ).toBeVisible();
  await page.screenshot({
    path: "screenshots/02-validation.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Accept refined problem" }).click();
  await expect(page.getByText("Need validated", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Partners", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Waste processing partner" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Team roles", exact: true }).click();
  await page.getByText("Why are 20 field volunteers needed?").click();
  await expect(page.getByText("volunteers per point")).toBeVisible();
  await page.getByRole("button", { name: "Return to feed" }).click();
  await page.getByLabel("Viewing as").selectOption("Contributor");
  await page
    .getByRole("button", { name: "Project Ripple", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Project Ripple", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Join Role", exact: true })
    .last()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("button", { name: "Join initiative", exact: true })
    .click();
  await expect(
    page.getByText("You’re now part of Project Ripple."),
  ).toBeVisible();
  await expect(
    page.getByText("20 / 30 roles filled", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Open Workspace", exact: true })
    .click();
  await expect(page.getByText("74%", { exact: true })).toBeVisible();
  await expect(page.getByText("10 team positions unfilled")).toBeVisible();
  await page.screenshot({
    path: "screenshots/03-workspace.png",
    fullPage: true,
  });
  for (const tab of [
    "Team",
    "Partners",
    "Tasks",
    "Permissions",
    "Resources",
    "Evidence",
    "Impact",
    "Overview",
  ]) {
    await page.getByRole("button", { name: tab, exact: true }).click();
    await expect(page.locator("main")).not.toBeEmpty();
  }
  await page
    .getByRole("button", { name: "Execution Mode", exact: true })
    .click();
  await page.getByRole("button", { name: /5 collection records/ }).click();
  await expect(page.getByRole("dialog")).toContainText("87 kg");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Submit for verification" }).click();
  await expect(
    page.getByText("Evidence is ready for partner review."),
  ).toBeVisible();
  await page.getByLabel("Viewing as").selectOption("Partner");
  await page
    .getByRole("button", { name: "Verify Impact", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Intention became impact." }),
  ).toBeVisible();
  await page.screenshot({
    path: "screenshots/04-verified.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "View my Impact Portfolio" }).click();
  await expect(
    page.getByText("Verified outcome", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".portfolio-stats>div").nth(2)).toContainText("3");
  await page.reload();
  await expect(
    page.getByText("Verified outcome", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Viewing as")).toHaveValue("Student");
  await page
    .getByRole("button", { name: "Post impact update", exact: true })
    .click();
  await page.getByLabel("What happened?").fill("Our first pilot is complete.");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Post impact update" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Our first pilot is complete." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset demo", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your Impact Feed" }),
  ).toBeVisible();
  await page.reload();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("actionos-demo-v1")!),
  );
  expect(stored.verification).toBe("unsubmitted");
  expect(stored.joined.ripple).toBeUndefined();
  expect(stored.updates).toEqual([]);
  expect(errors).toEqual([]);
});
test("onboarding, discovery filters, saves, and partner-posted need", async ({
  page,
}) => {
  await page.goto("/demo/onboarding");
  await page.getByRole("button", { name: "Environment", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Location", { exact: true }).fill("Mysuru");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Find my next step" }).click();
  await expect(
    page.getByRole("heading", { name: "Your Impact Feed" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Save Project Ripple", exact: true })
    .click();
  await page.getByRole("button", { name: "Saved (1)", exact: true }).click();
  await expect(page.locator(".initiative-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Discover", exact: true }).click();
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.getByLabel("Cause", { exact: true }).selectOption("Environment");
  await expect(page.locator(".initiative-card")).toHaveCount(1);
  await page.getByLabel("Mode", { exact: true }).selectOption("Online");
  await expect(
    page.getByRole("heading", { name: "No initiatives match just yet." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear all filters", exact: true })
    .click();
  await expect(page.locator(".initiative-card")).toHaveCount(5);
  await page.getByLabel("Viewing as").selectOption("Partner");
  await page.getByRole("button", { name: "Post a Need", exact: true }).click();
  await page.getByRole("button", { name: "Post verified need" }).click();
  await page.getByRole("button", { name: "Discover", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "We work with 80 children and need a structured six-week spoken-English programme.",
    }),
  ).toBeVisible();
});
test("alternate verification decisions and responsive routes", async ({
  page,
}) => {
  await page.goto("/demo/execution");
  await page.getByRole("button", { name: "Submit for verification" }).click();
  await page.getByLabel("Viewing as").selectOption("Partner");
  await page
    .getByRole("button", { name: "Request clarification", exact: true })
    .click();
  await page.getByRole("button", { name: "Record decision" }).click();
  await expect(
    page.getByText("Clarification requested", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Partially verify", exact: true })
    .click();
  await page.getByLabel("Confirmed weight (kg)").fill("70");
  await page.getByRole("button", { name: "Record decision" }).click();
  await expect(
    page.getByText("Partially verified", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Verify Impact", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Intention became impact." }),
  ).toBeVisible();
  const paths = [
    "/demo",
    "/discover",
    "/create",
    "/blueprint",
    "/initiative/ripple",
    "/initiative/digital",
    "/initiative/animals",
    "/initiative/access",
    "/initiative/books",
    "/my-initiatives",
    "/workspace",
    "/execution",
    "/partner",
    "/verified",
    "/profile",
    "/onboarding",
  ];
  for (const path of paths) {
    await page.goto("/demo" + path);
    await expect(page.locator("main h1").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    "/demo",
    "/profile",
    "/workspace",
    "/execution",
    "/partner",
    "/create",
    "/blueprint",
    "/initiative/ripple",
    "/discover",
    "/verified",
  ]) {
    await page.goto("/demo" + path);
    await expect(page.locator("main h1").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      path,
    ).toBe(true);
  }
  await page.goto("/demo");
  await page.screenshot({ path: "screenshots/05-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("button", { name: "Discover", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Small steps. Shared purpose." }),
  ).toBeVisible();
});
test("runtime loads without any external network requests", async ({
  page,
}) => {
  const external: string[] = [];
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(process.env.TEST_URL || "http://localhost:3000").origin) {
      external.push(url.href);
      return route.abort();
    }
    return route.continue();
  });
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: "Your Impact Feed" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Create initiative", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "What have you noticed?" }),
  ).toBeVisible();
  expect(external).toEqual([]);
});

