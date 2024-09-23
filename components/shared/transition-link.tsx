"use client";

import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

interface TransitionLinkProps extends React.PropsWithChildren<LinkProps> {
  className?: string;
  href: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const TransitionLink: React.FC<TransitionLinkProps> = ({
  children,
  className,
  href,
  ...props
}) => {
  const router = useRouter();

  const handleTransition = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    e.preventDefault();
    const mainContent = document.querySelector(".main-content");
    mainContent?.classList.add("page-transition");
    await sleep(500);
    router.push(href);
    await sleep(500);
    mainContent?.classList.remove("page-transition");
  };

  return (
    <Link
      onClick={handleTransition}
      href={href}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
};

export default TransitionLink;
