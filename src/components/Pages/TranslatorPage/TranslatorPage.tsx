import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { alphabetTypes } from 'consts';

import { t } from 'translations';

import { setAlphabetTypeAction } from 'actions';

import { Translator } from 'services/translator';

import { useAlphabets } from 'hooks/useAlphabets';
import { useAlphabetType } from 'hooks/useAlphabetType';
import { useFlavorisationType } from 'hooks/useFlavorisationType';
import { useLoading } from 'hooks/useLoading';

import { Button } from 'components/Button';
import { Expand } from 'components/Expand';
import { FlavorisationSelector } from 'components/FlavorisationSelector';
import { LineSelector } from 'components/LineSelector';
import { TranslateResults } from 'components/Pages/TranslatorPage/TranslateResults';
import { Textarea } from 'components/Textarea';

import './TranslatorPage.scss';

const defaultTextText = 'Вредному коту дали миску с едой, а он перевернул её и ничего не съел.\nЭтот переводчик работает почти как Google Translate, но только с русского языка на междуславянский.';
// const defaultTextText = 'Кошки, наряду с собаками — одни из самых популярных домашних питомцев в мире. Впрочем, далеко не все их породы живут по уютным квартирам — бессчётное количество этих созданий до сих пор ведёт дикий и вольный образ жизни.\nИ, если задуматься, множество фактов о кошках мы попросту не знаем, несмотря на то, что они живут с нами по соседству.';
// const defaultTextText = '';

const IS_API = true;

export const TranslatorPage = () => {
    const dispatch = useDispatch();
    const alphabets = useAlphabets();
    const alphabetType = useAlphabetType();
    const [results, setResults] = useState([]);
    const [rawResults, setRawResults] = useState([]);
    const [text, setText] = useState(defaultTextText);
    const [translatorLoaded, setTranslatorLoaded] = useState(false);
    const [isTranslating, setTranslating] = useState(false);
    const flavorisationType = useFlavorisationType()
    const isLoading = useLoading();
    const [translatedPlainText, setTranslatedPlainText] = useState('');
    const [expanded, setExpanded] = useState(false);

    const onChangeExpand = useCallback(() => {
        setExpanded(!expanded);
    }, [expanded]);

    const onSelectAlphabet = useCallback((type) => {
        dispatch(setAlphabetTypeAction(type))
    }, [dispatch]);

    const onPlainTextChange = useCallback((plainText) => {
        setTranslatedPlainText(plainText);
    }, [setTranslatedPlainText]);

    const onTextChange = useCallback((value) => setText(value), [text, setText]);

    const onTranslateResultsChange = useCallback((nodes) => {
        setResults(nodes);
        setTranslatedPlainText(Translator.getPlain(nodes));
    }, [setResults, setTranslatedPlainText]);

    const alphabetsSelectOptions = alphabetTypes
        .filter(({ value }) => alphabets[value])
        .map((item) => ({ name: t(item.name), value: item.value }))
    ;

    useEffect(() => Translator.init(() => setTranslatorLoaded(true)), [setTranslatorLoaded]);

    useEffect(() => {
        if (IS_API) {
            setTranslating(true);
            const fetchOptions = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ lang: 'ru', text }),
            };

            fetch('http://isv-rules-bt2901.pythonanywhere.com/api/', fetchOptions)
                .then((res) => res.json())
                .then((data) => {
                    const nodes = data.translation.map((arr) => {
                        const str = arr[0];
                        const forms = arr.slice(1);
                        const type = /[,|.|\?|\[|\]]/.test(str) ? 'space' : 'valid';

                        return {
                            str,
                            forms,
                            type,
                        };
                    });
                    setRawResults(nodes);

                    setTranslating(false);
                })
            ;
        } else {
            if (!isLoading && translatorLoaded) {
                setTranslating(true);

                Translator.translate({ text }).then((nodes) => {
                    setRawResults(nodes);

                    setTranslating(false);
                });
            }
        }
    }, [text, setResults, isLoading, translatorLoaded, setTranslatorLoaded, setTranslating]);

    useEffect(() => {
        const formattedNodes = Translator.formatNodes(rawResults, flavorisationType, alphabetType);

        setResults(formattedNodes);
        setTranslatedPlainText(Translator.getPlain(formattedNodes));
    }, [rawResults, flavorisationType, alphabetType]);

    const onCopyClick = useCallback(() => navigator.clipboard.writeText(translatedPlainText), [translatedPlainText])

    return (
        <div className="translator">
            <Textarea
                placeholder={t('translatorPlaceholderText')}
                className="translator__source-text"
                value={text}
                size="M"
                onChange={onTextChange}
                autoresize={true}
            />
            <Expand
                isExpanded={expanded}
                onChange={onChangeExpand}
            >
                {
                    Object.values(alphabets).filter(Boolean).length > 1 && (
                        <LineSelector
                            className="translator__alphabet-selector"
                            options={alphabetsSelectOptions}
                            value={alphabetType}
                            onSelect={onSelectAlphabet}
                        />
                    )
                }
                <FlavorisationSelector key="flavorisation" />
            </Expand>
            <TranslateResults
                results={results}
                onChange={onTranslateResultsChange}
                isLoading={isTranslating}
            />
            <Textarea
                className="translator__result-text"
                value={translatedPlainText}
                size="M"
                onChange={onPlainTextChange}
                autoresize={true}
                autoCapitalize="false"
                autoComplete="false"
                autoCorrect="false"
                spellCheck="false"
            />
            <Button
                size="S"
                className="translator__result-copy"
                title={t('viewerCopyToClipboard')}
                onClick={onCopyClick}
                disabled={!translatedPlainText.length}
            />
        </div>
    );
};

export default TranslatorPage;
