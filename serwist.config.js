/** @type {import("@serwist/build").InjectManifestOptions} */
const options = {
  globDirectory: "out",
  globPatterns: ["**/*.{json,txt,html,ico,woff2,css,js,png,webp,jpeg,jpg,svg}"],
  globIgnores: ["404.html", "pwa/**"],
  swSrc: "out/sw.js",
  swDest: "out/sw.js",
};

export default options;
