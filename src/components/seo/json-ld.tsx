/**
 * Renders schema.org structured data as a JSON-LD <script>. Accepts a single
 * object or an array of objects (multiple graphs).
 */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD is trusted, app-generated data — safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
