"use client";

import { cn } from "@/lib/utils";
import { domAnimation, LazyMotion, m } from "framer-motion";
import React from "react";

interface AnimatedComponentProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
  x?: number;
  y?: number;
  as?: keyof typeof m;
}

const { baseDuration, baseThreshold } = {
  baseDuration: 0.3,
  baseThreshold: 0.5,
};

const AnimatedComponent: React.FC<AnimatedComponentProps> = ({
  as = "div",
  children,
  delay = 0,
  threshold = baseThreshold,
  className,
  x,
  y,
}) => {
  const Tag = m[as] as typeof m.div;

  return (
    <LazyMotion features={domAnimation}>
      <Tag
        initial={{ x, y, opacity: 0 }}
        whileInView={{ x: 0, y: 0, opacity: 1 }}
        transition={{ duration: baseDuration + delay }}
        viewport={{ once: true, amount: threshold }}
        className={className}
      >
        {children}
      </Tag>
    </LazyMotion>
  );
};

export const AnimatedUpComponent = (
  props: Omit<AnimatedComponentProps, "y">,
) => <AnimatedComponent {...props} y={100} />;

export const AnimatedLeftComponent = (
  props: Omit<AnimatedComponentProps, "x">,
) => <AnimatedComponent {...props} x={100} />;

const AnimatedPage: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  return (
    <LazyMotion features={domAnimation}>
      <m.main
        initial={{
          opacity: 0,
          y: 50,
          filter: "blur(10px)",
        }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
        }}
        transition={{
          duration: baseDuration,
          ease: "easeOut",
        }}
        className={cn(className)}
      >
        {children}
      </m.main>
    </LazyMotion>
  );
};

export default AnimatedPage;
