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
import { notification } from '../../lib/notifications';
import { routes } from '../../lib/constants';

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

export const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userState, setUserState] = useState<UserState | null>(null);

  useEffect(() => {
    const fetchUserState = async () => {
      try {
        const state = await getUserState();
        if (state) {
          setUserState(state);
        } else {
          notification.error('Connection Error', 'Failed to load user state. Please refresh the page.');
        }
      } catch {
        notification.error('Connection Error', 'Failed to load user state. Please refresh the page.');
      }
    };

    fetchUserState();
  }, []);

  if (!id) {
    notification.error('Error', 'Invalid level ID');
    navigate(routes.dashboard);
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#1e3a5f] to-[#0d1b2a]">
      <Header userState={userState} />

      <main className="flex-grow">
        {/* Level Info Section */}
        <section className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
              <div>
                <span className="text-[#22D3EE] text-sm font-semibold">Level 1</span>
                <h1 className="text-2xl font-bold text-white mt-1">Introduction to C</h1>
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
                prose-table:text-gray-200 prose-th:text-[#22D3EE] prose-td:border-white/10 prose-td:px-4 prose-td:py-2">
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
                  {`# Introduction to C

C is a general-purpose programming language created by **Dennis Ritchie** at Bell Labs between 1969 and 1973. It was designed as a practical language for writing operating systems -- the Unix OS itself was rewritten in C shortly after.

Despite being over 50 years old, C remains one of the most widely used languages in the world. It powers the Linux kernel, embedded systems, game engines, databases, and serves as the foundation for languages like C++, Java, Python, and Go.

---

## Why C?

Most high-level languages abstract away what is happening in hardware. C sits much closer to the machine:

- You manage memory yourself -- no garbage collector
- Code compiles directly to machine instructions -- execution is fast
- The language is small -- the entire C standard fits in one book
- Understanding C gives you a mental model that applies to almost every other language

This course uses C as a vehicle for understanding how programs actually work at a fundamental level.

---

## How C Code Becomes a Program

C is a **compiled** language. You write source code in a \`.c\` file, and a compiler translates it into machine code that the processor can execute.

The process has four stages:

\`\`\`
source.c  -->  [Preprocessor]  -->  source.i
          -->  [Compiler]      -->  source.s   (assembly)
          -->  [Assembler]     -->  source.o   (object file)
          -->  [Linker]        -->  program    (executable)
\`\`\`

In practice, you invoke all four stages with a single command using GCC:

\`\`\`bash
gcc main.c -o main
./main
\`\`\`

- \`gcc\` is the compiler
- \`main.c\` is your source file
- \`-o main\` names the output executable
- \`./main\` runs it

---

## Your First Program

Here is the simplest complete C program:

\`\`\`c
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
\`\`\`

Compile and run it:

\`\`\`bash
gcc main.c -o main
./main
\`\`\`

Output:

\`\`\`
Hello, World!
\`\`\`

---

## Common Beginner Errors

### Missing semicolon

\`\`\`c
printf("Hello")   // error: expected ';'
\`\`\`

Every statement in C must end with a semicolon.

### Missing #include

\`\`\`c
int main() {
    printf("Hello\\n");  // error: implicit declaration of printf
    return 0;
}
\`\`\`

Without \`#include <stdio.h>\`, the compiler does not know about \`printf\`.

---

## Summary

Topics covered in this level:

- What C is and why it matters
- How C source code is compiled into an executable
- The structure of a minimal C program
- Common errors beginners make

---

Next level: **Variables and Data Types** -- storing and naming values in memory.`}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </section>

        {/* Quiz Section - Placeholder */}
        <section className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-white mb-4">Quiz</h2>
              <p className="text-gray-400">Quiz section coming soon...</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};