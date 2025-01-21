import React from "react";
import styles from "./DecoratedButton.module.css";

const DecoratedButton = ({
  onClick,
  icon,
  buttonText,
  isDisabled = false,
  googleClassName = "material-symbols-outlined",
  extraClasses = "",
  extraIconClasses = "",
}) => {
  return (
    <button
      aria-disabled={isDisabled}
      className={`${styles["button"]} ${extraClasses}`}
      onClick={isDisabled ? () => {} : () => onClick?.()}
    >
      <span className={`${googleClassName} ${styles["icon"]} ${extraIconClasses}`}>{icon}</span>
      <span>{buttonText}</span>
    </button>
  );
};

export default DecoratedButton;
