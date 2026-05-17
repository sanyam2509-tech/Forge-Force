"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Gauge, Radio, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm text-primary"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Sparkles className="size-3.5" />
            AI operational intelligence for event teams
          </motion.div>
        <motion.h1
          className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Run Events Like an AI-Powered Command Center
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        >
          EventOS AI turns raw event details into realistic operations plans,
          readiness signals, volunteer coverage, communication flows, and
          creator-grade launch strategy.
        </motion.p>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
        >
          <Link href="/create">
            <Button size="lg" className="gap-2 px-6 text-base">
              Generate Event Workspace
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </motion.div>
        </div>

        <motion.div
          className="mx-auto mt-14 grid max-w-4xl gap-3 md:grid-cols-3"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.45 }}
        >
          {([
            ["Readiness scoring", "Live risk, urgency, and owner signals", Gauge],
            ["Ops workspace", "Tasks, timeline, volunteers, and scripts", Sparkles],
            ["Comms engine", "Email, reminders, WhatsApp copy, social plan", Radio],
          ] as const).map(([title, body, Icon]) => (
            <div
              key={title}
              className="rounded-xl border border-border/60 bg-card/70 p-4 text-left shadow-2xl shadow-black/20 backdrop-blur"
            >
              <Icon className="mb-3 size-5 text-primary" />
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
