import ongekiSkills from "../hooks/ongekiSkill.json"

export type SkillInfo = {
	id: number
	name: string
	category: string
	info: string
}

const skillMap = new Map<number, SkillInfo>(
	(ongekiSkills as SkillInfo[]).map(skill => [skill.id, skill])
)

export function getSkillInfo(skillId: number | null): SkillInfo | undefined {
	if (skillId === null) return undefined
	return skillMap.get(skillId)
}
