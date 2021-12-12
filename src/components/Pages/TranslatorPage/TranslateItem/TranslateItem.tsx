import classNames from 'classnames';

import { TranslateNodeType } from 'services/translator';

import './TranslateItem.scss';

interface ITranslateItemProps {
    str: string;
    index: number;
    type: TranslateNodeType;
    onItemChange?: (itemIndex: number, formIndex: number) => void;
    forms?: string[];
    isLoading?: boolean;
}

export const TranslateItem = ({ str, type, onItemChange, index, forms, isLoading }: ITranslateItemProps) => {
    const hasForms = forms && forms.length > 1;

    return (
        <div
            className={classNames('translate-item', [type], { forms: hasForms, br: str === '\n', loading: isLoading })}
            key={index}
        >
            {str}
            {
                hasForms && (
                    <select
                        className="translate-item__form-select"
                        onChange={(e) => onItemChange(index, e.currentTarget.selectedIndex)}
                    >
                        {forms.map((form, i) => <option key={i} value={i}>{form}</option>)}
                    </select>
                )
            }
        </div>
    );
}
