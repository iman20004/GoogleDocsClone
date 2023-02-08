# GoogleDocsClone
An online text editor featuring real-time collaboration between multiple users. Utilizes Yjs CRDT framework to resolve conflicting changes/edits.


Technologies/Frameworks:
- Node/Express servers over the cloud, 
- Local MongoDB for storage, 
- EventSource API for server-sent events, and
- React and y-quill frontend


Features:
- Real time collaboration
- Conflicts resolved using CRDT
- Text editor, also supports images
- Indicates collaborators cursor presence and location
