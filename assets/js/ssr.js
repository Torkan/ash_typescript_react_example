import { createInertiaApp } from "@inertiajs/svelte";
import { mount } from "svelte";

export function render(page) {
  return createInertiaApp({
    page,
    resolve: async (name) => await import(`./pages/${name}.svelte`),
    setup({ el, App }) {
      mount(App, { target: el, hydrate: true });
    },
  });
}
