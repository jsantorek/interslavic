import request from 'request';
import { dictionaryUrl } from 'consts';
import { declensionNoun } from 'utils/legacy/declensionNoun';
import { declensionAdjective } from 'utils/legacy/declensionAdjective';
import { conjugationVerb } from 'utils/legacy/conjugationVerb';
import {
    getGender,
    getPartOfSpeech,
    isAnimated, isIndeclinable,
    isPlural,
} from 'utils/wordDetails';
import * as fs from 'fs';

const testCases = {
    noun: [],
    verb: [],
    adjective: [],
};

request(dictionaryUrl, (err, data) => {
    const splittedBody = data.body.split('\n').filter(Boolean).slice(1);
    splittedBody.forEach((line, i) => {
        const [ word, add, details ] = line.split('\t').slice(0, 3);
        switch (getPartOfSpeech(details)) {
            case 'noun':
                const gender = getGender(details);
                const animated = isAnimated(details);
                const plural = isPlural(details);
                const indeclinable = isIndeclinable(details);

                testCases.noun.push({
                    init: { word, add, details },
                    expected: declensionNoun(word, add, gender, animated, plural, indeclinable),
                });
                break;
            case 'verb':
                testCases.verb.push({
                    init: { word, add, details },
                    expected: conjugationVerb(word, add.replace(/\(|\)/g, '')),
                });
                break;
            case 'adjective':
                testCases.adjective.push({
                    init: { word, add, details },
                    expected: declensionAdjective(word),
                });
                break;
        }
        if (i + 1 === splittedBody.length) {
            fs.writeFileSync('./tests/testCases.json', JSON.stringify(testCases, null, 2));
        }
    });
});
