import * as Y from 'yjs'
import { QuillBinding } from 'y-quill'
import Delta from "quill-delta";
import Quill from 'quill'
import QuillCursors from 'quill-cursors'
//import { QuillImage, QuillImageBindings } from 'quill-image'
import { useEffect, useState, useRef } from 'react'
import { useParams } from "react-router-dom";
import "./styles.css"
var events;

function Editor() {
    const { id } = useParams();
    // A Yjs document holds the shared data
    const ydoc = new Y.Doc()
    const [ytext, setText] = useState(ydoc.getText('quill'));
    const quillRef = useRef(null)
    const cursors = useRef();
    const quill = useRef();

    //var user_ids = {}


    // EventSource stuff in here
    //events = new EventSource(`http://rushhour.cse356.compas.cs.stonybrook.edu/api/connect/${id}`, { credentials: 'include' })
    events = new EventSource(`http://rushhour.cse356.compas.cs.stonybrook.edu/api/connect/${id}`, { withCredentials: true })


    // The "sync" event's data should replace the document contents in the UI.
    events.addEventListener('sync', (event) => {
        console.log("In sync");
        //console.log(`data: ${event.data}, doc: ${ydoc}`);

        var data = JSON.parse(event.data)
        Y.applyUpdate(ydoc, Uint8Array.from(data));
        const ytext2 = ydoc.getText();
        quill.current.setContents(ytext2.toDelta());
        //setText(ydoc.getText('quill'));


    });

    // The "update" event's data should be used to apply CRDT changes sent by the server
    events.addEventListener('update', (event) => {
        console.log("In update")

        var data = JSON.parse(event.data);
        //console.log(data);
        Y.applyUpdate(ydoc, Uint8Array.from(data));
        const ytext2 = ydoc.getText();
        quill.current.setContents(ytext2.toDelta());
        //setText(ydoc.getText('quill'));
    });

    events.addEventListener('presence', (event) => {
        console.log('In presense')
        //console.log("Cursors in presence stuff")
        //console.log(cursors)

        if (cursors.current) {
            var data = JSON.parse(event.data);
            const randomColor2 = Math.floor(Math.random() * 16777215).toString(16);
            console.log(data.session_id);
            console.log(data.cursor);
            // if(user_ids[data.name] !== data.session_id){
            //     cursors.current.removeCursor(user_ids[data.name]);
            //     user_ids[data.name] = data.session_id; 
            // }
            if (Object.keys(data.cursor).length !== 0) {
                //user_ids[data.name] = data.session_id; 
                cursors.current.createCursor(data.session_id, data.name, `#${randomColor2}`, data.cursor);
                cursors.current.moveCursor(data.session_id, data.cursor);
            } else {
                //user_ids[data.name] = undefined; 
                console.log(`deleted cursor cuz a nigga left: ${data.session_id}`);
                cursors.current.removeCursor(data.session_id);
            }
            console.log(cursors.current.cursors());
        }
    });

    window.onbeforeunload = () => {
        events.close();
        return 'Are you sure?'
    }

    const imageHandler = async () => {
        console.log('in image handler');
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        console.log(quill.current);
        const quillObj = quill.current.getEditor();
        input.onchange = async () => {
            var file = input && input.files ? input.files[0] : null;
            var formData = new FormData();
            formData.append("file", file);
            await fetch('http://rushhour.cse356.compas.cs.stonybrook.edu/media/upload', {
                body: formData,
                method: 'post'
            }).then((response) => response.json())
                .then((data) => {
                    const range = quillObj.getSelection(true);
                    quillObj.insertEmbed(range.index, 'image', `http://rushhour.cse356.compas.cs.stonybrook.edu/media//access/${data.mediaid}`);
                });
        }
    }


    useEffect(() => {
        if (cursors.current) {
            cursors.current.clearCursors();
        }
        var toolbarOptions = [
            ['bold', 'italic', 'underline'],        // toggled buttons
            ['link', 'image']          // add's image support
        ];
        Quill.register('modules/cursors', QuillCursors)
        quill.current = new Quill(document.querySelector('#editor'), {
            modules: {
                cursors: true,
                toolbar: toolbarOptions
            },
            theme: 'snow'
        })
    }, [quillRef])


    useEffect(() => {
        if (quill.current) {
            cursors.current = quill.current.getModule('cursors');
            quill.current.getModule('toolbar').addHandler('image', imageHandler);


            quill.current.on('selection-change', function (range, source) {
                if (source === "user") {
                    //call /api/presence/:id here
                    //console.log(`cursor at: ${range.index}, ${range.length}`);
                    if (range) {
                        fetch(`http://rushhour.cse356.compas.cs.stonybrook.edu/api/presence/${id}`,
                            {
                                method: 'POST',
                                credentials: 'include',
                                headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                                    //"Access-Control-Allow-Origin": "*",
                                },
                                body: JSON.stringify({ index: range.index, length: range.length })
                            });
                    }
                }
            });

            quill.current.on('text-change', function (delta, oldDelta, source) {
                if (source === "user") {
                    let uint8Array = Y.encodeStateAsUpdate(ydoc)
                    let array = Array.from(uint8Array)
                    //let str = array.toString();
                    console.log(delta);

                    fetch(`http://rushhour.cse356.compas.cs.stonybrook.edu/api/op/${id}`,
                        {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json",
                                //"Access-Control-Allow-Origin": "*",
                            },
                            body: JSON.stringify({ load: array })
                        })

                }
            });

            const binding = new QuillBinding(ytext, quill.current)

        }

    }, [quill])


    // const wrapperRef = useCallback((wrapper) => {
    //     if (wrapper == null) return
    //     wrapper.innerHTML = ""

    //     cursors.current = quill.getModule('cursors');
    //     console.log("cursors in wrapper")
    //     console.log(cursors)

    //     // awareness.on('change', changes => {
    //     //     console.log("bound the awareness ngga")
    //     //   })

    // }, [])


    return <div>
        <div>Document Id: {id}</div>
        <div id='editor' className='container' ref={quillRef}></div>
    </div>
}

export default Editor;