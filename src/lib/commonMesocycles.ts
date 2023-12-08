type commonMesocycles = {
  name: string;
  description: string;
  exerciseSplit: MesocycleTemplate["exerciseSplit"];
}[];

export const commonMesocycles: commonMesocycles = [
  {
    name: "Pull Push Legs",
    description: `A common split with moderate volume. Six workouts per microcycle and a muscle group targeting frequency of 2x`,
    exerciseSplit: [
      {
        name: "Pull A",
        exercises: [
          {
            weightType: "Bodyweight",
            targetMuscleGroup: "Back",
            name: "Pull up",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 15
          },
          {
            weightType: "Weighted",
            name: "Barbell row",
            targetMuscleGroup: "Back",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20
          },
          {
            weightType: "Weighted",
            name: "Dumbbell curl",
            targetMuscleGroup: "Biceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20
          },
          {
            weightType: "Weighted",
            name: "Face pull",
            targetMuscleGroup: "Rear delts",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20
          }
        ]
      },
      {
        name: "Push A",
        exercises: [
          {
            weightType: "Weighted",
            targetMuscleGroup: "Chest",
            name: "Incline Barbell Press",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 10
          },
          {
            weightType: "Weighted",
            name: "Overhead cable extension",
            targetMuscleGroup: "Triceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20
          },
          {
            weightType: "Weighted",
            name: "Dumbbell lateral raises",
            targetMuscleGroup: "Side delts",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20
          },
          {
            weightType: "Weighted",
            name: "Cable lateral raise",
            targetMuscleGroup: "Side delts",
            sets: 2,
            repRangeStart: 10,
            repRangeEnd: 20
          }
        ]
      },
      {
        name: "Legs A",
        exercises: [
          {
            weightType: "Weighted",
            targetMuscleGroup: "Quads",
            name: "Barbell squat",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 10
          },
          {
            weightType: "Weighted",
            name: "Good morning",
            targetMuscleGroup: "Hamstrings",
            sets: 2,
            repRangeStart: 10,
            repRangeEnd: 20
          },
          {
            weightType: "Weighted",
            name: "Leg extension",
            targetMuscleGroup: "Quads",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20
          },
          {
            weightType: "Bodyweight",
            name: "Calf raise",
            targetMuscleGroup: "Calves",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20
          }
        ]
      },
      null,
      {
        name: "Pull B",
        exercises: [
          {
            weightType: "Bodyweight",
            targetMuscleGroup: "Back",
            name: "Pull up",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 15
          },
          {
            weightType: "Weighted",
            name: "Barbell row",
            targetMuscleGroup: "Back",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20
          },
          {
            weightType: "Weighted",
            name: "Dumbbell curl",
            targetMuscleGroup: "Biceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20
          },
          {
            weightType: "Weighted",
            name: "Face pull",
            targetMuscleGroup: "Rear delts",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20
          }
        ]
      },
      {
        name: "Push B",
        exercises: [
          {
            weightType: "Weighted",
            targetMuscleGroup: "Chest",
            name: "Incline Barbell Press",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 10
          },
          {
            weightType: "Weighted",
            name: "Overhead cable extension",
            targetMuscleGroup: "Triceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20
          },
          {
            weightType: "Weighted",
            name: "Dumbbell lateral raises",
            targetMuscleGroup: "Side delts",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20
          },
          {
            weightType: "Weighted",
            name: "Cable lateral raise",
            targetMuscleGroup: "Side delts",
            sets: 2,
            repRangeStart: 10,
            repRangeEnd: 20
          }
        ]
      },
      {
        name: "Legs B",
        exercises: [
          {
            weightType: "Weighted",
            targetMuscleGroup: "Quads",
            name: "Barbell squat",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 10
          },
          {
            weightType: "Weighted",
            name: "Good morning",
            targetMuscleGroup: "Hamstrings",
            sets: 2,
            repRangeStart: 10,
            repRangeEnd: 20
          },
          {
            weightType: "Weighted",
            name: "Leg extension",
            targetMuscleGroup: "Quads",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20
          },
          {
            weightType: "Bodyweight",
            name: "Calf raise",
            targetMuscleGroup: "Calves",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20
          }
        ]
      },
      null
    ]
  }
];
