import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js/lib/core';
import c from 'highlight.js/lib/languages/c';
import bash from 'highlight.js/lib/languages/bash';
import plaintext from 'highlight.js/lib/languages/plaintext';
import 'highlight.js/styles/github-dark.css';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { getUserState, type UserState } from '../../lib/api/user';
import { getLevelDetail, submitQuiz } from '../../lib/api/level';
import { notification } from '../../lib/notifications';
import { routes } from '../../lib/constants';
import type { LevelDetail, QuizSubmitResult } from '../../types/level';

hljs.registerLanguage('c', c);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('plaintext', plaintext);

const CodeBlock = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const language = className?.replace('language-', '') || 'plaintext';
  const code = String(children).replace(/\n$/, '');

  let highlightedCode: string;
  try {
    if (hljs.getLanguage(language)) {
      highlightedCode = hljs.highlight(code, { language }).value;
    } else {
      highlightedCode = hljs.highlight(code, { language: 'plaintext' }).value;
    }
  } catch {
    highlightedCode = code;
  }

  return (
    <div className="relative group my-4">
      <div className="absolute top-0 left-0 right-0 h-8 bg-[#24292e] border-b border-white/10 rounded-t-lg flex items-center px-3 gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-gray-400 font-mono uppercase">{language}</span>
      </div>
      <pre className="bg-[#24292e] border border-white/10 rounded-lg rounded-t-none pt-10 pb-4 px-4 overflow-x-auto">
        <code
          className={`text-sm font-mono leading-relaxed hljs`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
};

interface QuestionOptionProps {
  optionId: number;
  optionText: string;
  isSelected: boolean;
  isCorrect?: boolean;
  isResultView?: boolean;
  onSelect: (optionId: number) => void;
}

const QuestionOption = ({ optionId, optionText, isSelected, isCorrect, isResultView, onSelect }: QuestionOptionProps) => {
  let bgColor = 'bg-white/5 hover:bg-white/10';
  let borderColor = 'border-white/10';
  let textColor = 'text-gray-200';

  if (isResultView) {
    if (isCorrect) {
      bgColor = 'bg-emerald-500/20';
      borderColor = 'border-emerald-500';
      textColor = 'text-emerald-400';
    } else if (isSelected && !isCorrect) {
      bgColor = 'bg-red-500/20';
      borderColor = 'border-red-500';
      textColor = 'text-red-400';
    }
  } else if (isSelected) {
    bgColor = 'bg-[#22D3EE]/20';
    borderColor = 'border-[#22D3EE]';
    textColor = 'text-[#22D3EE]';
  }

  return (
    <button
      type="button"
      onClick={() => !isResultView && onSelect(optionId)}
      disabled={isResultView}
      className={`w-full p-4 rounded-xl border ${borderColor} ${bgColor} text-left transition-all cursor-pointer ${isResultView ? 'cursor-default' : 'hover:border-[#22D3EE]/50'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'border-[#22D3EE] bg-[#22D3EE]' : 'border-gray-500'}`}>
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <span className={`text-sm ${textColor}`}>{optionText}</span>
        {isResultView && isCorrect && (
          <svg className="w-5 h-5 text-emerald-400 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {isResultView && isSelected && !isCorrect && (
          <svg className="w-5 h-5 text-red-400 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
    </button>
  );
};

interface QuizResultProps {
  result: QuizSubmitResult;
}

const QuizResult = ({ result }: QuizResultProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <div className="bg-white/5 rounded-2xl p-6 text-center">
        <div className={`text-5xl font-bold ${getScoreColor(result.score)} mb-2`}>
          {result.score}%
        </div>
        <p className="text-gray-400">
          {result.correct} of {result.total} questions correct
        </p>
        {result.isNewCompletion && (
          <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-semibold">First Completion! Aura Reward Earned!</span>
          </div>
        )}
        {result.isCompleted && (
          <p className="mt-2 text-sm text-emerald-400">Level completed!</p>
        )}
      </div>

      {/* Question Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Review Answers</h3>
        {result.results.map((qResult, index) => (
          <div key={qResult.question_id} className="bg-white/5 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${qResult.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {qResult.is_correct ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Question {index + 1}</p>
                <p className="text-gray-300 mt-1">{qResult.question_text}</p>
              </div>
            </div>

            {!qResult.is_correct && (
              <div className="space-y-2 mb-4">
                <div className="text-sm text-red-400">
                  <span className="text-gray-400">Your answer: </span>
                  {qResult.selected_option_text || 'No answer selected'}
                </div>
                <div className="text-sm text-emerald-400">
                  <span className="text-gray-400">Correct answer: </span>
                  {qResult.correct_option_text}
                </div>
              </div>
            )}

            {qResult.explanation && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-4">
                <p className="text-blue-400 text-sm font-medium mb-1">Explanation</p>
                <p className="text-gray-300 text-sm">{qResult.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userState, setUserState] = useState<UserState | null>(null);
  const [levelDetail, setLevelDetail] = useState<LevelDetail | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<QuizSubmitResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        notification.error('Error', 'Invalid level ID');
        navigate(routes.dashboard);
        return;
      }

      notification.loading({
        title: 'Loading',
        message: 'Fetching level data...',
      });

      const [state, detail] = await Promise.all([
        getUserState(),
        getLevelDetail(parseInt(id, 10)),
      ]);

      notification.close();

      if (!state) {
        notification.error('Error', 'Failed to load user state');
        navigate(routes.dashboard);
        return;
      }

      if (!detail) {
        notification.error('Error', 'Failed to load level data');
        navigate(routes.dashboard);
        return;
      }

      if (!detail.is_unlocked && !detail.is_completed) {
        notification.error('Access Denied', 'You need to start this level from the dashboard first.');
        navigate(routes.dashboard);
        return;
      }

      setUserState(state);
      setLevelDetail(detail);
    };

    fetchData();
  }, [id, navigate]);

  const handleSelectAnswer = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!levelDetail) return;

    const unansweredCount = levelDetail.questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      notification.warning('Incomplete', `Please answer all ${levelDetail.questions.length} questions before submitting.`);
      return;
    }

    setIsSubmitting(true);
    notification.loading({
      title: 'Submitting',
      message: 'Checking your answers...',
    });

    try {
      const result = await submitQuiz(levelDetail.id, answers);
      notification.close();

      if (!result) {
        notification.error('Error', 'Failed to submit quiz. Please try again.');
        return;
      }

      setQuizResult(result);

      if (result.isNewCompletion) {
        notification.success('Congratulations!', `You completed the level and earned ${levelDetail.quiz_aura_reward} aura!`);
      } else if (result.passed) {
        notification.success('Well Done!', 'You passed the quiz!');
      } else {
        notification.warning('Try Again', 'You need 70% or higher to pass. Review the explanations and try again.');
      }

      // Refresh data
      const [state, detail] = await Promise.all([
        getUserState(),
        getLevelDetail(levelDetail.id),
      ]);
      if (state) setUserState(state);
      if (detail) setLevelDetail(detail);
    } catch {
      notification.close();
      notification.error('Error', 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryQuiz = () => {
    setQuizResult(null);
    setAnswers({});
  };

  if (!id || !levelDetail) {
    return null;
  }

  const allAnswered = levelDetail.questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#1e3a5f] to-[#0d1b2a]">
      <Header userState={userState} />

      <main className="flex-grow">
        {/* Level Info Section */}
        <section className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
              <div>
                <span className="text-[#22D3EE] text-sm font-semibold">Level {levelDetail.level_number}</span>
                <h1 className="text-2xl font-bold text-white mt-1">{levelDetail.title}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-gray-400 text-sm">
                    <span className="text-[#22D3EE]">{levelDetail.energy_cost}</span> energy cost
                  </span>
                  <span className="text-gray-400 text-sm">
                    <span className="text-yellow-400">{levelDetail.quiz_aura_reward}</span> aura reward
                  </span>
                  {levelDetail.is_completed && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full">
                      Completed
                    </span>
                  )}
                  {levelDetail.attempts > 0 && (
                    <span className="text-gray-400 text-sm">
                      <span className="text-gray-300">{levelDetail.attempts}</span> attempts
                    </span>
                  )}
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#0891B2] flex items-center justify-center">
                <span className="text-white text-3xl font-bold font-museo">C</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-4 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="prose prose-invert max-w-none
                prose-headings:text-[#22D3EE] prose-headings:font-bold
                prose-p:text-gray-200 prose-p:leading-relaxed
                prose-a:text-[#22D3EE] prose-a:underline
                prose-strong:text-gray-100 prose-strong:font-semibold
                prose-li:text-gray-200
                prose-hr:border-white/10
                prose-code:text-[#67e8f9] prose-code:before:content-none prose-code:after:content-none
                prose-table:text-gray-200 prose-th:text-[#22D3EE] prose-td:border-white/10 prose-td:px-4 prose-td:py-2
                prose-em:text-gray-300
                prose-blockquote:text-gray-300 prose-blockquote:border-l-[#22D3EE]
                prose-tr:text-gray-200 prose-th:text-gray-200
                text-gray-200 [&>p]:text-gray-200 [&>h1]:text-[#22D3EE] [&>h2]:text-[#22D3EE] [&>h3]:text-[#22D3EE]
                [&>ul]:text-gray-200 [&>ol]:text-gray-200 [&>li]:text-gray-200
                [&>strong]:text-gray-100 [&>em]:text-gray-300
                [&>table]:text-gray-200 [&>thead]:text-gray-200 [&>tbody]:text-gray-200
                [&>blockquote]:text-gray-300 [&>pre]:!bg-transparent [&>hr]:border-white/10">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match && !className;

                      if (isInline) {
                        return (
                          <code className="bg-white/10 text-[#22D3EE] px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                            {children}
                          </code>
                        );
                      }

                      return (
                        <CodeBlock className={className}>
                          {String(children).replace(/\n$/, '')}
                        </CodeBlock>
                      );
                    },
                    pre({ children }) {
                      return <>{children}</>;
                    },
                  }}
                >
                  {levelDetail.content_md}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </section>

        {/* Quiz Section */}
        <section className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Quiz</h2>

              {levelDetail.questions.length === 0 ? (
                <p className="text-gray-400">No quiz available for this level yet.</p>
              ) : quizResult ? (
                <QuizResult result={quizResult} />
              ) : (
                <div className="space-y-8">
                  {levelDetail.questions.map((question, index) => (
                    <div key={question.id} className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center font-semibold flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-white font-medium">{question.question_text}</p>
                      </div>

                      <div className="space-y-3 ml-11">
                        {question.options.map((option) => (
                          <QuestionOption
                            key={option.id}
                            optionId={option.id}
                            optionText={option.option_text}
                            isSelected={answers[question.id] === option.id}
                            onSelect={(optId) => handleSelectAnswer(question.id, optId)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={!allAnswered || isSubmitting}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        allAnswered && !isSubmitting
                          ? 'bg-gradient-to-r from-[#22D3EE] to-[#0891B2] text-white hover:opacity-90'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  </div>

                  {!allAnswered && (
                    <p className="text-center text-gray-400 text-sm">
                      {Object.keys(answers).length} of {levelDetail.questions.length} questions answered
                    </p>
                  )}
                </div>
              )}

              {quizResult && !levelDetail.is_completed && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleRetryQuiz}
                    className="px-6 py-3 rounded-xl font-medium bg-white/10 border border-white/10 text-gray-300 hover:bg-white/20 transition-all"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};