import { z } from "zod";

/**
 * Runtime validation schema for CodeSyncVault settings.
 */
export const settingsSchema = z.object({
	githubToken: z.string(),

	repositoryOwner: z.string().trim(),

	repositoryName: z.string().trim(),

	defaultBranch: z.string().default("main"),

	autoPush: z.boolean(),

	autoReadme: z.boolean(),

	retryFailedUploads: z.boolean(),
});

/**
 * Type inferred from the Zod schema.
 */
export type SettingsSchema = z.infer<typeof settingsSchema>;
