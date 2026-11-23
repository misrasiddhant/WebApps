# WebApps

![Projects](https://img.shields.io/badge/projects-9-2ea44f?style=flat-square)
![HTML](https://img.shields.io/badge/HTML-5-e34f26?style=flat-square&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla%20%2B%20Node.js-f7df1e?style=flat-square&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-projects-61dafb?style=flat-square&logo=react&logoColor=black)

A collection of small web applications, browser experiments, games, and interactive visualisations.

## Projects

| Project | Description | Documentation |
| --- | --- | --- |
| [Countdown The Game](./CountdownTheGame/) | Node.js recreation of the *Countdown* letters and numbers rounds, with a solver API and browser UI. | [README](./CountdownTheGame/README.md) |
| [DDL Generator](./DDLGenerator/) | Infers Hive column types from a header and sample row, then helps configure table DDL. | [README](./DDLGenerator/README.md) |
| [Game of Life](./GameOfLife/) | Interactive Conway's Game of Life grid with editable cells and automatic playback. | [README](./GameOfLife/README.md) |
| [Patient Movement](./PatientMovement/) | A browser simulation of moving healthy and infected patients. | [README](./PatientMovement/README.md) |
| [Photo Polaroids](./PhotoPolaroids/) | Local photo pairing tool that creates print-ready 4 × 6 JPEGs. | [README](./PhotoPolaroids/README.md) |
| [Diff Application](./diff-application/) | Express-backed browser tool for comparing text files. | [README](./diff-application/README.md) |
| [Resume Foundry](./resume-builder/) | Local-first React CV editor with human-readable and ATS-friendly PDF export. | [README](./resume-builder/README.md) |
| [Trivia](./trivia/) | Category-driven multiplayer trivia game with team joining and buzzer support. | [README](./trivia/README.md) |
| [DFS Graph Simulation](./dfs_graph_simulation.html) | A standalone browser experiment for drawing graphs and visualising traversal. | [README](./README.md#standalone-browser-experiments) |

## Running the projects

Each project is independent. Open its project README for prerequisites, setup, and run commands. The projects that use Node.js keep their dependencies in their own directory, so run commands from that directory.

## Standalone browser experiments

These pages have no package manager or build step and can be opened directly in a browser:

- [DFS Graph Simulation](./dfs_graph_simulation.html)
- [Patient Movement (legacy standalone page)](./PatientMovement.html)

For a more reliable local origin, serve the repository root with any static file server and open the relevant HTML file.
