"use client";

import { useEffect } from "react";

/**
 * One scroll lock for every overlay on the site (cart drawer, currency sheet,
 * status panel, sign-out dialog). Locks are counted so scrolling only resumes
 * when the last overlay closes — opening one overlay from another must never
 * release the lock early.
 */

let locks = 0;
let restore: { overflow: string; paddingRight: string } | null = null;

function lock() {
  locks += 1;
  if (locks > 1) return;

  const root = document.documentElement;
  // Reserve the scrollbar's width so the page does not jump sideways when it
  // disappears — the fixed header would visibly shift otherwise.
  const scrollbar = window.innerWidth - root.clientWidth;

  restore = {
    overflow: document.body.style.overflow,
    paddingRight: document.body.style.paddingRight,
  };

  root.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
}

function unlock() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;

  document.documentElement.style.overflow = "";
  document.body.style.overflow = restore?.overflow ?? "";
  document.body.style.paddingRight = restore?.paddingRight ?? "";
  restore = null;
}

/**
 * Holds the page still while `active` is true, releasing on unmount so a panel
 * that disappears mid-transition can never strand the lock.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}
