# DIY Recipes

A web app for managing, analyzing, and iterating on DIY home product recipes (skincare, haircare, etc.).

---

## Features

- **Magic Link Authentication** via Supabase
- **Recipe & Ingredient Management**
- **CSV Import** for bulk recipe upload
- **Versioning & Iteration** workflows
- **Ingredient Analysis** (compatibility, pH, shelf life)
- **Batch Tracking**
- **Optional AI Suggestions** via OpenAI integration

---

## Tech Stack

- **Frontend:** Vanilla JavaScript, HTML, CSS
- **Backend:** Supabase (Postgres DB, Auth, Storage)
- **Optional:** Node.js Express server for AI proxy (`server.js`)
- **Build/Run:** Node.js, npm

---

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/DIY_Recipes.git
cd DIY_Recipes
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

- Copy `.env.example` to `.env`
- Add your Supabase URL and anon/public API key
- (Optional) Add OpenAI API key if using AI features

4. **Run the app locally**

```bash
npm start
```

5. **Access**

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Folder Structure

- `/js` — Frontend JavaScript modules
- `/docs` — Additional documentation
- `/tests` — Test files
- `/coverage` — Test coverage reports
- `server.js` — Optional Express backend
- `architecture.md` — System architecture overview
- `documentation-standards.md` — Documentation guidelines

---

## Contribution Guidelines

- Follow the [Documentation Standards](documentation-standards.md).
- Use clear, detailed [JSDoc](https://jsdoc.app/) comments.
- Write concise, well-structured code.
- Branch naming: `feature/xyz`, `bugfix/abc`
- Commits: Use descriptive messages.
- Run tests before PRs.
- Update documentation as needed.
- See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) if available.

---

## Documentation Links

- [Architecture](architecture.md)
- [Documentation Standards](documentation-standards.md)
- [API Docs](js/api.js)
- [Authentication](js/auth.js, js/auth-ui.js)
- [Testing Guide](docs/TESTING.md)

---

## License

See [LICENSE](LICENSE).

---

## Credits

Built with ❤️ by the DIY Recipes team.