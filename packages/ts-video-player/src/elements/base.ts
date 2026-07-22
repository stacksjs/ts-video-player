/** Browser HTMLElement base with an inert server-side constructor for import-safe SSR. */
export const HTMLElementBase: typeof HTMLElement = globalThis.HTMLElement ?? class {} as typeof HTMLElement
