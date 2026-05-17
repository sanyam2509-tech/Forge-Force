"use client";

import { useState } from "react";
import { MessageCircle, Camera, Bell, Mail, Copy, Check, RefreshCw, ExternalLink, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { CommunicationItem, EventInput } from "@/lib/types";
import { communicationTextToEmailHtml } from "@/lib/email-format";

interface CommunicationTabProps {
  communication: CommunicationItem[];
  eventInput: EventInput;
  onRegenerate: () => void;
}

type SendState = {
  open: boolean;
  recipientEmail: string;
  sending: boolean;
  result: "sent" | "demo" | "failed" | null;
  error: string | null;
  lastSentAt: string | null;
};

const DEFAULT_SEND_STATE: SendState = {
  open: false,
  recipientEmail: "",
  sending: false,
  result: null,
  error: null,
  lastSentAt: null,
};

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
  eventInput,
  onRegenerate,
}: CommunicationTabProps) {
  const { isCopied, copy } = useCopyToClipboard();
  const [sendStates, setSendStates] = useState<Record<string, SendState>>({});

  const updateSendState = (type: string, updates: Partial<SendState>) => {
    setSendStates(prev => ({
      ...prev,
      [type]: { ...(prev[type] ?? DEFAULT_SEND_STATE), ...updates },
    }));
  };

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
            const sendState = sendStates[item.type] ?? DEFAULT_SEND_STATE;

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
                  <div className="flex items-center gap-1">
                    {/* Copy button — always shown */}
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

                    {/* WhatsApp: Share button */}
                    {item.type === "whatsapp" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://wa.me/?text=${encodeURIComponent(item.content)}`,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="size-3.5 mr-1.5" />
                        Share on WhatsApp
                      </Button>
                    )}

                    {/* Email: Send Email button */}
                    {item.type === "email" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateSendState(item.type, { open: !sendState.open })
                        }
                      >
                        <Mail className="size-3.5 mr-1.5" />
                        Send Email
                      </Button>
                    )}

                    {/* Instagram: Copy Caption button */}
                    {item.type === "instagram" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copy(item.content, `${item.type}-caption`)}
                      >
                        {isCopied(`${item.type}-caption`) ? (
                          <Check className="size-3.5 mr-1.5" />
                        ) : (
                          <Share2 className="size-3.5 mr-1.5" />
                        )}
                        Copy Caption
                      </Button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="mt-3 rounded bg-background/50 p-3 text-sm whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </div>

                {/* Email inline send form */}
                {item.type === "email" && sendState.open && (
                  <div className="bg-background/50 rounded-lg p-3 mt-2 border border-border/50 space-y-3">
                    {(() => {
                      const { subject } = communicationTextToEmailHtml(
                        item.content,
                        eventInput.title
                      );
                      return (
                        <p className="text-xs text-muted-foreground">
                          Subject:{" "}
                          <span className="font-medium text-foreground">
                            {subject}
                          </span>
                        </p>
                      );
                    })()}
                    <Input
                      type="email"
                      placeholder="recipient@example.com"
                      value={sendState.recipientEmail}
                      onChange={e =>
                        updateSendState(item.type, { recipientEmail: e.target.value })
                      }
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={sendState.sending || !sendState.recipientEmail}
                        onClick={async () => {
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          if (!emailRegex.test(sendState.recipientEmail)) return;
                          updateSendState(item.type, {
                            sending: true,
                            result: null,
                            error: null,
                          });
                          try {
                            const { subject, html } = communicationTextToEmailHtml(
                              item.content,
                              eventInput.title
                            );
                            const res = await fetch("/api/send-reminder", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                to: sendState.recipientEmail,
                                subject,
                                html,
                                eventTitle: eventInput.title,
                              }),
                            });
                            const data = await res.json();
                            if (!res.ok) {
                              updateSendState(item.type, {
                                sending: false,
                                result: "failed",
                                error: data.error ?? "Send failed",
                              });
                            } else {
                              updateSendState(item.type, {
                                sending: false,
                                result: data.status === "demo" ? "demo" : "sent",
                                lastSentAt: new Date().toLocaleTimeString(),
                              });
                            }
                          } catch {
                            updateSendState(item.type, {
                              sending: false,
                              result: "failed",
                              error: "Network error",
                            });
                          }
                        }}
                      >
                        {sendState.sending ? "Sending..." : "Send"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateSendState(item.type, { open: false })
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                    {sendState.result === "sent" && (
                      <p className="text-xs text-green-400">
                        Sent at {sendState.lastSentAt}
                      </p>
                    )}
                    {sendState.result === "demo" && (
                      <p className="text-xs text-yellow-400">
                        Demo mode — email not actually sent. Add RESEND_API_KEY
                        to send real emails.
                      </p>
                    )}
                    {sendState.result === "failed" && (
                      <p className="text-xs text-red-400">
                        {sendState.error}{" "}
                        <button
                          className="underline"
                          onClick={() =>
                            updateSendState(item.type, {
                              result: null,
                              error: null,
                            })
                          }
                        >
                          Retry
                        </button>
                      </p>
                    )}
                  </div>
                )}

                {/* Last sent timestamp (when form is closed) */}
                {item.type === "email" &&
                  !sendState.open &&
                  sendState.lastSentAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last sent at {sendState.lastSentAt}
                    </p>
                  )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
