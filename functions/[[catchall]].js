export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  // 1. Handle CORS Preflight (OPTIONS) requests immediately
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // 2. Define your target Google Apps Script URL
  const gasTargetUrl = "https://script.google.com/macros/s/AKfycbxVZy-biQDZAETUWVW5DoQGYbbkBGeYI2dqbYPJKv9zyy0yuXtCnieluUya0aBpc8iPVg/exec";
  const target = new URL(gasTargetUrl);

  // 3. Forward any incoming URL query strings (?key=value)
  url.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });

  // 4. Configure fetch headers and options
  const init = {
    method: request.method,
    headers: new Headers(request.headers),
    redirect: "follow", // CRUCIAL: Instructs Cloudflare to follow Google's 302 redirects automatically
  };

  // Prevent host header conflicts with Google's servers
  init.headers.delete("host");

  // 5. Forward request bodies for POST/PUT requests
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.clone().arrayBuffer();
  }

  try {
    const response = await fetch(target.toString(), init);
    
    // Clone response to add global CORS support if you're building an API
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    
    return newResponse;
  } catch (error) {
    return new Response(`Reverse Proxy Error: ${error.message}`, { status: 500 });
  }
}
