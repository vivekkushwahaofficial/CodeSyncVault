import { readRepositoryFile } from "../github/services/github-repository-reader";

import { parseRepositoryIndex } from "../repository-engine/metadata-index";
import type { RepositoryIndex } from "../repository-engine/types";

export async function readRepositoryIndex(): Promise<RepositoryIndex> {
  const content =
    await readRepositoryFile(
      ".codevault/index.json",
    );

  return parseRepositoryIndex(content);
}
