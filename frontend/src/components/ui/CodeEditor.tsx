import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";

const languageOptions = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  // You can add more languages here
];

// Function to register a basic Python completion provider
const registerPythonCompletionProvider = () => {
  // Check if the provider is already registered to avoid duplicates.
  // For a production solution, you might store a flag in a module-level variable.
  monaco.languages.registerCompletionItemProvider("python", {
    provideCompletionItems: (model, position) => {
      const suggestions = [
        {
          label: "def",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "def ${1:function_name}(${2:params}):\n\t$0",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "Define a function",
        },
        {
          label: "class",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText:
            "class ${1:ClassName}(${2:object}):\n\tdef __init__(self, ${3:args}):\n\t\t$0",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "Define a class",
        },
        {
          label: "import",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "import ",
          detail: "Import a module",
        },
        {
          label: "print",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "print(${1:object})",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "Print a value",
        },
      ];
      return { suggestions };
    },
  });
};

const CodeEditor: React.FC = () => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Start coding...");
  
  useEffect(() => {
    if (language === "python") {
      // Register the Python completion provider
      registerPythonCompletionProvider();
    }
    // Optionally, you might want to unregister or prevent duplicate registration in a production setup.
  }, [language]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
    console.log("Current code:", value);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-2 flex items-center gap-2">
        <label className="text-gray-700 font-medium" htmlFor="language-select">
          Language:
        </label>
        <select
          id="language-select"
          value={language}
          onChange={handleLanguageChange}
          className="border rounded px-2 py-1"
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-grow border rounded-md">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-light" // Change to "vs-dark" for a dark theme if desired
          options={{
            minimap: { enabled: false },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
