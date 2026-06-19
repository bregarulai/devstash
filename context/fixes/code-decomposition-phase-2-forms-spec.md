# Code Decomposition — Phase 2: Form & Dialog Decomposition

## Overview

Reduce boilerplate in `ItemCreateDialog.tsx` by extracting a reusable form field wrapper and separating form rendering from dialog logic.

| Priority | Count |
|----------|-------|
| High | 3 |

> **IMPORTANT**: When implementing these changes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

---

## 5. Extract `CreateFormField` Wrapper

**File:** `components/items/itemCreateDialog/ItemCreateDialog.tsx:77-202`

There are 7 nearly identical `<Field>` blocks, each following the pattern:
```tsx
<Field data-invalid={errors.X ? 'true' : undefined}>
  <FieldLabel htmlFor='X'>Label <span className='text-destructive'>*</span></FieldLabel>
  <FieldContent>
    <Input/Textarea {...register('X')} placeholder='...' />
    {errors.X && <FieldError>{errors.X.message}</FieldError>}
  </FieldContent>
</Field>
```

This pattern repeats for: `title`, `description`, `fileUrl`, `content`, `url`, `language`, and `tags`.

**Change:** Create `components/items/itemCreateDialog/CreateFormField.tsx` containing:
- Wraps `<Field>/<FieldLabel>/<FieldContent>/<FieldError>`
- Handles `data-invalid` attribute, required indicator, error display
- Accepts children for flexible input/textarea rendering

Props: `{ name, label, error?, required?, children }`

---

## 6. Extract `fileConfig` Variable

**File:** `components/items/itemCreateDialog/ItemCreateDialog.tsx:120-138`

The file upload field uses three ternaries to compute `accept`, `maxSize`, and `fileType` based on `selectedType`. These should be computed once.

**Change:** Extract a computed config object:
```ts
const fileConfig = selectedType === 'image'
  ? { accept: IMAGE_ACCEPT, maxSize: IMAGE_MAX_SIZE, fileType: 'image' as const }
  : { accept: FILE_ACCEPT, maxSize: FILE_MAX_SIZE, fileType: 'file' as const };
```

Then reference `fileConfig.accept`, `fileConfig.maxSize`, `fileConfig.fileType` in the JSX.

---

## 7. Extract `ItemCreateFormBody` Sub-component

**File:** `components/items/itemCreateDialog/ItemCreateDialog.tsx:76-221`

The dialog form body is 145 lines of JSX that could be a separate component. This would separate form rendering from dialog state management (open/close, form submission).

**Change:** Create `components/items/itemCreateDialog/ItemCreateFormBody.tsx` containing:
- The entire form field section (title, description, file upload, content, url, language, tags)
- Accepts form state (`register`, `errors`, `selectedType`, etc.) as props

Props: `{ register, errors, selectedType, watch, ... }`
