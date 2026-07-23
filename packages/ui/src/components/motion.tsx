"use client";

import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

interface FadeInProps extends HTMLMotionProps<"div"> {
  /** Delay in seconds before the reveal starts. */
  delay?: number;
  /** Vertical offset (px) the element rises from. */
  y?: number;
}

/**
 * Reveals its children with a subtle rise + fade the first time it enters
 * the viewport. Falls back to a plain container when the user prefers
 * reduced motion.
 */
export function FadeIn({
  children,
  delay = 0,
  y = 12,
  ...props
}: FadeInProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children as React.ReactNode}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps extends HTMLMotionProps<"div"> {
  /** Gap in seconds between each child's reveal. */
  stagger?: number;
}

/**
 * Container that reveals its direct <StaggerItem> children one after another.
 */
export function Stagger({
  children,
  stagger = 0.06,
  ...props
}: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children as React.ReactNode}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * A single item inside a <Stagger> container.
 */
export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children as React.ReactNode}
      </div>
    );
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
