import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Clock, 
  Award, 
  CheckCircle,
  XCircle,
  Play
} from 'lucide-react';
import { User, Assessment, Course, Question } from '../../types';

interface AssessmentSystemProps {
  user: User;
  assessments: Assessment[];
  courses: Course[];
  setAssessments: (assessments: Assessment[]) => void;
  onComplete: (score: number) => void;
}

export const AssessmentSystem: React.FC<AssessmentSystemProps> = ({
  user,
  assessments,
  courses,
  onComplete
}) => {
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: any }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const userAssessments = user.role === 'student' 
    ? assessments
    : assessments;

  const startAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setTimeRemaining(assessment.timeLimit * 60); // Convert to seconds
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < selectedAssessment!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitAssessment = () => {
    if (!selectedAssessment) return;

    let correctAnswers = 0;
    selectedAssessment.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (question.type === 'multiple-choice') {
        if (userAnswer === question.correctAnswer) correctAnswers++;
      } else if (question.type === 'true-false') {
        if (userAnswer === question.correctAnswer) correctAnswers++;
      } else if (question.type === 'short-answer') {
        // Simple string comparison for demo - in real app, this would be more sophisticated
        if (userAnswer && userAnswer.toLowerCase().includes(question.correctAnswer.toString().toLowerCase())) {
          correctAnswers++;
        }
      }
    });

    const finalScore = Math.round((correctAnswers / selectedAssessment.questions.length) * 100);
    setScore(finalScore);
    setIsSubmitted(true);
    onComplete(finalScore);
  };

  const renderQuestion = (question: Question) => {
    const userAnswer = answers[question.id];

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={index}
                  checked={userAnswer === index}
                  onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                  className="mt-1"
                />
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="true"
                checked={userAnswer === true}
                onChange={() => handleAnswerChange(question.id, true)}
              />
              <span className="text-gray-900">True</span>
            </label>
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="false"
                checked={userAnswer === false}
                onChange={() => handleAnswerChange(question.id, false)}
              />
              <span className="text-gray-900">False</span>
            </label>
          </div>
        );

      case 'short-answer':
        return (
          <textarea
            value={userAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Enter your answer here..."
          />
        );

      default:
        return null;
    }
  };

  const getQuestionResult = (question: Question) => {
    const userAnswer = answers[question.id];
    let isCorrect = false;

    if (question.type === 'multiple-choice') {
      isCorrect = userAnswer === question.correctAnswer;
    } else if (question.type === 'true-false') {
      isCorrect = userAnswer === question.correctAnswer;
    } else if (question.type === 'short-answer') {
      isCorrect = userAnswer && userAnswer.toLowerCase().includes(question.correctAnswer.toString().toLowerCase());
    }

    return isCorrect;
  };

  // Assessment Taking View
  if (selectedAssessment && !isSubmitted) {
    const currentQuestion = selectedAssessment.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedAssessment.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedAssessment.title}</h1>
                <p className="text-gray-600">Question {currentQuestionIndex + 1} of {selectedAssessment.questions.length}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{currentQuestion.question}</h2>
              {renderQuestion(currentQuestion)}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="text-sm text-gray-500">
                {Object.keys(answers).length} of {selectedAssessment.questions.length} answered
              </div>

              {currentQuestionIndex === selectedAssessment.questions.length - 1 ? (
                <button
                  onClick={submitAssessment}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit Assessment
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results View
  if (selectedAssessment && isSubmitted) {
    const passed = score >= selectedAssessment.passingScore;

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {/* Results Header */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {passed ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {passed ? 'Congratulations!' : 'Try Again'}
              </h1>
              <p className="text-gray-600 mb-4">
                You scored {score}% on {selectedAssessment.title}
              </p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                passed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {passed ? 'Passed' : 'Failed'} - {score}% (Required: {selectedAssessment.passingScore}%)
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Review</h2>
              {selectedAssessment.questions.map((question, index) => {
                const isCorrect = getQuestionResult(question);
                const userAnswer = answers[question.id];

                return (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCorrect ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">
                          Question {index + 1}: {question.question}
                        </h3>
                        <div className="text-sm text-gray-600 mb-3">
                          <p><strong>Your answer:</strong> {
                            question.type === 'multiple-choice' 
                              ? question.options?.[userAnswer] || 'Not answered'
                              : question.type === 'true-false'
                              ? userAnswer?.toString() || 'Not answered'
                              : userAnswer || 'Not answered'
                          }</p>
                          {!isCorrect && (
                            <p className="text-green-600 mt-1">
                              <strong>Correct answer:</strong> {
                                question.type === 'multiple-choice'
                                  ? question.options?.[question.correctAnswer as number]
                                  : question.correctAnswer.toString()
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setSelectedAssessment(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to Assessments
              </button>
              {!passed && (
                <button
                  onClick={() => startAssessment(selectedAssessment)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retake Assessment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Assessment List View
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessments</h1>
          <p className="text-gray-600">Test your knowledge and track your progress</p>
        </div>

        {/* Assessments Grid */}
        {userAssessments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments available</h3>
            <p className="text-gray-600">Check back later for new assessments</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userAssessments.map((assessment) => {
              const course = courses.find(c => c.id === assessment.courseId);
              
              return (
                <div key={assessment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ClipboardCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Available
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{assessment.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{assessment.description}</p>
                  
                  {course && (
                    <p className="text-sm text-gray-500 mb-4">Course: {course.title}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {assessment.timeLimit} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Pass: {assessment.passingScore}%
                    </span>
                    <span>{assessment.questions.length} questions</span>
                  </div>
                  
                  <button 
                    onClick={() => startAssessment(assessment)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Assessment
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};