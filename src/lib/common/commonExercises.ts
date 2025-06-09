import type { SplitExerciseTemplateWithoutIdsOrIndex } from '$lib/components/mesocycleAndExerciseSplit/commonTypes';
import type { MuscleGroup } from '@prisma/client';

// TODO: #82
export const commonExercisePerMuscleGroup: {
	muscleGroup: MuscleGroup;
	exercises: SplitExerciseTemplateWithoutIdsOrIndex[];
}[] = [
		{
		"muscleGroup": "Chest",
		"exercises": [
			{
				"name": "Barbell bench press",
				"targetMuscleGroup": "Chest",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Down",
				"repRangeStart": 5,
				"repRangeEnd": 10,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Feet flat, back arched, grip just outside shoulders. Lower bar to mid-chest, press up explosively."
			},
			{
				"name": "Incline dumbbell press",
				"targetMuscleGroup": "Chest",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Bench at 30-45 degrees, elbows tucked. Press dumbbells up, control descent."
			},
			{
				"name": "Machine chest flyes",
				"targetMuscleGroup": "Chest",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 15,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Sit upright, slight elbow bend. Squeeze handles together, slow return."
			},
			{
				"name": "Push-ups",
				"targetMuscleGroup": "Chest",
				"customMuscleGroup": null,
				"bodyweightFraction": 0.64,
				"setType": "Straight",
				"repRangeStart": 5,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Hands under shoulders, core tight. Lower chest to floor, push back up."
			},
			{
				"name": "Incline barbell bench press",
				"targetMuscleGroup": "Chest",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 6,
				"repRangeEnd": 12,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Bench at 30 degrees, grip outside shoulders. Lower bar to upper chest, press up."
			},
			{
				"name": "Dips",
				"targetMuscleGroup": "Chest",
				"customMuscleGroup": null,
				"bodyweightFraction": 0.75,
				"setType": "Straight",
				"repRangeStart": 8,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Lean forward, elbows at 45 degrees. Lower body, push up powerfully."
			},
			{
				"name": "Flat dumbbell bench press",
				"targetMuscleGroup": "Chest",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 8,
				"repRangeEnd": 12,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Feet flat, back arched, elbows tucked. Press dumbbells up, lower slowly."
			},
			{
				"name": "Dumbbell chest flyes",
				"targetMuscleGroup": "Chest",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Elbows soft, arms open wide. Squeeze chest at top."
			},
			{
				"name": "Incline dumbbell chest flyes",
				"targetMuscleGroup": "Chest",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Bench at 30 degrees, arms open wide. Stretch at bottom, squeeze at top."
			}
		]
	},
	{
		"muscleGroup": "FrontDelts",
		"exercises": [
			{
				"name": "Machine shoulder press",
				"targetMuscleGroup": "FrontDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 8,
				"repRangeEnd": 12,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Sit upright, grip handles firmly. Press up, control back down."
			},
			{
				"name": "EZ-bar front raise",
				"targetMuscleGroup": "FrontDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Hold bar shoulder-width, lift to eye level. Lower slowly."
			},
			{
				"name": "Seated dumbbell shoulder press",
				"targetMuscleGroup": "FrontDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 8,
				"repRangeEnd": 12,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Sit upright, elbows at 90 degrees. Press dumbbells overhead, control descent."
			},
			{
				"name": "Standing dumbbell shoulder press",
				"targetMuscleGroup": "FrontDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 8,
				"repRangeEnd": 12,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Back straight, dumbbells at shoulder height. Press overhead, control return."
			},
			{
				"name": "Dumbbell front raise",
				"targetMuscleGroup": "FrontDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Hold dumbbells in front, raise to eye level. Lower under control."
			},
			{
				"name": "Cable front raise",
				"targetMuscleGroup": "FrontDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Set cable low, grip handle. Raise to forehead, control return."
			}
		]
	},
	{
		"muscleGroup": "SideDelts",
		"exercises": [
			{
				"name": "Leaning dumbbell lateral raises",
				"targetMuscleGroup": "SideDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Lean slightly, raise dumbbells to shoulder height. Control descent."
			},
			{
				"name": "Behind the back cable lateral raises",
				"targetMuscleGroup": "SideDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Stand sideways, pull cable upward to shoulder height. Control return."
			},
			{
				"name": "Super ROM lateral raises",
				"targetMuscleGroup": "SideDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Start low, raise dumbbells high for max range. Control slow descent."
			},
			{
				"name": "Cross-body cable lateral raises",
				"targetMuscleGroup": "SideDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Grip low, pull cable diagonally outward to shoulder level. Slow return."
			},
			{
				"name": "Dumbbell lateral raises",
				"targetMuscleGroup": "SideDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Stand tall, raise dumbbells sideways until shoulders level. Lower slowly."
			},
			{
				"name": "Cable Y-raises",
				"targetMuscleGroup": "SideDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Hold cable, raise arms in Y-shape above shoulders. Slow return."
			}
		]
	},
	{
		"muscleGroup": "RearDelts",
		"exercises": [
			{
				"name": "Cable face pull",
				"targetMuscleGroup": "RearDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Set rope at face height, pull toward forehead, elbows high."
			},
			{
				"name": "Machine rear delt fly",
				"targetMuscleGroup": "RearDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Chest against pad, arms straight. Open wide, squeeze rear delts."
			},
			{
				"name": "Bent-over reverse dumbbell fly",
				"targetMuscleGroup": "RearDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Hinge forward, raise dumbbells outward, control descent."
			},
			{
				"name": "Reverse pec deck",
				"targetMuscleGroup": "RearDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Grip handles, open arms back, squeeze rear delts."
			},
			{
				"name": "Cable rear delt fly",
				"targetMuscleGroup": "RearDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Set cable at shoulder height, pull outward, slow return."
			},
			{
				"name": "Single-arm rear delt cable fly",
				"targetMuscleGroup": "RearDelts",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Grab low cable, pull across body, control return."
			}
		]
	},
	{
		"muscleGroup": "Lats",
		"exercises": [
			{
				"name": "Pull-ups",
				"targetMuscleGroup": "Lats",
				"customMuscleGroup": null,
				"bodyweightFraction": 1,
				"setType": "Straight",
				"repRangeStart": 6,
				"repRangeEnd": 12,
				"changeType": null,
				"changeAmount": null,
				"note": "Hang from bar, pull chest up to bar, lower under control."
			},
			{
				"name": "Lat pulldown (wide grip)",
				"targetMuscleGroup": "Lats",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Grip bar wide, pull to chest, squeeze lats, control return."
			},
			{
				"name": "Reverse grip lat pulldown",
				"targetMuscleGroup": "Lats",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Grip bar underhand, pull down to upper chest, control return."
			},
			{
				"name": "Cable lat pullover",
				"targetMuscleGroup": "Lats",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Grip rope, pull down in arc motion, keep arms straight."
			},
			{
				"name": "Dumbbell single-arm row",
				"targetMuscleGroup": "Lats",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 8,
				"repRangeEnd": 12,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Hand on bench, pull dumbbell to waist, control descent."
			},
			{
				"name": "Bent-over barbell row",
				"targetMuscleGroup": "Lats",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 6,
				"repRangeEnd": 12,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Hinge forward, pull barbell to waist, slow return."
			},
			{
				"name": "Seated cable row",
				"targetMuscleGroup": "Lats",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 8,
				"repRangeEnd": 12,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Sit tall, pull handle to waist, squeeze lats, control return."
			}
		]
	},
	{
		"muscleGroup": "Traps",
		"exercises": [
			{
				"name": "Barbell shrugs",
				"targetMuscleGroup": "Traps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Grip bar shoulder-width, shrug up, hold briefly, lower slow."
			},
			{
				"name": "Trap bar shrugs",
				"targetMuscleGroup": "Traps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Stand tall, grip trap bar, shrug up, hold briefly, slow return."
			},
			{
				"name": "Dumbbell shrugs",
				"targetMuscleGroup": "Traps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Hold dumbbells at sides, shrug up, squeeze, control return."
			},
			{
				"name": "Smith machine shrugs",
				"targetMuscleGroup": "Traps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Grip bar, shrug up, hold briefly, lower slow."
			},
			{
				"name": "Dual cable shrugs",
				"targetMuscleGroup": "Traps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Grab cables, shrug straight up, squeeze traps, slow return."
			}
		]
	},
	{
		"muscleGroup": "Triceps",
		"exercises": [
			{
				"name": "Cable triceps pressdown (rope)",
				"targetMuscleGroup": "Triceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Grip rope, pull down, spread handles, slow return."
			},
			{
				"name": "Overhead cable triceps extension",
				"targetMuscleGroup": "Triceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Grip rope overhead, extend arms straight, slow return."
			},
			{
				"name": "Katana cable triceps extension",
				"targetMuscleGroup": "Triceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Grip cable across body, extend outward, slow return."
			},
			{
				"name": "Dumbbell French press",
				"targetMuscleGroup": "Triceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Hold dumbbell behind head, extend arms straight, control down."
			},
			{
				"name": "One-arm dumbbell triceps extension",
				"targetMuscleGroup": "Triceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Hold dumbbell overhead, extend arm straight, slow return."
			},
			{
				"name": "Skull crushers",
				"targetMuscleGroup": "Triceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 8,
				"repRangeEnd": 12,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Lie flat, lower bar to forehead, extend arms straight."
			},
			{
				"name": "JM press",
				"targetMuscleGroup": "Triceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 8,
				"repRangeEnd": 12,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Lower bar toward neck, extend elbows, control back down."
			},
			{
				"name": "Triceps kickbacks (cable)",
				"targetMuscleGroup": "Triceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Bend forward, extend arm straight back, control return."
			},
			{
				"name": "Lying skull crushers",
				"targetMuscleGroup": "Triceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 8,
				"repRangeEnd": 12,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Lie down, lower bar to forehead, extend arms straight."
			}
		]
	},
	{
		"muscleGroup": "Biceps",
		"exercises": [
			{
				"name": "Dumbbell bicep curls",
				"targetMuscleGroup": "Biceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Hold dumbbells at sides, curl up, squeeze biceps, lower slow."
			},
			{
				"name": "Dumbbell hammer curls",
				"targetMuscleGroup": "Biceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Palms neutral, curl dumbbells up, squeeze, control return."
			},
			{
				"name": "Concentration curls",
				"targetMuscleGroup": "Biceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Elbow on thigh, curl dumbbell up, slow return."
			},
			{
				"name": "Preacher curls",
				"targetMuscleGroup": "Biceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Down",
				"repRangeStart": 10,
				"repRangeEnd": 20,
				"changeType": "AbsoluteLoad",
				"changeAmount": 2.5,
				"note": "Elbows on pad, curl bar up, control down."
			},
			{
				"name": "Lying dumbbell curls",
				"targetMuscleGroup": "Biceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Lie flat, curl dumbbells, stretch fully at bottom."
			},
			{
				"name": "EZ bar curls",
				"targetMuscleGroup": "Biceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 6,
				"repRangeEnd": 12,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Grip bar narrow, curl up, squeeze biceps, control return."
			},
			{
				"name": "Bayesian cable curls",
				"targetMuscleGroup": "Biceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Step forward, curl cable to shoulder, slow return."
			},
			{
				"name": "Incline dumbbell curls",
				"targetMuscleGroup": "Biceps",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Sit at incline, curl dumbbells, squeeze biceps at top."
			}
		]
	},
	{
		"muscleGroup": "Forearms",
		"exercises": [
			{
				"name": "Reverse grip curls",
				"targetMuscleGroup": "Forearms",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Grip bar palms down, curl to shoulders, lower slowly."
			},
			{
				"name": "Wrist roller",
				"targetMuscleGroup": "Forearms",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Roll weight up and down using forearm flexion and extension."
			},
			{
				"name": "Dumbbell wrist curls",
				"targetMuscleGroup": "Forearms",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Rest forearm on bench, curl dumbbell upward, control return."
			},
			{
				"name": "Dumbbell wrist extensions",
				"targetMuscleGroup": "Forearms",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Palm facing down, extend wrist upward, slow return."
			}
		]
	},
	{
    "muscleGroup": "Quads",
    "exercises": [
        {
            "name": "Barbell squats",
            "targetMuscleGroup": "Quads",
            "customMuscleGroup": null,
            "bodyweightFraction": 1,
            "setType": "Down",
            "repRangeStart": 5,
            "repRangeEnd": 10,
            "changeType": "AbsoluteLoad",
            "changeAmount": 10,
            "note": "Feet shoulder-width, squat deep, drive up strong."
        },
        {
            "name": "Leg press",
            "targetMuscleGroup": "Quads",
            "customMuscleGroup": null,
            "bodyweightFraction": null,
            "setType": "Straight",
            "repRangeStart": 10,
            "repRangeEnd": 20,
            "changeType": null,
            "changeAmount": null,
            "note": "Feet high for quad focus, push up, control return."
        },
        {
            "name": "Lunges",
            "targetMuscleGroup": "Quads",
            "customMuscleGroup": null,
            "bodyweightFraction": 0.85,
            "setType": "Straight",
            "repRangeStart": 10,
            "repRangeEnd": 15,
            "changeType": null,
            "changeAmount": null,
            "note": "Step forward, bend knee, push back explosively."
        },
        {
            "name": "Leg extensions",
            "targetMuscleGroup": "Quads",
            "customMuscleGroup": null,
            "bodyweightFraction": null,
            "setType": "Straight",
            "repRangeStart": 10,
            "repRangeEnd": 20,
            "changeType": null,
            "changeAmount": null,
            "note": "Lift legs fully, squeeze quads, slow return."
        },
        {
            "name": "Dumbbell Bulgarian split squats (raised)",
            "targetMuscleGroup": "Quads",
            "customMuscleGroup": null,
            "bodyweightFraction": null,
            "setType": "Straight",
            "repRangeStart": 8,
            "repRangeEnd": 15,
            "changeType": null,
            "changeAmount": null,
            "note": "Rear foot elevated higher, squat deep, push through quads."
        },
        {
            "name": "Heels-Raised Dumbbell Squats (75% depth)",
            "targetMuscleGroup": "Quads",
            "customMuscleGroup": null,
            "bodyweightFraction": null,
            "setType": "Straight",
            "repRangeStart": 10,
            "repRangeEnd": 15,
            "changeType": null,
            "changeAmount": null,
            "note": "Elevate heels, squat to 75% depth, push through quads."
        },
        {
            "name": "Dumbbell goblet squats",
            "targetMuscleGroup": "Quads",
            "customMuscleGroup": null,
            "bodyweightFraction": null,
            "setType": "Straight",
            "repRangeStart": 10,
            "repRangeEnd": 15,
            "changeType": null,
            "changeAmount": null,
            "note": "Hold dumbbell close, squat deep, push up."
        },
        {
            "name": "Dumbbell step-ups",
            "targetMuscleGroup": "Quads",
            "customMuscleGroup": null,
            "bodyweightFraction": null,
            "setType": "Straight",
            "repRangeStart": 10,
            "repRangeEnd": 15,
            "changeType": null,
            "changeAmount": null,
            "note": "Step onto box, push through quad, control down."
        }
    ]
},
	{
    "muscleGroup": "Hamstrings",
    "exercises": [
        {
            "name": "Romanian deadlifts",
            "targetMuscleGroup": "Hamstrings",
            "customMuscleGroup": null,
            "bodyweightFraction": null,
            "setType": "Straight",
            "repRangeStart": 8,
            "repRangeEnd": 12,
            "changeType": "AbsoluteLoad",
            "changeAmount": 5,
            "note": "Hinge at hips, lower bar to mid-shin, keep legs straight."
        },
        {
            "name": "Stiff-Legged Deadlift",
            "targetMuscleGroup": "Hamstrings",
            "customMuscleGroup": null,
            "bodyweightFraction": null,
            "setType": "Straight",
            "repRangeStart": 8,
            "repRangeEnd": 12,
            "changeType": "AbsoluteLoad",
            "changeAmount": 5,
            "note": "Keep legs straight, hinge at hips, lower bar, push through hamstrings."
        },
        {
            "name": "Seated leg curls",
            "targetMuscleGroup": "Hamstrings",
            "customMuscleGroup": null,
            "bodyweightFraction": null,
            "setType": "Straight",
            "repRangeStart": 12,
            "repRangeEnd": 20,
            "changeType": null,
            "changeAmount": null,
            "note": "Sit upright, curl legs down, squeeze hamstrings, slow return."
        },
        {
            "name": "Lying leg curls",
            "targetMuscleGroup": "Hamstrings",
            "customMuscleGroup": null,
            "bodyweightFraction": null,
            "setType": "Straight",
            "repRangeStart": 12,
            "repRangeEnd": 20,
            "changeType": null,
            "changeAmount": null,
            "note": "Lie face down, curl legs up, control return."
        },
        {
            "name": "Nordic hamstring curls",
            "targetMuscleGroup": "Hamstrings",
            "customMuscleGroup": null,
            "bodyweightFraction": 1,
            "setType": "Straight",
            "repRangeStart": 6,
            "repRangeEnd": 12,
            "changeType": null,
            "changeAmount": null,
            "note": "Anchor feet, lower slowly, push up explosively."
        },
        {
            "name": "Glute-ham raises",
            "targetMuscleGroup": "Hamstrings",
            "customMuscleGroup": null,
            "bodyweightFraction": 1,
            "setType": "Straight",
            "repRangeStart": 8,
            "repRangeEnd": 15,
            "changeType": null,
            "changeAmount": null,
            "note": "Bend at knees, lower torso, curl back up."
        },
        {
            "name": "Cable hamstring curls",
            "targetMuscleGroup": "Hamstrings",
            "customMuscleGroup": null,
            "bodyweightFraction": null,
            "setType": "Straight",
            "repRangeStart": 12,
            "repRangeEnd": 20,
            "changeType": null,
            "changeAmount": null,
            "note": "Set cable low, curl leg up, slow return."
        },
        {
            "name": "Dumbbell Romanian deadlifts",
            "targetMuscleGroup": "Hamstrings",
            "customMuscleGroup": null,
            "bodyweightFraction": null,
            "setType": "Straight",
            "repRangeStart": 8,
            "repRangeEnd": 12,
            "changeType": "AbsoluteLoad",
            "changeAmount": 5,
            "note": "Hold dumbbells, hinge at hips, lower to mid-shin, control up."
        }
    ]
},
	{
		"muscleGroup": "Glutes",
		"exercises": [
			{
				"name": "Barbell hip thrust",
				"targetMuscleGroup": "Glutes",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 8,
				"repRangeEnd": 12,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Shoulders on bench, thrust hips up, squeeze glutes, control return."
			},
			{
				"name": "Glute bridge",
				"targetMuscleGroup": "Glutes",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Lie flat, push hips up, contract glutes, slow return."
			},
			{
				"name": "Bulgarian split squat",
				"targetMuscleGroup": "Glutes",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Rear foot on bench, squat deep, push up strong."
			},
			{
				"name": "Cable glute kickback",
				"targetMuscleGroup": "Glutes",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Attach ankle strap, kick leg back, contract glutes, slow return."
			},
			{
				"name": "Dumbbell step-ups",
				"targetMuscleGroup": "Glutes",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Step onto box, push through glutes, control down."
			},
			{
				"name": "Sumo deadlift",
				"targetMuscleGroup": "Glutes",
				"customMuscleGroup": null,
				"bodyweightFraction": 1,
				"setType": "Straight",
				"repRangeStart": 5,
				"repRangeEnd": 10,
				"changeType": "AbsoluteLoad",
				"changeAmount": 10,
				"note": "Feet wide, grip bar, drive hips forward, lockout strong."
			},
			{
				"name": "Machine hip thrust",
				"targetMuscleGroup": "Glutes",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 8,
				"repRangeEnd": 12,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Push hips into pad, contract glutes, control return."
			},
			{
				"name": "Walking lunges",
				"targetMuscleGroup": "Glutes",
				"customMuscleGroup": null,
				"bodyweightFraction": 0.85,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Step forward, lower knee, push through glutes."
			}
		]
	},
	{
		"muscleGroup": "Calves",
		"exercises": [
			{
				"name": "Standing calf raises",
				"targetMuscleGroup": "Calves",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Stand tall, raise heels, squeeze calves, control down."
			},
			{
				"name": "Seated calf raises",
				"targetMuscleGroup": "Calves",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Sit upright, push toes down, contract soleus, control return."
			},
			{
				"name": "Dumbbell standing calf raises",
				"targetMuscleGroup": "Calves",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Hold dumbbells, raise heels, squeeze calves, control down."
			},
			{
				"name": "Dumbbell seated calf raises",
				"targetMuscleGroup": "Calves",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Place dumbbells on knees, raise heels, slow return."
			},
			{
				"name": "Donkey calf raises",
				"targetMuscleGroup": "Calves",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Lean forward, raise heels, stretch calves, control down."
			},
			{
				"name": "Single-leg calf raises",
				"targetMuscleGroup": "Calves",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Stand on one foot, raise heel, control descent."
			}
		]
	},
	{
		"muscleGroup": "Abs",
		"exercises": [
			{
				"name": "Weighted crunch",
				"targetMuscleGroup": "Abs",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Hold weight at chest, crunch up, squeeze abs, slow return."
			},
			{
				"name": "Hanging leg raises",
				"targetMuscleGroup": "Abs",
				"customMuscleGroup": null,
				"bodyweightFraction": 1,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Hang from bar, raise legs to 90 degrees, control return."
			},
			{
				"name": "Cable rope crunch",
				"targetMuscleGroup": "Abs",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Kneel, grip rope, crunch forward, squeeze abs, control return."
			},
			{
				"name": "Ab wheel rollout",
				"targetMuscleGroup": "Abs",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 8,
				"repRangeEnd": 12,
				"changeType": null,
				"changeAmount": null,
				"note": "Kneel, roll forward, engage core, return slowly."
			},
			{
				"name": "Plank",
				"targetMuscleGroup": "Abs",
				"customMuscleGroup": null,
				"bodyweightFraction": 1,
				"setType": "Isometric",
				"repRangeStart": 30,
				"repRangeEnd": 60,
				"changeType": null,
				"changeAmount": null,
				"note": "Forearms on floor, keep back straight, hold core tight."
			},
			{
				"name": "Modified candlestick",
				"targetMuscleGroup": "Abs",
				"customMuscleGroup": null,
				"bodyweightFraction": 1,
				"setType": "Straight",
				"repRangeStart": 8,
				"repRangeEnd": 12,
				"changeType": null,
				"changeAmount": null,
				"note": "Lie flat, roll back, extend legs upward, slow return."
			}
		]
	},
	{
		"muscleGroup": "Neck",
		"exercises": [
			{
				"name": "Neck curls",
				"targetMuscleGroup": "Neck",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Lie back, nod head forward, control return."
			},
			{
				"name": "Neck extensions",
				"targetMuscleGroup": "Neck",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Lie face down, lift head back, slow return."
			},
			{
				"name": "Lateral neck flexion",
				"targetMuscleGroup": "Neck",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Tilt head sideways, return slowly."
			},
			{
				"name": "Neck bridges",
				"targetMuscleGroup": "Neck",
				"customMuscleGroup": null,
				"bodyweightFraction": 1,
				"setType": "Straight",
				"repRangeStart": 8,
				"repRangeEnd": 12,
				"changeType": null,
				"changeAmount": null,
				"note": "Rest on head, lift body slightly, control movement."
			},
			{
				"name": "Plate neck curls",
				"targetMuscleGroup": "Neck",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": "AbsoluteLoad",
				"changeAmount": 2.5,
				"note": "Hold plate on forehead, nod forward, slow return."
			},
			{
				"name": "Neck harness extensions",
				"targetMuscleGroup": "Neck",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Attach harness, lean back, return slowly."
			}
		]
	},
	{
		"muscleGroup": "Adductors",
		"exercises": [
			{
				"name": "Seated adductor machine",
				"targetMuscleGroup": "Adductors",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Sit upright, push knees inward, squeeze, slow return."
			},
			{
				"name": "Cable standing adduction",
				"targetMuscleGroup": "Adductors",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Attach ankle strap, pull leg inward, control return."
			},
			{
				"name": "Sumo stance goblet squat",
				"targetMuscleGroup": "Adductors",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Hold dumbbell, squat wide, push through adductors, control up."
			},
			{
				"name": "Dumbbell sumo deadlift",
				"targetMuscleGroup": "Adductors",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 8,
				"repRangeEnd": 12,
				"changeType": "AbsoluteLoad",
				"changeAmount": 5,
				"note": "Feet wide, grip dumbbells, hinge hips, push through adductors."
			},
			{
				"name": "Side-lying adductor raises",
				"targetMuscleGroup": "Adductors",
				"customMuscleGroup": null,
				"bodyweightFraction": 1,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Lie on side, lift bottom leg upward, slow return."
			}
		]
	},
	{
		"muscleGroup": "Abductors",
		"exercises": [
			{
				"name": "Seated abductor machine",
				"targetMuscleGroup": "Abductors",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Sit upright, push knees outward, squeeze, slow return."
			},
			{
				"name": "Cable standing abduction",
				"targetMuscleGroup": "Abductors",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Attach ankle strap, lift leg sideways, control return."
			},
			{
				"name": "Side-lying hip abduction",
				"targetMuscleGroup": "Abductors",
				"customMuscleGroup": null,
				"bodyweightFraction": 1,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Lie on side, lift top leg, hold briefly, slow return."
			},
			{
				"name": "Dumbbell lateral step-ups",
				"targetMuscleGroup": "Abductors",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 10,
				"repRangeEnd": 15,
				"changeType": null,
				"changeAmount": null,
				"note": "Step sideways onto box, push through abductors, control down."
			},
			{
				"name": "Banded lateral walks",
				"targetMuscleGroup": "Abductors",
				"customMuscleGroup": null,
				"bodyweightFraction": null,
				"setType": "Straight",
				"repRangeStart": 12,
				"repRangeEnd": 20,
				"changeType": null,
				"changeAmount": null,
				"note": "Band around thighs, step sideways, maintain tension."
			}
		]
	}
		]
	}
];
