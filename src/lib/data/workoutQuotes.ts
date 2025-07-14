import type { QuotesDisplayMode } from '@prisma/client';

export interface WorkoutQuote {
	id: string;
	quote: string;
	author: string;
	category: 'PRE_WORKOUT' | 'POST_WORKOUT' | 'BETWEEN_SETS';
}

export const workoutQuotes: WorkoutQuote[] = [
	{
		id: '1',
		author: 'Unknown',
		category: 'PRE_WORKOUT',
		quote: "The only bad workout is the one that didn't happen."
	},
	{
		id: '2',
		author: 'Unknown',
		category: 'PRE_WORKOUT',
		quote: "Your body can stand almost anything. It's your mind you have to convince."
	},
	{
		id: '3',
		author: 'Unknown',
		category: 'PRE_WORKOUT',
		quote: "Don't wish for it, work for it."
	},
	{
		id: '4',
		author: 'Unknown',
		category: 'PRE_WORKOUT',
		quote: 'Champions train, losers complain.'
	},
	{
		id: '5',
		author: 'Jerry Rice',
		category: 'PRE_WORKOUT',
		quote: "Today I will do what others won't, so tomorrow I can accomplish what others can't."
	},
	{
		id: '6',
		author: 'Leigh Hunt',
		category: 'PRE_WORKOUT',
		quote: 'The groundwork for all happiness is good health.'
	},
	{
		id: '7',
		author: 'Rikki Rogers',
		category: 'PRE_WORKOUT',
		quote:
			"Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't."
	},
	{
		id: '8',
		author: 'Unknown',
		category: 'POST_WORKOUT',
		quote: 'You are stronger than you think. Prove it to yourself.'
	},
	{
		id: '9',
		author: 'Unknown',
		category: 'POST_WORKOUT',
		quote: 'Every rep, every set, every drop of sweat was worth it.'
	},
	{
		id: '10',
		author: 'Unknown',
		category: 'POST_WORKOUT',
		quote: "Success isn't given. It's earned in the gym."
	},
	{
		id: '11',
		author: 'Unknown',
		category: 'POST_WORKOUT',
		quote: "You just proved to yourself that you're capable of more than you imagined."
	},
	{
		id: '12',
		author: 'Unknown',
		category: 'POST_WORKOUT',
		quote: 'The pain you feel today will be the strength you feel tomorrow.'
	},
	{
		id: '13',
		author: 'Unknown',
		category: 'POST_WORKOUT',
		quote: "Recovery is not a sign of weakness, it's a sign of wisdom."
	},
	{
		id: '14',
		author: 'Unknown',
		category: 'POST_WORKOUT',
		quote: "You conquered another workout. Tomorrow, you'll conquer another goal."
	},
	{
		id: '15',
		author: 'Unknown',
		category: 'BETWEEN_SETS',
		quote: 'Rest, recover, repeat.'
	},
	{
		id: '16',
		author: 'Unknown',
		category: 'BETWEEN_SETS',
		quote: 'One more set, one step closer to your goal.'
	},
	{
		id: '17',
		author: 'Unknown',
		category: 'BETWEEN_SETS',
		quote: 'Breathe deep, stay focused.'
	},
	{
		id: '18',
		author: 'Unknown',
		category: 'BETWEEN_SETS',
		quote: 'This is where champions are made.'
	},
	{
		id: '19',
		category: 'BETWEEN_SETS',
		author: 'Vincent Williams Sr.',
		quote: 'Push harder than yesterday if you want a different tomorrow.'
	},
	{
		id: '20',
		author: 'Unknown',
		category: 'BETWEEN_SETS',
		quote: "The weight doesn't know how tired you are."
	},
	{
		id: '21',
		author: 'Unknown',
		category: 'BETWEEN_SETS',
		quote: 'Focus on form, not just numbers.'
	},
	// Dr. Mike Israetel / Renaissance Periodization quotes
	{
		id: '22',
		author: 'Dr. Mike Israetel',
		category: 'PRE_WORKOUT',
		quote: 'Progressive overload is the fundamental principle of growth. Make every session count.'
	},
	{
		id: '23',
		author: 'Dr. Mike Israetel',
		category: 'PRE_WORKOUT',
		quote: 'The best program is the one you can consistently execute with proper form and progression.'
	},
	{
		id: '24',
		author: 'Dr. Mike Israetel',
		category: 'PRE_WORKOUT',
		quote: 'Volume, intensity, and frequency - master these variables and you master growth.'
	},
	{
		id: '25',
		author: 'Dr. Mike Israetel',
		category: 'PRE_WORKOUT',
		quote: "Training is not about suffering - it's about intelligent progression toward your goals."
	},
	{
		id: '26',
		author: 'Dr. Mike Israetel',
		category: 'PRE_WORKOUT',
		quote: 'Your genetics load the gun, but your training and diet pull the trigger.'
	},
	{
		id: '27',
		author: 'Dr. Mike Israetel',
		category: 'BETWEEN_SETS',
		quote: 'Rest enough to perform your next set with quality. Rushing leads to junk volume.'
	},
	{
		id: '28',
		author: 'Dr. Mike Israetel',
		category: 'BETWEEN_SETS',
		quote: 'Each set should take you closer to failure, but not into form breakdown.'
	},
	{
		id: '29',
		author: 'Dr. Mike Israetel',
		category: 'BETWEEN_SETS',
		quote: 'The pump is temporary, but the adaptation is permanent. Focus on the process.'
	},
	{
		id: '30',
		author: 'Dr. Mike Israetel',
		category: 'BETWEEN_SETS',
		quote: 'Small progressions consistently applied lead to massive changes over time.'
	},
	{
		id: '31',
		author: 'Dr. Mike Israetel',
		category: 'BETWEEN_SETS',
		quote: 'Technique first, load second. Always.'
	},
	{
		id: '32',
		author: 'Dr. Mike Israetel',
		category: 'BETWEEN_SETS',
		quote: "Every rep is a chance to get better. Don't waste it on ego lifting."
	},
	{
		id: '33',
		author: 'Dr. Mike Israetel',
		category: 'POST_WORKOUT',
		quote: 'Recovery is where the magic happens. Train hard, but recover harder.'
	},
	{
		id: '34',
		author: 'Dr. Mike Israetel',
		category: 'POST_WORKOUT',
		quote: 'You just invested in your future self. The compound interest starts now.'
	},
	{
		id: '35',
		author: 'Dr. Mike Israetel',
		category: 'POST_WORKOUT',
		quote: 'Muscle grows during recovery, not during training. Respect the process.'
	},
	{
		id: '36',
		author: 'Dr. Mike Israetel',
		category: 'POST_WORKOUT',
		quote: 'Consistency beats perfection. Another quality session in the books.'
	},
	{
		id: '37',
		author: 'Dr. Mike Israetel',
		category: 'POST_WORKOUT',
		quote: 'Fatigue masks fitness. Rest well and let your true strength emerge.'
	},
	{
		id: '38',
		author: 'Dr. Mike Israetel',
		category: 'POST_WORKOUT',
		quote: 'The work you did today will compound into the results you see tomorrow.'
	},
	// Additional RP-inspired quotes based on training principles
	{
		id: '39',
		author: 'Dr. Mike Israetel',
		category: 'PRE_WORKOUT',
		quote: 'Minimum effective dose means maximum sustainable progress.'
	},
	{
		id: '40',
		author: 'Dr. Mike Israetel',
		category: 'PRE_WORKOUT',
		quote: "Science-based training isn't about complexity - it's about effectiveness."
	},
	{
		id: '41',
		author: 'Dr. Mike Israetel',
		category: 'BETWEEN_SETS',
		quote: 'Your maximum recoverable volume is your pathway to maximum gains.'
	},
	{
		id: '42',
		author: 'Dr. Mike Israetel',
		category: 'BETWEEN_SETS',
		quote: 'Effort without intelligence is just suffering. Train smart.'
	},
	{
		id: '43',
		author: 'Dr. Mike Israetel',
		category: 'POST_WORKOUT',
		quote: "Deloads aren't steps backward - they're strategic resets for greater progress."
	},
	{
		id: '44',
		author: 'Dr. Mike Israetel',
		category: 'POST_WORKOUT',
		quote: 'Your next workout starts with how well you recover from this one.'
	}
];

export function getRandomQuote(category: QuotesDisplayMode): WorkoutQuote {
	const categoryQuotes = workoutQuotes.filter((quote) => quote.category === category);
	const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
	return categoryQuotes[randomIndex];
}

export function getRandomQuotes(category: QuotesDisplayMode, count: number = 3): WorkoutQuote[] {
	const categoryQuotes = workoutQuotes.filter((quote) => quote.category === category);
	const shuffled = [...categoryQuotes].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, Math.min(count, categoryQuotes.length));
}
