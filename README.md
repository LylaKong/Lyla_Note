# PaceMaker RC (러닝 크루 전용 게시판)

Anti-AI UI/UX 디자인 철학을 적용하여 제작된 러닝 크루 세션 모집 및 커뮤니티 게시판입니다.

## 🏃 주요 기능
- **Google OAuth 로그인**: 구글 계정으로 간편 가입 및 인증
- **운영진 승인 관리 시스템 (`/admin`)**:
  - 구글 로그인한 회원 목록 조회
  - 관리자가 승인한 정식 크루원에게만 글쓰기/댓글/참석 권한 부여
  - 관리자(크루장) 권한 토글 및 회원 관리
- **러닝 특화 게시판**:
  - 정기런, 번개런, 러닝 후기, 크루 공지 카테고리
  - 일시, 집결 장소, 목표 거리(KM), 목표 페이스, 모집 인원 표시
- **참석 투표 (RSVP)**:
  - 참석하기 (Attending) & 응원하기 (Cheering) 실시간 투표
- **Anti-AI Design System**:
  - 클리셰(보라색 그라디언트, 무의미한 알약 뱃지, 3단 카드 나열) 배제
  - 하이콘트라스트 딥 매트 블랙과 세련된 Volt / Safety Orange 액센트
  - 스포티하고 에디토리얼한 타이포그래피

## 🛠 Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS (Custom Athletic Theme)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Triggers)
- **Deployment**: Vercel & Supabase CLI
