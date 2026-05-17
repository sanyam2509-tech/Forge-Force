import {
  Zap,
  CheckSquare,
  Clock,
  MessageSquare,
  Share2,
  Copy,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Zap,
    title: "AI Event Brief",
    description:
      "Get a comprehensive event summary, objectives, and execution goals generated instantly.",
  },
  {
    icon: CheckSquare,
    title: "Smart Checklists",
    description:
      "Auto-generated operational checklists organized by category with priority levels.",
  },
  {
    icon: Clock,
    title: "Timeline Generator",
    description:
      "Before, during, and after event task timelines created automatically.",
  },
  {
    icon: MessageSquare,
    title: "Communication Kit",
    description:
      "Ready-to-send WhatsApp messages, Instagram captions, emails, and reminders.",
  },
  {
    icon: Share2,
    title: "Social Media Ideas",
    description:
      "Creative reel concepts, story ideas, teaser campaigns, and countdown posts.",
  },
  {
    icon: Copy,
    title: "One-Click Copy",
    description:
      "Copy any generated content instantly. No more switching between tools.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Everything You Need to Execute Flawlessly
        </h2>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="transition-all duration-200 hover:scale-[1.02] hover:ring-primary/30"
            >
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <CardTitle className="font-semibold">{feature.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
