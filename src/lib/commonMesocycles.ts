type CommonExerciseSplits = (ExerciseSplit & { description: string })[];

export const commonSplits: CommonExerciseSplits = [
  {
    name: "Pull Push Legs",
    description:
      "A common split with moderate volume. Six workouts per microcycle and a muscle group targeting frequency of 2x",
    splitDays: [
      {
        name: "Pull A",
        exerciseTemplates: [
          {
            involvesBodyweight: true,
            targetMuscleGroup: "Lats",
            name: "Pull up",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 15,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Barbell row",
            targetMuscleGroup: "Traps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Dumbbell curl",
            targetMuscleGroup: "Biceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Face pull",
            targetMuscleGroup: "Rear delts",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          }
        ]
      },
      {
        name: "Push A",
        exerciseTemplates: [
          {
            involvesBodyweight: false,
            targetMuscleGroup: "Chest",
            name: "Incline Barbell Press",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 10,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Overhead cable extension",
            targetMuscleGroup: "Triceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Dumbbell lateral raises",
            targetMuscleGroup: "Side delts",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Cable lateral raise",
            targetMuscleGroup: "Side delts",
            sets: 2,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          }
        ]
      },
      {
        name: "Legs A",
        exerciseTemplates: [
          {
            involvesBodyweight: true,
            targetMuscleGroup: "Quads",
            name: "Barbell squat",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 10,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Good morning",
            targetMuscleGroup: "Hamstrings",
            sets: 2,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Leg extension",
            targetMuscleGroup: "Quads",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: true,
            name: "Calf raise",
            targetMuscleGroup: "Calves",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          }
        ]
      },
      {
        name: "Pull B",
        exerciseTemplates: [
          {
            involvesBodyweight: false,
            targetMuscleGroup: "Lats",
            name: "Lat pulldown",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Machine rows",
            targetMuscleGroup: "Traps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Preacher curl",
            targetMuscleGroup: "Biceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Rear delts fly",
            targetMuscleGroup: "Rear delts",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          }
        ]
      },
      {
        name: "Push B",
        exerciseTemplates: [
          {
            involvesBodyweight: false,
            targetMuscleGroup: "Chest",
            name: "Dumbbell Bench Press",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 10,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Triceps pushdown",
            targetMuscleGroup: "Triceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Cross body cable Y-raises",
            targetMuscleGroup: "Side delts",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Upright row",
            targetMuscleGroup: "Side delts",
            sets: 2,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          }
        ]
      },
      {
        name: "Legs B",
        exerciseTemplates: [
          {
            involvesBodyweight: true,
            targetMuscleGroup: "Quads",
            name: "Front squat",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 10,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Leg curl",
            targetMuscleGroup: "Hamstrings",
            sets: 2,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: true,
            name: "Sissy squat",
            targetMuscleGroup: "Quads",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Seated calf raise",
            targetMuscleGroup: "Calves",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          }
        ]
      },
      null
    ]
  },
  {
    name: "Yoked split",
    description:
      "A split with a high focus on the yoked muscles (back, shoulders, arms) with 3x frequency, and others with 2x frequency (inspired by the RP look like Thor video)",
    splitDays: [
      {
        name: "Back, Shoulders, Arms (1)",
        exerciseTemplates: [
          {
            involvesBodyweight: false,
            targetMuscleGroup: "Lats",
            name: "Lat pulldown",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Chest supported row",
            targetMuscleGroup: "Traps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Dumbbell curl",
            targetMuscleGroup: "Biceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Dumbbell lateral raises",
            targetMuscleGroup: "Side delts",
            sets: 3,
            repRangeStart: 15,
            repRangeEnd: 30,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Overhead triceps extension",
            targetMuscleGroup: "Triceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          }
        ]
      },
      {
        name: "Legs, Chest (1)",
        exerciseTemplates: [
          {
            involvesBodyweight: true,
            targetMuscleGroup: "Quads",
            name: "Hack squat",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 15,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Leg extension",
            targetMuscleGroup: "Quads",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Leg curl",
            targetMuscleGroup: "Hamstrings",
            sets: 2,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Incline dumbbell press",
            targetMuscleGroup: "Chest",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Cable pec flyes",
            targetMuscleGroup: "Chest",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: true,
            name: "Calf raise",
            targetMuscleGroup: "Calves",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          }
        ]
      },
      {
        name: "Back, Arms, Shoulders (2)",
        exerciseTemplates: [
          {
            involvesBodyweight: true,
            targetMuscleGroup: "Lats",
            name: "Pull up",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 10,
            note: "Use assisted pull ups if needed to land within 5-10 rep range",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Barbell row",
            targetMuscleGroup: "Traps",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 15,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Preacher curl",
            targetMuscleGroup: "Biceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Tricep pushdown",
            targetMuscleGroup: "Triceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Cable lateral raise",
            targetMuscleGroup: "Side delts",
            sets: 3,
            repRangeStart: 15,
            repRangeEnd: 25,
            note: "",
            setType: "straight"
          }
        ]
      },
      {
        name: "Chest, Legs (2)",
        exerciseTemplates: [
          {
            involvesBodyweight: false,
            targetMuscleGroup: "Chest",
            name: "Incline barbell press",
            sets: 3,
            repRangeStart: 5,
            repRangeEnd: 15,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Machine chest press",
            targetMuscleGroup: "Chest",
            sets: 2,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: true,
            name: "Dumbbell lunge",
            targetMuscleGroup: "Quads",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: true,
            name: "Dumbbell Romanian Deadlift",
            targetMuscleGroup: "Hamstrings",
            sets: 2,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: true,
            name: "Calf raise",
            targetMuscleGroup: "Calves",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          }
        ]
      },
      {
        name: "Back, Shoulders, Arms (3)",
        exerciseTemplates: [
          {
            involvesBodyweight: false,
            targetMuscleGroup: "Traps",
            name: "Helms row",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Lat prayer",
            targetMuscleGroup: "Lats",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "EZ barbell curl",
            targetMuscleGroup: "Biceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Cable upright row",
            targetMuscleGroup: "Side delts",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          },
          {
            involvesBodyweight: false,
            name: "Overhead triceps extension",
            targetMuscleGroup: "Triceps",
            sets: 3,
            repRangeStart: 10,
            repRangeEnd: 20,
            note: "",
            setType: "straight"
          }
        ]
      },
      null,
      null
    ]
  }
];
