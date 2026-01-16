export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) return res.status(500).json({ error: "Missing GOOGLE_MAPS_API_KEY in .env" });

    const { lat, lng, q, radius = "8000" } = req.query;
    if (!lat || !lng || !q) return res.status(400).json({ error: "Missing lat/lng/q" });

    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", String(radius));
    url.searchParams.set("keyword", String(q));
    url.searchParams.set("language", "th");
    url.searchParams.set("key", key);

    const r = await fetch(url.toString());
    const data = await r.json();

    const results = (data.results || []).map((p) => ({
      place_id: p.place_id,
      name: p.name,
      vicinity: p.vicinity,
      location: p.geometry?.location || null,
      rating: p.rating ?? null,
      user_ratings_total: p.user_ratings_total ?? null,
      business_status: p.business_status ?? null,
      open_now: p.opening_hours?.open_now ?? null,
    }));

    return res.status(200).json({ status: data.status, results });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
