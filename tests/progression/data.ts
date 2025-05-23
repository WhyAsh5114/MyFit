import type { ActiveMesocycleWithProgressionData } from '../../src/lib/trpc/routes/workouts';

export const testMesocycle: ActiveMesocycleWithProgressionData = {
	id: 'cm25sw3zk000w14ycgmmnfk8o',
	name: 'MyMeso',
	userId: 'cm25sutzy000010xygns28ax0',
	exerciseSplitId: 'cm25sv4cc000014ycbgn538se',
	RIRProgression: [1, 3, 3, 3],
	startDate: new Date(),
	endDate: null,
	startOverloadPercentage: 2.5,
	lastSetToFailure: true,
	forceRIRMatching: true,
	mesocycleExerciseSplitDays: [
		{
			id: 'cm25sw3zk000x14yc98z6395y',
			name: 'Pull A',
			dayIndex: 0,
			isRestDay: false,
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			mesocycleSplitDayExercises: [
				{
					id: 'cm25sw3zr000b10xypbnxnhtx',
					name: 'Pull-ups',
					exerciseIndex: 0,
					targetMuscleGroup: 'Lats',
					customMuscleGroup: null,
					bodyweightFraction: 1,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 5,
					repRangeEnd: 15,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk000x14yc98z6395y',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zr000c10xy5dqswu4o',
					name: 'Barbell rows',
					exerciseIndex: 1,
					targetMuscleGroup: 'Traps',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 15,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk000x14yc98z6395y',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zr000d10xyd1ovg8np',
					name: 'Dumbbell bicep curls',
					exerciseIndex: 2,
					targetMuscleGroup: 'Biceps',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 20,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk000x14yc98z6395y',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zr000e10xyffzb3d5h',
					name: 'Face pulls',
					exerciseIndex: 3,
					targetMuscleGroup: 'RearDelts',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 15,
					repRangeEnd: 30,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk000x14yc98z6395y',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				}
			]
		},
		{
			id: 'cm25sw3zk000y14yc1jhg7irq',
			name: 'Push A',
			dayIndex: 1,
			isRestDay: false,
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			mesocycleSplitDayExercises: [
				{
					id: 'cm25sw3zr000f10xyhuuhu6h2',
					name: 'Incline barbell press',
					exerciseIndex: 0,
					targetMuscleGroup: 'Chest',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 3,
					setType: 'Down',
					repRangeStart: 5,
					repRangeEnd: 10,
					changeType: 'Percentage',
					changeAmount: 5,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk000y14yc1jhg7irq',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zr000g10xyg58sxz1g',
					name: 'Overhead cable extensions',
					exerciseIndex: 1,
					targetMuscleGroup: 'Triceps',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 20,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk000y14yc1jhg7irq',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zr000h10xy0w6vbqnc',
					name: 'Dumbell lateral raises',
					exerciseIndex: 2,
					targetMuscleGroup: 'SideDelts',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 15,
					repRangeEnd: 30,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk000y14yc1jhg7irq',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zr000i10xy2zvejagf',
					name: 'Cable lateral raises',
					exerciseIndex: 3,
					targetMuscleGroup: 'SideDelts',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 0,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 20,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk000y14yc1jhg7irq',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				}
			]
		},
		{
			id: 'cm25sw3zk000z14yc315j6nf6',
			name: 'Legs A',
			dayIndex: 2,
			isRestDay: false,
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			mesocycleSplitDayExercises: [
				{
					id: 'cm25sw3zr000j10xyjxjjbt5h',
					name: 'Barbell good mornings',
					exerciseIndex: 0,
					targetMuscleGroup: 'Hamstrings',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 20,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk000z14yc315j6nf6',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zr000k10xym4ihml3q',
					name: 'Barbell squats',
					exerciseIndex: 1,
					targetMuscleGroup: 'Quads',
					customMuscleGroup: null,
					bodyweightFraction: 1,
					sets: 3,
					setType: 'Down',
					repRangeStart: 5,
					repRangeEnd: 10,
					changeType: 'AbsoluteLoad',
					changeAmount: 10,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk000z14yc315j6nf6',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zr000l10xygdw3cxrx',
					name: 'Leg extensions',
					exerciseIndex: 2,
					targetMuscleGroup: 'Quads',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 0,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 20,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk000z14yc315j6nf6',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zr000m10xyxb94dnfv',
					name: 'Calf raises',
					exerciseIndex: 3,
					targetMuscleGroup: 'Calves',
					customMuscleGroup: null,
					bodyweightFraction: 1,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 20,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk000z14yc315j6nf6',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				}
			]
		},
		{
			id: 'cm25sw3zk001014ycbaq28apk',
			name: 'Pull B',
			dayIndex: 3,
			isRestDay: false,
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			mesocycleSplitDayExercises: [
				{
					id: 'cm25sw3zr000n10xy1fnc0dhw',
					name: 'Lat pulldowns',
					exerciseIndex: 0,
					targetMuscleGroup: 'Lats',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 20,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk001014ycbaq28apk',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zr000o10xyh41j4gg8',
					name: 'Machine rows',
					exerciseIndex: 1,
					targetMuscleGroup: 'Traps',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 20,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk001014ycbaq28apk',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zs000p10xyo4kr67sv',
					name: 'Dumbbell hammer curls',
					exerciseIndex: 2,
					targetMuscleGroup: 'Biceps',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 15,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk001014ycbaq28apk',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zs000q10xyk4uc8g6r',
					name: 'Reverse pec flye',
					exerciseIndex: 3,
					targetMuscleGroup: 'RearDelts',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 15,
					repRangeEnd: 30,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk001014ycbaq28apk',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				}
			]
		},
		{
			id: 'cm25sw3zk001114yc8dyv6vov',
			name: 'Push B',
			dayIndex: 4,
			isRestDay: false,
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			mesocycleSplitDayExercises: [
				{
					id: 'cm25sw3zs000r10xyq1uj0ijd',
					name: 'Incline dumbbell press',
					exerciseIndex: 0,
					targetMuscleGroup: 'Chest',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 15,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk001114yc8dyv6vov',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zs000s10xyzmm67lm4',
					name: 'Overhead barbell extensions',
					exerciseIndex: 1,
					targetMuscleGroup: 'Triceps',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 20,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk001114yc8dyv6vov',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zs000t10xyptu20q1f',
					name: 'Machine lateral raises',
					exerciseIndex: 2,
					targetMuscleGroup: 'SideDelts',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 15,
					repRangeEnd: 30,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk001114yc8dyv6vov',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zs000u10xyw4aa1156',
					name: 'Cable lateral raises',
					exerciseIndex: 3,
					targetMuscleGroup: 'SideDelts',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 0,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 20,
					changeType: null,
					changeAmount: null,
					note: 'Behind the back',
					mesocycleExerciseSplitDayId: 'cm25sw3zk001114yc8dyv6vov',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				}
			]
		},
		{
			id: 'cm25sw3zk001214yc02wc4yg1',
			name: 'Legs B',
			dayIndex: 5,
			isRestDay: false,
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			mesocycleSplitDayExercises: [
				{
					id: 'cm25sw3zs000v10xy87fym1ea',
					name: 'Leg curls',
					exerciseIndex: 0,
					targetMuscleGroup: 'Hamstrings',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 20,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk001214yc02wc4yg1',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zs000w10xyz704cjzz',
					name: 'Leg press',
					exerciseIndex: 1,
					targetMuscleGroup: 'Quads',
					customMuscleGroup: null,
					bodyweightFraction: null,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 20,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk001214yc02wc4yg1',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zs000x10xy7di9mrxq',
					name: 'Lunges',
					exerciseIndex: 2,
					targetMuscleGroup: 'Quads',
					customMuscleGroup: null,
					bodyweightFraction: 0.85,
					sets: 0,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 15,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk001214yc02wc4yg1',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				},
				{
					id: 'cm25sw3zs000y10xylyd9zcgv',
					name: 'Calf raises',
					exerciseIndex: 3,
					targetMuscleGroup: 'Calves',
					customMuscleGroup: null,
					bodyweightFraction: 1,
					sets: 3,
					setType: 'Straight',
					repRangeStart: 10,
					repRangeEnd: 20,
					changeType: null,
					changeAmount: null,
					note: null,
					mesocycleExerciseSplitDayId: 'cm25sw3zk001214yc02wc4yg1',
					overloadPercentage: null,
					lastSetToFailure: null,
					forceRIRMatching: null,
					minimumWeightChange: null
				}
			]
		},
		{
			id: 'cm25sw3zk001314yc406fe2se',
			name: '',
			dayIndex: 6,
			isRestDay: true,
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			mesocycleSplitDayExercises: []
		}
	],
	mesocycleCyclicSetChanges: [
		{
			id: 'cm25sw3zq000110xyyas2btbi',
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			muscleGroup: 'Lats',
			customMuscleGroup: null,
			regardlessOfProgress: false,
			setIncreaseAmount: 1,
			maxVolume: 30
		},
		{
			id: 'cm25sw3zq000210xywip2ccuw',
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			muscleGroup: 'Traps',
			customMuscleGroup: null,
			regardlessOfProgress: false,
			setIncreaseAmount: 1,
			maxVolume: 30
		},
		{
			id: 'cm25sw3zq000310xybj1o5sqv',
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			muscleGroup: 'Biceps',
			customMuscleGroup: null,
			regardlessOfProgress: false,
			setIncreaseAmount: 1,
			maxVolume: 30
		},
		{
			id: 'cm25sw3zq000410xyzdsi4g9p',
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			muscleGroup: 'RearDelts',
			customMuscleGroup: null,
			regardlessOfProgress: false,
			setIncreaseAmount: 1,
			maxVolume: 30
		},
		{
			id: 'cm25sw3zq000510xywpe5pc82',
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			muscleGroup: 'Chest',
			customMuscleGroup: null,
			regardlessOfProgress: false,
			setIncreaseAmount: 1,
			maxVolume: 30
		},
		{
			id: 'cm25sw3zq000610xywdqtu46v',
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			muscleGroup: 'Triceps',
			customMuscleGroup: null,
			regardlessOfProgress: false,
			setIncreaseAmount: 1,
			maxVolume: 30
		},
		{
			id: 'cm25sw3zq000710xy014g6eia',
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			muscleGroup: 'SideDelts',
			customMuscleGroup: null,
			regardlessOfProgress: false,
			setIncreaseAmount: 1,
			maxVolume: 30
		},
		{
			id: 'cm25sw3zq000810xyaczxobyf',
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			muscleGroup: 'Hamstrings',
			customMuscleGroup: null,
			regardlessOfProgress: false,
			setIncreaseAmount: 1,
			maxVolume: 30
		},
		{
			id: 'cm25sw3zq000910xyy5x7tgja',
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			muscleGroup: 'Quads',
			customMuscleGroup: null,
			regardlessOfProgress: false,
			setIncreaseAmount: 1,
			maxVolume: 30
		},
		{
			id: 'cm25sw3zq000a10xyeqg2ywf0',
			mesocycleId: 'cm25sw3zk000w14ycgmmnfk8o',
			muscleGroup: 'Calves',
			customMuscleGroup: null,
			regardlessOfProgress: false,
			setIncreaseAmount: 1,
			maxVolume: 30
		}
	],
	workoutsOfMesocycle: []
};
