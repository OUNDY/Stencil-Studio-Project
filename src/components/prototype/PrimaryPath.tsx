import { useState } from "react";
import { motion } from "framer-motion";
import { VersionA } from "./VersionA";
import { VersionB } from "./VersionB";

type Version = "A" | "B";

export const PrimaryPath = () => {
  const [version, setVersion] = useState<Version>("A");

  return (
    <section className="py-14 lg:py-20 bg-background relative">
      <div className="container mx-auto px-6">
        {/* Version toggle — internal prototyping */}
        <div className="flex items-center justify-center gap-1 mb-10 p-1 rounded-full bg-muted/60 border border-border w-fit mx-auto">
          {(["A", "B"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVersion(v)}
              className={`relative px-5 py-2 text-sm font-sans rounded-full transition-colors ${
                version === v ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {version === v && (
                <motion.div
                  layoutId="version-pill"
                  className="absolute inset-0 bg-foreground rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">Version {v}</span>
            </button>
          ))}
        </div>

        {/* Subtitle */}
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-serif text-foreground mb-2">
            {version === "A" ? "Discover by Mood" : "Filter & Explore"}
          </h2>
          <p className="text-muted-foreground font-sans text-sm max-w-md mx-auto">
            {version === "A"
              ? "Choose your aesthetic, then your surface — we'll curate the rest."
              : "Mix mood and surface simultaneously to find your perfect pattern."}
          </p>
        </div>

        {/* Content */}
        {version === "A" ? <VersionA /> : <VersionB />}
      </div>
    </section>
  );
};
