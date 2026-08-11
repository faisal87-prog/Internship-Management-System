import type { User } from "@/types";

export function fullName(user: Pick<User, "firstName" | "lastName"> | null | undefined): string {
  if (!user) return "";
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
}
