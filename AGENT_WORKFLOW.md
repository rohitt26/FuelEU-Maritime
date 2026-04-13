# AI Agent Workflow Log

## Agents Used
- **ChatGPT**: Initial project template and base framework for backend + rough API (using my provided logic).
- **Gemini**: Refinement of backend code, UI polish, mock data seeding, filters, and frontend fixes.
- **Codex**: Restructuring and targeted fixes for Banking and Pooling implementations.
- **Cursor**: Migration from file-based DB to PostgreSQL, and test suite generation.

## Prompts & Outputs

### Prompts & Outputs – ChatGPT (Initial Framework & Step-by-Step Build)
ChatGPT was used first to establish the overall project and generate the base code. It produced working initial snippets but began hallucinating on refinements and complex logic connections.

1. **Prompt**: `lets go through the overall idea of the project.  `
   **Output**: High-level overview of a ship compliance system with CB (Compliance Balance) calculations, banking of surplus, and pooling for deficits. Generated initial domain concepts and flow.  
   **Refinement**: No major issues; used as foundation.

2. **Prompt**: `how are they computing compliance.  `
   **Output**: Explained CB formulas and logic. Produced initial computation functions.  
   **Refinement**: Formulas were verified later in prompt 9.

3. **Prompt**: `If ships cb is negative then we can use that ship either by banking or by pooling, right?  `
   **Output**: Confirmed negative-CB handling via banking or pooling.  
   **Refinement**: Integrated into core logic.

4. **Prompt**:  
   ```
   Architecture (Hexagonal)  
   src/
     core/
       domain/
       application/
       ports/
     adapters/
       inbound/http/
       outbound/postgres/
     infrastructure/
       db/
       server/
     shared/

   Use dependency-inverted modules: core → ports → adapters. Frameworks (Express/Prisma/etc.) only in adapters/infrastructure. Explain this
   ```
   **Output**: Full explanation + initial folder structure and boilerplate with dependency inversion.  
   **Refinement**: Used as the permanent architecture.

5. **Prompt**: `first tell me what is the basic thing we can do in the backend and make it functioning? and then we will move to next part  `
   **Output**: Suggested and generated basic CRUD + file-based DB prototype (JSON files for routes, compliance, banking, pools).  
   **Refinement**: Quick start; later migrated to Postgres.

6. **Prompt**:` Give me the CB implementation with formulas and endpoints  `
   **Output**: CB computation functions + HTTP endpoints.  
   **Issue/Fix**: Later CB bugs appeared (see Observations).

7. **Prompt**: `Give me the Banking implementation  `
   **Output**: Initial banking endpoints and logic (treated banks as per-route).  
   **Issue**: Hallucinated per-route banks instead of global. Fixed later with Codex + manual architecture guidance.

8. **Prompt**: `Give me the Pooling implementation  `
   **Output**: Initial pooling logic and endpoints.  
   **Issue**: Not year-wise and included ships without calculated CB. Fixed with my explicit instructions + Codex.

9. **Prompt**:` Now we will go through the formula verification, let's go all tabs step by step ` 
   **Output**: Step-by-step walkthrough of all tabs/formulas.  
   **Refinement**: Used for verification before frontend.

10. **Prompt**: `Now let's create frontend step by step  `
    **Output**: React frontend skeleton.  
    **Refinement**: Continued in subsequent prompts.

11. **Prompt**:` first letus creat the routes page with the table in it.  `
    **Output**: Routes page with data table.

12. **Prompt**:` Continue with Compare page + chart (Recharts + compliance table)  `
    **Output**: Compare page with Recharts charts + compliance table.

13. **Prompt**: `Banking Page  `
    **Output**: Banking page UI and basic interactions.

14. **Prompt**: `Pooling Page  `
    **Output**: Pooling page UI.

15. **Prompt**:` like ask the user to put the routeId and year then click on the calculate and then - cb_before, applied, cb_after and bank and apply show up  `
    **Output**: Interactive calculate UI with cb_before/applied/cb_after + bank/apply flows.

16. **Prompt**: `if the routeid or year is not found when the user enter then handle the case that froent don't get damaged  `
    **Output**: Basic error handling in frontend forms.

17. **Prompt**:` only those ships whose CB is calculated should be in the pooling.  `
    **Output**: Initial filtering logic for pooling.  
    **Issue**: Not fully enforced until Codex + manual tweak.

**Overall ChatGPT Outcome**: Delivered solid template/framework quickly. After these prompt it started hallucinating and could not refine further or connect components cleanly.

### Prompts & Outputs – Gemini (Refinement & UI/Polish)
Used after ChatGPT to clean up and enhance.

1. **Prompt**: `Make the UI proper, like keep the UI minimilistic like black ( lines ) and white, but professional as well, also don't change any name, function etc, just fix the UI  `
   **Output**: Clean minimalist black/white professional UI across all pages. No functional changes.

2. **Prompt**: `give the accordian symbol in the operational year  `
   **Output**: Accordion component added for operational year sections.

3. **Prompt**:` add the filter for route-id year and type in routepage  `
   **Output**: Filters for route-id, year, and type on Routes page.

4. **Prompt**:` generate the mock data for seeding  `
   **Output**: Complete mock data seeding scripts for routes, ships, compliance, etc.

