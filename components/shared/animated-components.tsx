"use client";

import { domAnimation, LazyMotion, m, Variants } from "framer-motion";

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
  const Tag = m[as];

  return (
    <LazyMotion features={domAnimation}>
      {/* @ts-ignore */}
      <Tag
        // @ts-ignore
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
