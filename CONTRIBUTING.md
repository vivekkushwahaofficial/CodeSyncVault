# Contributing to CodeVault

Thank you for your interest in contributing to CodeVault.

CodeVault welcomes contributions that improve the project's functionality, reliability, security, performance, documentation, and overall developer experience.

## Contribution Process

Contributions should generally follow this workflow:

```text
Fork
  ↓
Sync with develop
  ↓
Create Branch
  ↓
Implement Changes
  ↓
Test
  ↓
Commit
  ↓
Push
  ↓
Open Pull Request → develop
  ↓
Code Review
  ↓
Merge
````

## 1. Fork the Repository

Create a fork of the official CodeVault repository and use your fork for development.

Forks are intended to facilitate development, experimentation, review, and contributions to the CodeVault project.

Before creating a working branch, make sure your local repository is up to date with the project's `develop` branch.

## 2. Create a Branch

Create a dedicated branch **from `develop`** for each feature, fix, test, or documentation change.

Examples:

```text
feature/github-sync

feature/gfg-detector

fix/oauth-flow

fix/submission-detection

docs/installation

test/leetcode-adapter
```

Avoid making unrelated changes in the same branch.

Contributors should generally open pull requests against the `develop` branch unless the maintainers specify otherwise.

## 3. Development Guidelines

Contributions should:

* follow the existing project architecture;
* maintain established coding conventions;
* remain focused on the intended change;
* avoid unnecessary refactoring;
* consider security and reliability;
* include appropriate tests where applicable; and
* preserve existing functionality unless the change intentionally modifies it.

## 4. Testing

Before submitting a pull request, contributors should verify that:

* the project builds successfully;
* relevant tests pass;
* newly introduced functionality has been tested;
* existing functionality remains unaffected; and
* no credentials, tokens, API keys, or other sensitive information are included.

## 5. Commit Messages

Use concise, descriptive commit messages.

Examples:

```text
feat(leetcode): improve submission detection

feat(github): add repository validation

fix(oauth): handle authorization failure

test(gfg): add detector coverage

docs: update installation guide
```

## 6. Pull Requests

A pull request should:

* clearly describe the proposed change;
* explain the motivation where appropriate;
* include relevant testing information;
* reference related issues where applicable; and
* remain limited to the intended scope.

Unless otherwise specified by the maintainers, pull requests should target the `develop` branch.

Maintainers may request additional changes before a pull request is accepted.

Submission of a pull request does not guarantee acceptance or inclusion in the project.

## 7. Code Review

All contributions are subject to review by the CodeVault maintainers.

Review may consider:

* correctness;
* maintainability;
* security;
* performance;
* architecture;
* compatibility;
* test coverage; and
* consistency with project standards.

## 8. Security

Security vulnerabilities should not be disclosed through public issues or pull requests.

Please report security vulnerabilities privately to the project maintainers rather than publicly disclosing them.

Do not include secrets, credentials, access tokens, or private information in issues, commits, or pull requests.

## 9. Documentation

Changes that affect installation, configuration, functionality, APIs, architecture, or user workflows should include corresponding documentation updates where appropriate.

## 10. Licensing

CodeVault is currently distributed under the Apache License 2.0.

By submitting a contribution, you represent that:

* you have the necessary rights to submit the contribution;
* the contribution does not knowingly infringe the rights of another party; and
* you understand that accepted contributions may be incorporated into CodeVault and distributed under the project's applicable licensing terms.

Contributors are responsible for ensuring that third-party materials included in a contribution are compatible with their intended use.

## 11. Trademarks and Branding

The CodeVault name, logo, and associated branding are governed by the project's `TRADEMARKS.md`.

Contributing to CodeVault does not grant rights to use CodeVault branding for an independent product.

## 12. Community Standards

Contributors are expected to maintain a professional and respectful environment.

Technical disagreements are welcome when communicated constructively. Harassment, discrimination, personal attacks, and intentionally disruptive behavior are not acceptable.

## 13. Maintainer Discretion

The CodeVault maintainers reserve the right to review, request changes to, accept, or decline contributions based on the project's technical, security, legal, and maintenance requirements.

## 14. Thank You

We appreciate the time and effort contributed by everyone who helps improve CodeVault.

---

**CodeVault**
Copyright © 2026 Vivek Kumar
