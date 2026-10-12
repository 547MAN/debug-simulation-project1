# Debugging Challenge Journal

This journal tracks the debugging challenges for **Good Goods**, an AI-generated full-stack shop built with ASP.NET Core (.NET 10) and React.

The goal is to practice reading unfamiliar AI-generated code, identifying problems, researching solutions, and improving the application independently.

## How to use this journal

1. Read the current challenge without inspecting the AI's commit diff.
2. Reproduce the problem on your own machine.
3. Research and implement your own solution.
4. **Fill in the three answer boxes** below. Be specific: explain what you changed, how you reached that conclusion, and why it fixes the problem.
5. Record how you verified the fix, then commit and push your changes to GitHub.
6. Tell the AI assistant **"Challenge completed"**. The next challenge will be added after your fix is reviewed.

> **Spoiler policy:** Challenge descriptions state the expected behavior and the task, not the hidden defect, its file location, or the fix.

---

## Challenge #1 — Get the Shop Running

**Status:** ⬜ Not yet completed  
**Difficulty:** Starter  
**Stack:** ASP.NET Core (.NET 10) + React (Vite)

### Objective

Start the full-stack shop from the terminal. Investigate and fix the problem that prevents normal operation.

Once the problem is fixed, verify that you can:

- [ ] Start the app using `npm run dev`.
- [ ] Open the storefront at `http://127.0.0.1:5173`.
- [ ] See the product catalog load successfully.
- [ ] Add a product to the shopping cart.
- [ ] Complete a **simulated** checkout (no real payment).

### Reproduce the problem

From the repository root:

```bash
npm run setup
npm run dev
```

**Observed error or behavior:**

> ✍️ Paste or summarize the error message here. Include the command used and any relevant output.

### Answer box 1 — Solution

> ✍️ **Your answer:** What did you change to fix the bug?
>
> Describe the relevant files, changes, and commands. You may include a short code snippet if useful.
>
> **Write your solution here.**

### Answer box 2 — Thought process

> ✍️ **Your answer:** How did you investigate and reach your solution?
>
> Describe your initial hypotheses, debugging steps, useful error messages, documentation you researched, false starts, and how you narrowed down the cause.
>
> **Write your thought process here.**

### Answer box 3 — Why my solution works

> ✍️ **Your answer:** Why does your fix solve the root problem?
>
> Explain the underlying behavior, what was wrong before, why the new code or configuration works, and what you learned.
>
> **Write your explanation here.**

### Verification and testing

Record the checks you ran and their results.

| Check | Result / evidence |
| --- | --- |
| Backend starts | ⬜ Not tested |
| Frontend starts | ⬜ Not tested |
| Product catalog loads | ⬜ Not tested |
| Cart operations work | ⬜ Not tested |
| Simulated checkout works | ⬜ Not tested |
| Regression test added (if applicable) | ⬜ Not tested |

**Fix commit:** `(paste your commit SHA or URL here)`  
**Completed on:** `YYYY-MM-DD`

---

## Future challenges

**Challenge #2 and onward will be added only after the previous fix has been committed and reviewed.** Each round introduces one new problem while preserving the rest of the shop as a usable application.

### Template for later challenges

Copy this section when a new challenge is introduced:

```markdown
## Challenge #N — [Spoiler-free title]

**Status:** ⬜ Not yet completed

### Objective

[Describe expected behavior and the task without revealing the cause.]

### Observed error or behavior

> ✍️ Write here.

### Answer box 1 — Solution

> ✍️ Write here.

### Answer box 2 — Thought process

> ✍️ Write here.

### Answer box 3 — Why my solution works

> ✍️ Write here.

### Verification and testing

> ✍️ List tests run and results.

**Fix commit:** `(commit SHA or URL)`  
**Completed on:** `YYYY-MM-DD`
```
