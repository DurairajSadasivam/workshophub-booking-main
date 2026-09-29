---
description: Run repository sensors (reasons-lint, branch-name-check) and automatically fix detected issues until all sensors pass.
agents:
  - build
---

# `/sensor-and-fix` Protocol

Run validation sensors against the project and automatically resolve failures in an iterative loop until all sensors report success.

---

## 1. Execution Pipeline

Execute the review steps in the following strict order:

### Sensor 1: Branch Name Compliance
Run the branch naming script:
``
./scripts/branch-name-check.sh
``

- **If Failed:** Rename the current git branch to adhere to the `wh-<category>-<description>` naming scheme based on current working changes (e.g., `wh-fix-reasons-structure` or `wh-feature-prompt-update`).
  ``
  git branch -m <valid-branch-name>
  ``

---

### Sensor 2: REASONS Structure Linting
Run the REASONS structure linter against prompt files:
``
./scripts/reasons-lint.sh
``

- **If Failed:** Analyze the output for every failing file and apply repairs directly:

| Violation | Remediation Action |
| :--- | :--- |
| **Missing Section** | Inject missing section heading(s) in correct sequence: <br> `## Requirements` -> `## Entities` -> `## Approach` -> `## Structure` -> `## Operations` -> `## Norms` -> `## Safeguards` |
| **Section Out of Order** | Rearrange `##` sections into the exact canonical 7-section sequence listed above. |
| **Missing Mermaid Diagram** | Insert a relevant `` ```mermaid `` diagram inside the `## Entities` section representing data flows, components, or entities. |
| **TODO / PLACEHOLDER / [TBD]** | Resolve and replace all placeholder text with complete, production-ready prompt content. |
| **Framework Metadata** | Remove lines starting with `**Objective**`, `**Construction Guidance**`, or `**Quality Standards**`. |
| **Business Context Section** | Remove `## Business Context` section or merge relevant details directly into `## Requirements`. |

---

### Sensor 3: Uncommitted Syntax & Format Check
Check for additional common code or markdown structural flaws across modified prompt/script files:
- Ensure no trailing whitespace or unresolved merge conflicts exist.
- Ensure executable permissions (`chmod +x`) on script files in `./scripts/`.

---

## 2. Iterative Verification Loop

1. **Fix Application:** Apply targeted edits for any failing checks detected above.
2. **Re-Run Validation:** Re-execute both sensor scripts to verify the corrections:
   ``
   ./scripts/branch-name-check.sh && ./scripts/reasons-lint.sh
   ``
3. **Loop Control:** Repeat the process until both scripts exit with status `0`.

---

## 3. Final Summary Output

Upon successful completion, output a summary report containing:

1. **Branch Status:** Display the verified/renamed branch name.
2. **REASONS Lint Status:** Summary of files checked and specific fixes applied (e.g., added missing sections, generated Mermaid diagram, removed TBD markers).
3. **Final Verification:** Status confirmation that all sensor checks passed cleanly.