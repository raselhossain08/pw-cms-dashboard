"use client";

import * as React from "react";
import { X, Plus, GripVertical, Trash2, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface QuizQuestion {
  id: string;
  type:
    | "multiple_choice"
    | "true_false"
    | "short_answer"
    | "essay"
    | "fill_in_blank";
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
  order: number;
}

interface QuizBuilderProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

export default function QuizBuilder({ questions, onChange }: QuizBuilderProps) {
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      type: "multiple_choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
      order: questions.length + 1,
    };
    onChange([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    onChange(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const deleteQuestion = (id: string) => {
    onChange(questions.filter((q) => q.id !== id));
  };

  const duplicateQuestion = (question: QuizQuestion) => {
    const newQuestion: QuizQuestion = {
      ...question,
      id: `q-${Date.now()}`,
      question: `${question.question} (Copy)`,
      order: questions.length + 1,
    };
    onChange([...questions, newQuestion]);
  };

  const updateOption = (
    questionId: string,
    optionIndex: number,
    value: string
  ) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || !question.options) return;

    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    updateQuestion(questionId, { options: newOptions });
  };

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || !question.options) return;

    updateQuestion(questionId, { options: [...question.options, ""] });
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || !question.options || question.options.length <= 2) return;

    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    updateQuestion(questionId, { options: newOptions });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Quiz Questions</h3>
          <p className="text-sm text-slate-600">
            {questions.length} question{questions.length !== 1 ? "s" : ""} •{" "}
            {questions.reduce((sum, q) => sum + q.points, 0)} total points
          </p>
        </div>
        <Button onClick={addQuestion} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-slate-500 mb-4">No questions yet</p>
            <Button onClick={addQuestion} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Question
            </Button>
          </CardContent>
        </Card>
      )}

      {questions.map((question, index) => (
        <Card key={question.id} className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <GripVertical className="w-5 h-5 text-slate-400 mt-1 cursor-move" />
                <div className="flex-1">
                  <CardTitle className="text-base mb-1">
                    Question {index + 1}
                  </CardTitle>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => duplicateQuestion(question)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteQuestion(question.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Question Type & Points */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Question Type</Label>
                <Select
                  value={question.type}
                  onValueChange={(value: any) =>
                    updateQuestion(question.id, { type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">
                      Multiple Choice
                    </SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="fill_in_blank">
                      Fill in the Blank
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Points</Label>
                <Input
                  type="number"
                  min="1"
                  value={question.points}
                  onChange={(e) =>
                    updateQuestion(question.id, {
                      points: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>

            {/* Question Text */}
            <div>
              <Label>Question</Label>
              <Textarea
                value={question.question}
                onChange={(e) =>
                  updateQuestion(question.id, { question: e.target.value })
                }
                placeholder="Enter your question here..."
                className="min-h-[100px]"
              />
            </div>

            {/* Options for Multiple Choice */}
            {question.type === "multiple_choice" && (
              <div>
                <Label className="mb-3 block">Answer Options</Label>
                <RadioGroup
                  value={question.correctAnswer as string}
                  onValueChange={(value) =>
                    updateQuestion(question.id, { correctAnswer: value })
                  }
                >
                  <div className="space-y-2">
                    {question.options?.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center gap-2"
                      >
                        <RadioGroupItem
                          value={optionIndex.toString()}
                          id={`${question.id}-option-${optionIndex}`}
                        />
                        <Input
                          value={option}
                          onChange={(e) =>
                            updateOption(
                              question.id,
                              optionIndex,
                              e.target.value
                            )
                          }
                          placeholder={`Option ${String.fromCharCode(
                            65 + optionIndex
                          )}`}
                          className="flex-1"
                        />
                        {question.options && question.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeOption(question.id, optionIndex)
                            }
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(question.id)}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
            )}

            {/* True/False Options */}
            {question.type === "true_false" && (
              <div>
                <Label className="mb-3 block">Correct Answer</Label>
                <RadioGroup
                  value={question.correctAnswer as string}
                  onValueChange={(value) =>
                    updateQuestion(question.id, { correctAnswer: value })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id={`${question.id}-true`} />
                    <Label htmlFor={`${question.id}-true`}>True</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id={`${question.id}-false`} />
                    <Label htmlFor={`${question.id}-false`}>False</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Short Answer */}
            {question.type === "short_answer" && (
              <div>
                <Label>Acceptable Answer(s)</Label>
                <Input
                  value={question.correctAnswer as string}
                  onChange={(e) =>
                    updateQuestion(question.id, {
                      correctAnswer: e.target.value,
                    })
                  }
                  placeholder="Enter the correct answer (separate multiple answers with commas)"
                />
                <p className="text-xs text-slate-500 mt-1">
                  For multiple acceptable answers, separate them with commas
                </p>
              </div>
            )}

            {/* Explanation */}
            <div>
              <Label>Explanation (Optional)</Label>
              <Textarea
                value={question.explanation || ""}
                onChange={(e) =>
                  updateQuestion(question.id, { explanation: e.target.value })
                }
                placeholder="Explain why this answer is correct..."
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
