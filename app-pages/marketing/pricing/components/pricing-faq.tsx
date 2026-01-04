import { SectionContainer } from "@/components/marketing/section-container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function PricingFAQ() {
  const faqs = [
    {
      question: "Is the Free plan really free forever?",
      answer:
        "Yes! The Free plan includes all core features for up to 50 members and is free forever. We believe every community should have access to great tools, regardless of budget. Pro and Business plans are for communities that need more storage, members, or advanced features.",
    },
    {
      question: "What happens when I hit the Free plan limits?",
      answer:
        "On the Free plan, you can have up to 50 members, 10GB of storage (~2,000 photos or ~70 videos), and 3 active events at a time. Video uploads are capped at 1080p. If you hit these limits or need 4K video uploads, you can upgrade to Pro for unlimited members and events, plus 100GB of storage. You'll never lose access to your existing data.",
    },
    {
      question: "What counts toward storage?",
      answer:
        "Storage is used by photos and videos uploaded to The Vault, event media, and post attachments. Text content (posts, comments, member profiles) doesn't count against your storage quota. Free gets 10GB (~2,000 photos or ~70 one-minute videos), Pro gets 100GB, and Business gets unlimited storage.",
    },
    {
      question: "Why is video quality limited on the Free plan?",
      answer:
        "The Free plan limits video uploads to 1080p resolution to help manage storage costs. A 1-minute 1080p video is about 130-150MB, while a 4K video is 350-400MB. If you need to upload high-quality 4K videos, Pro and Business plans support unlimited video quality.",
    },
    {
      question: "What are per-member permission overrides?",
      answer:
        "This is a Pro feature that lets you customize permissions for specific members without changing their role. For example, you could prevent a specific member from creating events while keeping them as a regular member. It's perfect for nuanced community management.",
    },
    {
      question: "What happens when paid tiers launch?",
      answer:
        "Early access users on the Free plan will stay on the Free plan with all its features. We may introduce new advanced features exclusive to paid plans, but we'll never take away features you already have. As a thank you for being an early adopter, you'll also get special pricing if you ever want to upgrade.",
    },
    {
      question: "Can I upgrade or downgrade anytime?",
      answer:
        "Absolutely. You can upgrade or downgrade at any time. If you downgrade, you'll keep access to paid features until the end of your billing period. No lock-ins, no penalties.",
    },
    {
      question: "Do you offer annual discounts?",
      answer:
        "Yes! Pay annually and save: Pro is $180/year (save $48, about 20% off) and Business is $480/year (save $108, about 18% off). Annual plans also include better support priority.",
    },
    {
      question: "Do you offer discounts for nonprofits?",
      answer:
        "Yes! We're committed to supporting nonprofits, educational institutions, and community organizations. Reach out to us after joining the waitlist, and we'll work out pricing that makes sense for your organization.",
    },
    {
      question: "Will you ever show ads or sell our data?",
      answer:
        "Never. This is a core value, not a feature. We make money through optional paid plans, not by exploiting your community. Your data stays yours. No ads, no tracking, no selling to third parties. Period.",
    },
  ];

  return (
    <SectionContainer>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Tribe pricing
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border rounded-xl px-6 bg-card"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="text-lg font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </SectionContainer>
  );
}
