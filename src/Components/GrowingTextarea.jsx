import PropTypes from 'prop-types';
import styles from './GrowingTextarea.module.scss';

// https://css-tricks.com/auto-growing-inputs-textareas/
export default function GrowingTextarea({value, onChange}) {
  return (
    <div data-value={value} className={styles.sizer}>
      <textarea
        placeholder="Add notes.."
        rows={1}
        value={value}
        onInput={onChange}
        className={`rounded-xl dark:bg-gray-800 border resize-none
                    border-slate-300 dark:border-slate-700
                    focus:ring-2 focus:ring-blue-400 focus:outline-none`}
      />
    </div>
  );
}

GrowingTextarea.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
