import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import {io,Socket} from "socket.io-client";
import { useLocation } from "react-router-dom";

const socket: Socket = io("http://localhost:8013");

const languageOptions = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
];


const registerPythonCompletionProvider = () => {
  
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

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomId = queryParams.get("roomId") || "default-room";
  
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Start coding...");
  
  useEffect(()=>{
    socket.emit("join", roomId);

    
    socket.on("code-change", (newCode: string) => {
      setCode(newCode);
    });

    return () => {
      socket.off("code-change");
    };
  },[roomId]);

  useEffect(() => {
    if (language === "python") {
      
      registerPythonCompletionProvider();
    }
    
  }, [language]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handleEditorChange = (value: string | undefined) => {
    const updatedCode = value || "";
    setCode(updatedCode);
    console.log("Current code:", value);
    socket.emit("code-change", { roomId, code: updatedCode });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <label className="font-medium text-gray-700" htmlFor="language-select">
          Language:
        </label>
        <select
          id="language-select"
          value={language}
          onChange={handleLanguageChange}
          className="px-2 py-1 border rounded"
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
          theme="vs-light" 
          options={{
            minimap: { enabled: false },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
