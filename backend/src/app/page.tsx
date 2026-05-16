export default function BackendHome() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>
        HireMind AI API
      </h1>
      <p style={{ margin: 0 }}>
        Backend running on port <code>3001</code>. Interview routes under{" "}
        <code>/api/interview/*</code>.
      </p>
    </main>
  );
}
