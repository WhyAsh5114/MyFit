type CommonMesocycles = {
  name: string;
  description: string;
  exerciseSplit: MesocycleTemplate["exerciseSplit"];
}[];

export const commonMesocycles: CommonMesocycles = [
  {
    name: "Pull Push Legs",
    description:
      "A common split with moderate volume. Six workouts per microcycle and a muscle group targeting frequency of 2x",
    exerciseSplit: [
      {
        name: "Pull A",
        exerciseTemplates: [
          {
            bodyweight: true,
            targetMuscleGroup: "Back",
            name: "Pull up",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 15,
            note: ""
          },
          {
            bodyweight: false,
            name: "Barbell row",
            targetMuscleGroup: "Back",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          },
          {
            bodyweight: false,
            name: "Dumbbell curl",
            targetMuscleGroup: "Biceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          },
          {
            bodyweight: false,
            name: "Face pull",
            targetMuscleGroup: "Rear delts",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          }
        ]
      },
      {
        name: "Push A",
        exerciseTemplates: [
          {
            bodyweight: false,
            targetMuscleGroup: "Chest",
            name: "Incline Barbell Press",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 10,
            note: ""
          },
          {
            bodyweight: false,
            name: "Overhead cable extension",
            targetMuscleGroup: "Triceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          },
          {
            bodyweight: false,
            name: "Dumbbell lateral raises",
            targetMuscleGroup: "Side delts",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          },
          {
            bodyweight: false,
            name: "Cable lateral raise",
            targetMuscleGroup: "Side delts",
            sets: 2,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          }
        ]
      },
      {
        name: "Legs A",
        exerciseTemplates: [
          {
            bodyweight: false,
            targetMuscleGroup: "Quads",
            name: "Barbell squat",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 10,
            note: ""
          },
          {
            bodyweight: false,
            name: "Good morning",
            targetMuscleGroup: "Hamstrings",
            sets: 2,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          },
          {
            bodyweight: false,
            name: "Leg extension",
            targetMuscleGroup: "Quads",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          },
          {
            bodyweight: true,
            name: "Calf raise",
            targetMuscleGroup: "Calves",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          }
        ]
      },
      null,
      {
        name: "Pull B",
        exerciseTemplates: [
          {
            bodyweight: true,
            targetMuscleGroup: "Back",
            name: "Pull up",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 15,
            note: ""
          },
          {
            bodyweight: false,
            name: "Barbell row",
            targetMuscleGroup: "Back",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          },
          {
            bodyweight: false,
            name: "Dumbbell curl",
            targetMuscleGroup: "Biceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          },
          {
            bodyweight: false,
            name: "Face pull",
            targetMuscleGroup: "Rear delts",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          }
        ]
      },
      {
        name: "Push B",
        exerciseTemplates: [
          {
            bodyweight: false,
            targetMuscleGroup: "Chest",
            name: "Incline Barbell Press",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 10,
            note: ""
          },
          {
            bodyweight: false,
            name: "Overhead cable extension",
            targetMuscleGroup: "Triceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          },
          {
            bodyweight: false,
            name: "Dumbbell lateral raises",
            targetMuscleGroup: "Side delts",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          },
          {
            bodyweight: false,
            name: "Cable lateral raise",
            targetMuscleGroup: "Side delts",
            sets: 2,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          }
        ]
      },
      {
        name: "Legs B",
        exerciseTemplates: [
          {
            bodyweight: false,
            targetMuscleGroup: "Quads",
            name: "Barbell squat",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 10,
            note: ""
          },
          {
            bodyweight: false,
            name: "Good morning",
            targetMuscleGroup: "Hamstrings",
            sets: 2,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          },
          {
            bodyweight: false,
            name: "Leg extension",
            targetMuscleGroup: "Quads",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          },
          {
            bodyweight: true,
            name: "Calf raise",
            targetMuscleGroup: "Calves",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: ""
          }
        ]
      },
      null
    ]
  }
];
