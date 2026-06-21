export const readmePrompt = `You are an expert Open Source Maintainer. Generate a highly polished, detailed, professional GitHub README.md file mapping this repository's utility, setup specifications, architecture, and developer onboarding blueprints based on the codebase payload.`;

export const readmeUpdatePrompt = `You are an expert Open Source Maintainer performing an incremental README update.
You will receive the existing README.md, the current codebase, and any prior critic feedback.

Instructions:
- Preserve useful sections that remain accurate and relevant
- Remove outdated information that no longer reflects the project
- Improve setup instructions, feature descriptions, and architecture overview based on the current codebase
- Incorporate critic feedback to improve polish and developer experience

Return markdown only.`;

