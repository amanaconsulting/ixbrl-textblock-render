// Copyright AMANA Consulting GmbH, 2023
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import progress from "../misc/progress.html";
import stylesString from "../misc/styles.css";
import { unionRect } from "./rect";

export class PdfPreviewPlugin {
    constructor(iv) {
        this.iv = iv;
        this.documents = [];
    }

    async preProcessiXBRL(body, docIndex) {
        this.documents.push(body.ownerDocument);
    }

    detectRTL(doc) {
        const html = doc.getElementById("page-container") || doc.querySelector("html");        
        const dir = html.getAttribute("dir");
        if (dir === "rtl") {
            return true;
        }
        return false;
    }

    htmlCreateStyles(styles, fontFaces, rtl) {
        if (styles && Object.keys(styles).length > 0) {
            let str = "<style type='text/css'>\n";
            if (this.iv.isPDF) {
                str += stylesString + "\n";
                if (rtl) {
                    str = str.replaceAll("bidi-override", "normal");
                }
            }
            if (fontFaces) {
                for (const fontFace of fontFaces) {
                    str += fontFace + "\n";
                }
            }
            for (const style in styles) {
                var styleValue = styles[style];
                if (styleValue !== null) {
                    str += styleValue + "\n";
                }
            }
            str += "</style>";
            return str;
        }
        return "";
    }

    htmlWrapString(content, styles, fontFaces, rtl = false) {
        const str =
            "<!DOCTYPE html><html><head><title></title>"
            + this.htmlCreateStyles(styles, fontFaces, rtl)
            +"</head><body>" 
            + content 
            + "</body></html>";
        return str;
    }          

    getElementById(id) {
        for (const doc of this.documents) {
            let element = doc.getElementById(id);
            if (element !== null) {
                return element;
            }   
        }        
        return null;
    }

