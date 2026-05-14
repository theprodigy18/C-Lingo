import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js/lib/core';
import c from 'highlight.js/lib/languages/c';
import 'highlight.js/styles/github-dark.css';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { CodeEditor } from '../../components/problem/CodeEditor';
import { getUserState, type UserState } from '../../lib/api/user';
import { notification } from '../../lib/notifications';
import { routes } from '../../lib/constants';
import { useEffect } from 'react';

hljs.registerLanguage('c', c);

type TestCase = {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
};

type Problem = {
  id: number;
  title: string;
  slug: string;
  description: string;
  constraints: string;
  starterCode: string;
  difficulty: 'easy' | 'medium' | 'hard';
  energyCost: number;
  auraReward: number;
  testCases: TestCase[];
};

const sampleProblem: Problem = {
  id: 1,
  title: 'Two Sum',
  slug: 'two-sum',
  description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
  constraints: `- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
  starterCode: `#include <stdio.h>

/**
 * Note: The returned array must be malloced, assume caller frees them.
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Your code here

    *returnSize = 0;
    return NULL;
}`,
  difficulty: 'easy',
  energyCost: 5,
  auraReward: 100,
  testCases: [
    { input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]', isHidden: false },
    { input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]', isHidden: false },
    { input: 'nums = [3,3], target = 6', expectedOutput: '[0,1]', isHidden: true },
  ],
};

type SubmissionStatus = 'idle' | 'running' | 'accepted' | 'wrong_answer' | 'runtime_error' | 'compile_error';

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
    case 'compile_error':
      return 'bg-red-600/20 text-red-300 border-red-600/30';
    case 'running':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default:
      return 'bg-white/5 text-gray-400 border-white/10';
  }
};

export const ProblemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userState, setUserState] = useState<UserState | null>(null);
  const [code, setCode] = useState(sampleProblem.starterCode);
  const [activeTab, setActiveTab] = useState<'description' | 'solutions' | 'submissions'>('description');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserState = async () => {
      notification.loading({ title: 'Loading', message: 'Fetching problem...' });
      try {
        const state = await getUserState();
        notification.close();
        if (state) {
          setUserState(state);
        }
      } catch {
        notification.close();
        notification.error('Error', 'Failed to load user state');
      }
    };
    fetchUserState();
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatus('running');

    notification.loading({ title: 'Running Code', message: 'Executing test cases...' });

    setTimeout(() => {
      notification.close();
      setStatus('accepted');
      setIsSubmitting(false);
      notification.success('Accepted!', 'All test cases passed.');
    }, 2000);
  };

  const handleReset = () => {
    setCode(sampleProblem.starterCode);
    setStatus('idle');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#1e3a5f] to-[#0d1b2a]">
      <Header userState={userState} />

      <main className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-white/10 flex flex-col bg-[#0d1117]">
          {/* Problem Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">{sampleProblem.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyStyle(sampleProblem.difficulty)}`}>
                {sampleProblem.difficulty.charAt(0).toUpperCase() + sampleProblem.difficulty.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span><span className="text-[#22D3EE]">{sampleProblem.energyCost}</span> energy</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span><span className="text-yellow-400">{sampleProblem.auraReward}</span> aura</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-white/10">
            {(['description', 'solutions', 'submissions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'text-[#22D3EE] border-b-2 border-[#22D3EE]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'description' && (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">Problem</h2>
                  <div className="prose prose-invert prose-sm max-w-none text-gray-300
                    prose-headings:text-[#22D3EE] prose-headings:font-semibold
                    prose-p:text-gray-300 prose-p:leading-relaxed
                    prose-strong:text-white prose-code:text-[#67e8f9] prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                    <ReactMarkdown>{sampleProblem.description}</ReactMarkdown>
                  </div>
                </div>

                {/* Example */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">Example</h2>
                  <div className="bg-[#161b22] rounded-xl p-4 border border-white/10">
                    <div className="text-gray-400 text-sm mb-2">Input:</div>
                    <code className="text-[#67e8f9] font-mono text-sm">{sampleProblem.testCases[0].input}</code>
                    <div className="text-gray-400 text-sm mb-2 mt-4">Output:</div>
                    <code className="text-emerald-400 font-mono text-sm">{sampleProblem.testCases[0].expectedOutput}</code>
                  </div>
                </div>

                {/* Constraints */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">Constraints</h2>
                  <div className="bg-[#161b22] rounded-xl p-4 border border-white/10">
                    <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">{sampleProblem.constraints}</pre>
                  </div>
                </div>

                {/* Test Cases */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">Test Cases</h2>
                  <div className="space-y-3">
                    {sampleProblem.testCases.map((tc, idx) => (
                      <div key={idx} className="bg-[#161b22] rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-500 text-xs font-medium">
                            {tc.isHidden ? 'Hidden Test Case' : `Test Case ${idx + 1}`}
                          </span>
                          {tc.isHidden && (
                            <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">Hidden</span>
                          )}
                        </div>
                        {!tc.isHidden && (
                          <>
                            <div className="text-gray-400 text-sm mb-1">Input:</div>
                            <code className="text-[#67e8f9] font-mono text-sm">{tc.input}</code>
                            <div className="text-gray-400 text-sm mb-1 mt-2">Expected Output:</div>
                            <code className="text-emerald-400 font-mono text-sm">{tc.expectedOutput}</code>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'solutions' && (
              <div className="text-gray-400 text-sm">
                Solutions coming soon...
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="text-gray-400 text-sm">
                Submission history coming soon...
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
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(status)}`}>
                {status === 'idle' ? 'Not Submitted' : status.replace('_', ' ')}
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All test cases passed!
                </div>
              )}
            </div>
            <div className="p-4 font-mono text-sm text-gray-300">
              {status === 'running' ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#22D3EE] border-t-transparent rounded-full animate-spin" />
                  Running...
                </div>
              ) : status === 'idle' ? (
                <span className="text-gray-500">Click Submit to run your code</span>
              ) : (
                <span>Output will appear here after submission</span>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};