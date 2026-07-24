/** A user of the app — display name + app-generated join code (no real passwords). */
export interface User {
  id: string;
  name: string;
  joinCode: string;
  isAdmin: boolean;
  createdAt: number;
}
