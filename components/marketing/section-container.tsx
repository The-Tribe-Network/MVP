interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  background?: "default" | "muted";
  id?: string;
}

export function SectionContainer({
  children,
  className = "",
  background = "default",
  id,
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={`
        py-24 md:py-32
        ${background === "muted" ? "bg-secondary/10" : ""}
        ${className}
      `}
    >
      <div className="container mx-auto px-4">{children}</div>
    </section>
  );
}
