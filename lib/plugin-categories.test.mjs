import assert from "node:assert/strict";
import test from "node:test";

import { categorizePlugin } from "./plugin-categories.ts";

function plugin(description, topics = []) {
  return {
    manifest: { description },
    repo: { description: null, topics },
  };
}

test("classifies X and Twitter plugin metadata as social", () => {
  const descriptions = [
    "X/Twitter search",
    "Twitter timeline",
    "Search tweets",
    "Follower analytics",
    "Social posting",
    "X API client",
    "X automation",
  ];

  for (const description of descriptions) {
    assert.ok(categorizePlugin(plugin(description)).includes("social"));
  }
});

test("does not classify partial social-provider words", () => {
  assert.ok(
    !categorizePlugin(plugin("Antisocial slackness and contest postings")).includes(
      "social",
    ),
  );
  assert.ok(!categorizePlugin(plugin("Send messages through LINE")).includes("social"));
});
