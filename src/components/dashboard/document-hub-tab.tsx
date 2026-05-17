"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { collectDocuments } from "@/lib/schedule";
import type { EventDocument, EventInput } from "@/lib/types";

interface DocumentHubTabProps {
  eventInput: EventInput;
}

export function DocumentHubTab({ eventInput }: DocumentHubTabProps) {
  const { isCopied, copy } = useCopyToClipboard();
  const initialDocs = useMemo(() => collectDocuments(eventInput), [eventInput]);
  const [documents, setDocuments] = useState<EventDocument[]>(initialDocs);
  const readyCount = documents.filter((doc) => doc.ready).length;
  const readiness = documents.length ? (readyCount / documents.length) * 100 : 0;

  const toggleReady = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ready: !doc.ready } : doc))
    );
  };

  return (
    <div className="space-y-5">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="size-5 text-primary" />
            Event Document Hub
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-primary/30 text-primary">
              {readyCount}/{documents.length} ready
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Document readiness</span>
              <span>{Math.round(readiness)}%</span>
            </div>
            <Progress value={readiness} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl border border-border/60 bg-secondary/30 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant={doc.scope === "Parent" ? "outline" : "secondary"}>
                      {doc.scope}
                    </Badge>
                    <p className="mt-3 font-semibold">{doc.name}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      doc.priority === "High"
                        ? "border-red-500/30 text-red-300"
                        : "border-primary/30 text-primary"
                    }
                  >
                    {doc.priority}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{doc.purpose}</p>
                <div className="mt-4 rounded-lg border border-border/40 bg-background/35 p-3 text-xs leading-relaxed text-muted-foreground">
                  {doc.content.slice(0, 220)}
                  {doc.content.length > 220 ? "..." : ""}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copy(doc.content, doc.id)}
                  >
                    {isCopied(doc.id) ? (
                      <Check className="mr-1 size-3.5" />
                    ) : (
                      <Copy className="mr-1 size-3.5" />
                    )}
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant={doc.ready ? "secondary" : "ghost"}
                    onClick={() => toggleReady(doc.id)}
                  >
                    <ShieldCheck className="mr-1 size-3.5" />
                    {doc.ready ? "Ready" : "Mark Ready"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
