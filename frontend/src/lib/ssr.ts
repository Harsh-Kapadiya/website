// Build-time pre-render state (see src/entry-server.tsx). In the browser
// `active` stays false and none of this is used.
type Tag = ['meta' | 'link', Record<string, string>, string, string];

export const ssr = {
  active: false,
  data: new Map<string, unknown>(), // query key → rows, shared across pages
  pending: new Map<string, () => Promise<unknown>>(), // queries asked for this pass
  used: new Set<string>(), // keys this page read (embedded for the browser)
  meta: null as null | { title: string; tags: Tag[] },
  jsonld: new Map<string, string>(),
};
export type { Tag };
