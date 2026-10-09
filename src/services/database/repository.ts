import { DEMO_COMMENTS, DEMO_CONTENT, type RawComment } from "@/data/demo/comments";
import { KNOWLEDGE_BASE } from "@/data/demo/knowledge-base";
import { LESSONS } from "@/data/demo/lessons";
import { QUIZZES } from "@/data/demo/quizzes";
import { CATEGORIES } from "@/lib/constants/categories";
import type { KnowledgeEntry, LearningModule, Lesson, Quiz, RiskCategory } from "@/types";

/**
 * Content repository contract.
 *
 * `DemoContentRepository` serves seed data with the same shape as the
 * PostgreSQL schema (database/schema.sql). A `PostgresContentRepository`
 * can implement the same interface without touching UI code.
 */
export interface ContentRepository {
  listModules(): LearningModule[];
  listLessons(category?: RiskCategory): Lesson[];
  getLesson(slug: string): Lesson | undefined;
  listQuizzes(): Quiz[];
  getQuiz(id: string): Quiz | undefined;
  listKnowledge(): KnowledgeEntry[];
}

class DemoContentRepository implements ContentRepository {
  listModules() {
    return CATEGORIES;
  }
  listLessons(category?: RiskCategory) {
    return category ? LESSONS.filter((l) => l.category === category) : LESSONS;
  }
  getLesson(slug: string) {
    return LESSONS.find((l) => l.slug === slug);
  }
  listQuizzes() {
    return QUIZZES;
  }
  getQuiz(id: string) {
    return QUIZZES.find((q) => q.id === id);
  }
  listKnowledge() {
    return KNOWLEDGE_BASE;
  }
}

export const contentRepository: ContentRepository = new DemoContentRepository();

/* ------------------------------------------------------------------ */
/* Comment sources for CekJudol                                        */
/* ------------------------------------------------------------------ */

export interface FetchedContent {
  title: string;
  platform: string;
  comments: RawComment[];
  isDemo: boolean;
}

/**
 * Where CekJudol gets comments from. A production implementation would call
 * an official platform API (e.g. YouTube Data API) with proper credentials.
 * Never scrape or moderate a real platform without official permission.
 */
export interface CommentSource {
  fetchComments(url: URL, platform: string): Promise<FetchedContent>;
}

export class DemoCommentSource implements CommentSource {
  async fetchComments(_url: URL, platform: string): Promise<FetchedContent> {
    return { title: DEMO_CONTENT.title, platform, comments: DEMO_COMMENTS, isDemo: true };
  }
}

export function getCommentSource(): CommentSource {
  // Future: return a platform-API backed source when official credentials are configured.
  return new DemoCommentSource();
}
