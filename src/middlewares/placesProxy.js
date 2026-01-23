
/**
 * Middleware for proxying requests to Google Maps Places API
 * Used in Vite development server to avoid CORS issues
 */
export default function placesProxyMiddleware(env) {
  return async (req, res, next) => {
    if (req.url.startsWith('/api/places-nearby')) {
      try {
        const urlObj = new URL(req.url, `http://${req.headers.host}`);
        const lat = urlObj.searchParams.get('lat');
        const lng = urlObj.searchParams.get('lng');
        const q = urlObj.searchParams.get('q');
        const radius = urlObj.searchParams.get('radius') || '8000';

        if (!lat || !lng || !q) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: "Missing lat/lng/q" }));
          return;
        }

        const key = env.GOOGLE_MAPS_API_KEY;
        if (!key) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: "Missing GOOGLE_MAPS_API_KEY in .env" }));
          return;
        }

        const googleUrl = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
        googleUrl.searchParams.set("location", `${lat},${lng}`);
        googleUrl.searchParams.set("radius", radius);
        googleUrl.searchParams.set("keyword", q);
        googleUrl.searchParams.set("language", "th");
        googleUrl.searchParams.set("key", key);

        const googleRes = await fetch(googleUrl.toString());
        const data = await googleRes.json();

        res.setHeader('Content-Type', 'application/json');
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

        res.end(JSON.stringify({ status: data.status, results }));
      } catch (error) {
        console.error("API Middleware Error:", error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: error.toString() }));
      }
    } else {
      next();
    }
  };
}
