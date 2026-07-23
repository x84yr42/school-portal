interface TargetAudience {
  type: "all" | "grade" | "class" | "workshop";
  value: string;
}

interface ChildContext {
  grades: number[];
  classIds: string[];
  workshopIds: string[];
}

export function isAnnouncementVisible(
  targetAudienceJson: string | null,
  context: ChildContext
): boolean {
  if (!targetAudienceJson) return true;

  let target: TargetAudience;
  try {
    target = JSON.parse(targetAudienceJson);
  } catch {
    return true;
  }

  switch (target.type) {
    case "all":
      return true;
    case "grade":
      return context.grades.includes(parseInt(target.value));
    case "class":
      return context.classIds.includes(target.value);
    case "workshop":
      return context.workshopIds.includes(target.value);
    default:
      return true;
  }
}
