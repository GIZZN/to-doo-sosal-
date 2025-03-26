import s from './CheckBox.module.scss'

interface CheckBoxProps {
    id: string;
    isChecked: boolean;
    handleCheckBox: (id: string) => void;
}

export function CheckBox({ id, isChecked, handleCheckBox }: CheckBoxProps) {
    return (
        <label className={s.checkbox}>
            <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleCheckBox(id)}
            />
            <span className={s.checkboxWrapper}></span>
        </label>
    );
}