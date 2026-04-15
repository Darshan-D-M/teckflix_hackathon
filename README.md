# SafeRoute Pulse

A compact AI-powered mobility prototype for smarter commute decisions.

## Hackathon Challenge Brief

### 1. Before You Begin
Make sure the following prerequisites are completed:

- Google Antigravity is downloaded and set up on your system.
- Git is installed and configured.
- You have an active GitHub account.
- You are able to create and manage public repositories.

### 2. Important Rules
- You have a maximum of 2 submission attempts for the Warm Up Round.
- You have a maximum of 4 submission attempts for the Actual Challenge Round.
- The repository size must be less than 1 MB.
- The GitHub repository must be public.
- The repository should contain only one branch.
- Failure to follow these rules may result in your submission not being evaluated.

### 3. Challenge Expectations
Your solution should demonstrate:

- Ability to build a smart, dynamic assistant.
- Logical decision making based on user context.
- Effective use of Google Services.
- Practical and real-world usability.
- Clean and maintainable code.

Participants must choose one of the provided challenge verticals and design their solution around that persona and logic.

### 4. How to Work on Your Project
- Create a new repository on GitHub.
- Ensure the repository is set to public.
- Open Google Antigravity.
- Clone your repository inside Antigravity.
- Build your solution through prompting and coding.
- Regularly commit and push your progress.
- Keep all work within a single branch.

### 5. What to Submit
Note: For detailed submission steps, refer to the official document link provided by the organizers.

Your submission must include:

- A public GitHub repository link.
- Complete project code inside the repository.
- A README explaining:
	- Your chosen vertical.
	- Approach and logic.
	- How the solution works.
	- Any assumptions made.

### 6. Evaluation Focus Areas
Submissions will be reviewed on:

- Code Quality: structure, readability, maintainability.
- Security: safe and responsible implementation.
- Efficiency: optimal use of resources.
- Testing: validation of functionality.
- Accessibility: inclusive and usable design.
- Google Services: meaningful integration of Google Services.

## What it does
- Solves one specific problem: route safety and delay prediction for urban commuters.
- Uses live Google Maps data (when configured) or simulated signals to generate an immediate recommendation.
- Provides actionable output and a Google Maps handoff in seconds.

## Google Services Integration

SafeRoute Pulse leverages Google's ecosystem for real-world accuracy:

### Enabled Features
- **Google Maps Directions API** — Fetch real travel times, distances, and routes instead of simulating data
- **Google Maps Places API** — Autocomplete origin/destination with precise geographical coordinates
- **Google Sheets API** — Log all commute analyses for analytics and pattern tracking (backend proxy required)

### Setup
See [GOOGLE_SERVICES_SETUP.md](GOOGLE_SERVICES_SETUP.md) for complete configuration instructions.

**Quick Start:**
1. Enable APIs in your Google Cloud project (`thematic-ruler-493404-h6`)
2. Create an API key for Maps Directions API
3. Update `GOOGLE_CONFIG.apiKey` in `app.js`
4. (Optional) Set up Google Sheets logging with a backend proxy

Without API keys, the app gracefully falls back to simulated data while maintaining full functionality.

## Run
Open `index.html` in a browser.

## Concept
The prototype blends trip context, commute mode, and simulated city signals into:
- a safety score
- delay prediction
- crowding and reliability indicators
- a short action plan for the user
