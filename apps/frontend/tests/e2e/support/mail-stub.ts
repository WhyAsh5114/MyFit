import { createServer } from 'node:http';

/**
 * Stands in for Resend and PostHog. `POST /emails` records the sign-in code, and
 * `GET /otp?email=` returns it once, so each login reads the code it just requested.
 */
const codes = new Map<string, string>();

createServer(async (req, res) => {
	const url = new URL(req.url ?? '/', 'http://localhost');
	res.setHeader('content-type', 'application/json');

	if (req.method === 'POST' && url.pathname === '/emails') {
		let body = '';
		for await (const chunk of req) body += chunk;
		const { to, html } = JSON.parse(body) as { to: string | string[]; html: string };
		const code = /OTP is: (\d+)/.exec(html)?.[1];
		if (code) codes.set([to].flat()[0].toLowerCase(), code);
		return void res.end(JSON.stringify({ id: 'stub' }));
	}

	if (req.method === 'GET' && url.pathname === '/otp') {
		const email = (url.searchParams.get('email') ?? '').toLowerCase();
		const code = codes.get(email);
		codes.delete(email);
		res.statusCode = code ? 200 : 404;
		return void res.end(JSON.stringify({ code }));
	}

	res.end('{}');
}).listen(4010);
