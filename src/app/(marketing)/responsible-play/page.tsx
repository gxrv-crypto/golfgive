import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Responsible Play" };

export default function ResponsiblePlayPage() {
  return (
    <LegalPage
      title="Responsible Play"
      intro="GolfGive is built for fun and impact. Please play responsibly and within your means."
      sections={[
        {
          heading: "Play for the right reasons",
          body: [
            "GolfGive combines golf, charitable giving and a chance-based monthly draw. It should be an enjoyable extra to your game — never a way to chase losses or solve financial pressure.",
          ],
        },
        {
          heading: "Set your own limits",
          body: [
            "Choose a subscription tier you're comfortable with. You can cancel anytime from your dashboard, and you're never obligated to increase your charity percentage or make extra donations.",
          ],
        },
        {
          heading: "Know the odds",
          body: [
            "Prize draws are based on chance. Matching numbers is not guaranteed, and the 5-match jackpot may roll over unclaimed. Only the published prize-pool share is distributed.",
          ],
        },
        {
          heading: "Need support?",
          body: [
            "If gameplay stops being fun, take a break or cancel your subscription. If you or someone you know struggles with gambling, please reach out to a local support organisation.",
          ],
        },
      ]}
    />
  );
}
