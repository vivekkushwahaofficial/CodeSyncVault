/**
 * Represents all user-configurable settings
 * for the CodeSyncVault extension.
 */
export interface Settings {
	/**
	 * GitHub Personal Access Token
	 */
	githubToken: string;

	/**
	 * GitHub username or organization
	 */
	repositoryOwner: string;

	/**
	 * GitHub repository name
	 */
	repositoryName: string;

	/**
	 * Default Git branch
	 */
	defaultBranch: string;

	/**
	 * Automatically push accepted solutions
	 */
	autoPush: boolean;

	/**
	 * Automatically update README
	 */
	autoReadme: boolean;

	/**
	 * Retry failed uploads automatically
	 */
	retryFailedUploads: boolean;
}

/**
 * Default settings used when the extension
 * is installed for the first time.
 */
export const DEFAULT_SETTINGS: Settings = {
	githubToken: "",
	repositoryOwner: "",
	repositoryName: "",
	defaultBranch: "main",
	autoPush: true,
	autoReadme: true,
	retryFailedUploads: true,
};
