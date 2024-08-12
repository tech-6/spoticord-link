"use client";

import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useRef, useState } from "react";

type AnimatedUserIconProps = {
  image: string;
};

export function AnimatedUserIcon({ image }: AnimatedUserIconProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const image1Ref = useRef<HTMLImageElement>(null);
  const image2Ref = useRef<HTMLImageElement>(null);

  return (
    <div
      className="relative flex w-full flex-row justify-between px-16"
      ref={containerRef}
    >
      <Avatar className="z-10 size-12 md:size-16" ref={image1Ref}>
        <AvatarImage src={image} alt="User avatar" />
      </Avatar>

      <Avatar className="z-10 size-12 md:size-16" ref={image2Ref}>
        <AvatarImage src="/spotify-logo.png" alt="Spotify logo" />
      </Avatar>

      <AnimatedBeam
        duration={5}
        delay={0}
        containerRef={containerRef}
        fromRef={image1Ref}
        toRef={image2Ref}
        gradientStartColor="#1DB954"
        gradientStopColor="#5865F2"
      />
    </div>
  );
}
