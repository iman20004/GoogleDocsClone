// ... add imports and fill in the code
import { Doc, applyUpdate } from 'yjs';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';

class CRDTFormat {
  public bold?: Boolean = false;
  public italic?: Boolean = false;
  public underline?: Boolean = false;
};

exports.CRDT = class {
  public doc: Doc;
  public cb: (update: string, isLocal: Boolean) => void;

  constructor(cb: (update: string, isLocal: Boolean) => void) {
    // ...
    this.doc = new Doc();
    this.cb = cb; 
    this.doc.on('update', (update: Uint8Array, origin: string) => {
      let local = true;
      if(origin === 'update'){
        local = false; 
      }
      let load = Array.from(update);
      this.cb(JSON.stringify({load}), local);

    });
    ['update', 'insert', 'delete', 'insertImage', 'toHTML'].forEach(f => (this as any)[f] = (this as any)[f].bind(this));
  }

  update(update: string) {
    // ...
    applyUpdate(this.doc, Uint8Array.from(JSON.parse(update)));
    // this.cb(update, false);
  }

  insert(index: number, content: string, format: CRDTFormat) {
    // ...
    this.doc.getText().insert(index, content, format);
    // let load = Array.from(encodeStateAsUpdate(this.doc))
    // this.cb(JSON.stringify({load}), true);
  }

  delete(index: number, length: number) {
    // ...
    this.doc.getText().delete(index, length);
    // let load = Array.from(encodeStateAsUpdate(this.doc)) 
    // this.cb(JSON.stringify({load}), true);
  }

  insertImage(index: number, url: string) {
    var ytext = this.doc.getText()
    
    // Retain everything up untill index & insert image
    ytext.applyDelta([
      {retain: index},
      {insert: {image: url} }
    ]);

  }

  toHTML() {
    // ...
    var delta = this.doc.getText().toDelta();
    var cfg = {
      urlSanitizer: (url: string) => {
        return `<img src="${url}">`
      }
    }
    // includes images as IMG tags with a SRC attribute pointing 
    // to the image served by your /media/:mediaid route
    
    //var converter = new QuillDeltaToHtmlConverter(delta, cfg);
    var converter = new QuillDeltaToHtmlConverter(delta, cfg);

    return converter.convert();
  }
};
