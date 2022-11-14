import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [newDocName, setNewDocName] = useState('');


    const handleLogout = async () => {
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        };
        await fetch('http://rushhour.cse356.compas.cs.stonybrook.edu/users/logout', requestOptions)
            .then((response) => response.json())

        navigate('/loginUser')
    }

    const handleDelete = async (id) => {
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        };

        await fetch('http://rushhour.cse356.compas.cs.stonybrook.edu/collection/delete', requestOptions)
            .then(() => { setList(list.filter(docStuff => (docStuff.id !== id))) });
        //.then((response) => response.json())

    }

    const handleCreate = async (name) => {
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name })
        };

        await fetch('http://rushhour.cse356.compas.cs.stonybrook.edu/collection/create', requestOptions)
            .then((response) => response.json())
            .then((data) => {
                var datalist = [{ id: data.id, name: name }, ...list]
                if (datalist.length > 10) {
                    datalist.pop();
                }
                setList(datalist);
            });
    }

    const fetchlists = async () => {
        console.log('in use effect');
        await fetch('http://rushhour.cse356.compas.cs.stonybrook.edu/collection/list', { credentials: 'include' })
            //await fetch('http://194.113.73.211/collection/list')
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setList(data)
            });

        console.log('after fetching lists')
        console.log(list)

    }

    useEffect(() => {
        fetchlists();
    }, []);

    //console.log(list)


    return (
        <div>
            {list.map((doc) => (
                <div>
                    <button
                        onClick={() => navigate('/edit/' + doc.id)}
                    >{doc.name}</button>
                    <button onClick={() => handleDelete(doc.id)}>Delete</button>
                    <br></br>
                </div>
            ))}
            <br></br>
            <div>
                <div>
                    <input type="text" placeholder="Enter name" name="name" id="name"
                        onChange={(event) => setNewDocName(event.target.value)} required></input>
                </div>
                <button onClick={() => handleCreate(newDocName)} >Create New Doc</button>
            </div>
            <br></br>
            <br></br>
            <br></br>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );

}

export default Home;



