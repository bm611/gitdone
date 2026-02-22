import { authClient } from "./auth-client";

export function useDisplayName() {
  const { data: session } = authClient.useSession();
  return session?.user?.name || "Guest";
}
