import React from "react";

export const Dugme = ({ text, className, type, onClick }) => {
  return (
    <button className={className} type={type} onClick={onClick}>
      {text}
    </button>
  );
};
