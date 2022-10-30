import * as Y from 'yjs'
import { QuillBinding } from 'y-quill'
import Delta from "quill-delta";
import Quill from 'quill'
import QuillCursors from 'quill-cursors'
import { useCallback, useEffect, useState } from 'react'
import "./styles.css"

function Editor(props) {                                                                                                                                                       

    // A Yjs document holds the shared data
    const ydoc = new Y.Doc()
    const ytext = ydoc.getText('quill')
    console.log(ytext.toString())
    var ops;

    // EventSource stuff in here
    const events = new EventSource(`http://194.113.75.203:3001/api/connect/${props.docId}`)

    // The "sync" event's data should replace the document contents in the UI.
    events.addEventListener('sync', (event) => {
        console.log("In sync");
        var data = JSON.parse(event.data)
        console.log(data) //<- our data from the backend is here
        ytext.applyDelta(data)
        ops = data;
        console.log(ytext.toString() + " i hate my")
        //setYText(event.data); 
    });

    // The "update" event's data should be used to apply CRDT changes sent by the server
    events.addEventListener('update', (event) => {
        console.log("In update");
        console.log(event.data)
        //ytext.applyDelta(delta)
        //update crdt obj (which in this case would b y doc)
    });

    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return
        wrapper.innerHTML = ""
        Quill.register('modules/cursors', QuillCursors)
        const quill = new Quill(document.querySelector('#editor'), {
            modules: {
                cursors: true,
                toolbar: [],
                history: {
                    userOnly: true
                }
            },
            placeholder: 'Start collaborating...',
            theme: 'snow'
        })
        quill.setContents(ops)
        //Create an editor-binding which
        //"binds" the quill editor to a Y.Text type.
        quill.on('text-change',function(delta, oldDelta, source) {
            console.log(JSON.stringify(delta.ops))
            fetch(`http://194.113.75.203:3001/api/op/${props.docId}`, 
               { method: 'POST',
               headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
               body: JSON.stringify(delta.ops)})
        });

    }, [])

    return <div id='editor' className='container' ref={wrapperRef}></div>
}

export default Editor;