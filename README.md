# 🚀 CodeVault

> Automatically detect, organize, and synchronize accepted coding solutions from supported coding platforms to GitHub.

![Version](https://img.shields.io/badge/version-v1.4.0-blue)
![Status](https://img.shields.io/badge/status-Active-success)
![License](https://img.shields.io/badge/license-Apache--2.0-green)
![Platforms](https://img.shields.io/badge/platforms-3-orange)

---

## 📌 Overview

CodeVault is an open-source browser extension that automatically captures accepted coding solutions, extracts their metadata, organizes them into a structured GitHub repository, and keeps your coding portfolio up to date.

Instead of manually copying solutions, creating folders, generating documentation, and updating statistics, CodeVault automates the workflow after an accepted submission.

### Currently Supported Platforms

- 🟡 LeetCode
- 🟢 GeeksforGeeks
- 🔵 HackerRank

---
## 🚀 Install CodeVault

[![Install from Chrome Web Store](https://img.shields.io/badge/Install-Chrome%20Web%20Store-blue?logo=googlechrome)](https://chromewebstore.google.com/detail/codevault/loigjljekeahnjccojnnkmagibghofbn)

🌐 [Official Website](https://code-vault-website.vercel.app/)

🔗 [LinkedIn](https://www.linkedin.com/company/codevault-tool/)

---
# ✨ Features

## 🔄 Automatic Solution Detection

CodeVault detects accepted submissions on supported coding platforms.

Simply solve and submit a problem normally. Once the submission is accepted, CodeVault processes the solution automatically.

---

## 💻 Multi-Platform Support

CodeVault currently supports:

| Platform | Status |
| --- | --- |
| LeetCode | ✅ Supported |
| GeeksforGeeks | ✅ Supported |
| HackerRank | ✅ Supported |
| Codeforces | 🚧 Planned |
| CodeChef | 🚧 Planned |
| AtCoder | 🚧 Planned |

---

## 📦 Solution Extraction

CodeVault automatically extracts submitted source code from accepted solutions.

Supported languages depend on the platform and detector implementation.

The repository structure is designed to support multiple programming languages independently.

---

## 🧠 Metadata Extraction

CodeVault extracts and maintains metadata such as:

- Problem name
- Problem slug
- Difficulty
- Platform
- Programming language
- Tags
- Pattern
- Topic
- Time complexity
- Space complexity
- Solved date
- Submission information

---

## 📄 Automatic README Generation

Every synchronized solution can receive its own documentation.

Example:

```text
Two Sum

Difficulty: Easy
Platform: LeetCode
Language: Java

Problem Statement
...

Approach
...

Complexity
Time: O(n)
Space: O(n)
````

CodeVault also automatically generates a repository-level portfolio README.

---

## 📊 Portfolio Statistics

The Repository Engine automatically generates coding statistics from the solution index.

Statistics include:

* 🏆 Total problems solved
* 🔵 Basic problems
* 🟢 Easy problems
* 🟠 Medium problems
* 🔴 Hard problems
* 🌐 Platform statistics
* 💻 Language statistics
* 🧩 Pattern statistics
* 📚 Topic statistics
* 🕒 Recently solved problems
* 🔥 Coding activity

No manual README editing is required.

---

## 🔥 Coding Activity Heatmap

CodeVault v1.4.0 introduces an automatically generated GitHub-compatible coding activity heatmap.

Generated at:

```
.codevault/activity.svg
```

The heatmap represents coding activity across the latest 365 days.

Activity intensity is deterministic:

| Daily Solutions | Activity     |
| --------------: | ------------ |
|               0 | No activity  |
|               1 | Light        |
|               2 | Medium-light |
|             3–4 | Medium       |
|              5+ | Highest      |

The heatmap is generated from solved-date information stored in:

```
.codevault/index.json
```

---

## 🔐 GitHub OAuth Authentication

CodeVault uses GitHub OAuth authentication.

Users do not need to manually create or manage a Personal Access Token for the normal synchronization workflow.

---

## 🚀 Automatic GitHub Synchronization

After an accepted submission, CodeVault can automatically:

```text
Accepted Submission
        ↓
Detect
        ↓
Extract Solution
        ↓
Extract Metadata
        ↓
Generate Documentation
        ↓
Build Repository Package
        ↓
Update Repository Index
        ↓
Generate Portfolio
        ↓
Generate Activity Heatmap
        ↓
Commit
        ↓
Push to GitHub
```

---

## 🛡️ Duplicate Detection

CodeVault prevents previously synchronized solutions from being committed again.

A unique fingerprint is generated for synchronized solutions and checked against existing repository data.

---

# 📁 Repository Organization

Solutions are automatically organized by platform, language, difficulty, and problem.

Example:

```
Repository
│
├── LeetCode
│   └── Java
│       └── Easy
│           └── Two-Sum
│               ├── Solution.java
│               └── README.md
│
├── GeeksforGeeks
│   └── C++
│       └── Basic
│           └── Array-Problem
│               ├── Solution.cpp
│               └── README.md
│
└── HackerRank
    └── Java
        └── Easy
            └── Java-Problem
                ├── Solution.java
                └── README.md
```

The exact generated path can be configured and managed by the repository engine.

---

# 🧠 Repository Engine

The CodeVault Repository Engine manages repository-level coding data and documentation.

```text
.codevault/
├── index.json
└── activity.svg
```

The solution index acts as the source of truth for repository statistics.

The Repository Engine uses this information to generate:

* Portfolio README
* Difficulty statistics
* Platform statistics
* Language statistics
* Pattern statistics
* Topic statistics
* Recently solved problems
* Coding activity heatmap

---

# ⚙️ How It Works

```text
┌──────────────────────────┐
│ Solve Coding Problem     │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Accepted Submission      │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ CodeVault Detector       │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Extract Solution         │
│ + Metadata               │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Repository Engine        │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Generate Files            │
│ README + Index + Heatmap │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ GitHub Synchronization   │
└──────────────────────────┘
```

---

# 🏗️ Architecture

```text
Coding Platform
      │
      ▼
Browser Extension
      │
      ├── Platform Detector
      │
      ├── Metadata Extractor
      │
      ├── Solution Extractor
      │
      ├── Repository Engine
      │
      ├── GitHub Sync
      │
      └── Settings
              │
              ▼
        GitHub Repository
              │
              ├── Solutions
              ├── .codevault/index.json
              ├── .codevault/activity.svg
              └── README.md
```

---

# 🛠️ Tech Stack

## Browser Extension

* TypeScript
* React
* WXT
* Chrome Extension Manifest V3

## Backend

* Java
* Spring Boot
* Spring Security
* OAuth2

## GitHub Integration

* GitHub OAuth
* GitHub REST API
* Octokit

## Data & Architecture

* Zustand
* Zod
* Dexie
* TypeScript
* Feature-based architecture

## Development

* pnpm
* Turborepo
* Vite
* Biome
* Git
* GitHub

---

# 📁 Project Structure

```text
CodeVault
│
├── apps
│   ├── backend
│   │
│   └── extension
│       ├── entrypoints
│       │
│       ├── src
│       │   ├── core
│       │   ├── features
│       │   │   ├── github
│       │   │   ├── platforms
│       │   │   ├── repository-engine
│       │   │   ├── settings
│       │   │   └── ...
│       │   │
│       │   └── shared
│       │
│       └── wxt.config.ts
│
├── packages
│
├── docs
│
└── scripts
```

---

# 📥 Installation

## Development Installation

Clone the repository:

```bash
git clone https://github.com/vivekkushwahaofficial/CodeVault.git
```

Install dependencies:

```bash
pnpm install
```

Build the extension:

```bash
pnpm build
```

The production extension will be generated under:

```
apps/extension/.output/chrome-mv3/
```

---

## Load the Extension in Chrome

1. Open:

```
chrome://extensions
```

2. Enable **Developer mode**.

3. Click **Load unpacked**.

4. Select:

```text
apps/extension/.output/chrome-mv3
```

5. Open CodeVault.

6. Connect your GitHub account.

7. Solve an accepted problem on a supported platform.

---

# 🛠️ Development

Install dependencies:

```bash
pnpm install
```

Run the extension in development mode:

```bash
pnpm --dir apps/extension dev
```

Build the extension:

```bash
pnpm build
```

Run the backend:

```bash
cd apps/backend
./mvnw spring-boot:run
```

---

# 📊 Current Release

## CodeVault v1.4.0

### Coding Activity Heatmap

v1.4.0 introduces:

* 365-day coding activity heatmap
* Automatic solved-date processing
* Deterministic activity levels
* `.codevault/activity.svg`
* Improved repository portfolio generation
* Improved coding activity statistics
* Automatic heatmap regeneration

### Supported Platforms

* LeetCode
* GeeksforGeeks
* HackerRank

---

# 🚧 Roadmap

CodeVault is actively evolving.

## Platform Expansion

Planned support includes:

* Codeforces
* CodeChef
* AtCoder
* Coding Ninjas
* Additional coding platforms

---

## 🤖 AI-Powered Features

Planned capabilities include:

* Automatic pattern detection
* Topic classification
* Solution explanations
* Coding notes generation
* Interview questions for solved problems
* Complexity analysis
* Personalized coding insights

---

## 📊 Analytics

Future versions may include:

* Detailed coding analytics
* Platform comparison
* Difficulty distribution
* Pattern progress
* Topic weaknesses
* Language usage
* Coding streaks
* Progress insights

---

## 🔄 Revision System

Future versions will introduce intelligent revision capabilities including:

* Revision reminders
* Spaced repetition
* Problem revisit tracking
* Weak-topic identification
* Personalized revision plans

---

## 🌐 Developer Portfolio

CodeVault is evolving toward a complete developer portfolio system.

Future capabilities include:

* Coding profile
* Solution showcase
* Coding statistics
* Activity heatmap
* Achievements
* GitHub integration
* Portfolio generation

---

# 🤝 Contributing

Contributions are welcome.

You can contribute by:

* Reporting bugs
* Suggesting features
* Improving documentation
* Adding platform support
* Improving detectors
* Improving repository generation
* Opening pull requests

Create a feature branch:

```bash
git checkout -b feature/my-feature
```

Commit your changes:

```bash
git commit -m "feat: add new feature"
```

Push your branch:

```bash
git push origin feature/my-feature
```

Then open a Pull Request.

---

# 📄 License

CodeVault is licensed under the **Apache License 2.0**.

See the `LICENSE` file for details.

---

# 🐞 Feedback & Support

Found a bug or have a feature request?

Open an issue in the CodeVault repository.

⭐ If you find CodeVault useful, consider starring the repository.

---

# 🌟 Vision

CodeVault aims to become a complete coding solution management and developer productivity platform.

The long-term vision is to allow developers to:

* Solve problems on their preferred coding platforms.
* Automatically synchronize accepted solutions.
* Organize solutions without manual effort.
* Track coding progress.
* Analyze strengths and weaknesses.
* Maintain a professional coding portfolio.
* Receive AI-powered insights.
* Build a complete history of their coding journey.

The goal is simple:

> **Spend less time managing solutions and more time solving problems.**

---

Built with ❤️ for developers who love solving problems, not managing repositories.

