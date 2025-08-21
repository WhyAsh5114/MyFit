# MyFit Svelte App Design Guidelines

This document outlines the design standards and UI conventions for the MyFit Svelte application.

## Card UI Usage

Cards are a fundamental component in our UI design. They provide visual separation and grouping of related content. Use the appropriate card padding based on the content type and complexity.

### Normal Card Padding (p-6)

Use **normal card padding** (`p-6`) for content that requires more breathing room and visual hierarchy:

#### Big Forms

- Forms with **more than 2-3 inputs**
- Multi-section forms
- Complex forms with multiple field types
- Forms that require clear visual separation between sections

#### Widgets

- Dashboard widgets
- Summary cards
- Status indicators
- Metric displays

#### Overviews

- Profile overviews
- Summary sections
- Information panels
- Feature explanations

#### Charts

- Data visualizations
- Graph containers
- Chart legends and controls
- Analytics displays

### Compact Card Padding (p-4)

Use **compact card padding** (`p-4`) for content that benefits from a more condensed layout:

#### Actions

- Button groups
- Quick action cards
- Tool bars within cards
- Single-action containers

#### List Items

- Exercise list items
- Food item entries
- Workout entries
- Any repeating list content

#### Links

- Navigation cards
- Link collections
- Menu items in card format
- Category links

#### Small Forms

- Simple forms with **2-3 inputs or fewer**
- Login/signup forms
- Quick entry forms
- Search forms

## Implementation Notes

- Always consider the content density and user interaction patterns
- Maintain consistency within similar UI patterns
- When in doubt, consider the primary use case and user workflow
- Test on mobile devices to ensure appropriate touch targets with compact padding

## Examples

```svelte
<!-- Normal padding for big forms -->
<Card.Root>
	<Card.Content>
		<!-- Complex form with multiple inputs -->
	</Card.Content>
</Card.Root>

<!-- Compact padding for list items -->
<Card.Root class="py-4">
	<Card.Content class="px-4">
		<!-- Simple stuff like an exercise -->
	</Card.Content>
</Card.Root>
```
