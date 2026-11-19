# Localization: Deutsch, English, 한국어

## Selection

Supported language codes are `de`, `en` and `ko`. A saved `frame-language` preference wins. Otherwise the app checks the ordered browser/device language list (regional codes such as `de-AT` or `ko-KR` are normalized). Unsupported languages fall back to English.

The normal header and shooting Options sheet provide the same language selector. Switching updates visible text, document language/title, accessibility labels, placeholders and the selected values without replacing buttons or restarting the camera. A reload preserves the choice.

Speech uses `de-DE`, `en-US` or `ko-KR`, selects a matching installed voice when available and cancels the previous utterance on language changes. Actual voice availability depends on the device. Text guidance remains usable without speech.

## Catalog and presentation adapter

`dist/translations.js` maps stable English source strings to German and Korean translations. `dist/i18n.js` handles dynamic metric amounts, direction, timers, burst labels, quality summaries, pose labels and horizon angles.

The geometric engine continues to return English source messages for deterministic analysis/tests. A DOM presentation adapter translates text nodes and selected attributes (`aria-label`, `alt`, `title`, `placeholder`). It writes text, never translated HTML. A WeakMap retains each node's original source so repeated language switches do not translate a translation. MutationObserver processes newly rendered content and disconnects during its own writes to avoid feedback loops. Controls and event handlers are preserved.

Exact catalog matches have priority. Dynamic templates preserve numbers and actor/direction; German decimal meters use a comma. Composed instructions translate known complete phrases. Unknown strings fall back to their source text and must be reviewed when adding a feature.

## Add or change a message

1. Use a stable source string in the interface or engine.
2. Add German and Korean entries in `translations.js`; keep keys unique.
3. For interpolated data, add a narrowly scoped template in `translateText` rather than arbitrary word replacement.
4. Add a meaningful localization test, especially for directions, amounts and error paths.
5. Run `npm test` and check the affected screen at mobile width in all languages.
6. Keep proper names, units, model IDs and language self-names unchanged.

Do not translate CSS selectors, IDs, data attributes, state values or storage keys. Do not use HTML from translation entries.

## Native localization

The web interface is identical in both native shells. iOS `InfoPlist.strings` localizes camera/photo permission explanations in `en.lproj`, `de.lproj` and `ko.lproj`; all are registered in the Xcode project. Android's permission prompts are provided by the OS, and localized resource folders retain the FRAME display name.

If native alerts/screens are added later, they must receive equivalent native resource translations. Store descriptions/screenshots are separate release assets, not automatically translated app UI.

## Review boundaries

The authored translations have automated structural and dynamic-value checks and browser visual QA. This does not substitute for a full linguistic review by independent native speakers, or for native screen-reader/voice testing on hardware.
