import { profile } from '../data/profile';
import home from './index.astro?raw';
import workbench from './projects/payment-risk-workbench.astro?raw';

// Use public website sources only; private job-search files never enter the agent.
const plainText = (source: string) => source.replace(/^---[\s\S]*?---/, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
export function GET() {
  return Response.json({
    profile,
    about: 'Tomas is a product data scientist based in the New York Metro area. He values asking the right questions, explicit assumptions, and evidence that clarifies decisions.',
    selectedWork: plainText(home.slice(home.indexOf('<section id="work"'), home.indexOf('<section id="skills"'))),
    paymentRiskWorkbench: plainText(workbench),
    sources: [
      { title: 'Experience, education, and skills', url: 'https://tomasferrer.com/#experience' },
      { title: 'Selected work', url: 'https://tomasferrer.com/#work' },
      { title: 'Payment Risk Workbench', url: 'https://tomasferrer.com/projects/payment-risk-workbench/' },
    ],
  });
}
