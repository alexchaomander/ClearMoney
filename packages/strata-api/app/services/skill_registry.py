"""Registry for markdown-based financial planning skill definitions."""

import os
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

import yaml


@dataclass
class Skill:
    name: str
    display_name: str
    description: str
    required_context: list[str] = field(default_factory=list)
    optional_context: list[str] = field(default_factory=list)
    tools: list[str] = field(default_factory=list)
    output_format: str = "recommendation"
    content: str = ""  # full markdown body (below frontmatter)


@dataclass
class SkillSummary:
    name: str
    display_name: str
    description: str
    required_context: list[str]
    output_format: str


def _parse_skill_file(filepath: str) -> Skill:
    """Parse a markdown skill file with YAML frontmatter."""
    raw = Path(filepath).read_text(encoding="utf-8")

    # Split frontmatter from content
    if raw.startswith("---"):
        parts = raw.split("---", 2)
        if len(parts) >= 3:
            frontmatter_str = parts[1]
            content = parts[2].strip()
        else:
            frontmatter_str = ""
            content = raw
    else:
        frontmatter_str = ""
        content = raw

    meta = yaml.safe_load(frontmatter_str) if frontmatter_str else {}

    return Skill(
        name=meta.get("name", Path(filepath).stem),
        display_name=meta.get("display_name", meta.get("name", Path(filepath).stem)),
        description=meta.get("description", ""),
        required_context=meta.get("required_context", []),
        optional_context=meta.get("optional_context", []),
        tools=meta.get("tools", []),
        output_format=meta.get("output_format", "recommendation"),
        content=content,
    )


class SkillRegistry:
    def __init__(self, skills_dir: str):
        self._skills_dir = skills_dir
        self._cache: dict[str, Skill] = {}
        self._loaded = False

    def _ensure_loaded(self) -> None:
        if self._loaded:
            return
        self._cache.clear()
        skills_path = Path(self._skills_dir)
        if skills_path.is_dir():
            for filepath in sorted(skills_path.glob("*.md")):
                skill = _parse_skill_file(str(filepath))
                self._cache[skill.name] = skill
        self._loaded = True

    def list_skills(self) -> list[SkillSummary]:
        self._ensure_loaded()
        return [
            SkillSummary(
                name=s.name,
                display_name=s.display_name,
                description=s.description,
                required_context=s.required_context,
                output_format=s.output_format,
            )
            for s in self._cache.values()
        ]

    def get_skill(self, name: str) -> Skill | None:
        self._ensure_loaded()
        return self._cache.get(name)

    def match_skills(self, context: dict) -> list[SkillSummary]:
        """Return skills whose required_context is satisfied by the provided context."""
        self._ensure_loaded()
        matched = []

        for skill in self._cache.values():
            if _context_satisfies(context, skill.required_context):
                matched.append(
                    SkillSummary(
                        name=skill.name,
                        display_name=skill.display_name,
                        description=skill.description,
                        required_context=skill.required_context,
                        output_format=skill.output_format,
                    )
                )

        return matched


def _context_satisfies(context: dict, required: list[str]) -> bool:
    """Check if a context dict has all required fields.

    Required fields use dot-notation: 'profile.age', 'accounts.investment', etc.
    A field is satisfied if the dot-path resolves to a non-None, non-empty value.
    """
    for req in required:
        parts = req.split(".")
        current = context
        satisfied = True

        for part in parts:
            if isinstance(current, dict) and part in current:
                current = current[part]
            else:
                satisfied = False
                break

        if not satisfied:
            return False

        # Check if the resolved value is non-empty
        if current is None:
            return False
        if isinstance(current, (list, dict)) and len(current) == 0:
            return False

    return True


@lru_cache(maxsize=1)
def get_skill_registry() -> SkillRegistry:
    """Get the singleton skill registry."""
    skills_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "skills",
    )
    return SkillRegistry(skills_dir)
