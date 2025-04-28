import { ArticleItem } from "./article-item.interface";

export interface ArticlesResponse {
    articles?: ArticleItem[];
    message: string;
    statusCode: number;
}