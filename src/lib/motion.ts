import type { Transition, Variants } from "framer-motion";

export const easeOutExpo: Transition["ease"] = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: easeOutExpo } },
};

export const stagger = (delayChildren = 0.04, staggerChildren = 0.05): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
});

export const popIn: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: easeOutExpo },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.97,
    transition: { duration: 0.2, ease: easeOutExpo },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: easeOutExpo } },
  exit: { opacity: 0, x: 32, transition: { duration: 0.2, ease: easeOutExpo } },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOutExpo } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.18, ease: easeOutExpo } },
};
