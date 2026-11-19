# Development notes

Use the locked dependencies, run `npm run build`, `npm test` and `npm run check`, and document real validation. Keep camera permission independent of model loading. Preserve visible-crop/mirror geometry and suppress unreliable distance values. Do not invent depth measurements, identity recognition or aesthetic scores.

Every user-facing source message needs German and Korean catalog coverage. Dynamic directions, actors and metric quantities require tests. Keep the language-neutral engine deterministic; translate in the presentation layer.

After web changes, update asset/cache versions together and run `npx cap sync`. Do not commit generated native `public/` copies, local SDK paths, node_modules, certificates, keystores, gallery files or private camera fixtures.

Native changes need successful platform builds and real-device validation appropriate to their scope. A simulator screenshot does not prove physical camera access. Describe known gaps in release notes rather than marking them passed.

This repository's public visibility does not itself grant an open-source license for the project's original code. Consult the owner before redistributing it. Third-party licenses remain applicable.