    extractFonts(styles, fontFaces, ownerDocument) {
        const re = /^@font-face\s?{\s?font-family:\s([0-9a-f]+);/;
        for (const styleSheet of ownerDocument.styleSheets) {
            for (const rule of styleSheet.cssRules) {
                if (rule.type == 5) {
                    var match = rule.cssText.match(re);
                    if (match && '.' + match[1] in styles) {
                        fontFaces.push(rule.cssText);
                    }                    
                }
            }
        }
    }

    extractStyles(styles, ownerDocument) {
        for (const styleSheet of ownerDocument.styleSheets) {
            for (const rule of styleSheet.cssRules) {
                if (rule.type == 1 && rule.selectorText in styles) {
                    styles[rule.selectorText] = rule.cssText;                    
                }
            }
        }
    }

    getClassPrefix(className) {
        if (className === "_") // ignore unary _ class
            return "";
        if (className.startsWith("ws") ||
            className.startsWith("pf") ||
            className.startsWith("pc") ||
            className.startsWith("bi") ||
            className.startsWith("pi") ||
            className.startsWith("it") ||
            className.startsWith("fc") ||
            className.startsWith("ff") ||
            className.startsWith("fs") ||
            className.startsWith("gs") ||
            className.startsWith("sc") ||
            className.startsWith("ls"))
            return className.substring(0, 2);
        if (className.startsWith("_") ||
            className.startsWith("x") ||
            className.startsWith("y") ||
            className.startsWith("z") ||
            className.startsWith("w") ||
            className.startsWith("m") ||
            className.startsWith("h")) 
            return className.substring(0, 1);
        return className;
    }

    getClassWithPrefix(node, prefix) {
        for (const c of node.classList.values()) {
            if (this.getClassPrefix(c) === prefix) {
                return c;
            }
        }
        return null;
    }

    remapClass(node, prefix, styles) {
        const className = this.getClassWithPrefix(node, prefix);
        if (className != null) {
            styles['.' + className] = null;
        }
    }

    remapClassList(node, prefixList, styles) {
        node.querySelectorAll("*").forEach(el => {
            for (const prefix of prefixList) {    
                this.remapClass(el, prefix, styles);
            }
        });
        for (const prefix of prefixList) {
            this.remapClass(node, prefix, styles);
        }
    }

    remapElement(node, elementMap, styles, deepClone, factory) {
        if (!elementMap.has(node)) {
            let child = node.cloneNode(deepClone);
            if (child.style && child.style.getPropertyValue('content-visibility'))
                child.style.removeProperty('content-visibility');
            this.remapClassList(node, ["ff", "fs", "ls", "fc", "ws", "sc", "m", "x", "y", "z", "w", "h", "_", "gs"], styles);
            factory.call(this, child);
            elementMap.set(node, child);
            return child;
        }
        return elementMap.get(node);
    }

    getInheritedStyles() {
        return {
            "table.table-highlight" : null
        };
    }

    renderTextblock(doc, idList) {
        const self = this;
        var styles = this.getInheritedStyles();
        var fontFaces = [];
        var fragment = doc.createDocumentFragment();
        var elementMap = new Map();
        for (const id of idList) {
            let element = this.getElementById(id);                        
            if (element === null) continue;
            (function remapChain(el, deepClone) {
                if (el.classList.contains("pf")) {
                    return self.remapElement(el, elementMap, styles, deepClone, 
                        e => fragment.appendChild(e));
                }
                else {
                    return self.remapElement(el, elementMap, styles, deepClone,
                        e => remapChain(el.parentNode, false).appendChild(e));
                }
            })(element, true);
        }
        this.extractStyles(styles, this.documents[0]);
        this.extractFonts(styles, fontFaces, this.documents[0]);
        const rtl = this.detectRTL(this.documents[0]);
        let pageContainer = doc.createElement('div');
        pageContainer.setAttribute('id', 'page-container');
        if (rtl) pageContainer.setAttribute('dir', 'rtl');        
        let zoomContainer = doc.createElement('div');
        zoomContainer.setAttribute('id', 'zoom-container');
        zoomContainer.appendChild(fragment);
        pageContainer.appendChild(zoomContainer);
        doc.open();
        doc.write(this.htmlWrapString(
            pageContainer.outerHTML, styles, fontFaces, rtl));        
        doc.close();
    }
    
    compactTextblock(doc, padding = [5, 10]) {
        var [padLeft, padTop] = padding;
        var coveredRect = null;
        doc.querySelectorAll(".pf").forEach(pf => {
            pf.querySelectorAll(".t").forEach(el => {
                if (coveredRect === null) {
                    coveredRect = el.getBoundingClientRect();
                } else {
                    coveredRect = unionRect(coveredRect, el.getBoundingClientRect());
                }
            });
        });
        doc.querySelectorAll(".pf").forEach(pf => {            
            var rect = null;
            pf.querySelectorAll(".t").forEach(el => {
                if (rect === null) {
                    rect = el.getBoundingClientRect();
                } else {
                    rect = unionRect(rect, el.getBoundingClientRect());
                }
            });
            let left = pf.getBoundingClientRect().left;             
            let top = pf.getBoundingClientRect().top;            
            let x = left;
            if (coveredRect.left > 0)
                x =- coveredRect.left;
            let y = top - rect.top;
            let pc = pf.querySelector(".pc");            
            pc.style.transform = `translate(${x + padLeft}px, ${y + padTop}px)`;            
            let height = parseFloat(getComputedStyle(pf).getPropertyValue("height"));
            pf.style.height = `${height + y}px`;
        });
    }

    defaultRenderWithTableBorders(doc, innertHTML) {
        doc.open();
        var styles = this.getInheritedStyles();
        this.extractStyles(styles, this.documents[0]);
        doc.write(this.htmlWrapString(innertHTML, styles));
        doc.close();
        doc.querySelectorAll("table").forEach(table => {
            table.classList.add("table-highlight");
        });
    }

    defaultRender(doc, innertHTML) {
        doc.open();
        doc.write(this.htmlWrapString(innertHTML));
        doc.close();
    }

    async extendDisplayTextblock(doc, fact) {             
        if (this.iv.isPDF) {
            const idList = [fact.vuid].concat(this.iv.viewer.itemContinuationMap[fact.vuid] || [])
                .map(id => id.replace(/^\d+-/,""));
            if (idList.length > 1) {
                doc.open();
                doc.write(progress);
                doc.close();
                setTimeout(() => {
                    this.renderTextblock(doc, idList);
                    this.compactTextblock(doc);
                }, 100);
            } else {
                this.renderTextblock(doc, idList);
                this.compactTextblock(doc);
            }                        
        } else if (this.iv.viewer.showTablesBorder) {
            this.defaultRenderWithTableBorders(doc, fact.value());            
        } else {
            this.defaultRender(doc, fact.value());
        }        
    }
}