"use client";

import Head from "next/head";
import * as Sentry from "@sentry/nextjs";

export default function Page() {
  return (
    <div>
      <Head>
        <title>Sentry Onboarding</title>
        <meta name="description" content="Test Sentry for your Next.js app!" />
      </Head>

      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "4rem", margin: "14px 0" }}>
          Sentry
        </h1>

        <p style={{ fontSize: "1.5rem", margin: "24px 0" }}>
          Get started by sending us a sample error:
        </p>
        
        <button
          type="button"
          style={{
            padding: "12px",
            cursor: "pointer",
            backgroundColor: "#AD6CAA",
            borderRadius: "4px",
            border: "none",
            color: "white",
            fontSize: "14px",
            margin: "18px",
          }}
          onClick={async () => {
            try {
              const res = await fetch("/api/sentry-example-api");
              if (!res.ok) {
                throw new Error("Sentry Example Frontend Error");
              }
            } catch (error) {
              Sentry.captureException(error);
            }
          }}
        >
          Throw error!
        </button>

        <p style={{ marginTop: "24px", fontSize: "14px", color: "#888" }}>
          Note: This page is just for testing. You can safely remove it.
        </p>
      </main>
    </div>
  );
}
