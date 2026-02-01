"""Tests for the SkillRegistry and skill file parsing."""

import os
import tempfile

import pytest

from app.services.skill_registry import (
    Skill,
    SkillRegistry,
    _context_satisfies,
    _parse_skill_file,
)


@pytest.fixture
def skills_dir() -> str:
    """Create a temp directory with test skill files."""
    tmpdir = tempfile.mkdtemp()

    # Skill with required context
    with open(os.path.join(tmpdir, "retirement.md"), "w") as f:
        f.write("""---
name: retirement_planning
display_name: Retirement Planning
description: Analyze retirement readiness
required_context:
  - profile.age
  - profile.retirement_age
optional_context:
  - profile.annual_income
tools:
  - calculate_compound_growth
output_format: recommendation
---

## System Prompt

You are a retirement planning specialist.

## Steps

1. Analyze savings trajectory
""")

    # Skill with no required context
    with open(os.path.join(tmpdir, "checkup.md"), "w") as f:
        f.write("""---
name: financial_checkup
display_name: Financial Checkup
description: Comprehensive health check
required_context: []
output_format: recommendation
---

## System Prompt

You are a financial health analyst.
""")

    # Skill with nested required context
    with open(os.path.join(tmpdir, "investment.md"), "w") as f:
        f.write("""---
name: investment_review
display_name: Investment Review
description: Portfolio allocation analysis
required_context:
  - accounts.investment
  - holdings
tools:
  - get_portfolio_allocation
output_format: recommendation
---

## System Prompt

You are an investment analyst.
""")

    return tmpdir


# --- _parse_skill_file ---


def test_parse_skill_file(skills_dir: str) -> None:
    skill = _parse_skill_file(os.path.join(skills_dir, "retirement.md"))
    assert skill.name == "retirement_planning"
    assert skill.display_name == "Retirement Planning"
    assert skill.description == "Analyze retirement readiness"
    assert "profile.age" in skill.required_context
    assert "profile.retirement_age" in skill.required_context
    assert "profile.annual_income" in skill.optional_context
    assert "calculate_compound_growth" in skill.tools
    assert skill.output_format == "recommendation"
    assert "retirement planning specialist" in skill.content.lower()


def test_parse_skill_file_empty_required(skills_dir: str) -> None:
    skill = _parse_skill_file(os.path.join(skills_dir, "checkup.md"))
    assert skill.name == "financial_checkup"
    assert skill.required_context == []


def test_parse_skill_file_no_frontmatter() -> None:
    """A file without frontmatter should still parse."""
    tmpfile = tempfile.NamedTemporaryFile(mode="w", suffix=".md", delete=False)
    tmpfile.write("# Just markdown\n\nNo frontmatter here.")
    tmpfile.close()
    skill = _parse_skill_file(tmpfile.name)
    assert skill.content == "# Just markdown\n\nNo frontmatter here."
    os.unlink(tmpfile.name)


# --- SkillRegistry ---


def test_list_skills(skills_dir: str) -> None:
    registry = SkillRegistry(skills_dir)
    skills = registry.list_skills()
    assert len(skills) == 3
    names = {s.name for s in skills}
    assert "retirement_planning" in names
    assert "financial_checkup" in names
    assert "investment_review" in names


def test_get_skill(skills_dir: str) -> None:
    registry = SkillRegistry(skills_dir)
    skill = registry.get_skill("retirement_planning")
    assert skill is not None
    assert skill.name == "retirement_planning"
    assert isinstance(skill, Skill)


def test_get_skill_not_found(skills_dir: str) -> None:
    registry = SkillRegistry(skills_dir)
    assert registry.get_skill("nonexistent") is None


def test_match_skills_all_context_satisfied(skills_dir: str) -> None:
    """When all required context is present, skill should match."""
    registry = SkillRegistry(skills_dir)
    context = {
        "profile": {
            "age": 35,
            "retirement_age": 65,
            "annual_income": 100000,
        },
        "accounts": {
            "investment": [{"name": "401k"}],
        },
        "holdings": [{"ticker": "VTI"}],
    }
    matched = registry.match_skills(context)
    names = {s.name for s in matched}
    assert "retirement_planning" in names
    assert "financial_checkup" in names
    assert "investment_review" in names


def test_match_skills_partial_context(skills_dir: str) -> None:
    """Only skills with satisfied required context should match."""
    registry = SkillRegistry(skills_dir)
    context = {
        "profile": {"age": 35},  # missing retirement_age
    }
    matched = registry.match_skills(context)
    names = {s.name for s in matched}
    # financial_checkup has no requirements, should always match
    assert "financial_checkup" in names
    # retirement_planning requires profile.retirement_age, should NOT match
    assert "retirement_planning" not in names
    # investment_review requires accounts.investment, should NOT match
    assert "investment_review" not in names


def test_match_skills_empty_context(skills_dir: str) -> None:
    """With empty context, only skills with no required context should match."""
    registry = SkillRegistry(skills_dir)
    matched = registry.match_skills({})
    names = {s.name for s in matched}
    assert "financial_checkup" in names
    assert len(names) == 1


# --- _context_satisfies ---


def test_context_satisfies_simple() -> None:
    ctx = {"profile": {"age": 30}}
    assert _context_satisfies(ctx, ["profile.age"]) is True


def test_context_satisfies_missing_field() -> None:
    ctx = {"profile": {"age": 30}}
    assert _context_satisfies(ctx, ["profile.retirement_age"]) is False


def test_context_satisfies_none_value() -> None:
    ctx = {"profile": {"age": None}}
    assert _context_satisfies(ctx, ["profile.age"]) is False


def test_context_satisfies_empty_list() -> None:
    ctx = {"accounts": {"investment": []}}
    assert _context_satisfies(ctx, ["accounts.investment"]) is False


def test_context_satisfies_nonempty_list() -> None:
    ctx = {"accounts": {"investment": [{"name": "401k"}]}}
    assert _context_satisfies(ctx, ["accounts.investment"]) is True


def test_context_satisfies_no_requirements() -> None:
    assert _context_satisfies({}, []) is True


def test_context_satisfies_top_level() -> None:
    ctx = {"holdings": [{"ticker": "VTI"}]}
    assert _context_satisfies(ctx, ["holdings"]) is True


# --- Real skill files ---


def test_real_skills_parse() -> None:
    """Verify the actual skill files in the project parse correctly."""
    real_skills_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "skills",
    )
    if not os.path.isdir(real_skills_dir):
        pytest.skip("skills directory not found")

    registry = SkillRegistry(real_skills_dir)
    skills = registry.list_skills()
    assert len(skills) >= 8

    # Check a known skill
    retirement = registry.get_skill("retirement_planning")
    assert retirement is not None
    assert retirement.display_name == "Retirement Planning"
    assert len(retirement.required_context) > 0
