import { getManifest } from "@serwist/build";
import { writeFileSync } from "fs";
import SerwistConfig from "./serwist.config";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { swDest, swSrc, ...config } = SerwistConfig;

const { count } = await getManifest(config);
const data = JSON.stringify({ count: count - 1 });

writeFileSync("out/precache-entries.json", data);
