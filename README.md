# 🚀 CodeSyncVault

>Automatically detect, organize, and synchronize accepted coding solutions from supported coding platforms to GitHub.

![Version](https://img.shields.io/badge/version-v1.4.5-blue)
![Status](https://img.shields.io/badge/status-Active-success)
![License](https://img.shields.io/badge/license-Apache--2.0-green)
![Platforms](https://img.shields.io/badge/platforms-3-orange)

---

## 📌 Overview

CodeSyncVault is an open-source browser extension that automatically captures accepted coding solutions, extracts their metadata, organizes them into a structured GitHub repository, and keeps your coding portfolio up to date.

Instead of manually copying solutions, creating folders, generating documentation, and updating statistics, CodeSyncVault automates the workflow after an accepted submission.

### Currently Supported Platforms

- 🟡 LeetCode
- 🟢 GeeksforGeeks
- 🔵 HackerRank

---

## 🚀 Install CodeSyncVault

[![Install from Chrome Web Store](https://img.shields.io/badge/Install-Chrome%20Web%20Store-blue?logo=googlechrome)](https://chromewebstore.google.com/detail/codevault/loigjljekeahnjccojnnkmagibghofbn)

🌐 [Official Website](https://codesyncvault.vercel.app/)

🔗 [LinkedIn](https://www.linkedin.com/company/codesyncvault/)

---

# ✨ Features

## 🔄 Automatic Solution Detection

CodeSyncVault detects accepted submissions on supported coding platforms.

Simply solve and submit a problem normally. Once the submission is accepted, CodeSyncVault processes the solution automatically.

---

## 💻 Multi-Platform Support

CodeSyncVault currently supports:

| Platform      | Status       |
| ------------- | ------------ |
| LeetCode      | ✅ Supported |
| GeeksforGeeks | ✅ Supported |
| HackerRank    | ✅ Supported |
| Codeforces    | 🚧 Planned   |
| CodeChef      | 🚧 Planned   |
| AtCoder       | 🚧 Planned   |

---

## 📦 Solution Extraction

CodeSyncVault automatically extracts submitted source code from accepted solutions.

Supported languages depend on the platform and detector implementation.

The repository structure is designed to support multiple programming languages independently.

---

## 🧠 Metadata Extraction

CodeSyncVault extracts, normalizes, and maintains problem metadata from supported coding platforms.

Metadata includes:

- Problem name
- Problem slug
- Difficulty
- Platform
- Programming language
- Tags (where available)
- Automatically classified patterns
- Automatically classified topics
- Estimated time complexity (supported patterns)
- Estimated space complexity (supported patterns)
- Solved date
- Submission information (where available)

Metadata availability depends on the platform and its submission data.

**Note:** Complexity values are heuristic estimates for supported patterns, not guaranteed results of complete static code analysis.

---

## 🧩 Pattern and Topic Classification

CodeSyncVault includes a local, rule-based classification engine.

It classifies supported solutions using predefined rules and available problem metadata.

Classification capabilities include:

- Pattern detection
- Topic classification
- Rule-based categorization
- Automatic metadata indexing

Examples of supported patterns include:

- Arrays
- Strings
- Binary Search
- Two Pointers
- Sliding Window
- Hash Map
- Stack
- Queue
- Linked List
- Trees
- Graphs
- Dynamic Programming
- Greedy

Classification runs locally using predefined rules without requiring an external AI API.

**Note:** Classification accuracy depends on the available problem metadata and supported rules.

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
```

CodeSyncVault also automatically generates a repository-level portfolio README.

---

## 📊 Portfolio Statistics

The Repository Engine automatically generates coding statistics from the solution index.

Statistics include:

- 🏆 Total problems solved
- 🔵 Basic problems
- 🟢 Easy problems
- 🟠 Medium problems
- 🔴 Hard problems
- 🔥 Coding streak
- 🌐 Platform statistics
- 💻 Language statistics
- 🧩 Pattern statistics
- 📚 Topic statistics
- 🕒 Recently solved problems
- 🔥 Coding activity

No manual README editing is required.

---

## 🔥 Coding Activity Heatmap

CodeSyncVault automatically generates a GitHub-compatible coding activity heatmap.

Generated at:

```
.codevault/activity.svg
```

The heatmap displays coding activity across a 365-day window ending at the latest valid recorded solution date in the repository index.

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

CodeSyncVault uses GitHub OAuth authentication.

Users do not need to manually create or manage a Personal Access Token for the normal synchronization workflow.

---

## 🚀 Automatic GitHub Synchronization

After an accepted submission, CodeSyncVault can automatically:

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

CodeSyncVault prevents previously synchronized solutions from being committed again.

A unique fingerprint is generated for synchronized solutions and checked against existing repository data.

---

# 📁 Repository Organization

Solutions are automatically organized by platform, language, difficulty, and problem.

Example:

```text
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

The Repository Engine automatically generates a consistent directory structure based on the platform, programming language, difficulty, and problem name.

Each solution is stored with its corresponding source-code file and generated README documentation.

---

# 🧠 Repository Engine

The CodeSyncVault Repository Engine manages repository-level coding data and documentation.

```text
.codevault/
├── index.json
└── activity.svg
```

The solution index acts as the source of truth for repository statistics.

The Repository Engine uses this information to generate:

- Portfolio README
- Difficulty statistics
- Platform statistics
- Language statistics
- Pattern statistics
- Topic statistics
- Recently solved problems
- Coding activity heatmap

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
│ CodeSyncVault Detector       │
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

# 🏗️ Architecture

CodeSyncVault follows a modular browser-extension architecture with a Spring Boot backend for GitHub OAuth authentication.

```text
Coding Platforms
       |
       v
Browser Extension
       |
       v
Platform Detection
       |
       v
Metadata and Solution Extraction
       |
       v
Pattern and Topic Classification
       |
       v
Repository Engine
       |
       +------------------+
       |         |        |
       v         v        v
   Solution   Portfolio  Activity
    Files      README    Heatmap
       |         |        |
       +---------+--------+
                 |
                 v
          GitHub Sync Service
                 |
                 v
          GitHub Repository


GitHub Authentication:

Browser Extension
       |
       v
Spring Boot Backend
       |
       v
GitHub OAuth
       |
       v
Access Token Returned to Extension
```

### Component Responsibilities

**Browser Extension**

- Platform detection
- Metadata extraction
- Solution extraction
- Pattern and topic classification
- Repository generation
- GitHub synchronization

**Spring Boot Backend**

- GitHub OAuth authorization-code exchange
- Backend health monitoring

**GitHub Repository**

- Solution storage
- Repository metadata index
- Generated README documentation
- Coding activity heatmap

````

# 🛠️ Tech Stack

## Browser Extension

- TypeScript
- React
- WXT
- Chrome Extension Manifest V3

## Backend

- Java
- Spring Boot
- Spring Security
- OAuth2

## GitHub Integration

- GitHub OAuth
- GitHub REST API
- Octokit

## Data & Architecture

- Zustand
- Zod
- Dexie
- TypeScript
- Feature-based architecture

## Development

- pnpm
- Turborepo
- Vite
- Biome
- Git
- GitHub

---

# 📁 Project Structure

```text
CodeSyncVault
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
````

---

# 📥 Installation

## Development Installation

Clone the repository:

```bash
git clone https://github.com/vivekkushwahaofficial/CodeSyncVault.git
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

5. Open CodeSyncVault.

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

## CodeSyncVault v1.4.5

### What's Updated

v1.4.5 includes:

- Restored the GeeksforGeeks platform value to `gfg`
- Preserved compatibility with existing GeeksforGeeks solution repositories
- Prevented new GFG solutions from being generated under the `GeeksforGeeks` directory
- Restored the existing GFG repository structure

### Supported Platforms

- LeetCode
- GeeksforGeeks
- HackerRank

---

# 🚧 Roadmap

CodeSyncVault is actively evolving.

## Platform Expansion

Planned support includes:

- Codeforces
- CodeChef
- AtCoder
- Coding Ninjas
- Additional coding platforms

---

## 🤖 AI-Powered Features

Future AI-powered capabilities include:

- AI-assisted pattern classification
- Advanced topic classification
- Solution explanations
- Automatic coding notes generation
- Interview questions for solved problems
- Advanced complexity analysis
- Personalized coding insights
- Weak-topic identification
- AI-powered learning recommendations

These features aim to extend the existing local rule-based classification engine with more advanced AI capabilities.

---

## 📊 Analytics

Future versions may include:

- Detailed coding analytics
- Platform comparison
- Difficulty distribution
- Pattern progress
- Topic weaknesses
- Language usage
- Progress insights

---

## 🔄 Revision System

Future versions will introduce intelligent revision capabilities including:

- Revision reminders
- Spaced repetition
- Problem revisit tracking
- Weak-topic identification
- Personalized revision plans

---

## 🌐 Developer Portfolio

CodeSyncVault is evolving toward a complete developer portfolio system.

Future capabilities include:

- Coding profile
- Solution showcase
- Coding statistics
- Activity heatmap
- Achievements
- GitHub integration
- Portfolio generation

---

# 🤝 Contributing

Contributions are welcome.

You can contribute by:

- Reporting bugs
- Suggesting features
- Improving documentation
- Adding platform support
- Improving detectors
- Improving repository generation
- Opening pull requests

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

CodeSyncVault is licensed under the **Apache License 2.0**.

See the `LICENSE` file for details.

---

# 🐞 Feedback & Support

Found a bug or have a feature request?

Open an issue in the CodeSyncVault repository.

⭐ If you find CodeSyncVault useful, consider starring the repository.

---

# 🌟 Vision

CodeSyncVault aims to become a complete coding solution management and developer productivity platform.

The long-term vision is to allow developers to:

- Solve problems on their preferred coding platforms.
- Automatically synchronize accepted solutions.
- Organize solutions without manual effort.
- Track coding progress.
- Analyze strengths and weaknesses.
- Maintain a professional coding portfolio.
- Receive AI-powered insights.
- Build a complete history of their coding journey.

The goal is simple:

> **Spend less time managing solutions and more time solving problems.**

---

Built with ❤️ for developers who love solving problems, not managing repositories.
