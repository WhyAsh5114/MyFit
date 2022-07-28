import { ErrorResponse, loginUser } from '../_db';
import type { RequestHandler } from '@sveltejs/kit';
import { serialize } from 'cookie';

export const POST: RequestHandler = async ({ request }) => {
  const body: { username: string; password: string } = await request.json();

  // Try logging in the user
  try {
    const id = await loginUser(body);
    return {
      status: 200,
      headers: {
        'set-cookie': serialize('sessionID', id, {
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
          httpOnly: true,
          secure: true
        })
      },
      body: {
        message: 'Logged in successfully'
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
        message: 'Internal server error'
      }
    };
  }
};
