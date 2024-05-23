import { t } from "translations";

import { analyzeAbbr } from "./analyzeAbbr";

export function translateAbbr(abbr: string): string {
    const analyzed = analyzeAbbr(abbr);
    if (analyzed.length === 0) {
        return abbr;
    }

    return analyzed.filter(shouldBeShownInAbbreviation).map((key) => t(`abbr-${key}`)).join(' ');
}

function shouldBeShownInAbbreviation(key: string): boolean {
    return key !== 'verb-main' && key !== 'noun' && key !== 'noun-inanimate';
}

