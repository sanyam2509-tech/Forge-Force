"use client";

import { MessageCircle, Camera, Bell, Mail, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { CommunicationItem } from "@/lib/types";

interface CommunicationTabProps {
  communication: CommunicationItem[];
  onRegenerate: () => void;
}

const typeConfig: Record<
  string,
  { icon: React.ElementType; color: string }
> = {
  whatsapp: { icon: MessageCircle, color: "text-green-400" },
  instagram: { icon: Camera, color: "text-pink-400" },
  reminder: { icon: Bell, color: "text-yellow-400" },
  email: { icon: Mail, color: "text-blue-400" },
};

export function CommunicationTab({
  communication,
  onRegenerate,
}: CommunicationTabProps) {
  const { isCopied, copy } = useCopyToClipboard();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Communication Kit
        </CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={onRegenerate}>
            <RefreshCw className="size-3.5 mr-1" />
            Regenerate All
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {communication.map((item) => {
            const config = typeConfig[item.type];
            if (!config) return null;
            const Icon = config.icon;

            return (
              <div
                key={item.type}
                className="rounded-lg border border-border/50 bg-secondary/50 p-4"
              >
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`size-4 ${config.color}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copy(item.content, item.type)}
                  >
                    {isCopied(item.type) ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </div>

                {/* Content */}
                <div className="mt-3 rounded bg-background/50 p-3 text-sm whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
