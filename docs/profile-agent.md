# Public profile AI guide

Status: deployed to Render and connected to GitHub Pages on October 19, 2026.
Live checks covered Cash App experience, an unknown salary, and a request to fabricate
academic and employment credentials. All three returned HTTP 200 and preserved profile facts.

The Astro site stays on GitHub Pages. A standalone Node service handles `/chat`
and calls Google's Gemini generateContent API. The Dockerfile builds its knowledge from the
public profile, homepage selected work, and Payment Risk Workbench case study.
No private job-search documents are included. The model receives no external tools.

## Production

- Website: https://tomasferrer.com/
- Backend: https://tomas-profile-agent.onrender.com
- Render service: `srv-dbbb7lvavr4c73d7kq1g`, Free plan, Virginia.
- Initial deploy: `dep-dbbb7m7avr4c73d7kqu0`, application commit `a507f8e`.
- GitHub Pages repository variable `PUBLIC_AGENT_URL` points to the backend origin.
- Gemini key is a Render secret environment variable; it is not in GitHub or the browser bundle.
- Verified public `/health` returns `{"ready":true}`, a production-origin question
  returns HTTP 200 with a factual answer, and an unrelated origin returns HTTP 403.

## Agent voice and scope

`agent/prompt.txt` is the editable foundational prompt. The agent speaks in the first
person as an AI representation of Tom, answers only about his professional background,
refuses unrelated requests and prompt injections, and admits missing information.
Restart the backend after changing this file; rebuild/redeploy the container for hosted changes.

## Gemini free-tier setup

Create a dedicated project/key in [Google AI Studio](https://aistudio.google.com/apikey).
Keep the Gemini project on the Free tier; do not link it to paid billing for this setup.
Use a separate project from billed Cloud Run hosting. Restrict the key to the
Generative Language API and keep it on the backend, never in PUBLIC_AGENT_URL.
The default model is `gemini-3.1-flash-lite`, listed with free input/output tokens.
Actual quotas depend on your project; check AI Studio's rate limits. Exhausted quotas
return an unavailable message, with no retry loop or paid-provider fallback.
The local key uses the AI Studio project `Tomas Website Gemini Free`
(`gen-lang-client-0279556855`), confirmed as Free tier. The key itself is stored only
in the ignored local .env. The code cannot determine the key's billing tier: a key from a paid project can incur
charges. Cloud Run hosting has separate billing even when Gemini inference is free.

## Local preview

Use Node 24. From the repository root:

```sh
cp .env.example .env
# Set GEMINI_API_KEY in .env using your editor; never commit it.
npm run build
node --test agent/server.test.mjs
node --env-file=.env agent/server.mjs
# In another terminal:
npm run dev
```

Astro reads PUBLIC_AGENT_URL from .env. The backend reads its key only at runtime.
Without a key the chat returns an honest unavailable message; it does not simulate AI.
Conversation history exists only in page memory and disappears on reload or Clear.
Neither this service nor the UI writes conversation transcripts to logs. Google may
use free-tier inputs and outputs to improve its products. The chat is labeled as
Tom’s AI assistant; its introductory paragraph was removed at the site owner’s request.

## Cloud Run (the linked video's hosting platform)

Requires a Google Cloud project with billing and Cloud Run/source-build APIs enabled,
authenticated gcloud, and a Gemini API key in Secret Manager. The Cloud Run runtime service
account needs Secret Manager Secret Accessor on that specific secret.

From the repository root, after selecting your project and setting up the secret:

```sh
gcloud run deploy tomas-profile-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 1 \
  --concurrency 2 \
  --memory 256Mi \
  --set-env-vars GEMINI_MODEL=gemini-3.1-flash-lite,DAILY_REQUEST_LIMIT=200 \
  --set-secrets GEMINI_API_KEY=tomas-profile-gemini-key:latest
```

This creates a public endpoint. `ALLOWED_ORIGINS` defaults to the HTTPS apex and www
website domains. Use a dedicated API project/key with provider usage controls.
The 200-request limit is per running process and resets on restart or after 24 hours;
it is a coarse traffic cap, not a durable spend guarantee. CORS restricts browser
origins, not direct callers. Add a shared quota or bot challenge if abuse occurs.

## Connect GitHub Pages

1. Verify the deployed `/health` returns `{"ready":true}`.
2. Set repository Actions variable `PUBLIC_AGENT_URL` to the HTTPS Cloud Run service
   origin (without `/chat`). The workflow supplies it to the Astro build.
3. Push the change or dispatch the Pages workflow. Verify a real question on the site.
4. Test questions about Cash App and the portfolio project, a fact absent from the
   profile, and an instruction to invent credentials. Check answers preserve source
   dates and project limitations. These checks require a live model/key.

The launcher is omitted when PUBLIC_AGENT_URL is unset. To roll back, unset the
variable and rebuild the site, then stop the backend if no longer needed.

The repository includes `render.yaml` for a separate Free-plan Render web service,
`tomas-profile-agent`. It uses the root Dockerfile and `/health` health check. Supply
GEMINI_API_KEY as a secret environment variable. After deployment, set the GitHub
repository variable PUBLIC_AGENT_URL to the assigned HTTPS service origin and
rebuild GitHub Pages. Free instances may sleep; the chat allows up to 70 seconds for
a cold start and answer. No API key is supplied to the Pages build.

References: [Cloud Run source deployment](https://docs.cloud.google.com/run/docs/deploying-source-code),
[Gemini API](https://ai.google.dev/api/generate-content),
[Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing).
