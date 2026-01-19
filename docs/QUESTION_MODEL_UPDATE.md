# Question Model Update - JSON Structure Alignment

## Overview

The Question data model has been updated to match the questions JSON format exactly. This ensures consistency across the entire codebase and simplifies the quiz engine logic.

## Changes Made

### 1. Prisma Schema Updates

**Before:**
```prisma
model Question {
  id            String     @id @default(cuid())
  question      String
  optionA       String
  optionB       String
  optionC       String
  optionD       String
  correctOption Option     // Enum: A, B, C, D
  difficulty    Difficulty @default(MEDIUM)
  category      String
  createdAt     DateTime   @default(now())
}

enum Option {
  A
  B
  C
  D
}
```

**After:**
```prisma
model Question {
  id        String     @id @default(cuid())
  question  String
  options   Json       // { a: string, b: string, c: string, d: string }
  answer    String     // "a" | "b" | "c" | "d"
  difficulty Difficulty @default(MEDIUM)
  category  String
  createdAt DateTime   @default(now())
}

// Option enum removed
```

### 2. JSON Structure Alignment

**Target JSON Format:**
```json
{
  "id": "1.1",
  "question": "\"Management is both a science and an art\" in India evolved through how many broad stages?",
  "options": {
    "a": "Three",
    "b": "Four", 
    "c": "Five",
    "d": "Six"
  },
  "answer": "c"
}
```

### 3. TypeScript Interface

```typescript
export interface Question {
  id: string;
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  answer: 'a' | 'b' | 'c' | 'd';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  createdAt?: Date;
}
```

### 4. Database Schema (SQL)

```sql
-- Updated questions table
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,  -- Changed from individual option columns
    "answer" TEXT NOT NULL,    -- Changed from enum to string
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);
```

## Implementation Guidelines

### Backend Logic
- Fetch questions return the exact JSON structure
- Compare user selections directly with the `answer` field
- Use `Object.entries(options)` to iterate through options
- No more enum-based option comparison

### Frontend Quiz Engine
- Render options dynamically: `Object.entries(question.options)`
- Display labels as A, B, C, D (UI only)
- Internally use "a", "b", "c", "d" for logic
- Direct comparison: `userSelection === question.answer`

### Data Migration
- Seeding script updated to use JSON options object
- Answer field stores lowercase letters ("a", "b", "c", "d")
- No more individual optionA/B/C/D fields

## Benefits

1. **Simplified Logic**: Direct string comparison instead of enum conversion
2. **JSON Alignment**: Perfect match with source data format
3. **Scalability**: Easier to extend with additional option formats
4. **Consistency**: Single source of truth for question structure
5. **Performance**: Reduced data transformation overhead

## Files Updated

- ✅ `prisma/schema.prisma` - Updated Question model
- ✅ `prisma/seed.ts` - Updated seeding logic
- ✅ `create_tables.sql` - Updated database schema
- ✅ `src/types/question.ts` - New TypeScript interfaces
- ✅ `.kiro/specs/quizmaster-platform/design.md` - Updated design
- ✅ `.kiro/specs/quizmaster-platform/requirements.md` - Updated requirements
- ✅ `.kiro/specs/quizmaster-platform/tasks.md` - Updated task descriptions

## Next Steps

1. Run the updated `create_tables.sql` in Supabase to create the new schema
2. Run the seeding script to populate questions with the new format
3. Update any existing frontend components to use the new question structure
4. Test the quiz engine with the updated data model

## Migration Notes

- The Option enum has been completely removed
- All option-related logic now uses lowercase letters ("a", "b", "c", "d")
- The options field is stored as JSON/JSONB for flexibility
- Existing data will need to be migrated to the new format