## My Experience Using Multiple AI Agents for the Ship Compliance System

Building this ship compliance management system , with complex domain logic around Compliance Balance (CB), global banking, year-wise pooling, and a clean hexagonal architecture, would have taken me significantly longer if done purely manually. Over the past few days, I leveraged ChatGPT, Gemini, Codex, and Cursor in a deliberate, multi-agent workflow. The experience taught me a great deal about both the power and limitations of current AI coding tools.

### What I Learned Using AI Agents

The biggest lesson was that **AI agents excel as powerful collaborators, not autonomous developers**. They are incredibly fast at generating boilerplate, implementing known patterns (like hexagonal architecture), and handling repetitive tasks. However, they still require strong human guidance for ambiguous or domain-specific logic. For example, all models initially defaulted to per-route banking instead of a single global bank, a critical architectural decision that wasn’t obvious from the problem statement. This taught me the importance of clearly articulating system-wide constraints and business rules early.

I also learned the value of **specialization**. ChatGPT was excellent for initial structure and high-level thinking. Gemini shone in refinement and frontend polishing. Codex was precise for fixing tricky logic bugs. Cursor (with folder context) was unmatched for code analysis, database migration, and writing comprehensive tests. Understanding each tool’s strength allowed me to chain them effectively.

Another key takeaway: **AI hallucinates most when continuing long conversations or handling open-ended requirements**. The CB recalculation bug after banking and the incorrect pooling logic were classic examples. I became much better at spotting these issues quickly and providing corrective prompts.

### Efficiency Gains vs Manual Coding

The efficiency gains were substantial. 

- The initial backend framework and basic functionality were built in hours instead of days.
- Writing unit and integration tests manually would have taken me at least 2–3 full days of debugging types and edge cases. Cursor completed them in under an hour with excellent coverage.
- Migrating from a file-based JSON database to PostgreSQL (including schema design, and adapter updates) was almost effortless with Cursor’s folder analysis, something I would have struggled with initially due to limited Postgres experience.
- UI polishing, filters, accordions, and mock data seeding, which usually consume significant frontend time, were completed rapidly with Gemini.

Overall, I estimate I completed the project **3–4x faster** than if I had coded everything manually. The biggest time savings came from rapid iteration, automatic test generation, and skipping the initial learning curve on unfamiliar technologies.

### Improvements I’d Make Next Time

Despite the gains, there is clear room for improvement:

1. **Better Prompt Engineering & Documentation**: I will start maintaining a living `architecture-decisions.md` from day one and reference it in every major prompt to reduce hallucinations.
2. **Earlier Test-Driven Approach**: Next project, I’ll ask Cursor to generate tests *before* implementing features, not after.
3. **Single Source of Truth**: I sometimes jumped between agents with slightly inconsistent context. Using Cursor more as the central agent with full project context would help maintain coherence.
4. **Human Review Gates**: I plan to add structured checkpoints after every major module (domain logic, banking, pooling) for deeper manual verification before proceeding.
5. **Version Control of AI Outputs**: I’ll track prompt versions and outputs more systematically to make debugging regressions easier.

---

**Final Thought**: AI agents turned me from a solo developer into the **orchestrator of a highly capable team**. They don’t replace deep thinking or domain understanding, they amplify it. With clearer processes and better prompting discipline, the next project will be even faster and more robust.

— Rohit Yadav  
April 2026