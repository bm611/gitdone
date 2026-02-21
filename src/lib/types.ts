export interface GuestHabit {
  id: string;
  name: string;
  color: string;
  category?: string;
  createdAt: number;
  completions: string[];
}
