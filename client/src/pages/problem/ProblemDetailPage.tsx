import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { CodeEditor } from '../../components/problem/CodeEditor';
import { ProblemLeaderboard } from '../../components/problem/ProblemLeaderboard';
import { getUserState, type UserState } from '../../lib/api/user';
import { getProblemDetail, submitCode, getSubmissions } from '../../lib/api/problem';
import { notification } from '../../lib/notifications';
import { routes } from '../../lib/constants';
import type { ProblemDetail, SubmissionStatus, SubmissionListItem } from '../../types/problem';

type TestCase = {
  inputUi: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
};

const getDifficultyStyle = (diff: string) => {
  switch (diff) {
    case 'easy':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'hard':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const getStatusStyle = (status: SubmissionStatus) => {
  switch (status) {
    case 'accepted':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'wrong_answer':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'runtime_error':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'compilation_error':
      return 'bg-red-600/20 text-red-300 border-red-600/30';
    case 'time_limit_exceeded':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'memory_limit_exceeded':
      return 'bg-purple-600/20 text-purple-300 border-purple-600/30';
    case 'output_limit_exceeded':
      return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    case 'running':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'pending':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default:
      return 'bg-white/5 text-gray-400 border-white/10';
  }
};

const formatStatus = (status: SubmissionStatus) => {
  return status.replace(/_/g, ' ');
};

export const ProblemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userState, setUserState] = useState<UserState | null>(null);
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [code, setCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'leaderboard'>('description');
  const [status, setStatus] = useState<SubmissionStatus | 'idle'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [errorOutput, setErrorOutput] = useState<string>('');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        notification.error('Error', 'Invalid problem ID');
        navigate(routes.dashboard);
        return;
      }

      notification.loading({ title: 'Loading', message: 'Fetching problem...' });

      const [state, problemData, submissionsData] = await Promise.all([
        getUserState(),
        getProblemDetail(parseInt(id, 10)),
        getSubmissions(parseInt(id, 10)),
      ]);

      notification.close();

      if (!state) {
        notification.error('Error', 'Failed to load user state');
        navigate(routes.dashboard);
        return;
      }

      if (!problemData) {
        notification.error('Error', 'Problem not found');
        navigate(routes.dashboard);
        return;
      }

      setUserState(state);
      setProblem(problemData);
      setCode(problemData.starterCode);
      setSubmissions(submissionsData.submissions);
    };

    fetchData();
  }, [id, navigate]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollSubmissionStatus = useCallback(
    (problemId: number, submissionId: number, initialAuraJustEarned: boolean = false) => {
      stopPolling();

      pollingRef.current = setInterval(async () => {
        const response = await getSubmissions(problemId);
        const submission = response.submissions.find((s) => s.id === submissionId);

        if (!submission) {
          return;
        }

        // Stop polling when status is no longer pending or running
        if (submission.status !== 'pending' && submission.status !== 'running') {
          stopPolling();
          setStatus(submission.status);
          setErrorOutput(submission.errorOutput);
          setIsSubmitting(false);
          setSubmissions(response.submissions);

          // Refetch user state to sync energy
          const state = await getUserState();
          if (state) {
            setUserState(state);
          }

          // Show notification based on result
          // If aura was just earned (either from initial fetch or this poll)
          if (response.auraJustEarned || initialAuraJustEarned) {
            notification.success('First Accept!', `+${problem?.auraReward ?? 0} aura earned!`);
          } else {
            switch (submission.status) {
              case 'accepted':
                notification.success('Accepted!', 'All test cases passed.');
                break;
              case 'compilation_error':
                notification.error('Compilation Error', 'Check the output panel for details.');
                break;
              case 'runtime_error':
                notification.error('Runtime Error', 'Check the output panel for details.');
                break;
              case 'time_limit_exceeded':
                notification.error('Time Limit Exceeded', 'Your code took too long to execute.');
                break;
              case 'memory_limit_exceeded':
                notification.error('Memory Limit Exceeded', 'Your code used too much memory.');
                break;
              case 'output_limit_exceeded':
                notification.error('Output Limit Exceeded', 'Your code produced too much output.');
                break;
              case 'wrong_answer':
                notification.warning('Wrong Answer', 'Check the output panel for details.');
                break;
              case 'internal_error':
                notification.error('Internal Error', 'Something went wrong. Please try again.');
                break;
              default:
                notification.error('Error', 'Submission failed. Please try again.');
            }
          }
        }
      }, 2000);
    },
    [stopPolling, problem]
  );

  const handleSubmit = async () => {
    if (!problem || isSubmitting || !userState) return;

    // Check energy before submitting
    if (userState.energy < problem.energyCost) {
      notification.error('Not Enough Energy', `You need ${problem.energyCost} energy to submit. You only have ${userState.energy} energy.`);
      return;
    }

    // Energy is sufficient, show confirmation modal
    const confirmed = await notification.confirm({
      title: 'Submit Solution?',
      message: `This submission will cost ${problem.energyCost} energy. You have ${userState.energy} energy.`,
      confirmText: 'Submit',
      cancelText: 'Cancel',
    });

    if (!confirmed.isConfirmed) {
      return;
    }

    stopPolling();
    setIsSubmitting(true);
    setStatus('pending');
    setErrorOutput('');

    notification.loading({ title: 'Submitting', message: 'Uploading your code...' });

    try {
      const result = await submitCode(problem.id, code);
      notification.close();

      if (!result) {
        notification.error('Error', 'Failed to submit code');
        setStatus('idle');
        setIsSubmitting(false);
        return;
      }

      notification.loading({ title: 'Running', message: 'Executing test cases...' });

      // Refetch user state immediately to sync energy after submission
      const stateAfterSubmit = await getUserState();
      if (stateAfterSubmit) {
        setUserState(stateAfterSubmit);
      }

      // Start polling for status
      pollSubmissionStatus(problem.id, result.submissionId, false);
    } catch (error) {
      notification.close();
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      notification.error('Error', message);
      setStatus('idle');
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!problem) return;
    setCode(problem.starterCode);
    setStatus('idle');
    setErrorOutput('');
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  if (!problem) {
    return null;
  }

  // Transform test cases for display
  const displayTestCases: TestCase[] = problem.testCases.map((tc) => ({
    inputUi: tc.inputUi,
    input: tc.input,
    expectedOutput: tc.expectedOutput,
    isHidden: tc.isHidden,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#1e3a5f] to-[#0d1b2a]">
      <Header userState={userState} />

      <main className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-white/10 flex flex-col bg-[#0d1117] min-h-0">
          {/* Problem Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyStyle(
                  problem.difficulty
                )}`}
              >
                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>
                  <span className="text-[#22D3EE]">{problem.energyCost}</span> energy
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                <span>
                  <span className="text-yellow-400">{problem.auraReward}</span> aura
                </span>
              </div>
            </div>
          </div>

          {/* Warning Note */}
          <div className="mx-6 mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-xs text-yellow-200">
                <p className="font-semibold mb-1">Important:</p>
                <ul className="space-y-0.5 text-yellow-100/80">
                  <li>• Do not change the function signature (name, parameters, return type)</li>
                  <li>• Do not remove the base includes (<code className="bg-yellow-500/20 px-1 rounded">#include</code> statements)</li>
                  <li>• You may add additional includes if needed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'description'
                  ? 'text-[#22D3EE] border-b-2 border-[#22D3EE]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'submissions'
                  ? 'text-[#22D3EE] border-b-2 border-[#22D3EE]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Submissions
              {submissions.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs">
                  {submissions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'text-[#22D3EE] border-b-2 border-[#22D3EE]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Leaderboard
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {activeTab === 'description' && (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">Problem</h2>
                  <div
                    className="prose prose-invert prose-sm max-w-none text-gray-300
                      prose-headings:text-[#22D3EE] prose-headings:font-semibold
                      prose-p:text-gray-300 prose-p:leading-relaxed
                      prose-strong:text-white prose-code:text-[#67e8f9] prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {problem.descriptionMd}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Example */}
                {displayTestCases.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-3">Example</h2>
                    <div className="bg-[#161b22] rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-2">Input:</div>
                      <code className="text-[#67e8f9] font-mono text-sm">
                        {displayTestCases[0].inputUi}
                      </code>
                      <div className="text-gray-400 text-sm mb-2 mt-4">Output:</div>
                      <code className="text-emerald-400 font-mono text-sm">
                        {displayTestCases[0].expectedOutput}
                      </code>
                    </div>
                  </div>
                )}

                {/* Constraints */}
                {problem.constraintsMd && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-3">Constraints</h2>
                    <div className="bg-[#161b22] rounded-xl p-4 border border-white/10">
                      <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                        {problem.constraintsMd}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Test Cases */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">Test Cases</h2>
                  <div className="space-y-3">
                    {displayTestCases.map((tc, idx) => (
                      <div
                        key={idx}
                        className="bg-[#161b22] rounded-xl p-4 border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-500 text-xs font-medium">
                            {tc.isHidden ? 'Hidden Test Case' : `Test Case ${idx + 1}`}
                          </span>
                          {tc.isHidden && (
                            <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
                              Hidden
                            </span>
                          )}
                        </div>
                        {!tc.isHidden && (
                          <>
                            <div className="text-gray-400 text-sm mb-1">Input:</div>
                            <code className="text-[#67e8f9] font-mono text-sm">{tc.inputUi}</code>
                            <div className="text-gray-400 text-sm mb-1 mt-2">Expected Output:</div>
                            <code className="text-emerald-400 font-mono text-sm">
                              {tc.expectedOutput}
                            </code>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="max-h-full overflow-y-auto">
                {submissions.length === 0 ? (
                  <p className="text-gray-400 text-sm py-6">No submissions yet.</p>
                ) : (
                  <div className="space-y-3 py-6">
                    {submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-[#161b22] rounded-xl p-4 border border-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                                sub.status as SubmissionStatus
                              )}`}
                            >
                              {formatStatus(sub.status as SubmissionStatus)}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {formatTime(sub.submittedAt)}
                            </span>
                          </div>
                          {sub.runtimeMs > 0 && (
                            <span className="text-gray-400 text-xs">
                              {sub.runtimeMs}ms / {sub.memoryKb}KB
                            </span>
                          )}
                        </div>
                        {sub.errorOutput && (
                          <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p className="text-red-400 text-xs font-medium mb-1">Error Output</p>
                            <pre className="text-red-300 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-32">
                              {sub.errorOutput}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="p-6">
                <ProblemLeaderboard problemId={parseInt(id ?? '0', 10)} />
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col bg-[#0d1117]">
          {/* Editor Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm hover:bg-white/10 transition-colors cursor-pointer"
              >
                Reset
              </button>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(
                  status as SubmissionStatus
                )}`}
              >
                {status === 'idle' ? 'Not Submitted' : formatStatus(status as SubmissionStatus)}
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                isSubmitting
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#22D3EE] to-[#0891B2] text-white hover:opacity-90'
              }`}
            >
              {isSubmitting ? 'Running...' : 'Submit'}
            </button>
          </div>

          {/* Code Editor */}
          <div className="flex-1 p-4">
            <div className="h-full">
              <CodeEditor value={code} onChange={setCode} />
            </div>
          </div>

          {/* Output Panel */}
          <div className="h-48 border-t border-white/10 bg-[#161b22]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <span className="text-gray-400 text-sm font-medium">Output</span>
              {status === 'accepted' && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  All test cases passed!
                </div>
              )}
            </div>
            <div className="p-4 font-mono text-sm text-gray-300 overflow-auto max-h-32">
              {status === 'pending' || status === 'running' ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#22D3EE] border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : status === 'idle' ? (
                <span className="text-gray-500">Click Submit to run your code</span>
              ) : errorOutput ? (
                <pre className="whitespace-pre-wrap">{errorOutput}</pre>
              ) : (
                <span className="text-gray-500">No output</span>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};