from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_async_session
from app.models.user import User
from app.schemas.skill import SkillDetailResponse, SkillSummaryResponse
from app.services.financial_context import build_financial_context
from app.services.skill_registry import get_skill_registry

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("", response_model=list[SkillSummaryResponse])
async def list_skills() -> list[SkillSummaryResponse]:
    """List all available financial planning skills."""
    registry = get_skill_registry()
    skills = registry.list_skills()
    return [
        SkillSummaryResponse(
            name=s.name,
            display_name=s.display_name,
            description=s.description,
            required_context=s.required_context,
            output_format=s.output_format,
        )
        for s in skills
    ]


@router.get("/available", response_model=list[SkillSummaryResponse])
async def list_available_skills(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> list[SkillSummaryResponse]:
    """List skills whose required context is satisfied for the current user."""
    registry = get_skill_registry()
    context = await build_financial_context(user.id, session)
    matched = registry.match_skills(context)
    return [
        SkillSummaryResponse(
            name=s.name,
            display_name=s.display_name,
            description=s.description,
            required_context=s.required_context,
            output_format=s.output_format,
        )
        for s in matched
    ]


@router.get("/{name}", response_model=SkillDetailResponse)
async def get_skill(name: str) -> SkillDetailResponse:
    """Get full details for a specific skill."""
    registry = get_skill_registry()
    skill = registry.get_skill(name)
    if skill is None:
        raise HTTPException(status_code=404, detail=f"Skill '{name}' not found")
    return SkillDetailResponse(
        name=skill.name,
        display_name=skill.display_name,
        description=skill.description,
        required_context=skill.required_context,
        optional_context=skill.optional_context,
        tools=skill.tools,
        output_format=skill.output_format,
        content=skill.content,
    )
