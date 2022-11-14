import React, { useState } from "react";
import Editor from './Editor'


function Fetch() {
    const [docId, setDocId] = useState('');
    const [showEditor, setShowEditor] = useState(false);


    const handleChange = (event) => {
        setDocId(event.target.value)
    }
    
    return (
        <div>
            {!showEditor ?
                (<div>
                    <input onChange={(e) => handleChange(e)} type="text" placeholder="Enter doc" name="doc" id="doc" required></input>
                    <button onClick={() => setShowEditor(true)}>Open</button>
                </div>) :
                <Editor
                    docId={docId}
                />}
        </div>
    )
}

export default Fetch;