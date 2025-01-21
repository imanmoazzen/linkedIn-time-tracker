import styles from "./ToggleSwitch.module.css";

const ToggleSwitch = ({ text, state, setState, extraClass = "" }) => {
  return (
    <div className={`${styles["container"]} ${extraClass}`}>
      <div className={styles["toggle"]} onClick={() => setState(!state)} data-is-toggled={state}>
        <div className={styles["knob"]} />
      </div>
      <span className={styles["label"]}>{text}</span>
    </div>
  );
};

export default ToggleSwitch;
