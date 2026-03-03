from __future__ import annotations

import uuid
from sqlalchemy import String, Text, ForeignKey, Integer, Float, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from .base import Base, IdMixin, TimestampedMixin


class CourseDifficulty(str, enum.Enum):  # noqa: A003
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class Course(Base, IdMixin, TimestampedMixin):
    __tablename__ = "courses"

    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(32), nullable=False, default=CourseDifficulty.beginner.value)
    tags: Mapped[list | None] = mapped_column(JSONB, nullable=True)

    lessons: Mapped[list["Lesson"]] = relationship(back_populates="course", order_by="Lesson.order")
    enrollments: Mapped[list["Enrollment"]] = relationship(back_populates="course", cascade="all, delete-orphan")


class Lesson(Base, IdMixin, TimestampedMixin):
    __tablename__ = "lessons"

    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    content_rich_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    estimated_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)

    course: Mapped["Course"] = relationship(back_populates="lessons")
    quizzes: Mapped[list["Quiz"]] = relationship(back_populates="lesson", cascade="all, delete-orphan")
    lesson_progress: Mapped[list["LessonProgress"]] = relationship(back_populates="lesson", cascade="all, delete-orphan")


class Quiz(Base, IdMixin, TimestampedMixin):
    __tablename__ = "quizzes"

    lesson_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    config: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    lesson: Mapped["Lesson"] = relationship(back_populates="quizzes")
    questions: Mapped[list["Question"]] = relationship(back_populates="quiz", cascade="all, delete-orphan")
    quiz_attempts: Mapped[list["QuizAttempt"]] = relationship(back_populates="quiz", cascade="all, delete-orphan")


class Question(Base, IdMixin, TimestampedMixin):
    __tablename__ = "questions"

    quiz_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    quiz: Mapped["Quiz"] = relationship(back_populates="questions")
    answers: Mapped[list["Answer"]] = relationship(back_populates="question", cascade="all, delete-orphan")


class Answer(Base, IdMixin, TimestampedMixin):
    __tablename__ = "answers"

    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)

    question: Mapped["Question"] = relationship(back_populates="answers")


class Enrollment(Base, IdMixin, TimestampedMixin):
    __tablename__ = "enrollments"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="active")
    started_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    completed_at: Mapped[object] = mapped_column(DateTime(timezone=True), nullable=True)

    course: Mapped["Course"] = relationship(back_populates="enrollments")


class LessonProgress(Base, IdMixin, TimestampedMixin):
    __tablename__ = "lesson_progress"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lesson_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="not_started")
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_viewed_at: Mapped[object] = mapped_column(DateTime(timezone=True), nullable=True)

    lesson: Mapped["Lesson"] = relationship(back_populates="lesson_progress")


class QuizAttempt(Base, IdMixin, TimestampedMixin):
    __tablename__ = "quiz_attempts"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    quiz_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    attempt_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    passed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    attempted_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=True)

    quiz: Mapped["Quiz"] = relationship(back_populates="quiz_attempts")


class Badge(Base, IdMixin, TimestampedMixin):
    __tablename__ = "badges"

    name: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon_key: Mapped[str | None] = mapped_column(String(64), nullable=True)
    criteria_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    user_badges: Mapped[list["UserBadge"]] = relationship(back_populates="badge", cascade="all, delete-orphan")


class UserBadge(Base, IdMixin, TimestampedMixin):
    __tablename__ = "user_badges"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    badge_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("badges.id", ondelete="CASCADE"), nullable=False)
    awarded_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=True)

    badge: Mapped["Badge"] = relationship(back_populates="user_badges")


class PointsLedger(Base, IdMixin, TimestampedMixin):
    __tablename__ = "points_ledger"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(String(128), nullable=False)
    reference_type: Mapped[str | None] = mapped_column(String(64), nullable=True)
    reference_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
