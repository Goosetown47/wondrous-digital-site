"use client";
import React from "react";

export function TestComponent() {
    return <div>Super Hero Banner</div>;
  }

// Export with expected name for registry
export { TestComponent as SuperHeroBanner };