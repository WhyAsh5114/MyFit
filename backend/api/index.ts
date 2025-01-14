import dotenv from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import { auth } from "./auth";
dotenv.config();

const app = new Hono();

app.use(
  "/api/auth/**",
  cors({
    origin: process.env.FRONTEND_URL!,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

app.get("/api", (c) => {
  return c.json({
    title: "MyFit v4 API",
    message:
      "You shouldn't be here! The website is available on: https://my-fit-v4.vercel.app",
  });
});

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;

if (!process.env.VERCEL) {
  import("@hono/node-server").then(({ serve }) => {
    serve({
      fetch: app.fetch,
      port: 3001,
    });
  });
}
