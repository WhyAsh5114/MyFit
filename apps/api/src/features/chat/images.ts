import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import {
	CHAT_IMAGE_MAX_BYTES,
	CHAT_IMAGE_TYPES,
	CHAT_IMAGE_URL_PREFIX
} from '@myfit/shared/constants';
import { getStorage } from '../../../lib/storage.js';
import { authMiddleware, getUserId } from '../../shared/middleware/auth.js';
import type { MyUIMessage } from './helpers.js';

/** Where a user's photo lives in the bucket. The user id comes from the session, never the client. */
const imageKey = (userId: string, id: string) => `chat-images/${userId}/${id}`;

/** The most photos one request sends to the model; older ones are described instead. */
const MAX_IMAGES_PER_REQUEST = 4;

const isChatImageType = (type: string): type is (typeof CHAT_IMAGE_TYPES)[number] =>
	(CHAT_IMAGE_TYPES as readonly string[]).includes(type);

export const chatImageRoutes = new Hono()
	/**
	 * Stores one chat photo for the signed-in user. The body is the image itself, with its type as
	 * the Content-Type. Answers the id the message part refers to.
	 */
	.post('/', authMiddleware, async (c) => {
		const storage = await getStorage();
		if (!storage) return c.json({ error: 'Photo storage is not configured' }, 501);

		const type = c.req.header('content-type')?.split(';')[0].trim() ?? '';
		if (!isChatImageType(type)) return c.json({ error: 'Unsupported image type' }, 415);
		const declared = Number(c.req.header('content-length'));
		if (declared > CHAT_IMAGE_MAX_BYTES) return c.json({ error: 'Image is too large' }, 413);

		const body = await c.req.arrayBuffer();
		if (body.byteLength === 0) return c.json({ error: 'Image is empty' }, 400);
		if (body.byteLength > CHAT_IMAGE_MAX_BYTES) return c.json({ error: 'Image is too large' }, 413);

		const id = crypto.randomUUID();
		try {
			await storage.write(imageKey(getUserId(c), id), body, { type });
		} catch (error) {
			// Usually the store is down or unreachable at S3_ENDPOINT, or rejects the key.
			console.error('Could not store a chat photo', error);
			return c.json({ error: 'Photo storage is unavailable' }, 503);
		}
		return c.json({ id }, 201);
	})
	/** One of the signed-in user's chat photos. Another user's id is simply not found. */
	.get('/:id', authMiddleware, zValidator('param', z.object({ id: z.uuid() })), async (c) => {
		const storage = await getStorage();
		if (!storage) return c.json({ error: 'Photo storage is not configured' }, 501);

		const file = storage.file(imageKey(getUserId(c), c.req.valid('param').id));
		try {
			if (!(await file.exists())) return c.json({ error: 'Image not found' }, 404);
			const [stat, bytes] = await Promise.all([file.stat(), file.arrayBuffer()]);
			// A photo never changes once stored, so the app can keep it.
			c.header('Cache-Control', 'private, max-age=31536000, immutable');
			return c.body(bytes, 200, { 'Content-Type': stat.type || 'application/octet-stream' });
		} catch (error) {
			console.error('Could not read a chat photo', error);
			return c.json({ error: 'Photo storage is unavailable' }, 503);
		}
	});

type Part = MyUIMessage['parts'][number];

/**
 * Swaps each stored photo the conversation refers to for its data, which the model needs, reading
 * only the user's own bucket path. Only the newest few photos are sent; an older or missing one is
 * replaced with a note, so a long conversation can't make every request carry every photo.
 */
export async function resolveChatImages(
	messages: MyUIMessage[],
	userId: string
): Promise<MyUIMessage[]> {
	const isStored = (part: Part) =>
		part.type === 'file' && part.url.startsWith(CHAT_IMAGE_URL_PREFIX);

	const stored = messages.flatMap((message) => message.parts.filter(isStored));
	const sent = new Set(stored.slice(-MAX_IMAGES_PER_REQUEST));
	const storage = sent.size > 0 ? await getStorage() : null;

	return Promise.all(
		messages.map(async (message) => ({
			...message,
			parts: await Promise.all(
				message.parts.map(async (part): Promise<Part> => {
					if (!isStored(part) || part.type !== 'file') return part;
					if (!sent.has(part))
						return { type: 'text', text: '[An earlier photo, not shown again.]' };
					const data = storage ? await readImage(storage, userId, part.url) : null;
					if (!data) return { type: 'text', text: '[A photo that is no longer available.]' };
					return { ...part, url: data };
				})
			)
		}))
	);
}

async function readImage(
	storage: NonNullable<Awaited<ReturnType<typeof getStorage>>>,
	userId: string,
	url: string
): Promise<string | null> {
	const id = url.slice(CHAT_IMAGE_URL_PREFIX.length);
	if (!z.uuid().safeParse(id).success) return null;
	try {
		const file = storage.file(imageKey(userId, id));
		const [bytes, stat] = await Promise.all([file.arrayBuffer(), file.stat()]);
		return `data:${stat.type || 'image/jpeg'};base64,${Buffer.from(bytes).toString('base64')}`;
	} catch (error) {
		console.warn('Could not read a chat photo', error);
		return null;
	}
}
