export interface ArticleItem {
  id?: string;
  title: string;
  date: string;
  hyperlink?: string;
  authors: string[];
  state?: string;
  evidence?: File;
  evidenceUrl?: string;
  editedLink?: boolean;
}
