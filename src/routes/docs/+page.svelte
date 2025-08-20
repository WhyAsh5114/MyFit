<svelte:head>
	<title>Docs - MyFit</title>
	<meta name="description" content="Read MyFit documentation to learn how to use the app effectively." />
</svelte:head>

<div class="prose prose-neutral max-w-none dark:prose-invert lg:prose-lg">
	<h1>Docs</h1>
	<blockquote>Just a basic overview of things work in this app, as there are some differences from V2</blockquote>

	<h2>Exercise splits</h2>
	<p>
		An exercise split refers to how workout sessions are divided across different days to target specific muscle groups
		or movement patterns. Examples: <i>Push Pull Legs</i>, <i>Upper Lower</i>, and <i>Full Body.</i>
	</p>
	<p>Tha app supports both synchronous (weekly) splits, and asynchronous splits (non-weekly) splits.</p>

	<h2>Mesocycle</h2>
	<p>
		A mesocycle is a unit of training consisting of several microcycles (repeated splits), usually lasting 4-6 weeks.
		The mesocycle structures progression and recovery, with increasing intensity or volume followed by deload phases to
		avoid overtraining. Deload feature will be coming soon!
	</p>

	<h2>Workouts</h2>
	<p>
		A single workout, consisting of multiple exercises, each with their own sets and options. Workouts can be done with
		or without an active mesocycle.
	</p>
	<p>Using an active mesocycle allows the app to progress performance and sets every microcycle.</p>

	<h2>Mesocycle exercise split</h2>
	<p>
		Whenever you create a mesocycle with an exercise split, that split is actually cloned for that mesocycle. This
		allows you and the app to make changes to the mesocycle's split without altering the original split.
	</p>

	<h2>Set types</h2>
	<p>
		Inspired by this:
		<a href="https://www.youtube.com/watch?v=XX1GD3sA1_c&list=PLjojr41yPbkCCADYomCimD_-H_e9tyZ6N&index=7">
			RP YouTube video.
		</a>
		You can utilize various set types in this app to make your workouts more interesting and challenging.
	</p>

	<h3>Straight sets</h3>
	<p>Sets with the same weight but can vary in reps. Easy and straightforward.</p>

	<h3>V2 sets</h3>
	<p>
		Or also default sets, reps and load can be changed in any way as desired.
		<i>This used to be the only default set type in V2 of the app.</i>
	</p>

	<h3>Down sets</h3>
	<p>
		Sets where load keeps on decreasing after the first set. Useful for exercises where rep drop-off is high and creates
		very low reps after load increases.
	</p>

	<h3>Drop sets</h3>
	<p>
		A set followed by mini-sets where load decreases after each mini-set. Useful for accumulating high training volume
		in a short amount of time. Convenient for dumbbell and pin-loaded machine exercises.
	</p>

	<h3>Myorep sets</h3>
	<p>
		Similar to drop sets, a set followed by mini-sets where load doesn't decrease after each mini-set. Same benefits as
		drop sets, but can be used for barbells as well.
	</p>

	<h3>Myorep match sets</h3>
	<p>
		All sets subsequent to the first one should match the reps of the first set. The subsequent sets maybe made up of
		multiple mini-sets with short breaks in between to achieve the same reps.
	</p>

	<h3>Myorep match down sets</h3>
	<p>Similar to myorep match sets, but load can be decreased after the first set.</p>

	<h2>Exercise configuration</h2>
	<h3>Bodyweight fraction</h3>
	<p>
		Exercises may or may not involve bodyweight. For example, bench press doesn't involve bodyweight significantly, so
		its fraction is 0. Pull-ups involve full bodyweight, so their fraction is 1. Push-ups typically involve about 2/3 of
		your bodyweight, so their fraction is 0.67.
	</p>

	<h3>Set options</h3>
	<p>
		When creating an exercise split, you only input the exercise and set types. During mesocycle implementation, you can
		distribute volume across exercises per muscle group. For example, if you set 10 starting sets for Quads and hit
		Quads 2x per microcycle, the sets will be split evenly (5, 5). The failure on last set option can be set globally
		for a mesocycle and overridden for individual exercises. To do so: Mesocycles > [your mesocycle name] > Split tab >
		Edit. Currently, for lengthened partials, you can add a note to each exercise.
	</p>

	<h2 class="italic">"I need more help!"</h2>
	<p>
		Feel free to <a href="https://github.com/WhyAsh5114/issues">open an issue</a> on the GitHub repository, will be glad
		to help you out and add more details to the docs
	</p>
</div>
