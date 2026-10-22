import { profile } from '../data/profile';
import home from './index.astro?raw';
import workbench from './projects/payment-risk-workbench.astro?raw';
import websiteAgent from './projects/website-ai-agent.astro?raw';
import supportTriage from './projects/support-triage-console.astro?raw';

// Use public website sources only; private job-search files never enter the agent.
const plainText = (source: string) => source.replace(/^---[\s\S]*?---/, '').replace(/<(style|script|pre)\b[^>]*>[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
export function GET() {
  return Response.json({
    profile,
    about: 'Tomas is a full stack data scientist based in the New York Metro area. He builds data and AI systems that turn analysis and machine learning into useful products and better decisions. He values clear assumptions, reliable engineering, and evidence that supports decisions.',
    selectedWork: plainText(home.slice(home.indexOf('<section id="work"'), home.indexOf('<section id="skills"'))),
    paymentRiskWorkbench: plainText(workbench),
    websiteAiAgent: plainText(websiteAgent),
    supportTriageConsole: plainText(supportTriage),
    sources: [
      { title: 'Experience, education, and skills', url: 'https://tomasferrer.com/#experience' },
      { title: 'Website AI agent', url: 'https://tomasferrer.com/projects/website-ai-agent/' },
      { title: 'Support Triage Console', url: 'https://tomasferrer.com/projects/support-triage-console/' },
      { title: 'Selected work', url: 'https://tomasferrer.com/#work' },
      { title: 'Payment Risk Workbench', url: 'https://tomasferrer.com/projects/payment-risk-workbench/' },
    ],
  });
}
