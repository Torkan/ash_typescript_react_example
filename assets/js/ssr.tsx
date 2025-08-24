import React from "react";
import { createInertiaApp } from "@inertiajs/react";
import ReactDOMServer from "react-dom/server";

export function render(page: string) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: async (name) => {
      const pages = import.meta.glob("./pages/**/*.tsx", { eager: true });
      return pages[`./pages/${name}.tsx`];
    },
    setup: ({ App, props }) => <App {...props} />,
  });
}
