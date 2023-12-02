"use client";
import React, { useCallback, useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $insertNodes,
  EditorState,
  LexicalEditor,
} from "lexical";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html";
// import { $generateHtmlFromNodes } from 'lexical';

import "./edtitor.css";

const theme = {};

function initialEditorState(editor: LexicalEditor): any {
  const root = $getRoot();
  const paragraph = $createParagraphNode();
  const text = $createTextNode("Welcome to collab!");
  paragraph.append(text);
  root.append(paragraph);
}

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  return null;
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error) {
  console.error(error);
}

const initialConfig = {
  namespace: "MyEditor",
  theme,
  onError,
  editable: true,
  // editorState: "<p></p>",
};

const MyFunPlugin = (): any => {
  const [editor] = useLexicalComposerContext();
  editor.registerUpdateListener(({ editorState }) => {
    editorState.read(() => {
      const tmp = $generateHtmlFromNodes(editor);
      console.log(tmp);
    });
  });
};

//
type HTMLEditorContainerProps = {
  defaultValue?: string;
  onChange: (value: string) => any;
};
const HTMLEditorContainer = (props: HTMLEditorContainerProps) => {
  const { defaultValue, onChange } = props;
  const [editor] = useLexicalComposerContext();

  // set defaultValue and onChange listener
  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.registerUpdateListener(() => {
      editor.update(() => {
        const html = $generateHtmlFromNodes(editor, null);
        onChange(html);
      });
    });
  }, [editor, onChange]);

  // set defaultValue and onChange listener
  useEffect(() => {
    if (!defaultValue || !editor) {
      return;
    }

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(defaultValue, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      $getRoot().clear();
      $getRoot().select();
      $insertNodes(nodes);
      // const selection = $getSelection();
      // // @ts-expect-error not sure...
      // selection.insertNodes(nodes);
    });
    // return;
  }, [editor, defaultValue]);

  return (
    <>
      <RichTextPlugin
        contentEditable={<ContentEditable className="containerEditor" />}
        placeholder={<p>Enter some text...</p>}
        ErrorBoundary={LexicalErrorBoundary}
      />
    </>
  );
};
//

const TextEditor = () => {
  // const [editorState, setEditorState] = useState<EditorState>();
  // function onChange(editorState: EditorState) {
  //   setEditorState(editorState);
  // }
  // const onChange = (editorState: EditorState) => {
  //   editorState.read(() => {
  //     // const json = editorState.toJSON();
  //     // console.log(JSON.stringify(json));
  //   });
  // };

  // const htmlString = $generateHtmlFromNodes(editorState);
  // console.log(htmlString);

  const [value, setValue] = useState("");
  const onChange = useCallback((value: string) => setValue(value), []);
  console.log(value);

  return (
    <div>
      <LexicalComposer initialConfig={initialConfig}>
        {/* <PlainTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={<div>Enter some text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        /> */}
        {/* <ToolbarPlugin /> */}
        {/* <RichTextPlugin
          contentEditable={<ContentEditable className="containerEditor" />}
          placeholder={<p>Enter some text...</p>}
          ErrorBoundary={LexicalErrorBoundary}
        /> */}
        <HTMLEditorContainer defaultValue="<p>asd</p>" onChange={onChange} />
        <HistoryPlugin />
        <MyCustomAutoFocusPlugin />
        {/* <OnChangePlugin onChange={onChange} /> */}
        {/* <MyFunPlugin /> */}
      </LexicalComposer>
    </div>
  );
};

export default TextEditor;
