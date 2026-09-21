// Every write (server actions and the image upload) goes through this.
// ponytail: there is no staff login yet; `?as=owner` is a preview switch, not authentication, so anyone who can
// reach the site could call these endpoints. Writes are allowed in `next dev` only. In production they're refused
// until Discord OAuth is in place: replace this body with "session has the owner role", and delete the env escape hatch.
export function assertCanEdit() {
  if (process.env.NODE_ENV === "development") return;
  if (process.env.CAELUM_ALLOW_UNAUTHENTICATED_EDITS === "1") return;
  throw new Error("Editing is turned off: staff login isn't set up yet.");
}
