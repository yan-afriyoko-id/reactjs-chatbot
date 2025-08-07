import React from 'react';

const ChatMessage = ({ message, isUser = false, timestamp }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Function to detect and format code blocks
  const formatMessage = (text) => {
    // Check for code blocks with ```language``` or ```code```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }

      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2].trim()
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  const renderCodeBlock = (code, language) => {
    const getLanguageColor = (lang) => {
      const colors = {
        javascript: 'text-yellow-400',
        js: 'text-yellow-400',
        python: 'text-blue-400',
        py: 'text-blue-400',
        html: 'text-orange-400',
        css: 'text-pink-400',
        java: 'text-red-400',
        cpp: 'text-blue-500',
        c: 'text-blue-500',
        php: 'text-purple-400',
        ruby: 'text-red-500',
        go: 'text-blue-600',
        rust: 'text-orange-500',
        sql: 'text-green-400',
        json: 'text-green-400',
        xml: 'text-orange-400',
        bash: 'text-green-500',
        shell: 'text-green-500',
        text: 'text-gray-400'
      };
      return colors[language.toLowerCase()] || colors.text;
    };

    return (
      <div className="my-2 rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 flex items-center justify-between">
          <span className={`text-xs font-medium ${getLanguageColor(language)}`}>
            {language}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(code);
            }}
            className="text-gray-400 hover:text-white transition-colors"
            title="Copy code"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        <pre className="bg-gray-900 p-4 overflow-x-auto">
          <code className={`text-sm ${getLanguageColor(language)}`}>
            {code}
          </code>
        </pre>
      </div>
    );
  };

  const messageParts = formatMessage(message);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl px-4 py-2 rounded-lg ${
        isUser 
          ? 'bg-blue-600 text-white rounded-br-none' 
          : 'bg-gray-700 text-white rounded-bl-none'
      }`}>
        <div className="text-sm space-y-2">
          {messageParts.map((part, index) => (
            <div key={index}>
              {part.type === 'code' ? (
                renderCodeBlock(part.content, part.language)
              ) : (
                <div className="whitespace-pre-wrap">{part.content}</div>
              )}
            </div>
          ))}
        </div>
        {timestamp && (
          <div className={`text-xs mt-2 ${
            isUser ? 'text-blue-200' : 'text-gray-400'
          }`}>
            {formatTime(timestamp)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 