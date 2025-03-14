import type {
	ExerciseSplit,
	ExerciseSplitDay,
	ExerciseSplitDaySession,
	ExerciseSplitDaySessionExercise,
	FitnessKnowledge
} from '@prisma/client';
import {
	Apple,
	Baby,
	BookOpenTextIcon,
	CalendarIcon,
	ChartNoAxesCombinedIcon,
	Dumbbell,
	DumbbellIcon,
	GithubIcon,
	GlobeLockIcon,
	HandCoinsIcon,
	LayoutDashboardIcon,
	Medal,
	NotebookTextIcon,
	PackagePlusIcon,
	RssIcon,
	SmilePlus,
	Sparkle,
	Sprout
} from 'lucide-svelte';

export const MUSCLE_GROUPS = {
	Biceps: 'Biceps',
	Triceps: 'Triceps',
	Forearms: 'Forearms',
	'Front delts': 'Front delts',
	'Side delts': 'Side delts',
	'Rear delts': 'Rear delts',
	Chest: 'Chest',
	Lats: 'Lats',
	Traps: 'Traps',
	Quads: 'Quads',
	Hamstrings: 'Hamstrings',
	Calves: 'Calves',
	Abs: 'Abs',
	'Lower back': 'Lower back'
} as const;

export const UNPROTECTED_ROUTES = [
	'/login',
	'/dashboard',
	'/privacy-policy',
	'/changelog',
	'/blog',
	'/donations',
	'/docs',
	'/'
];

export const SIDEBAR_LINK_GROUPS = [
	{
		label: 'Application',
		items: [
			{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
			{
				label: 'Progression',
				href: '/progression',
				icon: ChartNoAxesCombinedIcon
			}
		]
	},
	{
		label: 'Items',
		items: [
			{ label: 'Workouts', href: '/workouts', icon: DumbbellIcon },
			{ label: 'Mesocycles', href: '/mesocycles', icon: NotebookTextIcon },
			{
				label: 'Exercise splits',
				href: '/exercise-splits',
				icon: CalendarIcon
			}
		]
	},
	{
		label: 'Resources',
		items: [
			{ label: 'Docs', href: '/docs', icon: BookOpenTextIcon },
			{ label: 'Changelog', href: '/changelog', icon: PackagePlusIcon },
			{ label: 'Blog', href: '/blog', icon: RssIcon }
		]
	},
	{
		label: 'More',
		items: [
			{ label: 'Donations', href: '/donations', icon: HandCoinsIcon },
			{
				label: 'Github',
				href: 'https://github.com/WhyAsh5114/MyFit',
				icon: GithubIcon
			},
			{
				label: 'Privacy policy',
				href: '/privacy-policy',
				icon: GlobeLockIcon
			}
		]
	}
] as const;

export const SUGGESTED_DAYS_PER_WEEK: Readonly<Record<FitnessKnowledge, number>> = {
	newbie: 2,
	beginner: 3,
	intermediate: 4,
	advanced: 5
} as const;

export const GETTING_STARTED_QUESTIONS = [
	{
		question: 'Rate your fitness knowledge',
		default: 'newbie',
		options: [
			{
				value: 'newbie',
				label: 'Newbie',
				description: 'Just getting started with focusing on health',
				Icon: Baby
			},
			{
				value: 'beginner',
				label: 'Beginner',
				description: 'Know about exercise splits, diet, and recovery',
				Icon: Sprout
			},
			{
				value: 'intermediate',
				label: 'Intermediate',
				description: 'Have dabbled into techniques like deloads and periodization',
				Icon: Dumbbell
			},
			{
				value: 'advanced',
				label: 'Advanced',
				description: 'Comfortable with high degree of autoregulation and advanced techniques',
				Icon: Medal
			}
		]
	},
	{
		question: "What'll you be using MyFit for?",
		default: 'workout-tracking',
		options: [
			{
				value: 'workout-tracking',
				label: 'Workout tracking',
				description: 'Scientific approach to tracking workouts and progress',
				Icon: Dumbbell
			},
			{
				value: 'macro-tracking',
				label: 'Macro tracking',
				description: 'Dynamic and personalized nutrition tracking',
				Icon: Apple
			},
			{
				value: 'social-network',
				label: 'Social network',
				description: 'Connect with like-minded individuals and share progress',
				Icon: SmilePlus
			},
			{
				value: 'mix',
				label: 'A bit of everything',
				description: 'A mix of all the above, you can customize later',
				Icon: Sparkle
			}
		]
	}
] as const;

export const QUICK_SETUP_QUESTION = {
	question: 'Quick setup for?',
	default: 'workout-tracking',
	options: [
		{
			value: 'workout-tracking',
			label: 'Workout tracking',
			description: 'Scientific approach to tracking workouts and progress',
			Icon: Dumbbell
		},
		{
			value: 'macro-tracking',
			label: 'Macro tracking',
			description: 'Dynamic and personalized nutrition tracking',
			Icon: Apple
		},
		{
			value: 'social-network',
			label: 'Social network',
			description: 'Connect with like-minded individuals and share progress',
			Icon: SmilePlus
		}
	]
} as const;

export type ExerciseSplitTemplate = Omit<ExerciseSplit, 'id' | 'userId'> & {
	splitDays: (Omit<ExerciseSplitDay, 'id' | 'exerciseSplitId'> & {
		splitDaySessions: (Omit<ExerciseSplitDaySession, 'id' | 'exerciseSplitDayId'> & {
			exercises: Omit<ExerciseSplitDaySessionExercise, 'id' | 'exerciseSplitDaySessionId'>[];
		})[];
	})[];
};

export const EXERCISE_SPLIT_TEMPLATES: ExerciseSplitTemplate[] = [
	{
		name: 'Push Pull Legs',
		splitDays: [
			{
				dayIndex: 0,
				splitDaySessions: [
					{
						name: 'Push A',
						sessionIndex: 0,
						exercises: [
							{
								name: 'Barbell bench press',
								notes: [],
								exerciseIndex: 0,
								primaryMuscleGroup: 'Chest',
								secondaryMuscleGroups: ['Triceps', 'Front delts'],
								repRangeStart: 5,
								repRangeEnd: 10,
								setType: 'Down'
							}
						]
					}
				]
			},
			{
				dayIndex: 1,
				splitDaySessions: [
					{
						name: 'Pull A',
						sessionIndex: 0,
						exercises: [
							{
								name: 'Pull-up',
								notes: [],
								exerciseIndex: 0,
								primaryMuscleGroup: 'Lats',
								secondaryMuscleGroups: ['Biceps'],
								repRangeStart: 5,
								repRangeEnd: 10,
								setType: 'Down'
							}
						]
					}
				]
			},
			{ dayIndex: 2, splitDaySessions: [{ name: 'Legs A', sessionIndex: 0, exercises: [] }] },
			{ dayIndex: 3, splitDaySessions: [{ name: 'Push B', sessionIndex: 0, exercises: [] }] },
			{ dayIndex: 4, splitDaySessions: [{ name: 'Pull B', sessionIndex: 0, exercises: [] }] },
			{ dayIndex: 5, splitDaySessions: [{ name: 'Legs B', sessionIndex: 0, exercises: [] }] },
			{ dayIndex: 6, splitDaySessions: [] }
		]
	}
] as const;
