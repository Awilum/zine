export const layouts = new Map();
export function registerLayout(layout) {
  layouts.set(layout.name, layout);
}
export function getLayout(name) {
  const layout = layouts.get(name);
  if (!layout) throw new Error(`Unknown layout: ${name}`);
  return layout;
}
export function hasLayout(name) {
  return layouts.has(name);
}
export function listLayouts() {
  return [...layouts.keys()];
}
