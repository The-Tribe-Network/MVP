import { SectionContainer } from "@/components/marketing/section-container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const faqs = [
    {
      question: "What is Tribe?",
      answer:
        "Tribe is organizational infrastructure for communities that gather in person. We help groups stay connected with organized photo albums, event coordination, and granular permissions — all in one private, ad-free home.",
    },
    {
      question: "How is Tribe different from Facebook Groups?",
      answer:
        "We're not a social network — we're organizational infrastructure. Tribe offers granular permissions that mirror real-world community structures, organized photo albums that preserve memories permanently, and a chronological feed that doesn't bury your important updates in algorithmic noise.",
    },
    {
      question: "What communities is Tribe for?",
      answer:
        "Any existing community that gathers in person: churches, sports teams, clubs, alumni groups, hobby communities, coworking spaces, and more. If you already have the people, we provide the tools.",
    },
    {
      question: "When will Tribe launch?",
      answer:
        "We're currently building the waitlist and will invite early access users soon. Sign up to be first in line and help shape the product with your feedback.",
    },
    {
      question: "Is Tribe free?",
      answer:
        "Free during the early access period. Future pricing will be transparent and community-friendly — no ads, no data mining, ever. Early adopters will get special benefits when paid plans launch.",
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
          <h2 className="text-3xl md:text-5xl font-bold">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Tribe
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
