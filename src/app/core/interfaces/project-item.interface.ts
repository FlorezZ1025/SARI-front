export interface ProjectItem {
  id?: string;
  title: string;
  investigators: string[];
  date: string;
  status: string;
  type?: string;
  evidence?: File;
  evidenceUrl?: string;
}
