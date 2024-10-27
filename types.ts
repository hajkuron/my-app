export interface CalendarEvent {
  id: string;
  version_id: string;
  date: string;
  start: string;
  end: string;
  value: number;
  summary: string;
  description: string;
  calendar_name: string;
  new_date: string;
  new_start: string;
  new_end: string;
  status: string;
  duration: number;
  deleted: boolean;
}
