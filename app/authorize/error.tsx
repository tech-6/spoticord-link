"use client";

import ErrorCard from "@/components/error-card";
import BlurFade from "@/components/magicui/blur-fade";
import Particles from "@/components/magicui/particles";

export default function ErrorPage() {
  return (
    <div className="relative flex h-screen items-center justify-center">
      <BlurFade inView>
        <ErrorCard title="An unknown error occured">
          Something happened on our end that we weren&apos;t able to catch.
          Please try again, or request a new link from the bot.
        </ErrorCard>
      </BlurFade>

      <Particles
        className="absolute inset-0 -z-10"
        quantity={200}
        ease={80}
        color="#ffffff"
        refresh
      />
    </div>
  );
}
