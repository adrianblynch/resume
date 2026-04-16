# jsonresume-theme-flat-reordered

Local custom JSON Resume theme based on `jsonresume-theme-flat`, with support for:

- section reordering
- section title overrides
- hidden sections
- `Intl.DateTimeFormat`-style date formatting

## Theme Options

Configure this theme through `resume.json`:

```json
{
  "meta": {
    "themeOptions": {
      "sectionOrder": [],
      "hiddenSections": [],
      "sectionTitles": {},
      "dateFormat": {
        "locale": "en-GB",
        "options": {
          "month": "short",
          "year": "numeric"
        }
      }
    }
  }
}
```

## Date Formatting

The `dateFormat` option uses the same style of options as `Intl.DateTimeFormat`.

Example:

```json
{
  "meta": {
    "themeOptions": {
      "dateFormat": {
        "locale": "en-GB",
        "options": {
          "month": "short",
          "year": "numeric"
        }
      }
    }
  }
}
```

This would render a stored date like `2016-05-17` as `May 2016`.

### Supported `dateFormat.options` fields

- `year`: `numeric` or `2-digit`
- `month`: `numeric`, `2-digit`, `short`, `long`, or `narrow`
- `day`: `numeric` or `2-digit`
- `dateStyle`: `full`, `long`, `medium`, or `short`

### Notes

- If no valid `dateFormat.options` are supplied, the original JSON date string is shown.
- If the stored date only has a year, and your options require a month or day, the theme falls back to showing just the year.
- The theme formats date fields in `work`, `volunteer`, `education`, `awards`, and `publications`.