5. **Prompt**: `also one button for reset filter  `
   **Output**: Reset filter button added (integrated with prompt 3).  
   **Overall**: Gemini successfully refined the entire codebase post-ChatGPT.

### Prompts & Outputs – Codex (Restructuring Banking & Pooling)
Used for precise code corrections, driven by logic feeded by my analysis.

1. **Prompt**:` In banking there should be only one bank (global bank balance). When surplus is added (banked), the bank balance should increase. When applied, the bank balance should decrease and be usable for deficits. It should behave like a single global bank balance. If compliance balance (CB) is already calculated, it should be listed below. There should be a dropdown to calculate compliance balance for entries where it is not yet calculated.  `
   **Output**: Global single-bank implementation with transaction history, CB listing, and calculate dropdown.  
   **Correction**: Fully resolved earlier per-route hallucination.

2. **Prompt**: `Once compliance balance is calculated, it should not be recalculated again. Users should be able to view the compliance balance directly from the table. If someone adds to the bank or applies from it, the transaction should be stored in banking. There should be an option to view transactions. All such transactions should be displayed in that section.  `
   **Output**: No-recalculate enforcement + transaction storage and view.  
   **Correction**: Fixed recalculation bugs.

3. **Prompt**: `in the pooling table, mention if the cb is not calculated yet and disable the checkbox and once the cb is calculated then enable the checkbox  `
   **Output**: Conditional checkboxes + “CB not calculated” messaging in pooling table.

### Prompts & Outputs – Cursor (Migration & Testing)
Cursor analyzed the actual folder (backend with file-based JSON DB).

1. **Prompt**:` now analyse the folder and there is backend folder, and I have currently implemented file based database, and I want to change it to postgress database. for the schema you can see the code implementation and also banking compliance routes pools .json files  `
   **Output**: Full analysis of folder + PostgreSQL schema, Prisma migrations, updated outbound adapters, and seamless switch from JSON files.  
   **Benefit**: Saved huge time (I was not familiar with Postgres initially).

2. **Prompt**:
   ```
   Now for the testing first let's go through the backend files, and we will be using these tests: 
   ## Testing Checklist  
   - **Unit** — ComputeComparison, ComputeCB, BankSurplus, ApplyBanked, CreatePool  
   - **Integration** — HTTP endpoints via Supertest  
   - **Data** — Migrations + Seeds load correctly  
   - **Edge cases** — Negative CB, over-apply bank, invalid pool  
   now let's create the Unit test for Compute Comparison. ComputeCB BankSurplus ApplyBanked CreatePool  
   ```
   **Output**: Complete test suite covering all listed unit tests, integration tests, data validation, and edge cases. Cursor handled types and debugging automatically.

## Validation / Corrections
- Ran full backend locally after every major change, verified all endpoints with Postman/Supertest.
- Manually tested CB formulas tab-by-tab (prompt 9) against expected values.
- Fixed CB reset bug after banking (re-calculation ignored bank effects) by updating domain service logic.
- Enforced global bank architecture and year-wise pooling via my explicit guidance + Codex.
- Confirmed frontend error handling (missing route/year) prevents crashes.
- Ran all generated tests, migrations/seeds load correctly, edge cases (negative CB, over-apply, invalid pool) pass.
- UI validated for responsiveness and professional look, filters/accordion/reset button work as specified.

## Observations
- **Where agent saved time**: Cursor saved enormous time on tests — I only gave the checklist and function names, it wrote full unit/integration tests with proper types and edge cases few of them were handled by me explicitly like the negative CB. The Postgres migration was painless because Cursor analyzed the existing file-based folder and generated schema/migrations automatically from the file based json which I initially created. Started with file-based DB for rapid prototyping, then migrated once comfortable — huge productivity win.
- **Where it failed or hallucinated**: ChatGPT hallucinated after the initial template and could not connect further components. Banking was tricky/open-ended, all AIs initially hallucinated per-route banks instead of a single global bank. CB section had persistent bugs (re-calculating after banking reset CB without applying bank effect). Pooling initially ignored “year-wise” and “only ships with calculated CB” requirements.
- **How you combined tools effectively**: ChatGPT for fast broad framework → Gemini for polish + UI + mock data → Codex for surgical logic fixes → Cursor for analysis, migration, and testing. Provided my own architecture clarifications (global bank, year-wise pooling, CB-only checkbox logic) whenever AIs hallucinated. Used file-based DB as a safe stepping stone before Postgres.

## Best Practices Followed
- Step-by-step iterative prompting (idea → basic backend → specific features → frontend → verification → polish).
- Strict adherence to Hexagonal Architecture with clear dependency inversion.
- Started simple (file-based DB + JSON files) then migrated to Postgres for production readiness.
- Isolated UI prompts to Gemini (“don’t change any name, function etc.”).
- Provided explicit architecture rules for open-ended features (global bank, year-wise pooling).
- Used detailed testing checklist with Cursor for complete coverage.
- Manual formula verification and bug fixes where AI outputs were incomplete.
- Generated mock data early for consistent local testing.
- Handled all edge cases explicitly (missing route/year, uncalculated CB, over-apply bank).