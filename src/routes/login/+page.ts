import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = async ({ parent }) => {
  const { session } = await parent();
  if (session) {
    throw redirect(307, '/profile');
  }
};

export const prerender = true;
