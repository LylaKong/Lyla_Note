---
name: anti-ai-design
description: AI 특유의 클리셰한 보라색 그라데이션, 붕 뜬 카드, 획일적 레이아웃을 배제하고 실무 엔지니어 및 프로 디자이너 수준의 감각적인 UI를 구현하는 디자인 가이드
---

# Anti-AI UI/UX Design System (Craft-Driven Human UI)

이 스킬은 AI가 작성하는 코드에서 흔히 드러나는 'Generic AI Aesthetic(작위적인 보라/남색 그라데이션, 과도한 글래스모피즘, 둥글둥글한 알약 뱃지 남발, 붕 뜬 그림자)'을 완전히 배제하고, 실제 프로덕션 서비스(Linear, Vercel, Stripe, Nike Run Club) 수준의 감각적이고 신뢰감 있는 인터페이스를 구축하기 위한 실천 지침입니다.

## 1. Anti-AI 원칙 (Strict Constraints)
- **보라색-인디고 그라데이션 남발 금지**: 보라색-핑크빛 AI 전형의 그라데이션, 오로라 배경을 절대 사용하지 않습니다.
- **단일 악센트 컬러 원칙**: 모노톤(Zinc/Slate) 베이스에 활력을 주는 단 하나의 시그니처 악센트(러닝 크루 테마: `#FF5400` Safety Orange / `#CCFF00` Volt Lime)만 절제되게 사용합니다.
- **과도한 그림자 대신 1px 정밀 보더**: 붕 뜬 `shadow-2xl` 대신 `border border-zinc-800/80` 또는 `border-white/10`의 정밀한 선과 미세한 배경색 차이(`bg-zinc-900` vs `bg-zinc-950`)로 깊이감을 표현합니다.
- **날렵하고 일관된 모서리**: `rounded-3xl` 등 둔탁한 형태를 피하고, 카드는 `rounded-xl`, 버튼과 뱃지는 `rounded-md` ~ `rounded-lg`로 정돈합니다.
- **생생하고 현실적인 카피**: "혁신적인 솔루션" 같은 기계적 더미 문구 대신, 실제 러너들이 쓰는 어휘(예: *나이트런*, *주말 LSD*, *페이스 5분 30초*, *참석 명단*, *크루원 승인 대기*)를 정확하게 사용합니다.

## 2. 반응형 & 마이크로 인터랙션
- 모든 인터랙티브 요소는 부드러운 트랜지션(`transition-all duration-150`)과 상태별 피드백(Hover, Active, Focus, Disabled)을 갖춥니다.
- 빈 상태(Empty State), 로딩 스켈레톤, 권한별 뱃지(대기/승인/운영진)를 명확히 시각화합니다.
