import { PlatformType } from "./platform-type";

/**
 * Normalized problem metadata shared across all platforms.
 */
export interface ProblemMetadata {
  platform: PlatformType;

  title: string;

  slug: string;

  difficulty: string;

  language: string;

  url: string;

  tags?: string[];

  solvedAt: Date;
}