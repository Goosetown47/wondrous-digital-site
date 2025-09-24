"use client";
import React from "react";

export function TestComponent() {
    return <div>Double Trouble Hero</div>;
  }

// Export with expected name for registry
export { TestComponent as DoubleTroubleHero };