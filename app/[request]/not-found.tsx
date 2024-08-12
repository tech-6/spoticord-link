"use client";

import ErrorCard from "@/components/error-card";
import BlurFade from "@/components/magicui/blur-fade";
import Particles from "@/components/magicui/particles";

export default function ErrorPage() {
  return (
    <div className="relative flex h-screen items-center justify-center p-8">
      <BlurFade inView>
        <ErrorCard title="Unknown link">
          The provided link is unknown, or has previously expired. Please
          request a new link from the bot to link your Spotify account.
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
