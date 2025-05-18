import { useEffect, useRef } from 'react';
import * as monaco from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: string;
  options?: any;
}

export const CodeEditor = ({
  value,
  onChange,
  language = 'cpp',
  theme = 'vs-dark',
  options = {}
}: CodeEditorProps) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="h-[400px] w-full border rounded-md overflow-hidden">
      <monaco.Editor
        height="100%"
        defaultLanguage={language}
        defaultValue={value}
        theme={theme}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          automaticLayout: true,
          ...options
        }}
      />
    </div>
  );
}; 