import asyncio
import uuid
from finetech_api.db import async_session_factory
from finetech_api.models import Course, Lesson

async def seed():
    async with async_session_factory() as session:
        # Check if courses already exist
        from sqlalchemy import select
        existing = await session.execute(select(Course))
        if existing.scalars().first():
            print("Database already has data. Skipping seed.")
            return

        print("Seeding database...")
        course = Course(
            id=uuid.uuid4(),
            title="Introduction to Technical Analysis",
            description="Learn the basics of candlestick patterns, RSI, and MACD.",
            difficulty="beginner",
            tags=["stocks", "trading", "basics"]
        )
        session.add(course)
        await session.flush()

        lessons = [
            Lesson(
                id=uuid.uuid4(),
                course_id=course.id,
                title="What is a Candlestick?",
                content_rich_text="<p>Candlesticks represent price movement over time...</p>",
                order=1,
                estimated_minutes=10
            ),
            Lesson(
                id=uuid.uuid4(),
                course_id=course.id,
                title="Relative Strength Index (RSI)",
                content_rich_text="<p>RSI indicates overbought or oversold conditions...</p>",
                order=2,
                estimated_minutes=15
            )
        ]
        session.add_all(lessons)
        await session.commit()
        print("Seed complete!")

if __name__ == "__main__":
    asyncio.run(seed())
