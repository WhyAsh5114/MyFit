import { deLocalizeUrl } from '#lib/paraglide/runtime.js';

export const reroute = (request) => deLocalizeUrl(request.url).pathname;
