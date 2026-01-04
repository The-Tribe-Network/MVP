import { SectionContainer } from "@/components/marketing/section-container";
import { Quote } from "lucide-react";

export function SurgeonGeneralQuote() {
  return (
    <SectionContainer background="muted">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <Quote className="w-12 h-12 text-primary/20 absolute -top-2 -left-2" />
          <blockquote className="text-2xl md:text-3xl font-semibold text-foreground leading-relaxed pl-8 pt-4">
          The mortality impact of being socially disconnected is similar to that
          caused by smoking up to 15 cigarettes a day,
          </blockquote>
          <div className="mt-6 pl-8">
            <p className="text-muted-foreground text-lg">
              — Dr. Vivek Murthy, U.S. Surgeon General{" "}
              <a
                href="https://www.hhs.gov/sites/default/files/surgeon-general-social-connection-advisory.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Social Connection Advisory
              </a>
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              May 2, 2023
            </p>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}

