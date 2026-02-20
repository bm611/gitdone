import { useUser } from "@clerk/clerk-react";

export function useDisplayName() {
  const { user } = useUser();
  return user?.username || user?.firstName || "Guest";
}
