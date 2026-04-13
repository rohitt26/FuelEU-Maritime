export interface PoolingCandidate {
  routeId: string;
  year: number;
  adjustedCB: number;
}

export interface PoolingPreviewMember {
  routeId: string;
  year: number;
  cbBefore: number;
  cbAfter: number;
}

export interface PoolingPreview {
  members: PoolingPreviewMember[];
  totalCB: number;
  isValid: boolean;
  issues: string[];
}

export const buildPoolingPreview = (
  candidates: PoolingCandidate[]
): PoolingPreview => {
  const members = candidates.map((candidate) => ({
    routeId: candidate.routeId,
    year: candidate.year,
    cbBefore: candidate.adjustedCB,
    cbAfter: candidate.adjustedCB,
  }));

  const issues: string[] = [];

  if (members.length < 2) {
    issues.push("Select at least two ships to create a pool.");
  }

  const totalCB = members.reduce((sum, member) => sum + member.cbBefore, 0);

  if (totalCB < 0) {
    issues.push("Pool sum must be zero or positive.");
  }

  const surplus = members
    .filter((member) => member.cbBefore > 0)
    .sort((left, right) => right.cbBefore - left.cbBefore);

  const deficit = members
    .filter((member) => member.cbBefore < 0)
    .sort((left, right) => left.cbBefore - right.cbBefore);

  for (const deficitMember of deficit) {
    let remainingDeficit = Math.abs(deficitMember.cbAfter);

    for (const surplusMember of surplus) {
      if (remainingDeficit <= 0) {
        break;
      }

      if (surplusMember.cbAfter <= 0) {
        continue;
      }

      const transfer = Math.min(surplusMember.cbAfter, remainingDeficit);
      surplusMember.cbAfter -= transfer;
      deficitMember.cbAfter += transfer;
      remainingDeficit -= transfer;
    }
  }

  for (const member of members) {
    if (member.cbBefore < 0 && member.cbAfter < member.cbBefore) {
      issues.push(`Deficit ship ${member.routeId} becomes worse after pooling.`);
    }

    if (member.cbBefore > 0 && member.cbAfter < 0) {
      issues.push(`Surplus ship ${member.routeId} becomes negative after pooling.`);
    }
  }

  return {
    members,
    totalCB,
    isValid: issues.length === 0,
    issues,
  };
};
