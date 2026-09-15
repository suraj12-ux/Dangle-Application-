# Dangle

A critter that hangs off your macOS menu bar and swings on a rope. Grab it and fling it.

## Run it

```bash
cd dangle-mac
npm install
npm start
```

A 🐈 appears in your menu bar. Use it to switch critters, recenter, or quit.

## Build a real .app

```bash
npm run dist
```

Output lands in `dist/`: a `.dmg` and a `.app`. Drag the `.app` into `/Applications`.

The app is unsigned, so the first launch is blocked by Gatekeeper. Right-click the
app → **Open** → **Open** in the dialog. You only do this once. To distribute it to
other people properly you need an Apple Developer account ($99/yr) for signing and
notarization — set `CSC_NAME` and `APPLE_ID` env vars and electron-builder handles
the rest.

## Launch at login

System Settings → General → Login Items → **+** → pick Dangle.

Or in `main.js`, inside `app.whenReady()`:

```js
app.setLoginItemSettings({ openAtLogin: true });
```

## How the overlay works

Three window flags do the heavy lifting:

- `transparent: true` + `frame: false` — no background, no title bar, just the canvas.
- `setAlwaysOnTop(true, 'screen-saver')` + `setVisibleOnAllWorkspaces` — floats above
  every window and follows you across Spaces and full-screen apps.
- `setIgnoreMouseEvents(true, { forward: true })` — clicks pass straight through to
  whatever is underneath, *but* mouse moves still reach the renderer. The renderer
  checks whether the cursor is within 62px of the critter and messages the main
  process to flip click-through off, so only the critter is grabbable. Without this,
  a full-screen transparent window would eat every click on your desktop.

`app.dock.hide()` plus `LSUIElement: true` keeps it out of the Dock and Cmd-Tab.

## Things to add

- Climb the rope on double-click.
- Snap to the real cursor when it gets close.
- Read the frontmost app name via AppleScript and react to it.
- Multiple critters on separate ropes.
