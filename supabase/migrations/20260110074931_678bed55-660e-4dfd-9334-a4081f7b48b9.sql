-- Step 1: Create enum for club roles
CREATE TYPE public.club_role AS ENUM ('moderator', 'co_lead', 'elder', 'member');