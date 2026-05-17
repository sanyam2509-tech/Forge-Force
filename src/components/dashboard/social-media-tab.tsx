"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import type { SocialMediaIdea } from "@/lib/types";

interface SocialMediaTabProps {
  socialMedia: SocialMediaIdea[];
  onRegenerate: () => void;
}

const typeStyles: Record<string, string> = {
  reel: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  story: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  teaser: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  countdown: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export function SocialMediaTab({
  socialMedia,
  onRegenerate,
}: SocialMediaTabProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyItem = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const formatIdeaAsText = (idea: SocialMediaIdea) => {
    return `${idea.title}\n\n${idea.description}\n\nCaption:\n${idea.caption}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Social Media Ideas
        </CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={onRegenerate}>
            <RefreshCw className="size-3.5 mr-1" />
            Regenerate
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {socialMedia.map((idea, index) => (
            <div
              key={index}
              className="rounded-lg border border-border/50 bg-secondary/50 p-4"
            >
              {/* Top: type badge + title + copy */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={typeStyles[idea.type] ?? ""}
                  >
                    {idea.type}
                  </Badge>
                  <h4 className="font-semibold text-sm">{idea.title}</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => copyItem(formatIdeaAsText(idea), index)}
                >
                  {copiedIndex === index ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              </div>

              {/* Description */}
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {idea.description}
              </p>

              {/* Caption quote block */}
              <div className="mt-3 border-l-2 border-primary/50 pl-3 text-sm italic leading-relaxed whitespace-pre-wrap">
                {idea.caption}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
