import { ErrorResponse, setUser } from './_db';
import type { RequestHandler } from '@sveltejs/kit';
import { parse } from 'cookie';

export const POST: RequestHandler = async ({ request, locals }) => {
  const split: Split = await request.json();

  // Get sessionID
  const sessionID = parse(request.headers.get('cookie') || '').sessionID;

  // Make sure user is logged in by checking if
  // locals.user and sessionID are loaded
  if (!locals.user || !sessionID) {
    return {
      status: 403,
      body: {
        message: 'Not logged in, locals empty'
      }
    };
  }

  // Add the split to userData in locals
  locals.user.splits[split.name] = split;
  try {
    await setUser(locals.user, sessionID);
    return {
      status: 200,
      body: {
        message: 'Split saved successfully'
      }
    };
  } catch (err) {
    if (err instanceof ErrorResponse) {
      return {
        status: err.status,
        body: {
          message: err.message
        }
      };
    }
    return {
      status: 500,
      body: {
        message: JSON.stringify(err)
      }
    };
  }
};
