import { useState } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const CodeEditor = ({ value, onChange, readOnly = false }: CodeEditorProps) => {
  const [lineCount] = useState(() => {
    const lines = value.split('\n');
    return lines.length;
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newValue);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/10">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#22D3EE]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
          </svg>
          <span className="text-gray-400 text-sm font-mono">main.c</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">C</span>
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Line Numbers */}
        <div className="flex-shrink-0 py-4 bg-[#0d1117] border-r border-white/5 select-none">
          <div className="px-4 text-right">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="text-gray-600 text-sm font-mono leading-6">
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Code Area */}
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            spellCheck={false}
            className={`absolute inset-0 w-full h-full p-4 bg-transparent text-gray-200 font-mono text-sm leading-6 resize-none outline-none ${
              readOnly ? 'cursor-default' : 'cursor-text'
            }`}
            style={{
              whiteSpace: 'pre',
              overflowWrap: 'normal',
              overflowX: 'auto',
            }}
          />
        </div>
      </div>
    </div>
  );
};
