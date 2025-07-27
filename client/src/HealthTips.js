// src/HealthTips.js
import React from "react";

const tips = [
  { tip: "Stay hydrated. Drink at least 6-8 glasses of water daily.", icon: "💧" },
  { tip: "Get 7–8 hours of sleep every night.", icon: "😴" },
  { tip: "Wash your hands regularly.", icon: "🧼" },
  { tip: "Exercise 30 min/day for a stronger body.", icon: "🏃" },
  { tip: "Keep vaccinations up to date.", icon: "💉" },
  { tip: "Eat five servings of fruits & veggies daily.", icon: "🍏" }
];

function HealthTips() {
  return (
    <div className="flashcard-row">
      {tips.map((card, idx) => (
        <div className="flashcard" key={idx}>
          <div className="flashcard-icon">{card.icon}</div>
          <div className="flashcard-tip">{card.tip}</div>
        </div>
      ))}
    </div>
  );
}

export default HealthTips;
