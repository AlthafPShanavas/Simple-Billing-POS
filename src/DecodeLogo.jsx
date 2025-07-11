import React from "react";

export default function DecodeLogo({ size = 44, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <text x="0" y="35" fontFamily="Montserrat,Segoe UI,Arial,sans-serif" fontWeight="bold" fontSize="36" fill="#3a7bd5">D</text>
      <text x="28" y="35" fontFamily="Montserrat,Segoe UI,Arial,sans-serif" fontWeight="bold" fontSize="36" fill="#00b96b">E</text>
      <text x="54" y="35" fontFamily="Montserrat,Segoe UI,Arial,sans-serif" fontWeight="bold" fontSize="36" fill="#f09819">C</text>
      <text x="80" y="35" fontFamily="Montserrat,Segoe UI,Arial,sans-serif" fontWeight="bold" fontSize="36" fill="#25d366">O</text>
      <text x="106" y="35" fontFamily="Montserrat,Segoe UI,Arial,sans-serif" fontWeight="bold" fontSize="36" fill="#d90429">D</text>
      <text x="132" y="35" fontFamily="Montserrat,Segoe UI,Arial,sans-serif" fontWeight="bold" fontSize="36" fill="#3a7bd5">E</text>
    </svg>
  );
}
