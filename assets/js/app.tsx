// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//
// If you have dependencies that try to import CSS, esbuild will generate a separate `app.css` file.
// To load it, simply add a second `<link>` to your `root.html.heex` file.

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import React from "react";

axios.defaults.xsrfHeaderName = "x-csrf-token";

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob("./pages/**/*.tsx", { eager: true });
    return pages[`./pages/${name}.tsx`];
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
});
