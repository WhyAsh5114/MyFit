# MyFit schema

## Exercise split

A workout routine with exercises, sets, and rep range, used when starting new mesocycles.

- Can be weekly or asynchronous
- Can use bodyweight exercises
- Examples: Push Pull Legs, Upper Lower

## Mesocycle

A sequence of microcycles. Starts from an exercise split and adapts it according to the algorithms defined with progressive overload and deloading.

- Caloric state
- Specialized muscle groups
- Start RIR, total duration, and RIR progression
- Performs automatic progressive overload over microcycles
- Adds sets according to performance improvements and soreness
- Suggests deloads or recovery phases when performance loss detected

## Workout

An exercise sequence templated from an exercise split, performed in a microcycle of a mesocycle. Uses and improves values from reference workout if available.

- Takes SFR for each exercise
- Takes soreness and workload feedback for each muscle group.
- Shows performance changes for each exercise (compared to reference workout)
- Considers user bodyweight changes as well for bodyweight exercises
