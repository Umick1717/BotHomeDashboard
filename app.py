from __future__ import annotations

import random
from dataclasses import dataclass
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")


@dataclass(frozen=True)
class Question:
    left: int
    right: int

    @property
    def answer(self) -> int:
        return self.left * self.right

    def to_dict(self) -> dict:
        choices = {self.answer}
        while len(choices) < 4:
            candidate = max(0, self.answer + random.randint(-12, 12))
            choices.add(candidate)

        choice_list = list(choices)
        random.shuffle(choice_list)

        return {
            "left": self.left,
            "right": self.right,
            "answer": self.answer,
            "question": f"{self.left} × {self.right} = ?",
            "choices": choice_list,
        }


def create_question(min_number: int = 1, max_number: int = 12) -> Question:
    min_number = max(1, min(min_number, 20))
    max_number = max(min_number, min(max_number, 20))
    return Question(
        left=random.randint(min_number, max_number),
        right=random.randint(min_number, max_number),
    )


@app.get("/")
def home():
    return send_from_directory(BASE_DIR, "games.html")


@app.get("/games")
def games():
    return send_from_directory(BASE_DIR, "games.html")


@app.get("/api/question")
def question():
    try:
        min_number = int(request.args.get("min", 1))
        max_number = int(request.args.get("max", 12))
    except ValueError:
        return jsonify({"error": "min และ max ต้องเป็นตัวเลข"}), 400

    return jsonify(create_question(min_number, max_number).to_dict())


@app.post("/api/check")
def check_answer():
    data = request.get_json(silent=True) or {}
    try:
        left = int(data["left"])
        right = int(data["right"])
        selected = int(data["selected"])
    except (KeyError, TypeError, ValueError):
        return jsonify({"error": "ข้อมูลคำตอบไม่ครบ"}), 400

    correct_answer = left * right
    return jsonify(
        {
            "correct": selected == correct_answer,
            "answer": correct_answer,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
