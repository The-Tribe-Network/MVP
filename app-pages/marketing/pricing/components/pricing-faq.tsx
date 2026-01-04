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
        "Yes! The Free plan includes all core features and is free forever. We believe every community should have access to great tools, regardless of budget. Our Pro and Enterprise plans are for communities that need advanced features and premium support.",
    },
    {
      question: "What happens when paid tiers launch?",
      answer:
        "Early access users on the Free plan will stay on the Free plan with all its features. We may introduce new advanced features exclusive to paid plans, but we'll never take away features you already have. As a thank you for being an early adopter, you'll also get special pricing if you ever want to upgrade.",
    },
    {
      question: "Can I upgrade or downgrade anytime?",
      answer:
        "Absolutely. When paid plans launch, you can upgrade or downgrade at any time. If you downgrade, you'll keep access to paid features until the end of your billing period. No lock-ins, no penalties.",
    },
    {
      question: "Do you offer discounts for nonprofits or educational institutions?",
      answer:
        "Yes! We're committed to supporting nonprofits, educational institutions, and community organizations. Reach out to us after joining the waitlist, and we'll work out pricing that makes sense for your organization.",
    },
    {
      question: "How does member count affect pricing?",
      answer:
        "The Free plan supports unlimited members. For Pro and Enterprise, pricing may be based on active members or features needed. We'll share detailed pricing closer to launch, but our goal is to keep it simple and transparent.",
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
