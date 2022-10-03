/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import data from "../data.json";

export interface Env {
  __STATIC_CONTENT: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (request.url.includes("api")) {
      const length = data.length;
      const randomIndex = Math.floor(Math.random() * length);
      const resp = new Response(
        JSON.stringify({ code: 0, url: data[randomIndex], message: "OK" })
      );
      // Set CORS headers
      resp.headers.set("Access-Control-Allow-Origin", "*");
      // Append to/Add Vary header so browser will cache response correctly
      resp.headers.append("Vary", "Origin");
      return resp;
    }
    return await getAssetFromKV(
      {
        request,
        waitUntil(promise) {
          ctx.waitUntil(promise);
        },
      },
      {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        // ASSET_MANIFEST: assetManifest,
      }
    );
  },
};
