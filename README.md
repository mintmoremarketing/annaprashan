# Smriti's Annaprashan invitation

A static invitation website for 26 December 2026. Open `index.html` directly, or run `python -m http.server 4173` in this folder and visit `http://localhost:4173/`.

The site uses the supplied invitation artwork in `invitation-card.png`. It requires no build step. Google Fonts needs an internet connection; local fallback fonts are provided.

Guests can circle the spoon around the kheer bowl to open the invitation, or use the visible skip button. Arrow keys and Enter work with the opening bowl, and the footer can replay it. The hero responds to scrolling and has gently falling leaves; the date has a scratch reveal; and opening the blessing card releases petals and leaves. Reduced-motion preferences are respected.

The opening plays the family's supplied `tu-hain-toh.mp3` when a guest first stirs or opens the invitation. A music toggle remains in the header. No video is embedded. Browsers require a guest interaction before audio can play.

The card did not specify a ceremony time, so the site does not show one. RSVP was removed at the user's request.
