# MyFit

MyFit is a nutrition tracker for people who log macros precisely. These are the product's words. Use them in code, docs, UI copy and conversation, and add a term when one is settled. The format is in `.claude/skills/domain-modeling/GLOSSARY-FORMAT.md`.

## Diary

**Diary**:
The record of what a user ate and did, shown one day at a time.
_Avoid_: log, journal

**Diary day**:
One calendar day in the user's local time zone, which entries belong to by when they happened.
_Avoid_: date (alone), UTC day

**Finished day**:
A diary day before today. Only a finished day is judged on or off target.
_Avoid_: closed day, complete day

**Meal**:
A user-named group in the diary that food entries sit in, such as Breakfast. Meals have an order and can be hidden.
_Avoid_: category, slot

**Food entry**:
A food the user ate, with its amount, time and nutrition per 100 g.
_Avoid_: log, item, food (alone)

**Activity entry**:
Something the user did that burned calories, with its amount and calories.
_Avoid_: exercise, workout

## Foods

**Food database**:
The public catalogue of packaged and generic foods (from Open Food Facts) that the user searches or scans.
_Avoid_: nutrition data (in UI copy), products

**Your foods**:
The foods a user has logged before, ranked by how often and how recently they logged each.
_Avoid_: history, recents, favourites

## Goals

**Macros**:
Carbs, fat and protein, always in that order (C F P).
_Avoid_: macronutrients (in UI copy)

**Calorie goal**:
The calories a user aims to eat in a day, derived from their metrics, activity and weekly change.
_Avoid_: calorie target, budget, limit

**Macro targets**:
The user's daily amounts for carbs, fat and protein, and their weekly weight change, which sets whether they are cutting, maintaining or bulking.
_Avoid_: macro goals, plan

**Metrics**:
The user's bodyweight, height, body fat, age and sex, used to estimate the calories they burn at rest.
_Avoid_: body stats, profile

**On target / Off target**:
How a finished day went against a goal. Off target has a direction, over or under. There is no third status.
_Avoid_: good / bad, failed, missed

## Assistant

**Chat**:
A conversation with the assistant, which can read the diary and propose entries for the user to confirm.
_Avoid_: AI, bot, conversation (as a feature name)
