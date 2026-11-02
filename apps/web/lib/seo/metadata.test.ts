import assert from "node:assert/strict";
import test from "node:test";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

test("publica solo la home en el sitemap (la agenda vive en la landing)", () => {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://todocarnes.cl").replace(/\/$/, "");
  const urls = sitemap().map((entry) => entry.url);
  assert.deepEqual(urls, [origin]);
});

test("robots permite indexar y declara sitemap", () => {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://todocarnes.cl").replace(/\/$/, "");
  const value = robots();
  assert.deepEqual(value.rules, { userAgent: "*", allow: ["/"] });
  assert.equal(value.sitemap, `${origin}/sitemap.xml`);
});
