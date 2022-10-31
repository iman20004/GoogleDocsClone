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
    const [ytext, setText] = useState(ydoc.getText('quill'));

    // EventSource stuff in here
    const events = new EventSource(`http://194.113.75.203:80/api/connect/${props.docId}`)

    // The "sync" event's data should replace the document contents in the UI.
    events.addEventListener('sync', (event) => {
        console.log("In sync")
        var data = JSON.parse(event.data)
        console.log(data.doc) //<- our data from the backend is here
        Y.applyUpdate(ydoc, Uint8Array.from(data))
        setText(ydoc.getText('quill'));
        console.log("listener")
        //setYText(event.data); 
    });

    // The "update" event's data should be used to apply CRDT changes sent by the server
    events.addEventListener('update', (event) => {
        console.log("In update")
        console.log(event.data)
        var data = JSON.parse(event.data);
        Y.applyUpdate(ydoc, Uint8Array.from(data));
        setText(ydoc.getText('quill'));
        //console.log(ytext.toString())
        //ytext.applyDelta(delta)
        //update crdt obj (which in this case would b y doc)
    });

    // ydoc.on('update', (update) => {

    // })

    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return
        wrapper.innerHTML = ""
        Quill.register('modules/cursors', QuillCursors)
        const quill = new Quill(document.querySelector('#editor'), {
            modules: {
                cursors: true,
                toolbar: ['bold', 'italic', 'underline'],
                history: {
                    userOnly: true
                }
            },
            placeholder: 'Start collaborating...',
            theme: 'snow'
        })
        console.log("in wrapper")
        const binding = new QuillBinding(ytext, quill)
        //Create an editor-binding which
        //"binds" the quill editor to a Y.Text type.
        quill.on('text-change',function(delta, oldDelta, source) {
            let uint8Array = Y.encodeStateAsUpdate(ydoc)
            let array = Array.from(uint8Array)
            //let str = new TextDecoder().decode(uint8Array)
            let str = array.toString();
            console.log(str)
            
            fetch(`http://194.113.75.203:80/api/op/${props.docId}`, 
               { method: 'POST',
               headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
               body: JSON.stringify({load: array})})
        });

    }, [])
    
    return <div id='editor' className='container' ref={wrapperRef}></div>
}

export default Editor;