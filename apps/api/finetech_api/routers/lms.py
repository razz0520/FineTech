from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from finetech_api.db import get_session
from finetech_api.deps import get_current_user_id
from finetech_api.models import (
    Course,
    Lesson,
    Quiz,
    Question,
    Answer,
    Enrollment,
    LessonProgress,
    QuizAttempt,
    Badge,
    UserBadge,
    PointsLedger,
)

router = APIRouter(prefix="/lms", tags=["lms"])


# --- Schemas ---
class CourseOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    difficulty: str
    tags: list | None

    class Config:
        from_attributes = True


class LessonOut(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    title: str
    content_rich_text: str | None
    order: int
    estimated_minutes: int | None

    class Config:
        from_attributes = True


class QuizOut(BaseModel):
    id: uuid.UUID
    lesson_id: uuid.UUID
    title: str
    config: dict | None

    class Config:
        from_attributes = True


class QuestionOut(BaseModel):
    id: uuid.UUID
    quiz_id: uuid.UUID
    type: str
    prompt: str
    metadata_json: dict | None

    class Config:
        from_attributes = True


class AnswerOut(BaseModel):
    id: uuid.UUID
    question_id: uuid.UUID
    text: str
    is_correct: bool
    explanation: str | None

    class Config:
        from_attributes = True


class EnrollmentOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    course_id: uuid.UUID
    status: str
    started_at: str | None
    completed_at: str | None

    class Config:
        from_attributes = True


class LessonProgressIn(BaseModel):
    status: str
    score: float | None = None


class QuizSubmitIn(BaseModel):
    attempt_data: dict
    answers: list[dict]


class BadgeOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    icon_key: str | None

    class Config:
        from_attributes = True


class PointsEntryOut(BaseModel):
    id: uuid.UUID
    amount: int
    reason: str
    reference_type: str | None
    created_at: str | None

    class Config:
        from_attributes = True


# --- Courses & lessons (public browse) ---
@router.get("/courses", response_model=list[CourseOut])
async def list_courses(
    session: AsyncSession = Depends(get_session),
    difficulty: str | None = Query(None),
) -> list[CourseOut]:
    q = select(Course)
    if difficulty:
        q = q.where(Course.difficulty == difficulty)
    q = q.order_by(Course.created_at)
    result = await session.execute(q)
    rows = result.scalars().all()
    return [CourseOut.model_validate(r) for r in rows]


@router.get("/courses/{course_id}", response_model=CourseOut)
async def get_course(course_id: uuid.UUID, session: AsyncSession = Depends(get_session)) -> CourseOut:
    result = await session.execute(select(Course).where(Course.id == course_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Course not found")
    return CourseOut.model_validate(row)


@router.get("/courses/{course_id}/lessons", response_model=list[LessonOut])
async def list_lessons(course_id: uuid.UUID, session: AsyncSession = Depends(get_session)) -> list[LessonOut]:
    result = await session.execute(select(Lesson).where(Lesson.course_id == course_id).order_by(Lesson.order))
    rows = result.scalars().all()
    return [LessonOut.model_validate(r) for r in rows]


@router.get("/lessons/{lesson_id}", response_model=LessonOut)
async def get_lesson(lesson_id: uuid.UUID, session: AsyncSession = Depends(get_session)) -> LessonOut:
    result = await session.execute(select(Lesson).where(Lesson.id == lesson_id))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return LessonOut.model_validate(row)


@router.get("/lessons/{lesson_id}/quiz", response_model=dict)
async def get_quiz_by_lesson(lesson_id: uuid.UUID, session: AsyncSession = Depends(get_session)) -> dict:
    result = await session.execute(select(Quiz).where(Quiz.lesson_id == lesson_id).limit(1))
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="No quiz for this lesson")
    return {"id": str(row.id)}


# --- Enrollments ---
@router.post("/courses/{course_id}/enroll", response_model=EnrollmentOut)
async def enroll(
    course_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user_id: uuid.UUID = Depends(get_current_user_id),
) -> EnrollmentOut:
    existing = await session.execute(
        select(Enrollment).where(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already enrolled")
    enrollment = Enrollment(user_id=user_id, course_id=course_id, status="active")
    session.add(enrollment)
    await session.commit()
    await session.refresh(enrollment)
    return EnrollmentOut(
        id=enrollment.id,
        user_id=enrollment.user_id,
        course_id=enrollment.course_id,
        status=enrollment.status,
        started_at=str(enrollment.started_at) if enrollment.started_at else None,
        completed_at=str(enrollment.completed_at) if enrollment.completed_at else None,
    )


@router.get("/me/enrollments", response_model=list[EnrollmentOut])
async def my_enrollments(
    session: AsyncSession = Depends(get_session),
    user_id: uuid.UUID = Depends(get_current_user_id),
) -> list[EnrollmentOut]:
    result = await session.execute(select(Enrollment).where(Enrollment.user_id == user_id))
    rows = result.scalars().all()
    return [
        EnrollmentOut(
            id=r.id,
            user_id=r.user_id,
            course_id=r.course_id,
            status=r.status,
            started_at=str(r.started_at) if r.started_at else None,
            completed_at=str(r.completed_at) if r.completed_at else None,
        )
        for r in rows
    ]


# --- Progress ---
@router.post("/lessons/{lesson_id}/progress")
async def update_lesson_progress(
    lesson_id: uuid.UUID,
    body: LessonProgressIn,
    session: AsyncSession = Depends(get_session),
    user_id: uuid.UUID = Depends(get_current_user_id),
) -> dict:
    result = await session.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == user_id,
            LessonProgress.lesson_id == lesson_id,
        )
    )
    row = result.scalar_one_or_none()
    if row:
        row.status = body.status
        if body.score is not None:
            row.score = body.score
    else:
        row = LessonProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            status=body.status,
            score=body.score,
        )
        session.add(row)
    await session.commit()
    return {"status": "ok"}


@router.get("/me/progress")
async def my_progress(
    session: AsyncSession = Depends(get_session),
    user_id: uuid.UUID = Depends(get_current_user_id),
    course_id: uuid.UUID | None = Query(None),
) -> list[dict]:
    q = select(LessonProgress).where(LessonProgress.user_id == user_id)
    if course_id:
        q = q.join(Lesson, LessonProgress.lesson_id == Lesson.id).where(Lesson.course_id == course_id)
    result = await session.execute(q)
    rows = result.scalars().all()
    return [
        {
            "lesson_id": str(r.lesson_id),
            "status": r.status,
            "score": r.score,
            "last_viewed_at": str(r.last_viewed_at) if r.last_viewed_at else None,
        }
        for r in rows
    ]


# --- Quizzes ---
@router.get("/quizzes/{quiz_id}", response_model=dict)
async def get_quiz(quiz_id: uuid.UUID, session: AsyncSession = Depends(get_session)) -> dict:
    result = await session.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    qq = await session.execute(select(Question).where(Question.quiz_id == quiz_id))
    questions = qq.scalars().all()
    out_questions = []
    for q in questions:
        aa = await session.execute(select(Answer).where(Answer.question_id == q.id))
        answers = aa.scalars().all()
        out_questions.append(
            {
                "id": str(q.id),
                "type": q.type,
                "prompt": q.prompt,
                "metadata_json": q.metadata_json,
                "answers": [
                    {"id": str(a.id), "text": a.text, "is_correct": a.is_correct, "explanation": a.explanation}
                    for a in answers
                ],
            }
        )
    return {
        "id": str(quiz.id),
        "lesson_id": str(quiz.lesson_id),
        "title": quiz.title,
        "config": quiz.config,
        "questions": out_questions,
    }


@router.post("/quizzes/{quiz_id}/submit")
async def submit_quiz(
    quiz_id: uuid.UUID,
    body: QuizSubmitIn,
    session: AsyncSession = Depends(get_session),
    user_id: uuid.UUID = Depends(get_current_user_id),
) -> dict:
    result = await session.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    config = quiz.config or {}
    pass_threshold = float(config.get("pass_threshold", 0.7))
    correct = 0
    total = 0
    for ans in body.answers:
        qid = ans.get("question_id")
        aid = ans.get("answer_id")
        if not qid or not aid:
            continue
        a_result = await session.execute(
            select(Answer).where(Answer.id == uuid.UUID(aid), Answer.question_id == uuid.UUID(qid))
        )
        a_row = a_result.scalar_one_or_none()
        if a_row and a_row.is_correct:
            correct += 1
        total += 1
    score = correct / total if total else 0.0
    passed = score >= pass_threshold
    attempt = QuizAttempt(
        user_id=user_id,
        quiz_id=quiz_id,
        score=score,
        attempt_data=body.attempt_data,
        passed=passed,
    )
    session.add(attempt)
    await session.flush()
    if passed:
        points = int(config.get("points_reward", 10))
        session.add(
            PointsLedger(
                user_id=user_id,
                amount=points,
                reason="quiz_passed",
                reference_type="quiz_attempt",
                reference_id=attempt.id,
            )
        )
    await session.commit()
    return {"score": score, "passed": passed, "correct": correct, "total": total}


# --- Gamification ---
@router.get("/me/badges", response_model=list[BadgeOut])
async def my_badges(
    session: AsyncSession = Depends(get_session),
    user_id: uuid.UUID = Depends(get_current_user_id),
) -> list[BadgeOut]:
    result = await session.execute(
        select(Badge).join(UserBadge, UserBadge.badge_id == Badge.id).where(UserBadge.user_id == user_id)
    )
    rows = result.scalars().all()
    return [BadgeOut.model_validate(r) for r in rows]


@router.get("/me/points-history", response_model=list[PointsEntryOut])
async def my_points_history(
    session: AsyncSession = Depends(get_session),
    user_id: uuid.UUID = Depends(get_current_user_id),
    limit: int = Query(50, le=200),
) -> list[PointsEntryOut]:
    result = await session.execute(
        select(PointsLedger).where(PointsLedger.user_id == user_id).order_by(PointsLedger.created_at.desc()).limit(limit)
    )
    rows = result.scalars().all()
    return [
        PointsEntryOut(
            id=r.id,
            amount=r.amount,
            reason=r.reason,
            reference_type=r.reference_type,
            created_at=str(r.created_at) if r.created_at else None,
        )
        for r in rows
    ]
