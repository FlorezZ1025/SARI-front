export interface ProjectItem {
  id?: string;
  title: string;
  investigators: string[];
  date: string;
  status: string;
  type?: string;
  formulatedType?: string;
  evidence?: File;
  supportUrl?: string;
}
