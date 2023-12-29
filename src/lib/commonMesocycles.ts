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
            targetMuscleGroup: "Back (vertical pulls)",
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
            targetMuscleGroup: "Back (horizontal pulls)",
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
            involvesBodyweight: false,
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
            involvesBodyweight: true,
            targetMuscleGroup: "Back (vertical pulls)",
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
            targetMuscleGroup: "Back (horizontal pulls)",
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
        name: "Push B",
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
        name: "Legs B",
        exerciseTemplates: [
          {
            involvesBodyweight: false,
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
      null
    ]
  }
];
