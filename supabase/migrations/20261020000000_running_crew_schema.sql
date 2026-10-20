-- Supabase Schema for Running Crew Board

-- 1. Profiles (크루원 프로필 & 승인/권한 관리)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'guest')),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  running_pace TEXT DEFAULT '5:30',
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Posts (러닝 크루 게시글)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('regular', 'flash', 'log', 'notice')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  run_date TIMESTAMPTZ,
  location TEXT,
  distance_km NUMERIC(4, 1),
  target_pace TEXT,
  max_participants INTEGER DEFAULT 30,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 3. RSVPs (참석 투표 / 응원)
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'attending' CHECK (status IN ('attending', 'cheering')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- 4. Comments (댓글)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 5. Helper Function: 현재 유저가 관리자인지 확인
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_approved = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 6. Helper Function: 현재 유저가 승인된 멤버인지 확인
CREATE OR REPLACE FUNCTION public.is_approved_member()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_approved = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 7. RLS Policies
-- Profiles: 누구나 읽을 수 있음
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Profiles 업데이트: 본인은 프로필 정보(페이스, 소개 등)만 수정 가능, 관리자는 승인 및 롤 변경 가능
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- Posts: 승인 여부와 상관없이 모든 인증된 사용자는 글 목록/상세 조회 가능
CREATE POLICY "Posts are viewable by authenticated users"
ON public.posts FOR SELECT
TO authenticated
USING (true);

-- Posts 작성: 승인된 크루원만 작성 가능 (공지사항은 관리자만)
CREATE POLICY "Approved members can insert posts"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (
  public.is_approved_member() AND
  (category != 'notice' OR public.is_admin())
);

-- Posts 수정: 작성자 본인 또는 관리자
CREATE POLICY "Authors or admins can update posts"
ON public.posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id OR public.is_admin())
WITH CHECK (auth.uid() = author_id OR public.is_admin());

-- Posts 삭제: 작성자 본인 또는 관리자
CREATE POLICY "Authors or admins can delete posts"
ON public.posts FOR DELETE
TO authenticated
USING (auth.uid() = author_id OR public.is_admin());

-- RSVPs: 승인된 크루원만 참여 가능, 조회는 모두 가능
CREATE POLICY "RSVPs are viewable by authenticated users"
ON public.rsvps FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Approved members can insert RSVPs"
ON public.rsvps FOR INSERT
TO authenticated
WITH CHECK (public.is_approved_member() AND auth.uid() = user_id);

CREATE POLICY "Users can update own RSVPs"
ON public.rsvps FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users or admins can delete RSVPs"
ON public.rsvps FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- Comments: 승인된 크루원만 작성 가능
CREATE POLICY "Comments are viewable by authenticated users"
ON public.comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Approved members can insert comments"
ON public.comments FOR INSERT
TO authenticated
WITH CHECK (public.is_approved_member() AND auth.uid() = author_id);

CREATE POLICY "Authors or admins can delete comments"
ON public.comments FOR DELETE
TO authenticated
USING (auth.uid() = author_id OR public.is_admin());

-- 8. Trigger: 회원가입(구글 로그인 포함) 시 profiles에 자동 등록
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_is_first_user BOOLEAN;
  v_is_admin BOOLEAN;
BEGIN
  -- 등록된 프로필이 아무도 없거나 taehyun0826@gmail.com 이면 최초 관리자로 지정
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO v_is_first_user;
  v_is_admin := v_is_first_user OR NEW.email = 'taehyun0826@gmail.com';

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    is_approved
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    CASE WHEN v_is_admin THEN 'admin' ELSE 'member' END,
    CASE WHEN v_is_admin THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
