import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { saveQuizScore } from "@/lib/progress";
import type { Drill } from "@/types/domain";

interface QuizPanelProps {
  drill: Drill;
}

type AnswerMap = Record<number, number>;

export function QuizPanel({ drill }: QuizPanelProps) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  function handleAnswer(questionIndex: number, choiceIndex: number) {
    setAnswers((current) => ({
      ...current,
      [questionIndex]: choiceIndex,
    }));
  }

  function handleSubmit() {
    const score = drill.quiz.reduce((total, question, questionIndex) => {
      return answers[questionIndex] === question.correctIndex ? total + 1 : total;
    }, 0);

    saveQuizScore({
      controlId: drill.control.id,
      score,
      total: drill.quiz.length,
      at: new Date().toISOString(),
    });
    setSubmittedScore(score);
    toast.success(`Quiz score saved: ${score}/${drill.quiz.length}`);
  }

  return (
    <section aria-label="Quiz" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-primary">Quiz</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Answer each prompt to check whether the statement, Rego, and evidence
          expectations are connected.
        </p>
      </div>
      <Separator />
      <div className="flex flex-col gap-4">
        {drill.quiz.map((question, questionIndex) => {
          const selectedChoice = answers[questionIndex];
          const hasAnswer = selectedChoice !== undefined;
          const isCorrect = selectedChoice === question.correctIndex;

          return (
            <fieldset
              key={question.question}
              className="flex flex-col gap-4 rounded-xl border border-border bg-background/40 p-4"
            >
              <legend className="px-1 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Question {questionIndex + 1}
              </legend>
              <p className="text-base leading-7 text-foreground">
                {question.question}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {question.choices.map((choice, choiceIndex) => {
                  const inputId = `quiz-${questionIndex}-${choiceIndex}`;
                  return (
                    <label
                      key={choice}
                      htmlFor={inputId}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card/60 p-3 text-sm text-foreground transition-colors hover:border-primary/70 hover:bg-primary/5"
                    >
                      <input
                        id={inputId}
                        name={`quiz-${questionIndex}`}
                        type="radio"
                        checked={selectedChoice === choiceIndex}
                        onChange={() => handleAnswer(questionIndex, choiceIndex)}
                        className="mt-1 accent-primary"
                      />
                      <span>{choice}</span>
                    </label>
                  );
                })}
              </div>

              {hasAnswer ? (
                <div className="quiz-feedback-pulse flex flex-col gap-2 rounded-lg border border-primary/40 bg-card/80 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={
                        isCorrect
                          ? "bg-primary text-primary-foreground"
                          : "bg-destructive/20 text-destructive"
                      }
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Correct answer:{" "}
                      {question.choices[question.correctIndex]}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {question.explanation}
                  </p>
                </div>
              ) : null}
            </fieldset>
          );
        })}
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-primary">
            Save quiz progress
          </h3>
          <p className="text-sm text-muted-foreground">
            Unanswered questions count as incorrect when you submit.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {submittedScore !== null ? (
            <Badge variant="outline" className="border-primary/50 text-primary">
              Score {submittedScore}/{drill.quiz.length}
            </Badge>
          ) : null}
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Submit quiz
          </Button>
        </div>
      </div>
    </section>
  );
}
