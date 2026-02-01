from pydantic import BaseModel


class SkillSummaryResponse(BaseModel):
    name: str
    display_name: str
    description: str
    required_context: list[str]
    output_format: str


class SkillDetailResponse(SkillSummaryResponse):
    optional_context: list[str]
    tools: list[str]
    content: str
